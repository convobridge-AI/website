import { ArrowRight, Phone, BarChart3, Calendar, Globe2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveDemoWidget } from "@/components/LiveDemoWidget";
import { AuroraBackground } from "@/components/AuroraBackground";
import { GridPattern } from "@/components/GridPattern";
import { OrbitalRings } from "@/components/OrbitalRings";
import { HolographicOrb } from "@/components/HolographicOrb";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <AuroraBackground />
        <GridPattern className="opacity-40" />
        
        {/* Background Paths — animated flowing lines */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <BackgroundPaths title="" />
        </div>

        <OrbitalRings className="top-1/2 right-0 -translate-y-1/2 translate-x-1/4 hidden lg:block" size={600} />

        {/* CPU Architecture — tech accent */}
        <div className="absolute bottom-8 right-8 hidden lg:block opacity-40 pointer-events-none w-[320px] h-[160px]">
          <CpuArchitecture text="AI" className="text-primary/50" />
        </div>

        {/* 3D Holographic Orb — hero accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <HolographicOrb size={800} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.3fr,1fr] gap-16 items-start">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium glass-card"
                style={{ border: "1px solid hsla(217 91% 50% / 0.15)" }}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Powered by advanced AI</span>
              </div>

              <h1 className="text-display">
                Your AI agent
                <br />
                <span className="holo-text">answers every call.</span>
              </h1>

              <p className="text-body-large text-muted-foreground max-w-lg">
                ConvoBridge deploys intelligent AI agents that answer calls, qualify leads,
                and book appointments — 24/7 in 40+ languages.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="rounded-xl text-base px-6 bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_30px_-5px_hsla(217,91%,50%,0.3)]">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl text-base px-6 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 text-foreground">
                  Watch Demo
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Deploy in under 5 minutes. No credit card required.
              </p>
            </div>

            <div className="lg:mt-4">
              <LiveDemoWidget variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative section-spacing border-t border-border overflow-hidden">
        <GridPattern className="opacity-20" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-20">
            <p className="text-caption text-primary mb-3 uppercase tracking-wider">How it works</p>
            <h2 className="text-h2">Three steps to<br /><span className="holo-text">24/7 coverage.</span></h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Build your agent",
                description: "Use the visual builder to create an AI agent tailored to your business. Configure personality, voice, language, and response logic — no code required.",
                icon: Phone,
              },
              {
                step: "02",
                title: "Connect your number",
                description: "Forward your existing business number or get a new one. Integration takes minutes with any phone system or VoIP provider.",
                icon: Globe2,
              },
              {
                step: "03",
                title: "Watch it work",
                description: "Your agent answers calls, qualifies leads, books meetings, and logs everything to your dashboard. You focus on closing deals.",
                icon: BarChart3,
              },
            ].map((item, i) => (
              <div key={item.step} className="glass-card-hover rounded-2xl p-8">
                <div className="grid md:grid-cols-[80px,1fr] gap-6 items-start">
                  <div className="text-4xl font-extrabold font-display holo-text">
                    {item.step}
                  </div>
                  <div className="max-w-xl">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: "hsla(217 91% 50% / 0.08)",
                        border: "1px solid hsla(217 91% 50% / 0.12)",
                      }}
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-h3 mb-3">{item.title}</h3>
                    <p className="text-body text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics band */}
      <section className="border-t border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "40+", label: "Languages" },
              { value: "<5 min", label: "Setup time" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Availability" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-6">
                <div className="text-3xl md:text-4xl font-extrabold mb-1 font-display holo-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="section-spacing">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <p className="text-caption text-primary mb-3 uppercase tracking-wider">Use Cases</p>
            <h2 className="text-h2">Built for teams<br /><span className="holo-text">that talk to customers.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 perspective-deep">
            {[
              {
                title: "Sales",
                description: "Qualify inbound leads instantly. Your AI agent asks the right questions and routes hot prospects to your team.",
                icon: BarChart3,
                gradient: "from-[hsla(217,91%,50%,0.06)] to-transparent",
              },
              {
                title: "Support",
                description: "Handle common inquiries, collect information, and escalate complex issues to human agents seamlessly.",
                icon: Phone,
                gradient: "from-[hsla(199,89%,48%,0.06)] to-transparent",
              },
              {
                title: "Scheduling",
                description: "Book, reschedule, and confirm appointments automatically. Integrates with your existing calendar.",
                icon: Calendar,
                gradient: "from-[hsla(230,70%,55%,0.06)] to-transparent",
              },
            ].map((item) => (
              <div key={item.title} className={`glass-card-hover rounded-2xl p-8 space-y-4 hover-lift-3d holo-border bg-gradient-to-br ${item.gradient}`}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center glass-card">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-h4">{item.title}</h3>
                <p className="text-body text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative grain overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="glass-card rounded-3xl p-12 md:p-16 holo-border glass-shimmer">
            <h2 className="text-h2 mb-6">Ready to never miss <span className="holo-text">another call?</span></h2>
            <p className="text-body-large text-muted-foreground mb-10 max-w-lg mx-auto">
              Join hundreds of businesses using ConvoBridge to scale customer communication.
            </p>
            <Button size="lg" className="rounded-xl text-base px-8 bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_30px_-5px_hsla(217,91%,50%,0.3)]">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
