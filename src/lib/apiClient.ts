import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage if it exists
    this.token = localStorage.getItem('authToken');
    if (this.token) {
      this.setAuthHeader(this.token);
    }
  }

  private setAuthHeader(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Auth
  async signup(email: string, password: string, name: string, company?: string) {
    const response = await this.client.post('/auth/signup', {
      email,
      password,
      name,
      company,
    });
    if (response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('authToken', this.token);
      this.setAuthHeader(this.token);
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    if (response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('authToken', this.token);
      this.setAuthHeader(this.token);
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Agents
  async createAgent(agentData: any) {
    const response = await this.client.post('/agents', agentData);
    return response.data;
  }

  async getAgents() {
    const response = await this.client.get('/agents');
    return response.data;
  }

  async getAgent(id: string) {
    const response = await this.client.get(`/agents/${id}`);
    return response.data;
  }

  async updateAgent(id: string, agentData: any) {
    const response = await this.client.put(`/agents/${id}`, agentData);
    return response.data;
  }

  async deleteAgent(id: string) {
    const response = await this.client.delete(`/agents/${id}`);
    return response.data;
  }

  // Phone Numbers (admin)
  async getNumbers() {
    const response = await this.client.get('/admin/numbers');
    return response.data;
  }

  async createNumber(numberData: any) {
    const response = await this.client.post('/admin/numbers', numberData);
    return response.data;
  }

  async updateNumber(id: string, data: any) {
    const response = await this.client.put(`/admin/numbers/${id}`, data);
    return response.data;
  }

  async deleteNumber(id: string) {
    const response = await this.client.delete(`/admin/numbers/${id}`);
    return response.data;
  }

  // Calls
  async createCall(callData: any) {
    const response = await this.client.post('/calls', callData);
    return response.data;
  }

  async getCalls(query?: any) {
    const response = await this.client.get('/calls', { params: query });
    return response.data;
  }

  async getCall(id: string) {
    const response = await this.client.get(`/calls/${id}`);
    return response.data;
  }

  async getCallStats() {
    const response = await this.client.get('/calls/stats');
    return response.data;
  }

  // Contacts
  async submitContact(contactData: any) {
    const response = await this.client.post('/contacts', contactData);
    return response.data;
  }

  async getContacts(query?: any) {
    const response = await this.client.get('/contacts', { params: query });
    return response.data;
  }

  async updateContactStatus(id: string, status: string) {
    const response = await this.client.put(`/contacts/${id}`, { status });
    return response.data;
  }

  // Context Management
  async processFileForContext(agentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('agentId', agentId);
    
    const response = await this.client.post('/context/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async saveContext(agentId: string, context: string) {
    const response = await this.client.post('/context/save', { agentId, context });
    return response.data;
  }

  async getContext(agentId: string) {
    const response = await this.client.get(`/context/${agentId}`);
    return response.data;
  }

  async crawlWebsiteForContext(agentId: string, url: string) {
    const response = await this.client.post('/context/crawl', { agentId, url });
    return response.data;
  }

  async clearContext(agentId: string, type: 'file' | 'website' | 'all', index?: number) {
    const response = await this.client.delete(`/context/${agentId}/clear`, { 
      data: { type, index } 
    });
    return response.data;
  }

  // Agent Deployment
  async deployAgent(agentId: string) {
    const response = await this.client.post(`/agents/${agentId}/deploy`);
    return response.data;
  }

  // Settings
  async getSettings() {
    const response = await this.client.get('/settings');
    return response.data;
  }

  async updateSettings(settings: any) {
    const response = await this.client.put('/settings', settings);
    return response.data;
  }

  async regenerateApiKey() {
    const response = await this.client.post('/settings/regenerate-api-key');
    return response.data;
  }

  async connectIntegration(name: string, data: any) {
    const response = await this.client.post(`/settings/integrations/${name}/connect`, data);
    return response.data;
  }

  async disconnectIntegration(name: string) {
    const response = await this.client.delete(`/settings/integrations/${name}`);
    return response.data;
  }

  // Admin
  async getSystemStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  async getAllUsers(query?: any) {
    const response = await this.client.get('/admin/users', { params: query });
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async getAllAgentsAdmin(query?: any) {
    const response = await this.client.get('/admin/agents', { params: query });
    return response.data;
  }

  async getAllCallsAdmin(query?: any) {
    const response = await this.client.get('/admin/calls', { params: query });
    return response.data;
  }

  // Leads
  async getLeads(query?: any) {
    const response = await this.client.get('/leads', { params: query });
    return response.data;
  }

  async getLead(id: string) {
    const response = await this.client.get(`/leads/${id}`);
    return response.data;
  }

  async createLead(leadData: any) {
    const response = await this.client.post('/leads', leadData);
    return response.data;
  }

  async updateLead(id: string, leadData: any) {
    const response = await this.client.put(`/leads/${id}`, leadData);
    return response.data;
  }

  async deleteLead(id: string) {
    const response = await this.client.delete(`/leads/${id}`);
    return response.data;
  }

  async getLeadStats() {
    const response = await this.client.get('/leads/stats');
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiClient = new APIClient();
