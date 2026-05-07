import { useState } from "react";
import { Copy, Check, Terminal, Zap, BarChart3, Database, ShieldCheck, ArrowRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group rounded-xl overflow-hidden border border-border bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-border/50">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{language}</span>
        <button
          onClick={() => { copyToClipboard(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-[#e6edf3] font-mono text-[13px]">{code}</code>
      </pre>
    </div>
  );
}

function ParamTable({ rows }: { rows: { name: string; type: string; desc: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/40 text-left">
            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Parameter</th>
            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</th>
            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.name} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-mono text-primary text-xs">{r.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.type}</td>
              <td className="px-4 py-3 text-xs">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ code, color, label }: { code: string; color: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`inline-flex items-center justify-center w-14 h-7 rounded-md text-xs font-bold font-mono ${color}`}>{code}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

const sections = [
  { id: "auth", label: "Auth", icon: ShieldCheck },
  { id: "ai", label: "AI Campaign", icon: Zap },
  { id: "audio", label: "Audio", icon: Terminal },
  { id: "tts", label: "TTS", icon: Terminal },
  { id: "logs", label: "Logs", icon: BarChart3 },
  { id: "storage", label: "Storage", icon: Database },
  { id: "codes", label: "Status Codes", icon: ShieldCheck },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("auth");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium bg-primary/10 text-primary mb-4">
            <Terminal className="h-3.5 w-3.5" /> API Reference v1.2
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 font-display">
            ConvoBridge <span className="holo-text">API Docs</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Programmatically launch AI voice campaigns, inject per-call context, track call logs, and manage your infrastructure.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[220px_1fr] gap-10">
          {/* Sidebar Nav */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="space-y-16 min-w-0">
            {/* Auth */}
            <section id="auth" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" /> Authentication
              </h2>
              <p className="text-muted-foreground">
                All API requests require your company API key in the <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Authorization</code> header.
                You can find or regenerate your key in <strong>Dashboard → Settings → API Keys</strong>.
              </p>
              <CodeBlock language="http" code={`Authorization: Bearer YOUR_API_KEY`} />
            </section>

            {/* AI Campaign */}
            <section id="ai" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" /> AI Campaign
              </h2>
              <p className="text-muted-foreground">
                Launch a campaign where a Gemini-powered AI agent calls each number and has a real conversation.
                Use <strong>context injection</strong> to personalize every call.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-xs font-bold text-green-600 font-mono">POST</span>
                <span className="text-sm font-mono text-foreground">/api/campaign/ai</span>
              </div>

              <ParamTable rows={[
                { name: "numbers", type: "string[]", desc: "Required. Array of phone numbers (E.164 or raw digits)." },
                { name: "agent_id", type: "UUID", desc: "Optional. Specific agent UUID. Falls back to company default." },
                { name: "context", type: "object", desc: "Optional. Key-value pairs injected into the AI system prompt." },
              ]} />

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Context Injection Example</h4>
                <p className="text-xs text-muted-foreground">
                  The AI will naturally reference this context during the conversation — e.g. "Hello Ramesh, I see your balance is ₹20,000."
                </p>
              </div>

              <CodeBlock code={`{
  "numbers": ["919847493118"],
  "agent_id": "550e8400-e29b-41d4-a716-446655440000",
  "context": {
    "name": "Ramesh Kumar",
    "fee_pending": "₹20,000",
    "course": "BCA 2nd Year",
    "due_date": "May 15th, 2026",
    "notes": "Remind him about the early-bird scholarship."
  }
}`} />

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">cURL Example</h4>
              </div>

              <CodeBlock language="bash" code={`curl -X POST https://api.convobridge.in/api/campaign/ai \\
     -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{
       "numbers": ["919847493118"],
       "context": {
         "name": "Ramesh",
         "fee_remaining": "20000"
       }
     }'`} />
            </section>

            {/* Audio Campaign */}
            <section id="audio" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Terminal className="h-6 w-6 text-primary" /> Audio Playback Campaign
              </h2>
              <p className="text-muted-foreground">
                Play a pre-recorded audio file to each recipient in the campaign.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-xs font-bold text-green-600 font-mono">POST</span>
                <span className="text-sm font-mono text-foreground">/api/campaign/audio</span>
              </div>

              <ParamTable rows={[
                { name: "numbers", type: "string[]", desc: "Required. Array of target numbers." },
                { name: "cloudUrl", type: "string", desc: "Required. Public URL to a .wav or .mp3 file (e.g., Cloudinary)." },
              ]} />
            </section>

            {/* TTS Campaign */}
            <section id="tts" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Terminal className="h-6 w-6 text-primary" /> TTS Campaign
              </h2>
              <p className="text-muted-foreground">
                Convert text into speech and play it to each recipient.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-xs font-bold text-green-600 font-mono">POST</span>
                <span className="text-sm font-mono text-foreground">/api/campaign/tts</span>
              </div>

              <ParamTable rows={[
                { name: "numbers", type: "string[]", desc: "Required. Array of target numbers." },
                { name: "text", type: "string", desc: "Required. The message to be spoken." },
                { name: "provider", type: "string", desc: 'Optional. "google" (default) or "sarvam" (Hindi).' },
                { name: "voice_name", type: "string", desc: 'Optional. Google voice name (e.g., "en-IN-Wavenet-B").' },
              ]} />
            </section>

            {/* Logs */}
            <section id="logs" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" /> Monitoring & Logs
              </h2>

              <div className="space-y-4">
                {[
                  { method: "GET", path: "/api/logs/calls", desc: "Returns the 50 most recent inbound call records." },
                  { method: "GET", path: "/api/logs/outbound", desc: "Returns the 50 most recent outbound campaign call records." },
                  { method: "GET", path: "/api/status/:callId", desc: "Retrieve real-time status, duration, and recording URL for a specific call." },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/20 transition-colors">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                      <span className="text-xs font-bold text-blue-600 font-mono">{ep.method}</span>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold">{ep.path}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ep.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Storage */}
            <section id="storage" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" /> Storage & Infrastructure
              </h2>
              <div className="flex items-start gap-4 p-4 rounded-xl border border-border">
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs font-bold text-blue-600 font-mono">GET</span>
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold">/api/storage/stats</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Returns current Cloudinary usage stats (bandwidth, storage used, etc.).</p>
                </div>
              </div>
            </section>

            {/* Status Codes */}
            <section id="codes" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" /> Response Codes
              </h2>
              <div className="rounded-xl border border-border p-5 space-y-1">
                <StatusBadge code="200" color="bg-green-500/15 text-green-600" label="Campaign dispatched or data retrieved successfully." />
                <StatusBadge code="400" color="bg-yellow-500/15 text-yellow-600" label="Missing required parameters or invalid payload." />
                <StatusBadge code="401" color="bg-red-500/15 text-red-600" label="Invalid or missing API Key." />
                <StatusBadge code="402" color="bg-orange-500/15 text-orange-600" label="Insufficient outbound balance. Top up via Dashboard." />
                <StatusBadge code="500" color="bg-red-500/15 text-red-600" label="Server-side error during dispatch or processing." />
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
              <h3 className="text-xl font-bold">Need help integrating?</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Our team can help you set up your first campaign. Reach out and we'll get you live in minutes.
              </p>
              <Button className="rounded-xl px-6" onClick={() => window.location.href = '/contact-us'}>
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
