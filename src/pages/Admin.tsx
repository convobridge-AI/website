import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Plus, 
  Loader2, 
  Search,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

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

  const loadData = async () => {
    setLoading(true);
    try {
      // Use the standard company listing which RLS will filter for administrators to see all
      const companiesRes = await apiClient.getCompanies();
      setCompanies(companiesRes.companies || []);
    } catch (err: any) {
      toast({ title: 'Error loading companies', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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

      toast({ 
        title: 'Credits Added Successfully', 
        description: `$${topupAmount} added to ${selectedCompany.name}`,
      });
      
      setSelectedCompany(null);
      setTopupAmount('50');
      loadData(); // Refresh balance
    } catch (err: any) {
      toast({ title: 'Top-up failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsTopupLoading(false);
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
          { label: 'Active Calls', value: '4', icon: TrendingUp, color: 'text-green-600' },
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
    </div>
  );
}
