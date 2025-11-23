import { ArrowRight, CheckCircle2, Zap, Shield, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveDemoWidget } from "@/components/LiveDemoWidget";
import { FlowLines } from "@/components/FlowLines";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full glass z-40 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl">ConvoBridge</div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#solutions" className="text-caption text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
            <a href="#pricing" className="text-caption text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="text-caption text-muted-foreground hover:text-foreground transition-colors">About</a>
            <Button variant="ghost" size="sm">Login</Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-12 items-start">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-caption border border-primary/20">
                <Zap className="h-4 w-4" />
                AI Calling Agents
              </div>
              
              <h1 className="text-display max-w-3xl">
                Never miss a call.
                <span className="block text-primary">Let AI handle it.</span>
              </h1>

              <p className="text-body-large text-muted-foreground max-w-2xl">
                ConvoBridge deploys intelligent AI agents that answer calls, qualify leads, 
                and book appointments—24/7 in 40+ languages. Your business stays open while you sleep.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="text-base">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-base">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-caption">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-caption">Setup in 5 minutes</span>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up stagger-2">
              <LiveDemoWidget variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-8 opacity-60">
            <div className="text-caption font-semibold">Trusted by 500+ businesses</div>
            <div className="flex gap-12 items-center flex-wrap">
              <div className="text-caption font-semibold">TechCorp</div>
              <div className="text-caption font-semibold">StartupCo</div>
              <div className="text-caption font-semibold">Enterprise Ltd</div>
              <div className="text-caption font-semibold">Global Inc</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">How it works</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Three steps to 24/7 AI call coverage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Build Your Agent",
                description: "Use our visual builder to create an AI agent tailored to your business. Set personality, voice, and response logic.",
                icon: Zap,
              },
              {
                step: "02",
                title: "Connect Your Number",
                description: "Forward calls to your ConvoBridge number or integrate with your existing phone system in minutes.",
                icon: Shield,
              },
              {
                step: "03",
                title: "Let AI Work",
                description: "Your agent answers calls, qualifies leads, books meetings, and logs everything to your dashboard.",
                icon: Globe2,
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className={`stripe-card space-y-4 animate-fade-in-up stagger-${index + 1}`}
              >
                <div className="text-caption text-primary font-bold">{item.step}</div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-h4">{item.title}</h3>
                <p className="text-body text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing-tight bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-h2 animate-fade-in-up">
            Ready to never miss another call?
          </h2>
          <p className="text-body-large text-muted-foreground animate-fade-in-up stagger-1">
            Join 500+ businesses using ConvoBridge to scale their customer communication.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up stagger-2">
            <Button size="lg" className="text-base">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-xl mb-4">ConvoBridge</div>
              <p className="text-caption text-muted-foreground">
                AI calling agents that never sleep.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Security</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">About</a>
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Blog</a>
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Careers</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-caption text-muted-foreground">
            © 2025 ConvoBridge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
