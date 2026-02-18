import { supabase } from './supabase';

class APIClient {
  // Auth
  async signup(email: string, password: string, name: string, company?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, company },
      },
    });
    if (error) throw error;
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        company: user.user_metadata?.company,
      }
    };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Agents
  async createAgent(agentData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('agents').insert([{ ...agentData, user_id: user?.id }]).select();
    if (error) throw error;
    return { success: true, agent: data[0] };
  }

  async getAgents() {
    const { data, error, count } = await supabase.from('agents').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, agents: data, total: count || 0 };
  }

  async getAgent(id: string) {
    const { data, error } = await supabase.from('agents').select('*').eq('id', id).single();
    if (error) throw error;
    return { success: true, agent: data };
  }

  async updateAgent(id: string, agentData: any) {
    const { data, error } = await supabase.from('agents').update(agentData).eq('id', id).select();
    if (error) throw error;
    return { success: true, agent: data[0] };
  }

  async deleteAgent(id: string) {
    const { error } = await supabase.from('agents').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  // Phone Numbers (admin)
  async getNumbers() {
    const { data, error } = await supabase.from('phone_numbers').select('*');
    if (error) throw error;
    return { success: true, numbers: data };
  }

  async createNumber(numberData: any) {
    const { data, error } = await supabase.from('phone_numbers').insert([numberData]).select();
    if (error) throw error;
    return { success: true, number: data[0] };
  }

  async updateNumber(id: string, data: any) {
    const { data: updatedData, error } = await supabase.from('phone_numbers').update(data).eq('id', id).select();
    if (error) throw error;
    return { success: true, number: updatedData[0] };
  }

  async deleteNumber(id: string) {
    const { error } = await supabase.from('phone_numbers').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  // Calls
  async createCall(callData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('calls').insert([{ ...callData, user_id: user?.id }]).select();
    if (error) throw error;
    return { success: true, call: data[0] };
  }

  async getCalls(query?: any) {
    let request = supabase.from('calls').select('*, agents(name)', { count: 'exact' }).order('created_at', { ascending: false });
    if (query) {
      if (query.agentId) request = request.eq('agent_id', query.agentId);
      if (query.status) request = request.eq('status', query.status);
    }
    const { data, error, count } = await request;
    if (error) throw error;
    return { success: true, calls: data, total: count || 0 };
  }

  async getCall(id: string) {
    const { data, error } = await supabase.from('calls').select('*, agents(name)').eq('id', id).single();
    if (error) throw error;
    return { success: true, call: data };
  }

  async getCallStats() {
    const { data, error } = await supabase.from('calls').select('status, duration, outcome, sentiment');
    if (error) throw error;
    
    // Simple aggregation for stats
    const totalCalls = data.length;
    const completedCalls = data.filter(c => c.status === 'completed').length;
    const avgDuration = data.reduce((acc, c) => acc + (c.duration || 0), 0) / (totalCalls || 1);
    
    return {
      success: true,
      stats: {
        totalCalls,
        completedCalls,
        avgDuration,
      }
    };
  }

  // Contacts
  async submitContact(contactData: any) {
    const { data, error } = await supabase.from('contacts').insert([contactData]).select();
    if (error) throw error;
    return { success: true, contact: data[0] };
  }

  async getContacts(query?: any) {
    let request = supabase.from('contacts').select('*').order('created_at', { ascending: false });
    const { data, error } = await request;
    if (error) throw error;
    return { success: true, contacts: data };
  }

  async updateContactStatus(id: string, status: string) {
    const { data, error } = await supabase.from('contacts').update({ status }).eq('id', id).select();
    if (error) throw error;
    return { success: true, contact: data[0] };
  }

  // Context Management (Simulated or requiring Edge Functions)
  async processFileForContext(agentId: string, file: File) {
    // In a real app, upload to Supabase Storage and trigger an Edge Function
    console.log('Simulating file processing for context', file.name);
    return { success: true, message: 'File processed successfully', generatedContext: 'Excerpts summarized...' };
  }

  async saveContext(agentId: string, context: string) {
    const { data, error } = await supabase.from('agents').update({ generated_context: context }).eq('id', agentId).select();
    if (error) throw error;
    return { success: true, agent: data[0] };
  }

  async getContext(agentId: string) {
    const { data, error } = await supabase.from('agents').select('generated_context').eq('id', agentId).single();
    if (error) throw error;
    return { success: true, generatedContext: data.generated_context };
  }

  async crawlWebsiteForContext(agentId: string, url: string) {
    console.log('Simulating website crawling for context', url);
    return { success: true, message: 'Website crawled successfully' };
  }

  // Agent Deployment
  async deployAgent(agentId: string) {
    const { data, error } = await supabase.from('agents').update({ is_deployed: true }).eq('id', agentId).select();
    if (error) throw error;
    return { success: true, agent: data[0] };
  }

  // Settings
  async getSettings() {
    const { data: { user } } = await supabase.auth.getUsers?.() || await supabase.auth.getUser(); // Safe guard
    const actualUser = (user as any).user || user;
    const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', actualUser?.id).single();
    if (error && error.code === 'PGRST116') {
      const { data: newData, error: createError } = await supabase.from('user_settings').insert([{ user_id: actualUser?.id }]).select().single();
      if (createError) throw createError;
      return { success: true, settings: newData };
    }
    if (error) throw error;
    return { success: true, settings: data };
  }

  async updateSettings(settings: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('user_settings').update(settings).eq('user_id', user?.id).select();
    if (error) throw error;
    return { success: true, settings: data[0] };
  }

  async regenerateApiKey() {
    const { data: { user } } = await supabase.auth.getUser();
    const newApiKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
    const { data, error } = await supabase.from('user_settings').update({ api_key: newApiKey }).eq('user_id', user?.id).select().single();
    if (error) throw error;
    return { success: true, settings: data };
  }

  async connectIntegration(name: string, data: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: settings } = await supabase.from('user_settings').select('integrations').eq('user_id', user?.id).single();
    const updatedIntegrations = { ...settings?.integrations, [name]: { connected: true, ...data } };
    const { data: updatedSettings, error } = await supabase.from('user_settings').update({ integrations: updatedIntegrations }).eq('user_id', user?.id).select();
    if (error) throw error;
    return { success: true, settings: updatedSettings[0] };
  }

  async disconnectIntegration(name: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: settings } = await supabase.from('user_settings').select('integrations').eq('user_id', user?.id).single();
    const updatedIntegrations = { ...settings?.integrations };
    delete updatedIntegrations[name];
    const { data: updatedSettings, error } = await supabase.from('user_settings').update({ integrations: updatedIntegrations }).eq('user_id', user?.id).select();
    if (error) throw error;
    return { success: true, settings: updatedSettings[0] };
  }

  // Admin
  async getSystemStats() {
    const { data: users } = await supabase.from('profiles').select('count');
    const { data: agents } = await supabase.from('agents').select('count');
    const { data: calls } = await supabase.from('calls').select('count');
    return {
      success: true,
      stats: {
        totalUsers: users?.length || 0,
        totalAgents: agents?.length || 0,
        totalCalls: calls?.length || 0,
      }
    };
  }

  async getAllUsers(query?: any) {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return { success: true, users: data };
  }

  async updateUser(id: string, data: any) {
    const { data: updatedData, error } = await supabase.from('profiles').update(data).eq('id', id).select();
    if (error) throw error;
    return { success: true, user: updatedData[0] };
  }

  async getAllAgentsAdmin(query?: any) {
    const { data, error } = await supabase.from('agents').select('*, profiles(email)');
    if (error) throw error;
    return { success: true, agents: data };
  }

  async getAllCallsAdmin(query?: any) {
    const { data, error } = await supabase.from('calls').select('*, profiles(email), agents(name)');
    if (error) throw error;
    return { success: true, calls: data };
  }

  // Leads
  async getLeads(query?: any) {
    let request = supabase.from('leads').select('*').order('created_at', { ascending: false });
    const { data, error } = await request;
    if (error) throw error;
    return { success: true, leads: data };
  }

  async getLead(id: string) {
    const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
    if (error) throw error;
    return { success: true, lead: data };
  }

  async createLead(leadData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('leads').insert([{ ...leadData, user_id: user?.id }]).select();
    if (error) throw error;
    return { success: true, lead: data[0] };
  }

  async updateLead(id: string, leadData: any) {
    const { data, error } = await supabase.from('leads').update(leadData).eq('id', id).select();
    if (error) throw error;
    return { success: true, lead: data[0] };
  }

  async deleteLead(id: string) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async getLeadStats() {
    const { data, error } = await supabase.from('leads').select('status');
    if (error) throw error;
    return {
      success: true,
      stats: {
        totalLeads: data.length,
        newLeads: data.filter(l => l.status === 'new').length,
      }
    };
  }

  isAuthenticated(): boolean {
    // This is synchronous in the original, but Supabase session is handled better via AuthContext or async.
    // We'll return true if there's a cached session.
    return !!localStorage.getItem('supabase.auth.token'); // Rough estimate, Supabase usually handles this via getSession
  }

  getToken(): string | null {
    return localStorage.getItem('supabase.auth.token');
  }
}

export const apiClient = new APIClient();
