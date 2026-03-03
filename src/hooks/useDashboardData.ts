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

  const fetchData = async () => {
    if (!user?.company_id) return;
    
    try {
      setLoading(true);
      
      const [callsRes, leadsRes, companiesRes, agentsRes] = await Promise.all([
        supabase.from('calls')
          .select('*')
          .eq('company_id', user.company_id)
          .order('started_at', { ascending: false })
          .limit(20),
        supabase.from('leads')
          .select('*')
          .eq('company_id', user.company_id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase.from('companies')
          .select('*')
          .eq('id', user.company_id)
          .single(),
        supabase.from('agents')
          .select('*')
          .eq('company_id', user.company_id)
      ]);

      if (callsRes.error) throw callsRes.error;
      if (leadsRes.error) throw leadsRes.error;

      const callsData = callsRes.data || [];
      const leadsData = leadsRes.data || [];
      const companyData = companiesRes.data;
      const agentsData = agentsRes.data || [];
      
      // Calculate basic stats from fetched data
      const totalCalls = callsData.length;
      const totalDuration = callsData.reduce((acc, call) => acc + (call.duration_sec || 0), 0);
      
      setStats({
        totalCalls: companyData?.total_calls || totalCalls,
        totalDuration: totalDuration,
        leadsCount: leadsData.length,
        credits: companyData?.credits || 0,
        successRate: 0.95,
      });
      
      setCalls(callsData);
      setLeads(leadsData);
      setAgents(agentsData);

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
  };
};
