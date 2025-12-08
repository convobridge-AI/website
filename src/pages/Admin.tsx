import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Bot, Phone, TrendingUp, Search, Loader2, 
  Trash2, Edit, Shield, Activity, Database, Settings,
  BarChart3, Clock, CheckCircle, XCircle, AlertCircle,
  MessageSquare, Plus, RefreshCw
} from 'lucide-react';

interface SystemStats {
  users: { total: number };
  agents: { total: number; active: number; deployed: number };
  calls: { total: number; last24h: number; avgDuration: number };
  leads: { total: number };
}

interface User {
  _id: string;
  name: string;
  email: string;
  company?: string;
  role: string;
  isActive?: boolean;
  createdAt: string;
}

interface Agent {
  _id: string;
  name: string;
  type: string;
  userId: { name: string; email: string };
  isDeployed: boolean;
  isActive: boolean;
  asteriskExtension?: string;
  stats?: { totalCalls: number; successRate: number };
  createdAt: string;
}

interface Call {
  _id: string;
  callerNumber: string;
  agentId: { name: string };
  userId: { name: string; email: string };
  status: string;
  duration: number;
  outcome?: string;
  createdAt: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  createdAt: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [numbers, setNumbers] = useState<any[]>([]);
  
  // Form states
  const [searchQuery, setSearchQuery] = useState('');
  const [newNumber, setNewNumber] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load stats
      try {
        const statsRes = await apiClient.getSystemStats();
        setStats(statsRes.stats);
      } catch (err) {
        console.log('Stats not available:', err);
      }

      // Load users
      try {
        const usersRes = await apiClient.getAllUsers();
        setUsers(usersRes.users || []);
      } catch (err) {
        console.log('Users not available:', err);
      }

      // Load agents
      try {
        const agentsRes = await apiClient.getAllAgentsAdmin();
        setAgents(agentsRes.agents || []);
      } catch (err) {
        console.log('Agents not available:', err);
      }

      // Load calls
      try {
        const callsRes = await apiClient.getAllCallsAdmin();
        setCalls(callsRes.calls || []);
      } catch (err) {
        console.log('Calls not available:', err);
      }

      // Load contacts
      try {
        const contactsRes = await apiClient.getContacts();
        setContacts(contactsRes.contacts || contactsRes || []);
      } catch (err) {
        console.log('Contacts not available:', err);
      }

      // Load numbers
      try {
        const numsRes = await apiClient.getNumbers();
        setNumbers(numsRes.numbers || numsRes || []);
      } catch (err) {
        console.log('Numbers not available:', err);
      }

    } catch (err) {
      toast({ title: 'Error loading admin data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await apiClient.updateUser(userId, { role: newRole });
      toast({ title: 'User role updated' });
      loadAllData();
    } catch (err) {
      toast({ title: 'Failed to update user', variant: 'destructive' });
    }
  };

  const handleAddNumber = async () => {
    if (!newNumber.trim()) return;
    try {
      await apiClient.createNumber({ number: newNumber.trim() });
      toast({ title: 'Number added' });
      setNewNumber('');
      loadAllData();
    } catch (err: any) {
      toast({ title: err.response?.data?.message || 'Failed to add number', variant: 'destructive' });
    }
  };

  const handleDeleteNumber = async (id: string) => {
    try {
      await apiClient.deleteNumber(id);
      toast({ title: 'Number deleted' });
      setNumbers((s) => s.filter(n => n._id !== id));
    } catch (err) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, agents, calls, and system settings</p>
        </div>
        <Button onClick={loadAllData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.users?.total || users.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Bot className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.agents?.deployed || agents.filter(a => a.isDeployed).length || 0}</p>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Phone className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.calls?.last24h || 0}</p>
              <p className="text-sm text-muted-foreground">Calls (24h)</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">{Math.round(stats?.calls?.avgDuration || 0)}s</p>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full max-w-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-1">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Calls</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="numbers" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Numbers</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {calls.slice(0, 5).map((call) => (
                  <div key={call._id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{call.callerNumber || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{call.agentId?.name || 'N/A'}</p>
                    </div>
                    <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                      {call.status}
                    </Badge>
                  </div>
                ))}
                {calls.length === 0 && (
                  <p className="text-muted-foreground text-sm">No recent calls</p>
                )}
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API Server</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Gemini API</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Asterisk Bridge</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">Pending</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{calls.length}</p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-sm text-muted-foreground">Contacts</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{numbers.length}</p>
                <p className="text-sm text-muted-foreground">Phone Numbers</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.company && (
                          <p className="text-xs text-muted-foreground">{user.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role || 'user'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateUserRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="space-y-2">
            {agents.length === 0 ? (
              <Card className="p-8 text-center">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No agents created yet</p>
              </Card>
            ) : (
              agents.map((agent) => (
                <Card key={agent._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{agent.name}</p>
                        <Badge variant="outline">{agent.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Extension: {agent.asteriskExtension || 'Not assigned'} • 
                        Owner: {agent.userId?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agent.stats?.totalCalls || 0} calls • {agent.stats?.successRate || 0}% success
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={agent.isDeployed ? 'default' : 'secondary'}>
                        {agent.isDeployed ? 'Deployed' : 'Draft'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <Switch checked={agent.isActive} disabled />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Calls Tab */}
        <TabsContent value="calls" className="space-y-4">
          <div className="space-y-2">
            {calls.length === 0 ? (
              <Card className="p-8 text-center">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No calls recorded yet</p>
              </Card>
            ) : (
              calls.map((call) => (
                <Card key={call._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{call.callerNumber || 'Unknown Caller'}</p>
                      <p className="text-sm text-muted-foreground">
                        Agent: {call.agentId?.name || 'N/A'} • 
                        Duration: {call.duration}s
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(call.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        call.status === 'completed' ? 'default' : 
                        call.status === 'failed' ? 'destructive' : 
                        'secondary'
                      }>
                        {call.status}
                      </Badge>
                      {call.outcome && (
                        <Badge variant="outline">{call.outcome}</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contact submissions yet</p>
              </Card>
            ) : (
              contacts.map((contact) => (
                <Card key={contact._id} className="p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      {contact.company && (
                        <p className="text-xs text-muted-foreground">{contact.company}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{contact.message}</p>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Numbers Tab */}
        <TabsContent value="numbers" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Add Phone Number</h3>
            <div className="flex gap-2">
              <Input 
                value={newNumber} 
                onChange={(e) => setNewNumber(e.target.value)} 
                placeholder="+1 (555) 000-0000" 
              />
              <Button onClick={handleAddNumber}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </Card>

          <div className="space-y-2">
            {numbers.length === 0 ? (
              <Card className="p-8 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No phone numbers configured</p>
              </Card>
            ) : (
              numbers.map((num) => (
                <Card key={num._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium font-mono">{num.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {num.label || num.provider || (num.available ? 'Available' : 'In Use')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={num.available !== false ? 'default' : 'secondary'}>
                        {num.available !== false ? 'Available' : 'In Use'}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteNumber(num._id)}
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
      </Tabs>
    </div>
  );
}
