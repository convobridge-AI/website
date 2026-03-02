import { ArrowRight, Heart, Zap, Target, Globe, Rocket, Trophy, Code2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlowLines } from "@/components/FlowLines";
import NavBar from "@/components/NavBar";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="space-y-8 max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-caption border border-primary/20">
              <Heart className="h-4 w-4" />
              Our Mission
            </div>
            
            <h1 className="text-display">
              We're on a mission to
              <span className="block text-primary">eliminate missed calls forever.</span>
            </h1>

            <p className="text-body-large text-muted-foreground max-w-2xl">
              Behind ConvoBridge is a simple belief: every missed call is a missed opportunity. We're building 
              the most intelligent, reliable AI calling platform to help businesses never lose a lead, customer, or moment.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-base">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Do This */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Why We Do This</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              The problem is real. The solution is us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "The Challenge",
                description: "Businesses lose $62 billion annually to missed calls. A single overlooked call can cost a customer, a sale, or a partnership. Traditional phone systems fail in the modern world.",
                icon: Target,
              },
              {
                title: "Our Answer",
                description: "AI that's intelligent, not gimmicky. Agents that understand context, qualify leads, book appointments, and escalate properly—24/7 in 40+ languages.",
                icon: Zap,
              },
              {
                title: "What Success Looks Like",
                description: "Zero missed calls. Higher conversion rates. Happier customers. Sales teams focused on closing deals, not managing voicemails. That's what we're building.",
                icon: Trophy,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`stripe-card space-y-4 animate-fade-in-up stagger-${index + 1}`}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-h3">{item.title}</h3>
                  <p className="text-body text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Think */}
      <section className="section-spacing relative overflow-hidden bg-muted/30">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">How We Think</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Our core values drive every decision we make
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: "Intelligence Over Automation",
                description: "AI should understand context, not just follow scripts. We build agents that think.",
                icon: Code2,
              },
              {
                title: "Human-First Design",
                description: "Technology should amplify human capability, not replace it. Always in service of people.",
                icon: Heart,
              },
              {
                title: "Relentless Reliability",
                description: "A missed call on our platform is a failure. We target 99.9% uptime and never stop improving.",
                icon: Target,
              },
              {
                title: "Radical Transparency",
                description: "You own your data. You see every call. No black boxes. Complete control and clarity.",
                icon: Globe,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`stripe-card space-y-4 animate-fade-in-up stagger-${(index % 4) + 1}`}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-h4">{item.title}</h3>
                  <p className="text-body text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* From Idea to Impact */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">From Idea to Impact</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Our journey in numbers and milestones
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                year: "2023",
                title: "The Beginning",
                description: "Founded ConvoBridge with a singular vision: eliminate missed calls with AI.",
                icon: Rocket,
              },
              {
                year: "2024",
                title: "First Users",
                description: "Deployed with early adopters. Processed 2M+ calls. Proved the concept works.",
                icon: Target,
              },
              {
                year: "2024",
                title: "Major Milestone",
                description: "Expanded to 40+ languages. Built integrations with CRMs and communication platforms.",
                icon: Globe,
              },
              {
                year: "2025",
                title: "Scale & Vision",
                description: "Hundreds of customers. Millions of calls handled. Building the future of AI calling.",
                icon: Trophy,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.year}
                  className={`stripe-card space-y-4 animate-fade-in-up stagger-${(index % 4) + 1}`}
                >
                  <div className="text-caption text-primary font-bold">{item.year}</div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-h4">{item.title}</h3>
                  <p className="text-body text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Results */}
      <section className="section-spacing relative overflow-hidden bg-muted/30">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">The Results</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              What we've achieved so far
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                stat: "2M+",
                label: "Calls Handled",
                description: "Intelligent calls processed across all industries and languages.",
              },
              {
                stat: "40+",
                label: "Languages Supported",
                description: "AI agents speaking every major business language worldwide.",
              },
              {
                stat: "500+",
                label: "Active Customers",
                description: "Businesses from startups to enterprises trust ConvoBridge.",
              },
              {
                stat: "99.9%",
                label: "Uptime SLA",
                description: "Reliable infrastructure that never lets you miss a call.",
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className={`stripe-card text-center space-y-4 animate-fade-in-up stagger-${(index % 4) + 1}`}
              >
                <div className="text-5xl font-bold text-primary">{item.stat}</div>
                <h3 className="text-h4">{item.label}</h3>
                <p className="text-body text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Why We're Different</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              What sets ConvoBridge apart from the rest
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              "Purpose-built AI agents, not glorified chatbots",
              "Full transparency: you see and control every call",
              "Fast setup: deploy your first agent in minutes, not weeks",
              "Real support: experts who understand your use case",
              "Fair pricing: no per-minute overages, no surprise charges",
            ].map((item, index) => (
              <div
                key={item}
                className={`stripe-card flex items-start gap-4 p-4 animate-fade-in-up stagger-${(index % 5) + 1}`}
              >
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-body">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section-spacing relative overflow-hidden bg-muted/30">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Who We Are</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Meet the team building the future of AI calling
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Founder & CEO",
                title: "Visionary",
                bio: "Former product director at a leading AI company. Passionate about solving real business problems with intelligent technology.",
              },
              {
                name: "Lead Engineer",
                title: "Technical Excellence",
                bio: "Built infrastructure at scale for telecom giants. Expert in low-latency audio and voice AI. Obsessed with reliability.",
              },
              {
                name: "Head of Product",
                title: "Customer Voice",
                bio: "User researcher and product strategist. Spent years understanding how businesses really use calling technology.",
              },
            ].map((person, index) => (
              <div
                key={person.name}
                className={`stripe-card text-center space-y-4 animate-fade-in-up stagger-${(index % 3) + 1}`}
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{person.title[0]}</span>
                </div>
                <div>
                  <h3 className="text-h4">{person.name}</h3>
                  <p className="text-caption text-primary font-semibold">{person.title}</p>
                </div>
                <p className="text-body text-muted-foreground">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment to You */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="stripe-card space-y-6 animate-fade-in-up text-center">
            <h2 className="text-h2">Our Commitment to You</h2>
            <p className="text-body-large text-muted-foreground">
              ConvoBridge isn't just software. It's a partnership. We succeed when your business succeeds. 
              When you deploy an AI agent with us, you're not just getting technology—you're getting a team 
              dedicated to making sure every call counts.
            </p>
            <p className="text-body-large text-muted-foreground">
              We're transparent about our limits, honest about timelines, and relentless about solving your problems. 
              That's not just a feature—that's our foundation.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-spacing-tight bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-h2 animate-fade-in-up">
            Ready to join us on this mission?
          </h2>
          <p className="text-body-large text-muted-foreground animate-fade-in-up stagger-1">
            Start with a free trial. No credit card required. See how ConvoBridge can transform your business.
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
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="font-bold text-xl mb-4">ConvoBridge</div>
              <p className="text-caption text-muted-foreground mb-4">
                AI calling agents that never sleep.
              </p>
              <div className="space-y-2">
                <p className="text-caption text-muted-foreground">
                  <span className="font-semibold text-foreground">Email:</span><br />
                  <a href="mailto:contactconvobridge@gmail.com" className="hover:text-primary transition-colors">contactconvobridge@gmail.com</a>
                </p>
                <p className="text-caption text-muted-foreground">
                  <span className="font-semibold text-foreground">Phone:</span><br />
                  <a href="tel:+919847493118" className="hover:text-primary transition-colors">+91 9847 493118</a>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="/" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="/pricing" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <a href="#" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">Security</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="/about" className="block text-caption text-muted-foreground hover:text-foreground transition-colors">About</a>
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
