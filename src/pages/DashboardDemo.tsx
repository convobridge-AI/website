import { useState, useMemo } from "react";
import {
  Home, PhoneIncoming, Bot, Users, Settings, LogOut, Menu, X, Phone,
  BarChart3, TrendingUp, Clock, Search, Plus, MoreVertical, ArrowUpRight,
  ArrowDownRight, Eye, Download, ChevronLeft, ChevronRight,
  AlertCircle, Zap, CheckCircle2, Mic, MicOff, Volume2, Pause, Play,
  LineChart, Activity, Smartphone, Globe, Lock, Bell, CreditCard
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
import { Slider } from "@/components/ui/slider";

export default function DashboardDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [callDetailOpen, setCallDetailOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [callsFilter, setCallsFilter] = useState("all");
  const [callsSearch, setCallsSearch] = useState("");
  const [callsPage, setCallsPage] = useState(1);
  const [leadsFilter, setLeadsFilter] = useState("all");
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsPage, setLeadsPage] = useState(1);

  const menuItems = [
    { icon: Home, label: "Home", id: "home" },
    { icon: Bot, label: "Agents", id: "agents" },
    { icon: PhoneIncoming, label: "Calls", id: "calls" },
    { icon: Users, label: "Leads", id: "leads" },
    { icon: BarChart3, label: "Analytics", id: "analytics" },
    { icon: Settings, label: "Settings", id: "settings" }
  ];

  const metrics = [
    {
      label: "Total Calls",
      value: "1,247",
      trend: "+12.5%",
      trendUp: true,
      icon: Phone,
      color: "bg-blue-500/10 text-blue-600",
      previous: "1,106"
    },
    {
      label: "Active Agents",
      value: "8",
      trend: "+2",
      trendUp: true,
      icon: Bot,
      color: "bg-purple-500/10 text-purple-600",
      previous: "6"
    },
    {
      label: "New Leads",
      value: "156",
      trend: "+8.2%",
      trendUp: true,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
      previous: "144"
    },
    {
      label: "Conversion Rate",
      value: "38.5%",
      trend: "+2.1%",
      trendUp: true,
      icon: CheckCircle2,
      color: "bg-orange-500/10 text-orange-600",
      previous: "36.4%"
    }
  ];

  const recentCalls = [
    {
      id: 1,
      time: "2 min ago",
      agent: "Sales Agent - Emma",
      number: "+1 (555) 123-4567",
      duration: "3:42",
      recordingUrl: "#",
      status: "completed",
      outcome: "Lead Qualified",
      transcriptSnippet: "Thank you for your interest in our platform. I'd like to discuss how we can help automate your sales process..."
    },
    {
      id: 2,
      time: "5 min ago",
      agent: "Support Bot - Alex",
      number: "+1 (555) 234-5678",
      duration: "1:15",
      recordingUrl: "#",
      status: "completed",
      outcome: "Issue Resolved",
      transcriptSnippet: "Your issue has been escalated to our technical team. They will follow up within 2 hours..."
    },
    {
      id: 3,
      time: "12 min ago",
      agent: "Scheduling Agent - Max",
      number: "+1 (555) 345-6789",
      duration: "2:08",
      recordingUrl: "#",
      status: "completed",
      outcome: "Meeting Scheduled",
      transcriptSnippet: "Perfect! I've scheduled your meeting for tomorrow at 2 PM. A confirmation email has been sent..."
    },
    {
      id: 4,
      time: "28 min ago",
      agent: "Sales Agent - Emma",
      number: "+1 (555) 456-7890",
      duration: "4:21",
      recordingUrl: "#",
      status: "completed",
      outcome: "Demo Booked",
      transcriptSnippet: "Excellent! Your demo is confirmed for Friday at 10 AM. Our team will share the Zoom link via email..."
    },
    {
      id: 5,
      time: "45 min ago",
      agent: "Support Bot - Alex",
      number: "+1 (555) 567-8901",
      duration: "0:58",
      recordingUrl: "#",
      status: "completed",
      outcome: "FAQ Resolved",
      transcriptSnippet: "Thank you for contacting us. Here are the answers to your questions about pricing..."
    },
    {
      id: 6,
      time: "1 hour ago",
      agent: "Sales Agent - Jake",
      number: "+1 (555) 678-9012",
      duration: "5:32",
      recordingUrl: "#",
      status: "completed",
      outcome: "Follow-up Scheduled",
      transcriptSnippet: "I'll send you that information along with case studies from similar companies..."
    }
  ];

  const agents = [
    { id: 1, name: "Sales Agent - Emma", type: "Sales", status: "active", calls: 342, successRate: 78 },
    { id: 2, name: "Support Bot - Alex", type: "Support", status: "active", calls: 589, successRate: 85 },
    { id: 3, name: "Scheduling Agent - Max", type: "Scheduling", status: "active", calls: 234, successRate: 92 },
    { id: 4, name: "Sales Agent - Jake", type: "Sales", status: "inactive", calls: 156, successRate: 71 }
  ];

  const leads = [
    { id: 1, name: "Acme Corp", company: "Manufacturing", status: "qualified", calls: 2, lastCall: "2 min ago", value: "$50K" },
    { id: 2, name: "TechStart Inc", company: "SaaS", status: "interested", calls: 1, lastCall: "45 min ago", value: "$30K" },
    { id: 3, name: "Retail Solutions", company: "Retail", status: "qualified", calls: 3, lastCall: "2 hours ago", value: "$75K" },
    { id: 4, name: "Global Services", company: "Consulting", status: "negotiating", calls: 4, lastCall: "1 day ago", value: "$100K" },
    { id: 5, name: "StartupX", company: "AI/ML", status: "interested", calls: 1, lastCall: "3 days ago", value: "$20K" },
    { id: 6, name: "Enterprise Ltd", company: "Finance", status: "qualified", calls: 2, lastCall: "1 week ago", value: "$150K" }
  ];

  const analyticsData = [
    { metric: "Total Call Duration", value: "1,247 min", change: "+12.5%", icon: Clock },
    { metric: "Average Call Duration", value: "3:42", change: "+8.2%", icon: Activity },
    { metric: "Answer Rate", value: "94.2%", change: "+5.1%", icon: CheckCircle2 },
    { metric: "Calls Per Day", value: "142", change: "+18.3%", icon: TrendingUp }
  ];

  const filteredCalls = useMemo(() => {
    return recentCalls.filter((call) => {
      const matchesFilter = callsFilter === "all" || call.status === callsFilter;
      const matchesSearch = callsSearch === "" || call.agent.toLowerCase().includes(callsSearch.toLowerCase()) || call.number.includes(callsSearch);
      return matchesFilter && matchesSearch;
    });
  }, [callsFilter, callsSearch]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesFilter = leadsFilter === "all" || lead.status === leadsFilter;
      const matchesSearch = leadsSearch === "" || lead.name.toLowerCase().includes(leadsSearch.toLowerCase()) || lead.company.toLowerCase().includes(leadsSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [leadsFilter, leadsSearch]);

  const callsPerPage = 5;
  const totalCallPages = Math.ceil(filteredCalls.length / callsPerPage);
  const paginatedCalls = filteredCalls.slice((callsPage - 1) * callsPerPage, callsPage * callsPerPage);

  const leadsPerPage = 5;
  const totalLeadPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const paginatedLeads = filteredLeads.slice((leadsPage - 1) * leadsPerPage, leadsPage * leadsPerPage);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500/10 text-green-600",
      missed: "bg-red-500/10 text-red-600",
      "in-progress": "bg-blue-500/10 text-blue-600",
      qualified: "bg-purple-500/10 text-purple-600",
      interested: "bg-blue-500/10 text-blue-600",
      negotiating: "bg-orange-500/10 text-orange-600"
    };
    return colors[status] || "bg-gray-500/10 text-gray-600";
  };

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in-up">
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

      <div className="bg-card border rounded-lg overflow-hidden" style={{ animationDelay: "200ms" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-h3 font-semibold">Recent Calls</h2>
          <Button variant="outline" size="sm" onClick={() => setActiveTab("calls")}>
            View All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Outcome</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedCalls.slice(0, 3).map((call) => (
                <tr key={call.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{call.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{call.agent}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{call.duration}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
                      {call.outcome}
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
              ))}
            </tbody>
          </table>
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
              <DialogDescription>Choose a template to start building your AI agent</DialogDescription>
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
              <DialogDescription>Choose a template to start building your AI agent</DialogDescription>
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

      <div className="grid gap-4">
        {agents.map((agent) => (
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
                    <p className="text-sm text-muted-foreground">{agent.type} • {agent.status}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {agent.status === "active" && (
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
                <p className="text-2xl font-bold">{agent.calls}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${agent.successRate}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-bold">{agent.successRate}%</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
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
              onChange={(e) => setCallsSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={callsFilter} onValueChange={setCallsFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Outcome</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Recording</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{call.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{call.agent}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{call.duration}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(call.status)}`}>
                      {call.outcome}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span className="text-xs">MP3</span>
                    </button>
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
              ))}
            </tbody>
          </table>
        </div>

        {totalCallPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {(callsPage - 1) * callsPerPage + 1} to {Math.min(callsPage * callsPerPage, filteredCalls.length)} of {filteredCalls.length}
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
                Page {callsPage} of {totalCallPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCallsPage(Math.min(totalCallPages, callsPage + 1))}
                disabled={callsPage === totalCallPages}
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
        <h2 className="text-h2 font-semibold">Leads Pipeline</h2>
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
              placeholder="Search leads by name or company..."
              value={leadsSearch}
              onChange={(e) => setLeadsSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={leadsFilter} onValueChange={setLeadsFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Calls</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Deal Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Last Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {lead.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{lead.company}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{lead.calls}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{lead.value}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{lead.lastCall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalLeadPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {(leadsPage - 1) * leadsPerPage + 1} to {Math.min(leadsPage * leadsPerPage, filteredLeads.length)} of {filteredLeads.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeadsPage(Math.max(1, leadsPage - 1))}
                disabled={leadsPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm font-medium">
                Page {leadsPage} of {totalLeadPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeadsPage(Math.min(totalLeadPages, leadsPage + 1))}
                disabled={leadsPage === totalLeadPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-h2 font-semibold">Analytics & Performance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((data, idx) => (
          <div key={idx} className="bg-card border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <data.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                <ArrowUpRight className="h-3 w-3 inline mr-1" />
                {data.change}
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-1">{data.metric}</p>
            <p className="text-2xl font-bold">{data.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Calls by Agent</h3>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between">
                <span className="text-sm">{agent.name}</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(agent.calls / 589) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{agent.calls}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Call Outcomes</h3>
          <div className="space-y-3">
            {[
              { label: "Lead Qualified", value: 347, color: "bg-green-500" },
              { label: "Not Interested", value: 156, color: "bg-red-500" },
              { label: "Follow-up Needed", value: 421, color: "bg-orange-500" },
              { label: "Meeting Booked", value: 323, color: "bg-blue-500" }
            ].map((outcome) => (
              <div key={outcome.label} className="flex items-center justify-between">
                <span className="text-sm">{outcome.label}</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${outcome.color}`}
                      style={{ width: `${(outcome.value / 421) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{outcome.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-h2 font-semibold">Settings</h2>

      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Phone Numbers</h3>
                <p className="text-sm text-muted-foreground">Manage your agent phone numbers</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">Configure call alerts and notifications</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Integrations</h3>
                <p className="text-sm text-muted-foreground">Connect with CRM and other tools</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Security</h3>
                <p className="text-sm text-muted-foreground">Manage authentication and security settings</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Billing</h3>
                <p className="text-sm text-muted-foreground">Manage your subscription and billing info</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
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
              <span className="font-bold text-sm text-primary">JD</span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john@example.com</p>
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.href = "/login"}
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
              {activeTab === "calls" && "View all incoming and outgoing calls with recordings"}
              {activeTab === "leads" && "Track leads and manage your sales pipeline"}
              {activeTab === "analytics" && "View detailed analytics and performance metrics"}
              {activeTab === "settings" && "Manage account settings and integrations"}
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
            <DialogDescription>Complete information and transcript for this call</DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Agent</p>
                  <p className="font-semibold">{selectedCall.agent}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-mono text-sm">{selectedCall.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{selectedCall.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
                    {selectedCall.outcome}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Transcript</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                  <div className="flex gap-3">
                    <div className="text-primary font-semibold text-sm flex-shrink-0">Agent:</div>
                    <p className="text-sm">{selectedCall.transcriptSnippet}</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-foreground font-semibold text-sm flex-shrink-0">Caller:</div>
                    <p className="text-sm text-muted-foreground">That sounds great! Can you send me more information?</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Recording
                </Button>
                <Button variant="outline" className="flex-1">
                  Copy Transcript
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
