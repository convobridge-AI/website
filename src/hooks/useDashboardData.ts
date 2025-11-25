import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
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
      const [callStatsRes, callsRes, agentsRes, leadsRes] = await Promise.all([
        apiClient.getCallStats().catch(() => ({ stats: null })),
        apiClient.getCalls({ limit: 10 }).catch(() => ({ calls: [] })),
        apiClient.getAgents().catch(() => ({ agents: [] })),
        apiClient.getLeads({ limit: 10 }).catch(() => ({ leads: [] })),
      ]);

      setStats(callStatsRes.stats);
      setCalls(callsRes.calls || []);
      setAgents(agentsRes.agents || []);
      setLeads(leadsRes.leads || []);
    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
