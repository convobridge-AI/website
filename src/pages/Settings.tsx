import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Loader2, Lock, Save, Sparkles, Bot, Play, Square } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Agent management state
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [fetchingPrompt, setFetchingPrompt] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices = [
    { id: "puck", name: "Puck", gender: "Male", desc: "Energetic" },
    { id: "kore", name: "Kore", gender: "Female", desc: "Professional" },
    { id: "charon", name: "Charon", gender: "Male", desc: "Deep" },
    { id: "fenrir", name: "Fenrir", gender: "Male", desc: "Confident" },
    { id: "aoede", name: "Aoede", gender: "Female", desc: "Warm" },
    { id: "leda", name: "Leda", gender: "Female", desc: "Gentle" },
    { id: "orus", name: "Orus", gender: "Male", desc: "Calm" },
    { id: "zephyr", name: "Zephyr", gender: "Male", desc: "Breezy" },
    { id: "achernar", name: "Achernar", gender: "Female", desc: "Bright" },
    { id: "achird", name: "Achird", gender: "Male", desc: "Friendly" },
    { id: "algenib", name: "Algenib", gender: "Male", desc: "Steady" },
    { id: "algieba", name: "Algieba", gender: "Female", desc: "Rich" },
    { id: "autonoe", name: "Autonoe", gender: "Female", desc: "Lively" },
    { id: "callirrhoe", name: "Callirrhoe", gender: "Female", desc: "Smooth" },
    { id: "despina", name: "Despina", gender: "Female", desc: "Clear" },
    { id: "enceladus", name: "Enceladus", gender: "Male", desc: "Firm" },
    { id: "erinome", name: "Erinome", gender: "Female", desc: "Soft" },
    { id: "gacrux", name: "Gacrux", gender: "Male", desc: "Warm" },
    { id: "iapetus", name: "Iapetus", gender: "Male", desc: "Deep" },
    { id: "laomedeia", name: "Laomedeia", gender: "Female", desc: "Elegant" },
    { id: "pulcherrima", name: "Pulcherrima", gender: "Female", desc: "Expressive" },
    { id: "rasalgethi", name: "Rasalgethi", gender: "Male", desc: "Bold" },
    { id: "sadachbia", name: "Sadachbia", gender: "Male", desc: "Balanced" },
    { id: "sadaltager", name: "Sadaltager", gender: "Male", desc: "Gentle" },
    { id: "schedar", name: "Schedar", gender: "Female", desc: "Crisp" },
    { id: "sulafat", name: "Sulafat", gender: "Female", desc: "Melodic" },
    { id: "umbriel", name: "Umbriel", gender: "Male", desc: "Steady" },
    { id: "vindemiatrix", name: "Vindemiatrix", gender: "Female", desc: "Vibrant" },
    { id: "zubenelgenubi", name: "Zubenelgenubi", gender: "Male", desc: "Rich" },
  ];

  useEffect(() => {
    loadSettings();
    loadAgents();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await apiClient.getSettings();
      setSettings(res.settings);
    } catch (err) {
      toast({ title: 'Failed to load settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async (currentSelectedId?: string | null) => {
    try {
      setFetchingPrompt(true);
      const res = await apiClient.getAgents();
      const agentList = res.agents || [];
      setAgents(agentList);
      // Only auto-select first agent if nothing is selected yet
      const activeId = currentSelectedId ?? selectedAgentId;
      if (agentList.length > 0 && !activeId) {
        selectAgent(agentList[0]);
      }
    } catch (err) {
      console.error("Failed to load agents", err);
    } finally {
      setFetchingPrompt(false);
    }
  };

  const selectAgent = (agent: any) => {
    setSelectedAgentId(agent.id);
    setSystemPrompt(agent.master_prompt || "");
    setSelectedVoice((agent.voice || "Puck").toLowerCase());
  };

  const handleSaveAgent = async () => {
    if (!selectedAgentId) {
      toast({ title: 'No agent selected', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const voiceName = selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1);
      await apiClient.updateAgent(selectedAgentId, {
        master_prompt: systemPrompt,
        voice: voiceName,
      });
      toast({ title: 'Agent updated successfully', description: `Voice: ${voiceName} • Prompt saved` });
      // Refresh agent list but keep current selection — pass current ID to avoid reset
      loadAgents(selectedAgentId);
    } catch (err: any) {
      toast({ title: 'Failed to save agent', description: err?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateSettings(settings);
      toast({ title: 'Settings saved successfully' });
    } catch (err) {
      toast({ title: 'Failed to save changes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const playVoicePreview = (voiceId: string) => {
    if (playingVoice === voiceId) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingVoice(null);
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(`/voices/chirp3-hd-${voiceId}.wav`);
    audioRef.current = audio;
    setPlayingVoice(voiceId);
    audio.play().catch(() => setPlayingVoice(null));
    audio.onended = () => { setPlayingVoice(null); audioRef.current = null; };
    audio.onerror = () => { setPlayingVoice(null); audioRef.current = null; };
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      // Endpoint handled by backend/routes/auth.ts
      await apiClient.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      toast({ title: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({ 
        title: 'Failed to update password', 
        description: err.response?.data?.message || 'Check your current password',
        variant: 'destructive' 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      const res = await apiClient.regenerateApiKey();
      // res contains { apiKey: string }
      setSettings((prev: any) => ({ ...prev, apiKey: res.apiKey }));
      toast({ title: 'API key regenerated successfully' });
    } catch (err) {
      toast({ title: 'Failed to regenerate API key', variant: 'destructive' });
    }
  };

  const copyApiKey = () => {
    if (settings?.apiKey) {
      navigator.clipboard.writeText(settings.apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
      toast({ title: 'API key copied to clipboard' });
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
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-h2 mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and integrations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Preferences</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Call Recording</p>
                <p className="text-sm text-muted-foreground">Automatically record all calls</p>
              </div>
              <Switch
                checked={settings?.callRecordingEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, callRecordingEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transcription</p>
                <p className="text-sm text-muted-foreground">Generate transcripts for calls</p>
              </div>
              <Switch
                checked={settings?.transcriptionEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, transcriptionEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Receive real-time notifications</p>
              </div>
              <Switch
                checked={settings?.notificationsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email summaries</p>
              </div>
              <Switch
                checked={settings?.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Agent Configuration
              </h3>
              <p className="text-sm text-muted-foreground">Select an agent to edit its voice, prompt, and behavior</p>
            </div>

            {/* Agent Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Agent</label>
              {fetchingPrompt ? (
                <div className="h-10 border rounded-lg animate-pulse bg-muted/50" />
              ) : agents.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No agents found. Create one in the Agent Builder first.</p>
              ) : (
                <Select value={selectedAgentId || ""} onValueChange={(val) => {
                  const agent = agents.find(a => a.id === val);
                  if (agent) selectAgent(agent);
                }}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>
                        <span className="flex items-center gap-2">
                          {a.name}
                          {a.is_deployed && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedAgentId && (
              <>
                {/* Voice Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {voices.map((voice) => (
                      <div
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`p-2.5 border rounded-lg text-left transition-all flex items-center justify-between gap-1 cursor-pointer ${
                          selectedVoice === voice.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{voice.name}</p>
                          <p className="text-[10px] text-muted-foreground">{voice.desc} • {voice.gender}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); playVoicePreview(voice.id); }}
                          className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                          title={playingVoice === voice.id ? "Stop" : "Preview"}
                        >
                          {playingVoice === voice.id
                            ? <Square className="h-3.5 w-3.5 text-primary fill-primary" />
                            : <Play className="h-3.5 w-3.5 text-muted-foreground" />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Master Prompt
                  </label>
                  <Textarea 
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a friendly customer service agent..." 
                    className="min-h-[200px] font-mono text-sm leading-relaxed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Changes here will reflect in future calls handled by this agent.
                  </p>
                </div>

                <Button 
                  onClick={handleSaveAgent} 
                  disabled={saving} 
                  className="w-fit"
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Agent Changes
                </Button>
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security Settings
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {['salesforce', 'hubspot', 'stripe', 'zapier'].map((integration) => (
              <Card key={integration} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold capitalize">{integration}</h4>
                    <p className="text-sm text-muted-foreground">
                      {settings?.integrations?.[integration]?.connected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.integrations?.[integration]?.connected || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        toast({ title: `${integration} integration coming soon` });
                      } else {
                        apiClient.disconnectIntegration(integration).then(loadSettings);
                      }
                    }}
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Configure
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">API Key</h3>
              <p className="text-sm text-muted-foreground">Use this key to authenticate API requests</p>
            </div>

            <div className="flex gap-2">
              <Input
                type="password"
                value={settings?.apiKey || 'No API key generated'}
                readOnly
                className="font-mono"
              />
              <Button variant="outline" size="icon" onClick={copyApiKey}>
                {apiKeyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <Button variant="destructive" onClick={handleRegenerateApiKey}>
              Regenerate API Key
            </Button>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-700 font-semibold">⚠️ Warning</p>
              <p className="text-sm text-yellow-700/90 mt-1">
                Regenerating your API key will invalidate the old key immediately.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={loadSettings}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
