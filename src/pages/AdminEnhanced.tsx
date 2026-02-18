import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Users, Bot, Phone, TrendingUp, Search, Loader2, Plus, Trash2, Mail } from 'lucide-react';

export default function AdminEnhanced() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [newNumber, setNewNumber] = useState({ phone_number: '', friendly_name: '', provider: 'twilio' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, agentsRes, callsRes, numbersRes, contactsRes] = await Promise.all([
        apiClient.getSystemStats(),
        apiClient.getAllUsers(),
        apiClient.getAllAgentsAdmin(),
        apiClient.getAllCallsAdmin(),
        apiClient.getNumbers(),
        apiClient.getContacts(),
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setAgents(agentsRes.agents);
      setCalls(callsRes.calls);
      setPhoneNumbers(numbersRes.numbers);
      setContacts(contactsRes.contacts);
    } catch (err) {
      toast({ title: 'Failed to load admin data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNumber = async () => {
    try {
      await apiClient.createNumber(newNumber);
      toast({ title: 'Phone number added successfully' });
      setIsAddingNumber(false);
      setNewNumber({ phone_number: '', friendly_name: '', provider: 'twilio' });
      loadData();
    } catch (err) {
      toast({ title: 'Failed to add phone number', variant: 'destructive' });
    }
  };

  const handleDeleteNumber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this number?')) return;
    try {
      await apiClient.deleteNumber(id);
      toast({ title: 'Phone number deleted' });
      loadData();
    } catch (err) {
      toast({ title: 'Failed to delete phone number', variant: 'destructive' });
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await apiClient.updateUser(userId, updates);
      toast({ title: 'User updated successfully' });
      loadData();
    } catch (err) {
      toast({ title: 'Failed to update user', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-h2 mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide management and analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Bot className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.agents?.deployed || 0}</p>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Phone className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.calls?.last24h || 0}</p>
              <p className="text-sm text-muted-foreground">Calls (24h)</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round(stats?.calls?.avgDuration || 0)}s</p>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="numbers">Phone Numbers</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {user.role}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateUser(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })}
                    >
                      Toggle Admin
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="space-y-2">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Extension: {agent.asteriskExtension || 'Not assigned'} • 
                      Owner: {agent.userId?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${agent.isDeployed ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {agent.isDeployed ? 'Deployed' : 'Draft'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <div className="space-y-2">
            {calls.map((call) => (
              <Card key={call.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{call.callerNumber || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      Agent: {call.agentId?.name || 'N/A'} • 
                      Duration: {call.duration}s • 
                      {new Date(call.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    call.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                    call.status === 'failed' ? 'bg-red-500/10 text-red-500' : 
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {call.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="numbers" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Available Phone Numbers</h3>
            <Button onClick={() => setIsAddingNumber(!isAddingNumber)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Number
            </Button>
          </div>

          {isAddingNumber && (
            <Card className="p-6 border-primary/20 bg-primary/5 animate-fade-in-up mb-6">
              <h4 className="font-semibold mb-4">Register New Number</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number (E.164)</label>
                  <Input 
                    placeholder="+1234567890" 
                    value={newNumber.phone_number} 
                    onChange={(e) => setNewNumber({...newNumber, phone_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Friendly Name</label>
                  <Input 
                    placeholder="Support Line" 
                    value={newNumber.friendly_name} 
                    onChange={(e) => setNewNumber({...newNumber, friendly_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider</label>
                  <select 
                    className="w-full h-10 px-3 border rounded-lg bg-background"
                    value={newNumber.provider}
                    onChange={(e) => setNewNumber({...newNumber, provider: e.target.value})}
                  >
                    <option value="twilio">Twilio</option>
                    <option value="plivo">Plivo</option>
                    <option value="asterisk">Asterisk (Internal)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setIsAddingNumber(false)}>Cancel</Button>
                <Button onClick={handleAddNumber}>Register Number</Button>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            {phoneNumbers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                No phone numbers registered in the system.
              </div>
            ) : (
              phoneNumbers.map((num) => (
                <Card key={num.id} className="p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{num.phone_number}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          num.status === 'active' ? 'bg-success/10 text-success' : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {num.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {num.friendly_name || 'No Label'} • Provider: {num.provider}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Assigned To</p>
                        <p className="text-sm font-medium">
                          {num.assignment_type === 'unassigned' ? (
                            <span className="text-muted-foreground italic">Available for users</span>
                          ) : (
                            num.assigned_to_id || 'Unknown' 
                          )}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
                        onClick={() => handleDeleteNumber(num.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                No contact form submissions found.
              </div>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className="p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.email} • {contact.company || 'Private'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(contact.createdAt || contact.created_at).toLocaleString()}</span>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg text-sm italic">
                    "{contact.message}"
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${contact.email}`}>
                      Reply via Email
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
