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
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [outboundCalls, setOutboundCalls] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Use RPC functions instead of direct queries to bypass RLS
      const [callsRes, leadsRes, companyRes, topupsRes, outboundRes, agentsRes, phoneNumbersRes] = await Promise.all([
        supabase.rpc('get_user_calls', { user_id_param: user.id }),
        supabase.rpc('get_user_leads', { user_id_param: user.id }),
        supabase.rpc('get_user_company', { user_id_param: user.id }),
        supabase.rpc('get_user_topups', { user_id_param: user.id }),
        supabase.rpc('get_user_outbound_calls', { user_id_param: user.id }),
        supabase.rpc('get_user_agents', { user_id_param: user.id }),
        supabase.rpc('get_user_phone_numbers', { user_id_param: user.id })
      ]);

      if (callsRes.error) throw callsRes.error;
      if (leadsRes.error) throw leadsRes.error;
      if (companyRes.error) throw companyRes.error;
      
      const callsData = callsRes.data || [];
      const leadsData = leadsRes.data || [];
      const companyData = companyRes.data; // This is now JSONB object
      const topupsData = topupsRes.data || [];
      const outboundData = outboundRes.data || [];
      
      // Calculate trends
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const currCalls = callsData.filter(c => new Date(c.started_at) >= thirtyDaysAgo);
      const prevCalls = callsData.filter(c => {
         const d = new Date(c.started_at);
         return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      });
      const currLeads = leadsData.filter(l => new Date(l.created_at) >= thirtyDaysAgo);
      const prevLeads = leadsData.filter(l => {
         const d = new Date(l.created_at);
         return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      });

      const calcTrend = (curr: number, prev: number) => {
        if (prev === 0 && curr === 0) return { percentage: "+0%", isUp: true, previous: "0", currentValue: "0" };
        if (prev === 0) return { percentage: "+100%", isUp: true, previous: "0", currentValue: curr.toString() };
        const percent = Math.round(((curr - prev) / prev) * 100);
        return { percentage: `${percent > 0 ? '+' : ''}${percent}%`, isUp: percent >= 0, previous: prev.toString(), currentValue: curr.toString() };
      };

      const currSuccess = currCalls.filter(c => c.status === 'completed' || c.duration_sec > 10).length;
      const prevSuccess = prevCalls.filter(c => c.status === 'completed' || c.duration_sec > 10).length;
      const currSuccessRate = currCalls.length > 0 ? currSuccess / currCalls.length : 1;
      const prevSuccessRate = prevCalls.length > 0 ? prevSuccess / prevCalls.length : 1;

      const calcTrendPercent = (curr: number, prev: number) => {
        const diff = (curr - prev) * 100;
        return { percentage: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`, isUp: diff >= 0, previous: `${(prev * 100).toFixed(1)}%`, currentValue: `${(curr * 100).toFixed(1)}%` };
      };

      const activeAgentsCount = agentsRes.data?.filter((a: any) => a.is_deployed || a.isActive)?.length || 0;

      const trends = {
        calls: calcTrend(currCalls.length, prevCalls.length),
        leads: calcTrend(currLeads.length, prevLeads.length),
        successRate: calcTrendPercent(currSuccessRate, prevSuccessRate),
        agents: calcTrend(activeAgentsCount, activeAgentsCount) // Usually static or hard to trace previous state
      };

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
        outbound_balance: companyData?.outbound_balance || 0,
        successRate: totalCalls > 0 ? successfulCalls / totalCalls : 1,
        company: companyData,
        trends
      });
      
      setCalls(callsData);
      setLeads(leadsData);
      setAgents(agentsRes.data || []);
      setPhoneNumbers(phoneNumbersRes.data || []);
      setTopups(topupsData);
      setOutboundCalls(outboundData);

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
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

      const outboundSubscription = supabase
        .channel(`company-outbound-${user.company_id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'outbound_calls',
          filter: `company_id=eq.${user.company_id}`
        }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(callsSubscription);
        supabase.removeChannel(leadsSubscription);
        supabase.removeChannel(companiesSubscription);
        supabase.removeChannel(outboundSubscription);
      };
    }
  }, [user?.id]);

  return {
    loading,
    stats,
    calls,
    agents,
    leads,
    phoneNumbers,
    refresh: fetchData,
    topups,
    outboundCalls,
  };
};
