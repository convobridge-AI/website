import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, PhoneIncoming, Bot, Users, Settings, LogOut, Menu, X, Phone,
  BarChart3, TrendingUp, Clock, Search, Plus, MoreVertical, ArrowUpRight,
  ArrowDownRight, Eye, Download, ChevronLeft, ChevronRight,
  AlertCircle, Zap, CheckCircle2, Loader, PlayCircle, Play, Megaphone, Square, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumAudioPlayer } from "@/components/PremiumAudioPlayer";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
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
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [callDetailOpen, setCallDetailOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [callsFilter, setCallsFilter] = useState("all");
  const [callsSearch, setCallsSearch] = useState("");
  const [callsPage, setCallsPage] = useState(1);
  const [userName, setUserName] = useState("User");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("500");
  const [topupLoading, setTopupLoading] = useState(false);

  // Campaigns State
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignMode, setCampaignMode] = useState<'ai' | 'tts' | 'audio'>('ai');
  const [campaignName, setCampaignName] = useState("");
  const [campaignNumbers, setCampaignNumbers] = useState("");
  const [campaignAgent, setCampaignAgent] = useState("");
  const [campaignText, setCampaignText] = useState("");
  const [campaignTtsProvider, setCampaignTtsProvider] = useState<'google' | 'sarvam'>('google');
  const [campaignGoogleVoice, setCampaignGoogleVoice] = useState<string>('en-IN-Chirp3-HD-Puck');
  const [campaignCloudUrl, setCampaignCloudUrl] = useState("");
  const [isLaunchingCampaign, setIsLaunchingCampaign] = useState(false);
  const [campaignResult, setCampaignResult] = useState<any>(null);
  const [playingTtsVoice, setPlayingTtsVoice] = useState<string | null>(null);
  const campaignAudioRef = useRef<HTMLAudioElement | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem("api_secret_key") || "");
  const [showApiKey, setShowApiKey] = useState(false);

  // Fetch real data from Supabase
  // Voice Data
  const GOOGLE_CHIRP_VOICES = [
    { id: "Puck", gender: "M", desc: "Energetic" }, { id: "Kore", gender: "F", desc: "Professional" },
    { id: "Charon", gender: "M", desc: "Authoritative" }, { id: "Fenrir", gender: "M", desc: "Confident" },
    { id: "Aoede", gender: "F", desc: "Melodic" }, { id: "Leda", gender: "F", desc: "Gentle" },
    { id: "Orus", gender: "M", desc: "Calm" }, { id: "Zephyr", gender: "M", desc: "Casual" },
    { id: "Achernar", gender: "F", desc: "Expressive" }, { id: "Achird", gender: "M", desc: "Friendly" },
    { id: "Algenib", gender: "M", desc: "Trustworthy" }, { id: "Algieba", gender: "F", desc: "Resonant" },
    { id: "Autonoe", gender: "F", desc: "Spirited" }, { id: "Callirrhoe", gender: "F", desc: "Flowing" },
    { id: "Despina", gender: "F", desc: "Precise" }, { id: "Enceladus", gender: "M", desc: "Direct" },
    { id: "Erinome", gender: "F", desc: "Soft" }, { id: "Gacrux", gender: "M", desc: "Welcoming" },
    { id: "Iapetus", gender: "M", desc: "Deep calm" }, { id: "Laomedeia", gender: "F", desc: "Elegant" },
    { id: "Pulcherrima", gender: "F", desc: "Bright" }, { id: "Rasalgethi", gender: "M", desc: "Bold" },
    { id: "Sadachbia", gender: "M", desc: "Balanced" }, { id: "Sadaltager", gender: "M", desc: "Reassuring" },
    { id: "Schedar", gender: "F", desc: "Crisp" }, { id: "Sulafat", gender: "F", desc: "Warm" },
    { id: "Umbriel", gender: "M", desc: "Steady" }, { id: "Vindemiatrix", gender: "F", desc: "Dynamic" },
    { id: "Zubenelgenubi", gender: "M", desc: "Rich" },
  ];

  const { stats, calls, agents, leads, phoneNumbers, topups, loading, refresh, outboundCalls } = useDashboardData();

  // Load system prompt for Nilgiri bot when settings tab is active
  useEffect(() => {
    if (activeTab === "settings" && stats?.company?.system_prompt) {
      setSystemPrompt(stats.company.system_prompt || "");
    }
  }, [activeTab, stats]);

  const handleUpdateSystemPrompt = async () => {
    if (!stats?.company?.id) return;
    setIsSavingPrompt(true);
    try {
      const { user } = await apiClient.getCurrentUser();
      const { data, error } = await supabase.rpc('update_company_prompt', {
        user_id_param: user.id,
        new_prompt: systemPrompt
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to update prompt');
      toast.success("System prompt updated successfully");
      refresh();
    } catch (err: any) {
      console.error("Error updating prompt:", err);
      toast({ title: "Failed to update system prompt", variant: "destructive" });
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !campaignNumbers) {
      toast.error("Campaign name and phone numbers are required");
      return;
    }
    if (campaignMode === 'ai' && !campaignAgent) {
      toast.error("Please select an AI agent");
      return;
    }
    if (campaignMode === 'tts' && !campaignText) {
      toast.error("Please enter the message text for TTS");
      return;
    }
    if (campaignMode === 'audio' && !campaignCloudUrl) {
      toast.error("Please enter a Cloudinary audio URL");
      return;
    }

    // Parse numbers (split by comma, newline, semicolon)
    const numbers = campaignNumbers
      .split(/[\n,;]+/)
      .map(n => n.trim().replace(/\D/g, ''))
      .filter(n => n.length >= 10);

    if (numbers.length === 0) {
      toast.error("No valid phone numbers found (minimum 10 digits)");
      return;
    }

    // Build base payload — company_id is automatically injected by apiClient.launchCampaign
    const basePayload: any = { numbers };

    if (campaignMode === 'tts') {
      basePayload.text = campaignText;
      basePayload.provider = campaignTtsProvider;
      // Pass specific Chirp3-HD voice for Google TTS campaigns
      if (campaignTtsProvider === 'google' && campaignGoogleVoice) {
        basePayload.voice_name = campaignGoogleVoice;
      }
    }
    if (campaignMode === 'audio') {
      basePayload.cloudUrl = campaignCloudUrl;
    }
    if (campaignMode === 'ai') {
      // agent_id: UUID of the outbound AI agent to use
      basePayload.agent_id = campaignAgent || null;
    }

    setIsLaunchingCampaign(true);
    setCampaignResult(null);
    try {
      const result = await apiClient.launchCampaign(campaignMode, basePayload);
      setCampaignResult(result);
      toast.success(`✅ Campaign dispatched to ${numbers.length} number${numbers.length !== 1 ? 's' : ''}!`);
      setCampaignModalOpen(false);
      setCampaignName("");
      setCampaignNumbers("");
      setCampaignAgent("");
      setCampaignText("");
      setCampaignCloudUrl("");
      if (campaignAudioRef.current) {
        campaignAudioRef.current.pause();
        campaignAudioRef.current = null;
      }
      setPlayingTtsVoice(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to launch campaign");
    } finally {
      setIsLaunchingCampaign(false);
    }
  };

  const handleAgentDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    
    try {
      await apiClient.deleteAgent(id);
      toast.success(`Agent "${name}" deleted successfully`);
      refresh(); // Refresh data
    } catch (err: any) {
      console.error("Error deleting agent:", err);
      toast.error(err.message || "Failed to delete agent");
    }
  };

  // Razorpay topup: create order on backend, open checkout popup
  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error("Enter a valid amount (min ₹1)");
      return;
    }
    if (!stats?.company?.id) {
      toast({ title: "Company not loaded yet", variant: "destructive" });
      return;
    }
    setTopupLoading(true);
    try {
      const order = await apiClient.createRazorpayOrder(stats.company.id, amount);
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "ConvoBridge",
        description: "Outbound Balance Top-Up",
        order_id: order.order_id,
        handler: () => {
          toast.success(`₹${amount.toFixed(2)} top-up initiated! Balance updates within seconds.`);
          setTopupOpen(false);
          setTimeout(() => refresh(), 3000);
        },
        theme: { color: "#6366f1" }
      };
      // @ts-ignore — Razorpay is loaded via CDN script in index.html
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(`Top-up failed: ${e.message}`);
    } finally {
      setTopupLoading(false);
    }
  };

  // Get user info on mount
  useEffect(() => {
    let currentKey = localStorage.getItem("api_secret_key");
    const userData = localStorage.getItem("currentUser") || localStorage.getItem("user");
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || user.full_name || "User");
        if (user.api_key && !currentKey) {
          currentKey = user.api_key;
          localStorage.setItem("api_secret_key", currentKey);
        }
      } catch (e) {
        setUserName("User");
      }
    }
    
    if (currentKey) {
      setApiKey(currentKey);
    }
  }, []);

  const menuItems = [
    { icon: Home, label: "Home", id: "home" },
    { icon: Bot, label: "Agents", id: "agents" },
    { icon: PhoneIncoming, label: "Inbound", id: "calls" },
    { icon: Megaphone, label: "Campaigns", id: "campaigns" },
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
        call.agent_name?.toLowerCase().includes(callsSearch.toLowerCase()) || 
        call.caller_number?.includes(callsSearch) ||
        call.phoneNumber?.includes(callsSearch);
      return matchesFilter && matchesSearch;
    });
  }, [callsFilter, callsSearch, calls]);

  const callsPerPage = 5;
  const totalPages = Math.ceil(filteredCalls.length / callsPerPage);
  const paginatedCalls = filteredCalls.slice((callsPage - 1) * callsPerPage, callsPage * callsPerPage);

  const filteredCampaigns = useMemo(() => {
    if (!outboundCalls) return [];
    return outboundCalls.filter((c: any) => {
      const matchesSearch = campaignSearch === "" || 
        c.target_number?.includes(campaignSearch) ||
        c.campaign_tag?.toLowerCase().includes(campaignSearch.toLowerCase());
      return matchesSearch;
    });
  }, [campaignSearch, outboundCalls]);

  const campaignsPerPage = 5;
  const campaignsTotalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage) || 1;
  const paginatedCampaigns = filteredCampaigns.slice((campaignPage - 1) * campaignsPerPage, campaignPage * campaignsPerPage);

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

          <div className="bg-card border rounded-lg overflow-hidden" style={{ animationDelay: "200ms" }}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-h3 font-semibold">Recent Calls</h2>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("calls")}>
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

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
                      <tr key={call.id || call._id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-muted-foreground">{formatTime(call.started_at || call.startedAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{call.agent_name || call.agentId?.name || 'V-Nilgiri Agent'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{call.caller_number || call.phoneNumber || "—"}</td>
                        <td className="px-6 py-4 text-sm font-mono">{formatDuration(call.duration_sec || call.duration)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            call.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                            call.status === 'missed' ? 'bg-red-500/10 text-red-600' :
                            call.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {call.summary ? "Transcripted" : (call.outcome || call.status)}
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
                    navigate("/dashboard/agents/new");
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
              key={agent.id || agent._id}
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
                      <p className="text-sm text-muted-foreground">
                        {agent.voice || "Kore"} Voice • {agent.is_deployed ? 'Deployed' : 'Draft'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {agent.is_deployed && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></span>
                      Active
                    </span>
                  )}
                  {phoneNumbers?.find(pn => pn.primary_agent_id === agent.id) && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Inbound Primary
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Calls</p>
                  <p className="text-2xl font-bold">{agent.total_calls || agent.stats?.totalCalls || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(agent.success_rate || agent.stats?.successRate || 0.95) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-bold">{((agent.success_rate || agent.stats?.successRate || 0.95) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {(agent.systemPrompt || agent.prompt) && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">System Prompt</p>
                  <p className="text-sm text-foreground line-clamp-2">{agent.systemPrompt || agent.prompt}</p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                   size="sm"
                  className="h-9 px-4 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/agents/edit/${agent.id || agent._id}`);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Modify Agent
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 px-4 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAgentDelete(agent.id || agent._id, agent.name);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
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
              placeholder="Search by caller or DID..."
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Caller Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">DID (Called)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Cost</th>
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
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatTime(call.started_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-semibold">
                      {call.caller_number || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                      {call.metadata?.dialed_number || call.metadata?.call_tag || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">
                      {formatDuration(call.duration_sec)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        call.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                        call.status === 'missed' ? 'bg-red-500/10 text-red-600' :
                        call.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                        call.status === 'answered' ? 'bg-blue-500/10 text-blue-600' :
                        'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {call.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {call.cost != null ? `₹${Number(call.cost).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {call.recording_url && (
                        <a
                          href={call.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title="Play recording"
                        >
                          <Play className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setSelectedCall(call);
                          setCallDetailOpen(true);
                        }}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="View transcript"
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

  const renderCampaigns = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-semibold">Outbound Campaigns</h2>
          <p className="text-muted-foreground text-sm">Launch automated calling campaigns to your contacts</p>
        </div>
        <Button onClick={() => { setCampaignModalOpen(true); setCampaignResult(null); }}>
          <Megaphone className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* === LAUNCH DIALOG === */}
      <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Launch Campaign</DialogTitle>
            <DialogDescription>Choose a campaign type and configure your outbound blast.</DialogDescription>
          </DialogHeader>
          
          {/* Mode Tab Bar */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 mt-2">
            {(['ai', 'tts', 'audio'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setCampaignMode(mode)}
                className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                  campaignMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'ai' && '🤖 AI Calling'}
                {mode === 'tts' && '🔊 Text-to-Speech'}
                {mode === 'audio' && '📁 Audio File'}
              </button>
            ))}
          </div>

          <form onSubmit={handleLaunchCampaign} className="space-y-4">
            {/* Campaign Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Campaign Name</label>
              <Input
                placeholder="e.g. Q1 Lead Follow-up"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                required
              />
            </div>

            {/* Phone Numbers */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Numbers</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[90px]"
                placeholder="Enter one per line or comma-separated&#10;e.g. 9847493118, 9876543210"
                value={campaignNumbers}
                onChange={(e) => setCampaignNumbers(e.target.value)}
                required
              />
              {campaignNumbers && (
                <p className="text-xs text-muted-foreground">
                  {campaignNumbers.split(/[\n,;]+/).map(n => n.trim().replace(/\D/g, '')).filter(n => n.length >= 10).length} valid numbers
                </p>
              )}
            </div>

            {/* === AI Calling Mode === */}
            {campaignMode === 'ai' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">AI Agent</label>
                <Select value={campaignAgent} onValueChange={setCampaignAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents && agents.length > 0 ? agents.map((a: any) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                    )) : (
                      <SelectItem value="__none" disabled>No agents available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Agent handles live 2-way conversation using Gemini AI</p>
              </div>
            )}

            {/* === TTS Mode === */}
            {campaignMode === 'tts' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Message Text</label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                    placeholder="Enter the message to be spoken to the customer..."
                    value={campaignText}
                    onChange={(e) => setCampaignText(e.target.value)}
                    required={campaignMode === 'tts'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Voice Engine</label>
                  <Select value={campaignTtsProvider} onValueChange={(v: 'google' | 'sarvam') => setCampaignTtsProvider(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">🌐 Google Chirp3-HD (English/Multi)</SelectItem>
                      <SelectItem value="sarvam">🇮🇳 Sarvam Bulbul (Hindi/Indian)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Google voice picker — only when Google is selected */}
                {campaignTtsProvider === 'google' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Google Voice</label>
                    <div className="flex gap-2">
                      <Select 
                        value={campaignGoogleVoice} 
                        onValueChange={(val) => {
                          setCampaignGoogleVoice(val);
                          // Stop existing audio when changing dropdown
                          if (campaignAudioRef.current) {
                            campaignAudioRef.current.pause();
                            campaignAudioRef.current = null;
                          }
                          setPlayingTtsVoice(null);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a voice..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {GOOGLE_CHIRP_VOICES.map(v => (
                            <SelectItem key={v.id} value={`en-IN-Chirp3-HD-${v.id}`}>
                              {v.id} ({v.gender}) — {v.desc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        title={playingTtsVoice === campaignGoogleVoice ? "Stop Preview" : "Preview Voice"}
                        onClick={() => {
                          const id = campaignGoogleVoice.split('-').pop()?.toLowerCase();
                          if (!id) return;
                          
                          // Toggle check
                          if (playingTtsVoice === campaignGoogleVoice) {
                            if (campaignAudioRef.current) {
                              campaignAudioRef.current.pause();
                              campaignAudioRef.current = null;
                            }
                            setPlayingTtsVoice(null);
                            return;
                          }

                          // Stop previous
                          if (campaignAudioRef.current) {
                            campaignAudioRef.current.pause();
                            campaignAudioRef.current = null;
                          }

                          const audio = new Audio(`/voices/chirp3-hd-${id}.wav`);
                          campaignAudioRef.current = audio;
                          setPlayingTtsVoice(campaignGoogleVoice);
                          
                          audio.play().catch(() => setPlayingTtsVoice(null));
                          audio.onended = () => {
                            setPlayingTtsVoice(null);
                            campaignAudioRef.current = null;
                          };
                        }}
                        className="px-3 py-2 border rounded-md hover:bg-muted transition-colors text-sm"
                      >
                        {playingTtsVoice === campaignGoogleVoice ? (
                          <Square className="h-4 w-4 text-primary fill-primary" />
                        ) : (
                          <Play className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Google Chirp3-HD — high quality neural voices</p>
                  </div>
                )}
              </>
            )}


            {/* === Audio File Mode === */}
            {campaignMode === 'audio' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cloudinary Audio URL</label>
                <Input
                  placeholder="https://res.cloudinary.com/.../recording.wav"
                  value={campaignCloudUrl}
                  onChange={(e) => setCampaignCloudUrl(e.target.value)}
                  required={campaignMode === 'audio'}
                />
                <p className="text-xs text-muted-foreground">Paste a public WAV/MP3 URL from Cloudinary. The server will download &amp; convert automatically.</p>
              </div>
            )}

            {/* Launch Button */}
            <Button type="submit" className="w-full" disabled={isLaunchingCampaign}>
              {isLaunchingCampaign ? (
                <><Loader className="mr-2 h-4 w-4 animate-spin" /> Dispatching...</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Launch Campaign</>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* === CAMPAIGN HISTORY TABLE === */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Campaign History</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number or type..."
              value={campaignSearch}
              onChange={(e) => { setCampaignSearch(e.target.value); setCampaignPage(1); }}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campaign / Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">
                  <Loader className="h-5 w-5 text-muted-foreground mx-auto animate-spin" />
                </td></tr>
              ) : paginatedCampaigns.length > 0 ? (
                paginatedCampaigns.map((call: any) => {
                  const tag = (call.campaign_tag || '').toLowerCase();
                  const typeLabel = tag.includes('tts') ? '🔊 TTS' : tag.includes('audio') ? '📁 Audio' : '🤖 AI';
                  return (
                    <tr key={call.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{formatTime(call.started_at)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium block">{call.campaign_tag || '—'}</span>
                        <span className="text-xs text-muted-foreground">{typeLabel}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{call.target_number || '—'}</td>
                      <td className="px-6 py-4 text-sm font-mono">{formatDuration(call.duration_sec)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          call.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                          call.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                          call.status === 'answered' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>{call.status || 'queued'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{call.cost != null ? `₹${Number(call.cost).toFixed(2)}` : '—'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center">
                  <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">No campaigns launched yet. Click "New Campaign" to start.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {campaignsTotalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {(campaignPage - 1) * campaignsPerPage + 1} – {Math.min(campaignPage * campaignsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCampaignPage(Math.max(1, campaignPage - 1))} disabled={campaignPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm font-medium">Page {campaignPage} of {campaignsTotalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCampaignPage(Math.min(campaignsTotalPages, campaignPage + 1))} disabled={campaignPage === campaignsTotalPages}>
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
        <div>
          <h2 className="text-h2 font-semibold">Leads</h2>
          <p className="text-sm text-muted-foreground">Captured interest from conversation intelligence</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {loading ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Loader className="h-12 w-12 text-muted-foreground mx-auto animate-spin" />
        </div>
      ) : leads && leads.length > 0 ? (
        <div className="bg-card border rounded-lg overflow-hidden transition-all shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-4 text-left">Captured</th>
                  <th className="px-6 py-4 text-left">Lead Details</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Intelligence Summary</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {(lead.name || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{lead.name || "Anonymous Lead"}</p>
                          <p className="text-xs text-muted-foreground font-mono">{lead.phone || lead.email || "No contact info"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === 'new' ? 'bg-blue-500/10 text-blue-600' :
                        lead.status === 'qualified' ? 'bg-green-500/10 text-green-600' :
                        lead.status === 'contacted' ? 'bg-purple-500/10 text-purple-600' :
                        'bg-gray-500/10 text-gray-600'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        {lead.interest || lead.notes || "Analyzed from call transcript..."}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
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
          <p className="text-muted-foreground">Leads will appear here as the AI agent identifies interest during calls.</p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-semibold mb-2">Usage &amp; Billing</h2>
          <p className="text-muted-foreground">Monitor consumption and credit balances</p>
        </div>
        {/* Dual wallet cards */}
        <div className="flex gap-4">
          {/* Inbound (AI call minutes) */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 min-w-[180px]">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Inbound Credits</p>
            <p className="text-3xl font-bold text-foreground">₹{Number(stats?.credits || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">AI call minutes</p>
          </div>
          {/* Outbound (campaigns / broadcasts) */}
          <div className="bg-orange-500/5 border border-orange-400/20 rounded-2xl p-5 min-w-[180px]">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Outbound Balance</p>
            <p className="text-3xl font-bold text-foreground">₹{Number(stats?.outbound_balance || 0).toFixed(2)}</p>
            <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="mt-2 border-orange-400/40 text-orange-600 hover:bg-orange-500/10">
                  <Plus className="mr-1 h-4 w-4" /> Top Up
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Top Up Outbound Balance</DialogTitle>
                  <DialogDescription>Add money to your outbound campaign wallet via Razorpay.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm font-medium mb-2">Amount (INR ₹)</p>
                    <div className="flex gap-2 mb-3">
                      {["500","1000","2000","5000"].map(a => (
                        <button key={a} onClick={() => setTopupAmount(a)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                            topupAmount === a ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"
                          }`}>₹{a}</button>
                      ))}
                    </div>
                    <Input
                      type="number" min={1}
                      value={topupAmount}
                      onChange={e => setTopupAmount(e.target.value)}
                      placeholder="Custom amount"
                    />
                  </div>
                  <Button onClick={handleTopup} disabled={topupLoading} className="w-full">
                    {topupLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    Pay ₹{topupAmount} via Razorpay
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Secured by Razorpay • Balance credited instantly after payment</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-6 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Usage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-6 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                  <Phone className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Total Calls</p>
              </div>
              <p className="text-3xl font-bold mb-1">{stats?.totalCalls || 0}</p>
              <p className="text-xs text-muted-foreground">Lifetime volume</p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Total Minutes</p>
              </div>
              <p className="text-3xl font-bold mb-1">{Math.floor((stats?.totalDuration || 0) / 60)}</p>
              <p className="text-xs text-muted-foreground">~{((stats?.totalDuration || 0) / 3600).toFixed(1)} hours</p>
            </div>

            <div className="bg-card border rounded-lg p-6 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                  <Zap className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Total Cost</p>
              </div>
              <p className="text-3xl font-bold mb-1">${Number(stats?.totalCost || 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Charged to balance</p>
            </div>

            <div className="bg-card border rounded-lg p-6 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Avg Rate</p>
              </div>
              <p className="text-3xl font-bold mb-1">${Number(stats?.company?.rate_per_minute || 0.05).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Per minute of talk</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top-up History */}
            <div className="lg:col-span-2 bg-card border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold">Recent Transactions</h3>
                <Download className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Reference</th>
                      <th className="px-6 py-3 text-left">Method</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topups && topups.length > 0 ? (
                      topups.map((topup: any) => (
                        <tr key={topup.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(topup.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm font-mono text-muted-foreground">#{topup.reference || topup.id}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted border capitalize">{topup.method}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-green-600">+${Number(topup.amount).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">No transactions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-card border rounded-lg p-6 space-y-6">
              <h3 className="font-semibold border-b pb-4">Billing Profile</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{stats?.company?.name || 'V-Nilgiri'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Billing Status</span>
                  <span className="text-green-600 font-semibold bg-green-500/10 px-2 py-0.5 rounded">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min. Balance</span>
                  <span className="font-medium">$1.00</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-4">Need help?</p>
                <Button variant="outline" className="w-full text-xs h-9">Contact Support</Button>
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
        <h3 className="text-h3 font-semibold mb-2">Nilgiri Bot Configuration</h3>
        <p className="text-sm text-muted-foreground mb-6">Manage the fallback intelligence and personality for legacy calls.</p>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                Fallback Voice
              </label>
              <Select value={stats?.company?.voice || "Kore"} onValueChange={(val) => apiClient.updateCompany(stats.company.id, { voice: val }).then(refresh)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                   {GOOGLE_CHIRP_VOICES.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.id} ({v.gender})</SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                Master System Prompt
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">Primary Model</span>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter the system prompt that defines the bot's behavior, knowledge, and personality..."
              className="w-full min-h-[300px] p-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-sans leading-relaxed"
            />
            <p className="text-xs text-muted-foreground italic">
              Tip: Be specific about the bot's role, tone (e.g., professional vs friendly), and key information about Nilgiri College.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setSystemPrompt(stats?.company?.system_prompt || "")}>
              Discard Changes
            </Button>
            <Button onClick={handleUpdateSystemPrompt} disabled={isSavingPrompt || systemPrompt === stats?.company?.system_prompt}>
              {isSavingPrompt ? <><Loader className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Update System Prompt"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-8">
        <h3 className="text-h3 font-semibold mb-2">Virtual Phone Numbers (DIDs)</h3>
        <p className="text-sm text-muted-foreground mb-6">Assign an AI agent to handle inbound calls for each of your company phone numbers.</p>
        
        <div className="space-y-4">
          {phoneNumbers && phoneNumbers.length > 0 ? (
            phoneNumbers.map((pn: any) => (
              <div key={pn.id} className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-mono font-bold">{pn.phone_number}</p>
                    <p className="text-xs text-muted-foreground capitalize">{pn.description || "Main Inbound Line"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Assigned Agent</p>
                    <Select 
                      value={pn.primary_agent_id || "none"} 
                      onValueChange={async (val) => {
                        try {
                          await apiClient.updateNumber(pn.id, { primary_agent_id: val === "none" ? null : val });
                          toast({ title: "DID Updated", description: `Agent assigned to ${pn.phone_number}` });
                          refresh();
                        } catch (err: any) {
                          toast({ title: "Update Failed", description: err.message, variant: "destructive" });
                        }
                      }}
                    >
                      <SelectTrigger className="w-48 h-9 text-sm">
                        <SelectValue placeholder="No Agent Assigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Agent (Fallback)</SelectItem>
                        {agents.filter(a => a.is_deployed).map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center bg-muted/10 rounded-xl border border-dashed">
              <p className="text-sm text-muted-foreground">No active phone numbers found for your company.</p>
            </div>
          )}
        </div>
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Private API Key</label>
                {apiKey && (
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                )}
              </div>
              <p className="text-sm font-mono text-foreground bg-background/50 p-2 rounded border border-border/40 select-all overflow-x-auto whitespace-nowrap">
                {apiKey ? (showApiKey ? apiKey : `••••••••••••••••${apiKey.slice(-5)}`) : 'No API key found. Click Regenerate below.'}
              </p>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    if (confirm("Are you sure you want to regenerate your API key? The old one will stop working immediately.")) {
                      try {
                        const { apiKey: newKey } = await apiClient.regenerateApiKey();
                        setApiKey(newKey);
                        toast.success("API key regenerated successfully");
                      } catch (err: any) {
                        toast.error(err.message || "Failed to regenerate API key");
                      }
                    }
                  }}
                >
                  Regenerate API Key
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (apiKey) {
                      navigator.clipboard.writeText(apiKey);
                      toast.success("API key copied to clipboard");
                    }
                  }}
                >
                  <Download className="h-3 w-3 mr-2 rotate-180" />
                  Copy Key
                </Button>
              </div>
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
        <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <Button variant="destructive">Delete Account</Button>
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
            onClick={logout}
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
          {activeTab === "campaigns" && renderCampaigns()}
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

              {selectedCall.recording_url && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <PlayCircle className="h-4 w-4" />
                    <span>Call Recording</span>
                  </div>
                  <PremiumAudioPlayer 
                    url={selectedCall.recording_url} 
                    title={`Recording: ${selectedCall.caller_number || 'Internal Call'}`} 
                  />
                </div>
              )}

              {selectedCall.transcript_user && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Live Transcript
                  </h4>
                  <div className="bg-muted/30 rounded-xl p-4 max-h-48 overflow-y-auto space-y-3 border border-border/50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User</p>
                      <p className="text-sm italic text-foreground/80">{selectedCall.transcript_user}</p>
                    </div>
                    {selectedCall.transcript_ai && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Agent</p>
                        <p className="text-sm text-foreground">{selectedCall.transcript_ai}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedCall.summary && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">AI Summary</h4>
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-sm text-foreground/90 leading-relaxed">{selectedCall.summary}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="w-full h-11 rounded-xl font-medium border-border/60 hover:bg-muted/50 transition-all">
                  Copy Metadata ID
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
