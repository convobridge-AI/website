import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Loader2 } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  useEffect(() => {
    loadSettings();
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateSettings(settings);
      toast({ title: 'Settings saved successfully' });
    } catch (err) {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      const res = await apiClient.regenerateApiKey();
      setSettings(res.settings);
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
          <TabsTrigger value="voice">Voice & Language</TabsTrigger>
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

        <TabsContent value="voice" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Default Voice & Language</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Voice</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={settings?.defaultVoice || 'aria'}
                onChange={(e) => setSettings({ ...settings, defaultVoice: e.target.value })}
              >
                <option value="aria">Aria (Female, American)</option>
                <option value="guy">Guy (Male, American)</option>
                <option value="jenny">Jenny (Female, British)</option>
                <option value="chris">Chris (Male, Australian)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default Language</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={settings?.defaultLanguage || 'English'}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
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
