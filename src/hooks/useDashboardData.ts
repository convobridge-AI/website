import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user?.company_id) return;
    
    try {
      setLoading(true);
      
      const [callsRes, leadsRes, companiesRes, topupsRes] = await Promise.all([
        supabase.from('calls')
          .select('*')
          .eq('company_id', user.company_id)
          .order('started_at', { ascending: false }),
        supabase.from('leads')
          .select('*')
          .eq('company_id', user.company_id)
          .order('created_at', { ascending: false }),
        supabase.from('companies')
          .select('*')
          .eq('id', user.company_id)
          .single(),
        supabase.from('topups')
          .select('*')
          .eq('company_id', user.company_id)
          .order('created_at', { ascending: false })
      ]);

      if (callsRes.error) throw callsRes.error;
      const callsData = callsRes.data || [];
      const leadsData = leadsRes.data || [];
      const companyData = companiesRes.data;
      const topupsData = topupsRes.data || [];
      
      // Calculate analytics
      const totalCalls = callsData.length;
      const totalDuration = callsData.reduce((acc, call) => acc + (call.duration_sec || 0), 0);
      const totalCost = callsData.reduce((acc, call) => acc + (Number(call.cost) || 0), 0);
      const successfulCalls = callsData.filter(c => c.status === 'completed' || c.duration_sec > 10).length;
      
      setStats({
        totalCalls,
        totalDuration,
        totalCost,
        leadsCount: leadsData.length,
        credits: companyData?.credit_balance || 0,
        successRate: totalCalls > 0 ? successfulCalls / totalCalls : 1,
        company: companyData
      });
      
      setCalls(callsData);
      setLeads(leadsData);
      setAgents([{ 
        id: companyData?.id, 
        name: companyData?.name || 'Primary Agent', 
        isActive: companyData?.active 
      }]);
      setTopups(topupsData);

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.company_id) {
      fetchData();

      // Subscribe to real-time updates for calls and leads restricted to this company
      const callsSubscription = supabase
        .channel(`company-calls-${user.company_id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'calls',
          filter: `company_id=eq.${user.company_id}` 
        }, () => fetchData())
        .subscribe();

      const leadsSubscription = supabase
        .channel(`company-leads-${user.company_id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'leads',
          filter: `company_id=eq.${user.company_id}`
        }, () => fetchData())
        .subscribe();

      const companiesSubscription = supabase
        .channel(`company-data-${user.company_id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'companies',
          filter: `id=eq.${user.company_id}`
        }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(callsSubscription);
        supabase.removeChannel(leadsSubscription);
        supabase.removeChannel(companiesSubscription);
      };
    }
  }, [user?.company_id]);

  return {
    loading,
    stats,
    calls,
    agents,
    leads,
    refresh: fetchData,
    topups,
  };
};
