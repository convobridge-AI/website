import { Briefcase, MapPin, DollarSign, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlowLines } from "@/components/FlowLines";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function Careers() {
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  const jobs = [
    {
      id: 1,
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      level: "Senior",
      salary: "$180k - $220k",
      description: "Build the next generation of AI calling agents. We're looking for experienced ML engineers to optimize our voice recognition, NLP, and response generation models.",
      responsibilities: [
        "Design and implement cutting-edge NLP models for conversational AI",
        "Optimize model inference for low-latency real-time calls",
        "Research and integrate new transformer architectures",
        "Collaborate with voice engineering team on end-to-end optimization",
        "Contribute to open-source AI projects"
      ],
      requirements: [
        "5+ years experience with machine learning and NLP",
        "Strong background in transformers and language models",
        "Experience with PyTorch or TensorFlow",
        "Proven track record optimizing models for production",
        "PhD or equivalent experience in ML"
      ]
    },
    {
      id: 2,
      title: "Communication Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      level: "Senior",
      salary: "$160k - $200k",
      description: "Own the voice infrastructure that powers millions of calls. Build low-latency audio pipelines, optimize WebRTC connections, and ensure crystal-clear voice quality.",
      responsibilities: [
        "Design and maintain high-performance audio streaming infrastructure",
        "Optimize WebRTC for minimal latency and maximum quality",
        "Implement real-time audio processing and enhancement",
        "Manage SIP/VoIP protocol implementations",
        "Build monitoring and alerting for voice quality metrics"
      ],
      requirements: [
        "5+ years building communication systems or VoIP platforms",
        "Deep expertise in WebRTC, SIP, and audio codecs",
        "Strong systems programming skills (C++, Rust, or Go)",
        "Experience with real-time audio processing",
        "Track record of shipping production communication systems"
      ]
    },
    {
      id: 3,
      title: "Sales Engineer",
      department: "Sales",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      level: "Mid",
      salary: "$120k - $180k + commission",
      description: "Help businesses transform their customer communication. Build relationships with prospects, run demos, and close high-value deals while showcasing ConvoBridge's capabilities.",
      responsibilities: [
        "Conduct technical demos and proof-of-concepts with prospects",
        "Understand customer pain points and map to ConvoBridge solutions",
        "Collaborate with product and engineering on custom implementations",
        "Support sales team through technical discovery calls",
        "Gather customer feedback to improve product roadmap"
      ],
      requirements: [
        "3+ years in sales engineering or customer-facing technical roles",
        "Ability to explain complex AI/ML concepts to non-technical audiences",
        "Experience closing enterprise deals ($50k+ ARR)",
        "Strong communication and presentation skills",
        "Understanding of VoIP, call centers, or communication platforms"
      ]
    },
    {
      id: 4,
      title: "3D Metahuman Developer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      level: "Senior",
      salary: "$150k - $190k",
      description: "Create photorealistic AI avatars for ConvoBridge. Build the visual layer of our agents using cutting-edge 3D graphics, animation, and generative AI technologies.",
      responsibilities: [
        "Develop real-time 3D avatar systems for video calling",
        "Implement facial animation and lip-sync from audio",
        "Optimize 3D models and rendering for low-latency streaming",
        "Integrate generative AI for dynamic avatar creation",
        "Build tools for avatar customization and personalization"
      ],
      requirements: [
        "5+ years in 3D graphics, game development, or CGI",
        "Expert-level experience with Unity or Unreal Engine",
        "Strong understanding of shaders, rendering pipelines, and optimization",
        "Experience with facial animation, rigging, or motion capture",
        "Knowledge of generative AI and neural rendering (NeRF, etc.)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="space-y-8 max-w-3xl animate-fade-in-up">
            <h1 className="text-display">
              Join us in building the
              <span className="block text-primary">future of AI calling.</span>
            </h1>

            <p className="text-body-large text-muted-foreground max-w-2xl">
              We're a team of passionate engineers, designers, and builders working on the most challenging problems in conversational AI. Help us eliminate missed calls forever.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-base">
                View All Openings
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Why Join ConvoBridge?</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: "Cutting-Edge AI",
                description: "Work on GPT-4, voice synthesis, and real-time NLP at the frontier of AI research"
              },
              {
                title: "High Impact",
                description: "Your work directly impacts millions of calls and business outcomes every day"
              },
              {
                title: "Equity & Growth",
                description: "Competitive salary, equity grants, and clear path to leadership roles"
              },
              {
                title: "Flexibility",
                description: "Remote-friendly options, flexible hours, and focus on results over presence"
              }
            ].map((item, idx) => (
              <div key={idx} className="stripe-card p-6 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <h3 className="text-h3 mb-2">{item.title}</h3>
                <p className="text-body-small text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Open Positions</h2>
            <p className="text-body-large text-muted-foreground">
              We're always looking for exceptional talent. Here are our current openings.
            </p>
          </div>

          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <div
                key={job.id}
                className="stripe-card p-6 cursor-pointer transition-all hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-h3 mb-3">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-body-small text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-caption font-semibold">
                        {job.level}
                      </div>
                    </div>
                    <p className="text-body text-muted-foreground">{job.description}</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                </div>

                {expandedJob === job.id && (
                  <div className="mt-6 pt-6 border-t space-y-6 animate-fade-in-up">
                    <div>
                      <h4 className="text-h4 mb-3 font-semibold">Key Responsibilities</h4>
                      <ul className="space-y-2">
                        {job.responsibilities.map((resp, idx) => (
                          <li key={idx} className="text-body text-muted-foreground flex gap-3">
                            <span className="text-primary mt-1">•</span>
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-h4 mb-3 font-semibold">Requirements</h4>
                      <ul className="space-y-2">
                        {job.requirements.map((req, idx) => (
                          <li key={idx} className="text-body text-muted-foreground flex gap-3">
                            <span className="text-primary mt-1">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button size="lg" className="w-full md:w-auto text-base">
                      Apply Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-lg mb-4">ConvoBridge</h3>
              <p className="text-muted-foreground text-sm mb-4">AI calling agents that never miss.</p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Email:</span><br />
                  <a href="mailto:contactconvobridge@gmail.com" className="hover:text-primary transition-colors text-xs">contactconvobridge@gmail.com</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Phone:</span><br />
                  <a href="tel:+919847493118" className="hover:text-primary transition-colors text-xs">+91 9847 493118</a>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
                <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact-us" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="/careers" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 ConvoBridge. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
