import { useState, useMemo, useEffect } from "react";
import {
  Home, PhoneIncoming, Bot, Users, Settings, LogOut, Menu, X, Phone,
  BarChart3, TrendingUp, Clock, Search, Plus, MoreVertical, ArrowUpRight,
  ArrowDownRight, Eye, Download, ChevronLeft, ChevronRight,
  AlertCircle, Zap, CheckCircle2, Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [callDetailOpen, setCallDetailOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [callsFilter, setCallsFilter] = useState("all");
  const [callsSearch, setCallsSearch] = useState("");
  const [callsPage, setCallsPage] = useState(1);
  const [userName, setUserName] = useState("User");

  // Fetch real data from MongoDB via API
  const { stats, calls, agents, leads, numbers, loading } = useDashboardData();

  // Get user info on mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || "User");
      } catch (e) {
        setUserName("User");
      }
    }
  }, []);

  const menuItems = [
    { icon: Home, label: "Home", id: "home" },
    { icon: Bot, label: "Agents", id: "agents" },
    { icon: PhoneIncoming, label: "Calls", id: "calls" },
    { icon: Users, label: "Leads", id: "leads" },
    { icon: BarChart3, label: "Analytics", id: "analytics" },
    { icon: Settings, label: "Settings", id: "settings" }
  ];

  // Format real metrics from MongoDB stats
  const metrics = stats ? [
    {
      label: "Total Calls",
      value: stats.totalCalls?.toLocaleString() || "0",
      trend: "+0%",
      trendUp: true,
      icon: Phone,
      color: "bg-blue-500/10 text-blue-600",
      previous: "—"
    },
    {
      label: "Active Agents",
      value: agents?.filter(a => a.isActive).length || "0",
      trend: "+0",
      trendUp: true,
      icon: Bot,
      color: "bg-purple-500/10 text-purple-600",
      previous: "—"
    },
    {
      label: "New Leads",
      value: leads?.length || "0",
      trend: "+0%",
      trendUp: true,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
      previous: "—"
    },
    {
      label: "Success Rate",
      value: stats.successRate ? `${(stats.successRate * 100).toFixed(1)}%` : "0%",
      trend: "+0%",
      trendUp: true,
      icon: CheckCircle2,
      color: "bg-orange-500/10 text-orange-600",
      previous: "—"
    }
  ] : [];

  // Helper function to format duration from seconds to MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds && seconds !== 0) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to format date
  const formatTime = (date?: string | Date) => {
    if (!date) return "—";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  const filteredCalls = useMemo(() => {
    if (!calls) return [];
    return calls.filter((call: any) => {
      const matchesFilter = callsFilter === "all" || call.status === callsFilter;
      const matchesSearch = callsSearch === "" || 
        call.agentId?.name?.toLowerCase().includes(callsSearch.toLowerCase()) || 
        call.phoneNumber?.includes(callsSearch);
      return matchesFilter && matchesSearch;
    });
  }, [callsFilter, callsSearch, calls]);

  const callsPerPage = 5;
  const totalPages = Math.ceil(filteredCalls.length / callsPerPage);
  const paginatedCalls = filteredCalls.slice((callsPage - 1) * callsPerPage, callsPage * callsPerPage);

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in-up">
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
              <div className="h-12 w-12 bg-muted rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2 w-24"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <div
                key={idx}
                className="bg-card border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.color}`}>
                    <metric.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                    {metric.trendUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {metric.trend}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-foreground mb-2">{metric.value}</p>
                <p className="text-xs text-muted-foreground">vs {metric.previous} last period</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border rounded-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-h3 font-semibold">Recent Calls</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("calls")}>
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Existing search/filter section */}
              <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by agent or number..."
                  value={callsSearch}
                  onChange={(e) => {
                    setCallsSearch(e.target.value);
                    setCallsPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={callsFilter} onValueChange={(val) => {
                setCallsFilter(val);
                setCallsPage(1);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Number</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Outcome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedCalls.length > 0 ? (
                    paginatedCalls.map((call: any) => (
                      <tr key={call.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-muted-foreground">{formatTime(call.startedAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{call.agentId?.name || 'Unknown Agent'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{call.phoneNumber || '—'}</td>
                        <td className="px-6 py-4 text-sm font-mono">{formatDuration(call.duration)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            call.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                            call.status === 'missed' ? 'bg-red-500/10 text-red-600' :
                            call.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {call.outcome || call.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedCall(call);
                              setCallDetailOpen(true);
                            }}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">No calls found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Showing {(callsPage - 1) * callsPerPage + 1} to {Math.min(callsPage * callsPerPage, filteredCalls.length)} of {filteredCalls.length} calls
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCallsPage(Math.max(1, callsPage - 1))}
                    disabled={callsPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm font-medium">
                    Page {callsPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCallsPage(Math.min(totalPages, callsPage + 1))}
                    disabled={callsPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  My Numbers
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">
                  {numbers.length} Active
                </span>
              </div>
              
              <div className="space-y-3">
                {numbers.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">No numbers assigned</p>
                  </div>
                ) : (
                  numbers.slice(0, 3).map((num: any) => (
                    <div key={num.id} className="p-3 border rounded-lg hover:border-primary/30 transition-all">
                      <p className="font-bold text-sm tracking-tighter">{num.phone_number}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-muted-foreground">{num.friendly_name || 'Direct Line'}</p>
                        <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <Button variant="ghost" className="w-full mt-4 text-xs h-8 text-primary" onClick={() => setActiveTab("settings")}>
                Request another number
              </Button>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-500" />
                Active Agents
              </h3>
              <div className="space-y-3">
                {agents?.filter(a => a.isActive).slice(0, 2).map((agent: any) => (
                  <div key={agent.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{agent.type}</p>
                    </div>
                  </div>
                ))}
                {agents?.filter(a => a.isActive).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No active agents</p>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4 text-xs h-8" onClick={() => setActiveTab("agents")}>
                Manage All Agents
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-lg p-8 flex items-center justify-between" style={{ animationDelay: "300ms" }}>
            <div>
              <h3 className="text-h3 font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Ready to create your next agent?
              </h3>
              <p className="text-muted-foreground">Build powerful AI calling agents in minutes with our intuitive builder.</p>
            </div>
            <Dialog open={createAgentOpen} onOpenChange={setCreateAgentOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Agent</DialogTitle>
                  <DialogDescription>
                    Choose a template to start building your AI agent
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "Sales Agent", icon: "🎯" },
                    { name: "Support Agent", icon: "🛟" },
                    { name: "Scheduling", icon: "📅" },
                    { name: "Custom", icon: "⚙️" }
                  ].map((template) => (
                    <button
                      key={template.name}
                      className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                      onClick={() => {
                        window.location.href = "/dashboard/agents/new";
                      }}
                    >
                      <div className="text-2xl mb-2">{template.icon}</div>
                      <p className="text-sm font-medium">{template.name}</p>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">Your Agents</h2>
        <Dialog open={createAgentOpen} onOpenChange={setCreateAgentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Create New Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Choose a template to start building your AI agent
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Sales Agent", icon: "🎯" },
                { name: "Support Agent", icon: "🛟" },
                { name: "Scheduling", icon: "📅" },
                { name: "Custom", icon: "⚙️" }
              ].map((template) => (
                <button
                  key={template.name}
                  className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                  onClick={() => {
                    window.location.href = "/dashboard/agents/new";
                  }}
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <p className="text-sm font-medium">{template.name}</p>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-muted rounded mb-4 w-32"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ) : agents && agents.length > 0 ? (
        <div className="grid gap-4">
          {agents.map((agent: any) => (
            <div
              key={agent.id}
              className="bg-card border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.type} • {agent.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {agent.isActive && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                      Active
                    </span>
                  )}
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Calls</p>
                  <p className="text-2xl font-bold">{agent.stats?.totalCalls || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(agent.stats?.successRate || 0) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-bold">{((agent.stats?.successRate || 0) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {agent.systemPrompt && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">System Prompt</p>
                  <p className="text-sm text-foreground line-clamp-2">{agent.systemPrompt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-h3 font-semibold mb-2">No Agents Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first AI agent to get started</p>
          <Button onClick={() => setCreateAgentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Agent
          </Button>
        </div>
      )}
    </div>
  );

  const renderCalls = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">Call History</h2>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by agent or number..."
              value={callsSearch}
              onChange={(e) => {
                setCallsSearch(e.target.value);
                setCallsPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={callsFilter} onValueChange={(val) => {
            setCallsFilter(val);
            setCallsPage(1);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Outcome</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Loader className="h-5 w-5 text-muted-foreground mx-auto animate-spin" />
                  </td>
                </tr>
              ) : paginatedCalls.length > 0 ? (
                paginatedCalls.map((call: any) => (
                  <tr key={call.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatTime(call.startedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{call.agentId?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{call.phoneNumber || '—'}</td>
                    <td className="px-6 py-4 text-sm font-mono">{formatDuration(call.duration)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        call.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                        call.status === 'missed' ? 'bg-red-500/10 text-red-600' :
                        call.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                        call.status === 'answered' ? 'bg-blue-500/10 text-blue-600' :
                        'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600">
                        {call.outcome || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedCall(call);
                          setCallDetailOpen(true);
                        }}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No calls found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {(callsPage - 1) * callsPerPage + 1} to {Math.min(callsPage * callsPerPage, filteredCalls.length)} of {filteredCalls.length} calls
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCallsPage(Math.max(1, callsPage - 1))}
                disabled={callsPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm font-medium">
                Page {callsPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCallsPage(Math.min(totalPages, callsPage + 1))}
                disabled={callsPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">Leads</h2>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {loading ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Loader className="h-12 w-12 text-muted-foreground mx-auto animate-spin" />
        </div>
      ) : leads && leads.length > 0 ? (
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.slice(0, 10).map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{lead.name || '—'}</td>
                    <td className="px-6 py-4 text-sm">{lead.email || '—'}</td>
                    <td className="px-6 py-4 text-sm font-mono">{lead.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm">{lead.company || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        lead.status === 'new' ? 'bg-blue-500/10 text-blue-600' :
                        lead.status === 'contacted' ? 'bg-yellow-500/10 text-yellow-600' :
                        lead.status === 'qualified' ? 'bg-purple-500/10 text-purple-600' :
                        lead.status === 'converted' ? 'bg-green-500/10 text-green-600' :
                        lead.status === 'lost' ? 'bg-red-500/10 text-red-600' :
                        'bg-gray-500/10 text-gray-600'
                      }`}>
                        {lead.status || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-16">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(lead.score || 0)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-xs">{lead.score || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{lead.source || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-h3 font-semibold mb-2">No Leads Yet</h3>
          <p className="text-muted-foreground">Leads will appear here as calls are converted</p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-h2 font-semibold mb-2">Analytics & Reports</h2>
        <p className="text-muted-foreground">Detailed insights into your call performance</p>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-6 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Calls</p>
              <p className="text-3xl font-bold mb-2">{stats?.totalCalls || 0}</p>
              <p className="text-xs text-green-600">↑ This period</p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
              <p className="text-3xl font-bold mb-2">{((stats?.successRate || 0) * 100).toFixed(1)}%</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(stats?.successRate || 0) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Avg Call Duration</p>
              <p className="text-3xl font-bold mb-2">{formatDuration(stats?.avgDuration || 0)}</p>
              <p className="text-xs text-muted-foreground">Across all calls</p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Active Agents</p>
              <p className="text-3xl font-bold mb-2">{agents?.filter(a => a.isActive).length || 0}</p>
              <p className="text-xs text-muted-foreground">Deployed and active</p>
            </div>
          </div>

          {/* Call Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-h3 font-semibold mb-4">Call Status Distribution</h3>
              <div className="space-y-3">
                {[
                  { status: 'Completed', count: Math.floor((stats?.totalCalls || 0) * 0.75), color: 'bg-green-500' },
                  { status: 'In Progress', count: Math.floor((stats?.totalCalls || 0) * 0.1), color: 'bg-blue-500' },
                  { status: 'Missed', count: Math.floor((stats?.totalCalls || 0) * 0.1), color: 'bg-red-500' },
                  { status: 'Failed', count: Math.floor((stats?.totalCalls || 0) * 0.05), color: 'bg-yellow-500' }
                ].map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.status}</span>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${(item.count / (stats?.totalCalls || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-h3 font-semibold mb-4">Lead Status Distribution</h3>
              <div className="space-y-3">
                {[
                  { status: 'Converted', leads: leads?.filter(l => l.status === 'converted').length || 0, color: 'bg-green-500' },
                  { status: 'Qualified', leads: leads?.filter(l => l.status === 'qualified').length || 0, color: 'bg-purple-500' },
                  { status: 'Contacted', leads: leads?.filter(l => l.status === 'contacted').length || 0, color: 'bg-blue-500' },
                  { status: 'New', leads: leads?.filter(l => l.status === 'new').length || 0, color: 'bg-yellow-500' },
                  { status: 'Lost', leads: leads?.filter(l => l.status === 'lost').length || 0, color: 'bg-red-500' }
                ].map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.status}</span>
                      <span className="text-sm font-semibold">{item.leads}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${(item.leads / Math.max(leads?.length || 1, 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Performance */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-h3 font-semibold mb-4">Agent Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Total Calls</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Success Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {agents && agents.length > 0 ? (
                    agents.map((agent: any) => (
                      <tr key={agent.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-medium">{agent.name}</td>
                        <td className="px-4 py-3 text-sm">{agent.type}</td>
                        <td className="px-4 py-3 text-sm font-mono">{agent.stats?.totalCalls || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-20">
                              <div className="h-full bg-blue-500" style={{ width: `${(agent.stats?.successRate || 0) * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-semibold">{((agent.stats?.successRate || 0) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            agent.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'
                          }`}>
                            {agent.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No agents found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Trends */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-h3 font-semibold mb-4">Period Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Conversion Rate</p>
                <p className="text-2xl font-bold">{leads && leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">{leads?.filter(l => l.status === 'converted').length || 0} converted from {leads?.length || 0} leads</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Avg Quality Score</p>
                <p className="text-2xl font-bold">{leads && leads.length > 0 ? (leads.reduce((sum: number, l: any) => sum + (l.score || 0), 0) / leads.length).toFixed(1) : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on lead scores</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Most Used Source</p>
                <p className="text-2xl font-bold">
                  {leads && leads.length > 0 ? (
                    Object.keys(
                      leads.reduce((acc: Record<string, number>, l: any) => {
                        acc[l.source || 'Direct'] = (acc[l.source || 'Direct'] || 0) + 1;
                        return acc;
                      }, {})
                    ).reduce((a, b) => (
                      (leads.reduce((sum: number, l: any) => sum + (l.source === a ? 1 : 0), 0) > 
                       leads.reduce((sum: number, l: any) => sum + (l.source === b ? 1 : 0), 0)) ? a : b
                    ))
                  ) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Most common lead source</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-fade-in-up max-w-4xl">
      <div>
        <h2 className="text-h2 font-semibold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="bg-card border rounded-lg p-8">
        <h3 className="text-h3 font-semibold mb-6">Account Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Full Name</label>
              <Input value={userName} readOnly disabled className="bg-muted" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
              <Input value={localStorage.getItem("userEmail") || "—"} readOnly disabled className="bg-muted" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-8">
        <h3 className="text-h3 font-semibold mb-6">Default Call Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Default Agent Voice</label>
            <Select defaultValue="alloy">
              <SelectTrigger>
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy (Default)</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="fable">Fable</SelectItem>
                <SelectItem value="onyx">Onyx</SelectItem>
                <SelectItem value="nova">Nova</SelectItem>
                <SelectItem value="shimmer">Shimmer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Default Language</label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Call Recording</label>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" id="recording" />
              <label htmlFor="recording" className="text-sm">Enable call recording by default</label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-8">
        <h3 className="text-h3 font-semibold mb-6">API & Integrations</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">Manage API tokens and third-party integrations</p>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-mono text-muted-foreground">API Key: sk_live_••••••••••••••••</p>
              <Button variant="outline" size="sm" className="mt-3">
                Regenerate API Key
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Integrations</label>
            <div className="grid gap-3">
              {[
                { name: 'Salesforce', icon: '🔷', connected: true },
                { name: 'HubSpot', icon: '🟠', connected: false },
                { name: 'Stripe', icon: '💙', connected: false },
                { name: 'Zapier', icon: '⚡', connected: false }
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.connected ? 'Connected' : 'Not connected'}</p>
                    </div>
                  </div>
                  <Button variant={integration.connected ? "outline" : "default"} size="sm">
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-8">
        <h3 className="text-h3 font-semibold mb-6 text-red-600">Danger Zone</h3>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button>Save Changes</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-card border-r transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0">
          {sidebarOpen && <span className="font-bold text-lg">ConvoBridge</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              title={sidebarOpen ? "" : item.label}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t p-4 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-sm text-primary">{userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">Dashboard User</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-sm"
            title="Logout"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        <div className="sticky top-0 h-16 bg-card border-b px-8 flex items-center justify-between z-20 flex-shrink-0">
          <div>
            <h1 className="text-h3 font-semibold capitalize">{activeTab === "home" ? "Dashboard" : activeTab}</h1>
            <p className="text-xs text-muted-foreground">
              {activeTab === "home" && "Welcome back! Here's your activity overview."}
              {activeTab === "agents" && "Manage your AI calling agents"}
              {activeTab === "calls" && "View all incoming and outgoing calls"}
              {activeTab === "leads" && "Manage and track your leads"}
              {activeTab === "analytics" && "View detailed analytics and reports"}
              {activeTab === "settings" && "Configure your account and preferences"}
            </p>
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Quick search..."
              className="pl-10 w-48"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {activeTab === "home" && renderHome()}
          {activeTab === "agents" && renderAgents()}
          {activeTab === "calls" && renderCalls()}
          {activeTab === "leads" && renderLeads()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "settings" && renderSettings()}
        </div>
      </div>

      <Dialog open={callDetailOpen} onOpenChange={setCallDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              Complete information and transcript for this call
            </DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Agent</p>
                  <p className="font-semibold">{selectedCall.agentId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-mono text-sm">{selectedCall.phoneNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{formatDuration(selectedCall.duration)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedCall.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                    selectedCall.status === 'missed' ? 'bg-red-500/10 text-red-600' :
                    selectedCall.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                    'bg-yellow-500/10 text-yellow-600'
                  }`}>
                    {selectedCall.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Outcome</p>
                  <p className="font-semibold">{selectedCall.outcome || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Call Time</p>
                  <p className="text-sm">{selectedCall.startedAt ? new Date(selectedCall.startedAt).toLocaleString() : '—'}</p>
                </div>
              </div>

              {selectedCall.notes && (
                <div>
                  <h4 className="font-semibold mb-3">Notes</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm">{selectedCall.notes}</p>
                  </div>
                </div>
              )}

              {selectedCall.transcriptId && (
                <div>
                  <h4 className="font-semibold mb-3">Transcript Available</h4>
                  <p className="text-sm text-muted-foreground">Full transcript has been recorded and is available for this call.</p>
                </div>
              )}

              <div className="flex gap-3">
                {selectedCall.recordingId && (
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Recording
                  </Button>
                )}
                <Button variant="outline" className={selectedCall.recordingId ? "flex-1" : "w-full"}>
                  Copy Call ID
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
