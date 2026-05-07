import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Building2, CreditCard, TrendingUp, Users,
  Plus, Loader2, Search, CheckCircle2, DollarSign,
  Phone, Hash, Bot, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Top-up Modal State
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [topupAmount, setTopupAmount] = useState('50');
  const [topupMethod, setTopupMethod] = useState('manual');
  const [isTopupLoading, setIsTopupLoading] = useState(false);

  // DID Pool State
  const [didNumbers, setDidNumbers] = useState<any[]>([]);
  const [didLoading, setDidLoading] = useState(false);
  const [addNumberOpen, setAddNumberOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newNumberCompany, setNewNumberCompany] = useState('');
  const [addingNumber, setAddingNumber] = useState(false);
  const [allAgents, setAllAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const companiesRes = await apiClient.getCompanies();
      setCompanies(companiesRes.companies || []);
    } catch (err: any) {
      toast({ title: 'Error loading companies', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadDids = async () => {
    setDidLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_phone_numbers');
      if (error) throw error;
      setDidNumbers(data || []);
    } catch (err: any) {
      toast({ title: 'Error loading phone numbers', description: err.message, variant: 'destructive' });
    } finally {
      setDidLoading(false);
    }
  };

  const loadAgents = async () => {
    setAgentsLoading(true);
    try {
      // Get agents and join with company to show owner name
      const { data, error } = await supabase
        .from('agents')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllAgents(data || []);
    } catch (err: any) {
      toast({ title: 'Error loading global agents', description: err.message, variant: 'destructive' });
    } finally {
      setAgentsLoading(false);
    }
  };

  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await apiClient.getContacts();
      setContacts(res.contacts || []);
    } catch (err: any) {
      toast({ title: 'Error loading contacts', description: err.message, variant: 'destructive' });
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => { loadData(); loadDids(); loadAgents(); loadContacts(); }, []);

  const handleAgentDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    
    try {
      await apiClient.deleteAgent(id);
      toast({ title: 'Agent Deleted', description: `Successfully removed "${name}"` });
      loadAgents();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleTopup = async () => {
    if (!selectedCompany || !topupAmount) return;
    setIsTopupLoading(true);
    try {
      await apiClient.createTopup({
        company_id: selectedCompany.id,
        amount: parseFloat(topupAmount),
        method: topupMethod,
        reference: `Admin Topup - ${new Date().toLocaleDateString()}`
      });
      toast({ title: 'Credits Added Successfully', description: `$${topupAmount} added to ${selectedCompany.name}` });
      setSelectedCompany(null);
      setTopupAmount('50');
      loadData();
    } catch (err: any) {
      toast({ title: 'Top-up failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleAssignNumber = async (numberId: number, companyId: string) => {
    try {
      const { error } = await supabase.rpc('admin_assign_phone_number', {
        number_id_param: numberId,
        company_id_param: parseInt(companyId)
      });
      if (error) throw error;
      toast({ title: 'DID reassigned successfully' });
      loadDids();
    } catch (err: any) {
      toast({ title: 'Failed to reassign DID', description: err.message, variant: 'destructive' });
    }
  };

  const handleAddNumber = async () => {
    if (!newNumber) return;
    setAddingNumber(true);
    try {
      const { error } = await supabase.rpc('admin_add_phone_number', {
        phone_number_param: newNumber.replace(/\D/g, ''),
        label_param: newLabel || newNumber,
        company_id_param: newNumberCompany ? parseInt(newNumberCompany) : null
      });
      if (error) throw error;
      toast({ title: `${newNumber} added to DID pool` });
      setAddNumberOpen(false);
      setNewNumber('');
      setNewLabel('');
      setNewNumberCompany('');
      loadDids();
    } catch (err: any) {
      toast({ title: 'Failed to add number', description: err.message, variant: 'destructive' });
    } finally {
      setAddingNumber(false);
    }
  };

  const handleContactStatusUpdate = async (id: string, status: string) => {
    try {
      await apiClient.updateContactStatus(id, status);
      toast({ title: 'Status Updated', description: `Inquiry marked as ${status}` });
      loadContacts();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-display font-semibold tracking-tight">Platform Admin</h1>
          <p className="text-body text-muted-foreground mt-2">Manage tenants, billing, and system scaling.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-11 px-6">
            <Plus className="mr-2 h-4 w-4" /> New Tenant
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Tenants', value: companies.length, icon: Building2, color: 'text-blue-600' },
          { label: 'Total AI Agents', value: allAgents.length, icon: Bot, color: 'text-indigo-600' },
          { label: 'Platform Revenue', value: `$${companies.reduce((acc, c) => acc + parseFloat(c.credit_balance || 0), 0).toFixed(2)}`, icon: DollarSign, color: 'text-purple-600' },
          { label: 'Total Leads', value: companies.reduce((acc, c) => acc + (c.leads_count?.[0]?.count || 0), 0), icon: Users, color: 'text-orange-600' },
        ].map((stat, i) => (
          <Card key={i} className="stripe-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-h3 font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="stripe-card overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Tenants & Organizations</CardTitle>
              <CardDescription>Manage balances and monitor usage for all registered companies.</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or slug..." 
                className="pl-10 h-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-caption font-semibold text-muted-foreground border-b border-gray-100">
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Rate/Min</th>
                  <th className="px-6 py-4">Total Usage</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8 h-16 bg-gray-50/20" />
                    </tr>
                  ))
                ) : filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {company.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-body font-medium">{company.name}</p>
                          <p className="text-caption text-muted-foreground">{company.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${company.active ? 'bg-green-500' : 'bg-red-500'}`} />
                        {company.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-body font-semibold ${
                        parseFloat(company.credit_balance) < parseFloat(company.min_balance) ? 'text-red-600' : 'text-foreground'
                      }`}>
                        ${parseFloat(company.credit_balance).toFixed(2)}
                      </p>
                      <p className="text-caption text-muted-foreground">Min: ${company.min_balance}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-body">${company.rate_per_minute}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-caption font-medium uppercase tracking-tighter text-muted-foreground">Calls</p>
                          <p className="text-body">{company.calls_count?.[0]?.count || 0}</p>
                        </div>
                        <div>
                          <p className="text-caption font-medium uppercase tracking-tighter text-muted-foreground">Leads</p>
                          <p className="text-body">{company.leads_count?.[0]?.count || 0}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 hover:bg-primary hover:text-white border-primary/20"
                            onClick={() => setSelectedCompany(company)}
                          >
                            <CreditCard className="mr-2 h-4 w-4" /> Manage Credits
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              Add Credits to {selectedCompany?.name}
                            </DialogTitle>
                            <DialogDescription>
                              The organization's balance will be updated instantly upon submission.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Top-up Amount ($)</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number" 
                                  value={topupAmount} 
                                  onChange={(e) => setTopupAmount(e.target.value)} 
                                  className="pl-10 h-12 text-lg" 
                                  placeholder="50.00"
                                />
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Current Balance</span>
                                <span className="font-medium">${Number(selectedCompany?.credit_balance ?? 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-base font-bold text-green-600">
                                <span>New Balance</span>
                                <span>${(Number(selectedCompany?.credit_balance ?? 0) + Number(topupAmount || 0)).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="flex gap-2">
                            <Button 
                              className="w-full h-12 text-base font-semibold" 
                              onClick={handleTopup}
                              disabled={isTopupLoading || !topupAmount}
                            >
                              {isTopupLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                              Confirm & Recharge
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Agents Management ───────────────────────────────────── */}
      <Card className="stripe-card overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> Global Agents Manager</CardTitle>
              <CardDescription>View, edit, and moderate all AI agents active on the platform.</CardDescription>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{allAgents.length} Agents Found</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-caption font-semibold text-muted-foreground border-b border-gray-100">
                  <th className="px-6 py-4">Agent Name</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Voice</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agentsLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                ) : allAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="font-medium text-body">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{(agent.companies as any)?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono bg-muted/50 px-2 py-0.5 rounded">{agent.voice}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {agent.is_deployed && <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] uppercase font-bold">Deployed</span>}
                        {agent.is_active && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] uppercase font-bold">In-Use</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary h-8"
                          onClick={() => window.location.href = `/dashboard/agents/edit/${agent.id}`}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive h-8"
                          onClick={() => handleAgentDelete(agent.id, agent.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      {/* ── DID Pool Management ──────────────────────────────────────── */}
      <Card className="stripe-card overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-primary" /> DID Pool</CardTitle>
              <CardDescription>Manage phone numbers and assign them to tenants.</CardDescription>
            </div>
            <Dialog open={addNumberOpen} onOpenChange={setAddNumberOpen}>
              <DialogTrigger asChild>
                <Button className="h-10">
                  <Plus className="mr-2 h-4 w-4" /> Add DID Number
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Phone Number to Pool</DialogTitle>
                  <DialogDescription>Enter the DID number from your Asterisk/SIP trunk.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number *</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="919876543210" value={newNumber}
                        onChange={e => setNewNumber(e.target.value)} className="pl-10" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Enter digits only, with country code (e.g. 91XXXXXXXXXX)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Label / Description</label>
                    <Input placeholder="KSRTC Support Line" value={newLabel}
                      onChange={e => setNewLabel(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Assign to Company (optional)</label>
                    <Select value={newNumberCompany} onValueChange={setNewNumberCompany}>
                      <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button onClick={handleAddNumber} disabled={addingNumber || !newNumber} className="w-full">
                    {addingNumber ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Add to Pool
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-caption font-semibold text-muted-foreground border-b border-gray-100">
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Label</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4 text-right">Reassign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {didLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </td></tr>
                ) : didNumbers.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No phone numbers in pool yet.
                  </td></tr>
                ) : didNumbers.map((num) => (
                  <tr key={num.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold">+{num.phone_number}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{num.label || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        num.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${num.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {num.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {num.company_name
                        ? <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                            <Building2 className="h-3 w-3" /> {num.company_name}
                          </span>
                        : <span className="text-muted-foreground text-sm italic">Unassigned</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{num.provider}</td>
                    <td className="px-6 py-4 text-right">
                      <Select
                        defaultValue={num.company_id ? String(num.company_id) : ''}
                        onValueChange={(val) => handleAssignNumber(num.id, val)}
                      >
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue placeholder="Reassign..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Contact Inquiries ────────────────────────────────────────── */}
      <Card className="stripe-card overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Contact Inquiries</CardTitle>
              <CardDescription>Messages from potential customers and demo requests.</CardDescription>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{contacts.length} Inquiries</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-caption font-semibold text-muted-foreground border-b border-gray-100">
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contactsLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                ) : contacts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">No inquiries received yet.</td></tr>
                ) : contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-body font-medium">{contact.name}</p>
                        <p className="text-caption text-muted-foreground">{contact.email}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(contact.created_at).toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{contact.company || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-muted-foreground max-w-xs line-clamp-2" title={contact.message}>{contact.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        contact.status === 'pending' ? 'bg-orange-50 text-orange-700' : 
                        contact.status === 'contacted' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Select 
                        defaultValue={contact.status}
                        onValueChange={(val) => handleContactStatusUpdate(contact.id, val)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
