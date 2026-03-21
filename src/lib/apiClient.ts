import axios, { AxiosInstance } from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private currentUser: any | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load user from localStorage if it exists
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  private setAuthHeader(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Auth using Supabase RPC functions
  async signup(email: string, password: string, name: string, company?: string) {
    // For now, signup defaults to Supabase Auth
    // You can create a custom RPC function if needed
    const {data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          company: company,
        },
      },
    });

    if (error) throw error;
    return { user: data.user };
  }

  async login(email: string, password: string) {
    // Use Supabase RPC function for custom PSQL auth
    console.log('[apiClient] Attempting login with email:', email);
    
    const { data, error } = await supabase.rpc('custom_login', {
      user_email: email,
      user_password: password,
    });

    console.log('[apiClient] RPC response:', { data, error });

    if (error) {
      console.error('[apiClient] Supabase RPC error:', error);
      throw error;
    }
    
    const result = data as { success: boolean; user?: any; error?: string };
    
    if (!result.success) {
      console.error('[apiClient] Login failed:', result.error);
      throw new Error(result.error || 'Login failed');
    }

    console.log('[apiClient] Login successful for user:', result.user.email);
    
    // Store user data locally
    this.currentUser = result.user;
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    
    return { user: result.user };
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }
    return { user: this.currentUser };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    delete this.client.defaults.headers.common['Authorization'];
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }

    // Verify current password first
    const { data: loginResult } = await supabase.rpc('custom_login', {
      user_email: this.currentUser.email,
      user_password: currentPassword,
    });

    if (!loginResult?.success) {
      throw new Error('Current password is incorrect');
    }

    // Update password using RPC function
    const { data, error } = await supabase.rpc('update_user_password', {
      user_id_param: this.currentUser.id,
      new_password: newPassword
    });

    if (error) throw error;
    
    if (!data?.success) {
      throw new Error(data?.error || 'Failed to update password');
    }
    
    return { success: true };
  }

  // Agents
  async createAgent(agentData: any) {
    const { data, error } = await supabase
      .from('agents')
      .insert([{ ...agentData, company_id: this.currentUser?.company_id }])
      .select()
      .single();
    
    if (error) throw error;
    return { agent: data };
  }

  async getAgents() {
    if (!this.currentUser?.id) {
      throw new Error('Not authenticated');
    }
    
    const { data, error } = await supabase.rpc('get_user_agents', {
      user_id_param: this.currentUser.id
    });
    
    if (error) throw error;
    return { agents: data || [] };
  }

  async getAgent(id: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { agent: data };
  }

  async updateAgent(id: string, agentData: any) {
    const { data, error } = await supabase
      .from('agents')
      .update(agentData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { agent: data };
  }

  async deleteAgent(id: string) {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }

  // Phone Numbers (admin)
  async getNumbers() {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*');
    
    if (error) throw error;
    return { numbers: data || [] };
  }

  async createNumber(numberData: any) {
    const { data, error } = await supabase
      .from('phone_numbers')
      .insert([numberData])
      .select()
      .single();
    
    if (error) throw error;
    return { number: data };
  }

  async updateNumber(id: string, data: any) {
    const { data: updated, error } = await supabase
      .from('phone_numbers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { number: updated };
  }

  async deleteNumber(id: string) {
    const { error } = await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }

  // Calls
  async createCall(callData: any) {
    throw new Error('Call creation is handled by Asterisk server');
  }

  async getCalls(query?: any) {
    if (!this.currentUser?.id) {
      throw new Error('Not authenticated');
    }
    
    const { data, error } = await supabase.rpc('get_user_calls', {
      user_id_param: this.currentUser.id
    });
    
    if (error) throw error;
    return { calls: data || [] };
  }

  async getCall(id: string) {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { call: data };
  }

  async getCallStats() {
    if (!this.currentUser?.id) {
      throw new Error('Not authenticated');
    }
    
    const { data, error } = await supabase.rpc('get_user_calls', {
      user_id_param: this.currentUser.id
    });
    
    if (error) throw error;
    
    const totalCalls = data?.length || 0;
    const totalDuration = data?.reduce((sum: number, call: any) => sum + (call.duration || 0), 0) || 0;
    const totalCost = 0; // Calculate based on your pricing logic
    
    return {
      stats: {
        totalCalls,
        totalDuration,
        totalCost,
        avgDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
      }
    };
  }

  // Contacts
  async submitContact(contactData: any) {
    return { success: true };
  }

  async getContacts(query?: any) {
    return { contacts: [] };
  }

  async updateContactStatus(id: string, status: string) {
    return { success: true };
  }

  // Leads
  async getLeads() {
    if (!this.currentUser?.id) {
      throw new Error('Not authenticated');
    }
    
    const { data, error } = await supabase.rpc('get_user_leads', {
      user_id_param: this.currentUser.id
    });
    
    if (error) throw error;
    return { leads: data || [] };
  }

  async createLead(leadData: any) {
    if (!this.currentUser?.company_id) {
      throw new Error('Not authenticated');
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...leadData, company_id: this.currentUser.company_id }])
      .select()
      .single();
    
    if (error) throw error;
    return { lead: data };
  }

  // Context Management
  async processFileForContext(agentId: string, file: File) {
    return { success: true };
  }

  async saveContext(agentId: string, context: string) {
    return { success: true };
  }

  async getContext(agentId: string) {
    return { context: '' };
  }

  async crawlWebsiteForContext(agentId: string, url: string) {
    return { success: true };
  }

  // Agent Deployment
  async deployAgent(agentId: string) {
    return { deployment: { extension: '1000' } };
  }

  // Settings
  async getSettings() {
    // Return mock settings for now - you can store these in a user_settings table
    return { 
      settings: {
        callRecordingEnabled: true,
        transcriptionEnabled: true,
        notificationsEnabled: true,
        emailNotifications: false,
      } 
    };
  }

  async getCompanies() {
    if (!this.currentUser?.id) {
      throw new Error('Not authenticated');
    }
    
    // Use RPC function to bypass RLS and get stats (admin only)
    const { data, error } = await supabase.rpc('get_companies_with_stats', {
      user_id_param: this.currentUser.id
    });
    
    if (error) throw error;
    return { companies: data || [] };
  }

  async createTopup(data: any) {
    // Use RPC function that handles both insert and balance update
    const { data: result, error } = await supabase.rpc('create_topup', {
      p_company_id: data.company_id,
      p_amount: data.amount,
      p_method: data.method || 'manual',
      p_reference: data.reference || ''
    });
    
    if (error) throw error;
    return { success: true, ...result };
  }

  async updateSettings(settings: any) {
    // Store in localStorage for now - you can create a user_settings table later
    localStorage.setItem('user_settings', JSON.stringify(settings));
    return { settings };
  }

  async regenerateApiKey() {
    // Generate a simple API key (you should use a more secure method in production)
    const apiKey = 'cb_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('user_api_key', apiKey);
    return { settings: { apiKey } };
  }

  async connectIntegration(name: string, data: any) {
    return { success: true };
  }

  async disconnectIntegration(name: string) {
    return { success: true };
  }

  // Admin
  async getSystemStats() {
    return { stats: {} };
  }

  async getAllUsers(query?: any) {
    return { users: [] };
  }

  async updateUser(userId: string, updates: any) {
    return { success: true };
  }

  async getAllAgentsAdmin() {
    return { agents: [] };
  }

  async getAllCallsAdmin() {
    return { calls: [] };
  }

  // Razorpay: Create outbound topup order
  async createRazorpayOrder(companyId: number | string, amount: number) {
    const apiKey = (import.meta as any).env?.VITE_API_SECRET_KEY || localStorage.getItem('api_secret_key') || '';
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ company_id: companyId, amount }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Failed to create Razorpay order');
    }
    return res.json();
  }
}

export const apiClient = new APIClient();
