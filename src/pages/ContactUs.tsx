import { Mail, Phone, MapPin, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FlowLines } from "@/components/FlowLines";
import NavBar from "@/components/NavBar";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.submitContact(formData);
      setSubmitted(true);
      toast.success("Message sent successfully! We'll be in touch soon.");
      setTimeout(() => {
        setFormData({ name: "", email: "", company: "", message: "" });
        setSubmitted(false);
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="space-y-8 max-w-3xl animate-fade-in-up">
            <h1 className="text-display">
              Get in touch with
              <span className="block text-primary">our team today.</span>
            </h1>

            <p className="text-body-large text-muted-foreground max-w-2xl">
              Have questions about ConvoBridge? Want to schedule a demo? Our team is here to help you build smarter AI calling agents.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Phone,
                title: "Call Us",
                value: "+91 98474 93118",
                description: "Available Monday to Friday, 9 AM - 6 PM EST"
              },
              {
                icon: Mail,
                title: "Email Us",
                value: "contactconvobridge@gmail.com",
                description: "We typically respond within 24 hours"
              },
              {
                icon: MapPin,
                title: "Visit Us",
                value: "San Francisco, CA",
                description: "HQ located in the heart of tech innovation"
              }
            ].map((item, idx) => (
              <div key={idx} className="stripe-card group cursor-pointer">
                <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-h3 mb-2">{item.title}</h3>
                <p className="text-body font-semibold text-foreground mb-2">{item.value}</p>
                <p className="text-body-small text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Send us a message</h2>
            <p className="text-body-large text-muted-foreground">
              Tell us about your use case and we'll get back to you shortly.
            </p>
          </div>

          {submitted ? (
            <div className="stripe-card text-center py-12 animate-fade-in-up">
              <div className="inline-flex p-3 rounded-lg bg-success/10 mb-4">
                <MessageSquare className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-h3 mb-2">Thank you!</h3>
              <p className="text-body-large text-muted-foreground">
                We've received your message and will be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="stripe-card p-8 space-y-6 animate-fade-in-up">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-body-small font-semibold">Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-body-small font-semibold">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-body-small font-semibold">Company</label>
                <Input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-body-small font-semibold">Message</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project..."
                  required
                  className="min-h-32 resize-none"
                />
              </div>

              <Button size="lg" className="w-full md:w-auto text-base" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Message"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing relative overflow-hidden">
        <FlowLines />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="stripe-card p-12 md:p-16 text-center">
            <h2 className="text-h2 mb-4 animate-fade-in-up">Prefer a live demo?</h2>
            <p className="text-body-large text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up stagger-2">
              Schedule a call with our team to see ConvoBridge in action and discuss your specific needs.
            </p>
            <Button size="lg" className="text-base">
              Schedule a Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
