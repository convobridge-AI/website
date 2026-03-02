import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch calls, agents (from companies/metadata as real agents table doesn't exist in the raw schema provided but can be inferred), and leads from Supabase
      const [callsRes, leadsRes, companiesRes] = await Promise.all([
        supabase.from('calls').select('*').order('started_at', { ascending: false }).limit(10),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('companies').select('*').limit(1) // Assuming single tenant for now or current company
      ]);

      if (callsRes.error) throw callsRes.error;
      if (leadsRes.error) throw leadsRes.error;

      const callsData = callsRes.data || [];
      const leadsData = leadsRes.data || [];
      
      // Calculate basic stats from fetched data
      const totalCalls = callsData.length;
      const totalDuration = callsData.reduce((acc, call) => acc + (call.duration_sec || 0), 0);
      
      setStats({
        totalCalls,
        totalDuration,
        successRate: 0.95, // Placeholder or calculate based on status
      });
      
      setCalls(callsData);
      setLeads(leadsData);
      
      // Agents might be stored in metadata or a separate table eventually
      // For now, providing a placeholder or empty array
      setAgents([]);

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time updates for calls and leads
    const callsSubscription = supabase
      .channel('public:calls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calls' }, () => fetchData())
      .subscribe();

    const leadsSubscription = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(callsSubscription);
      supabase.removeChannel(leadsSubscription);
    };
  }, []);

  return {
    loading,
    stats,
    calls,
    agents,
    leads,
    refresh: fetchData,
  };
};
