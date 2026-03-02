import { useState } from 'react';
import { ArrowRight, Check, X, Zap, TrendingUp, Shield, BarChart3, Phone, MessageSquare, Globe2, Users, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowLines } from "@/components/FlowLines";
import NavBar from "@/components/NavBar";

interface PricingFeature {
  name: string;
  starter: boolean | string | number;
  professional: boolean | string | number;
  enterprise: boolean | string | number;
  category: string;
}

const pricingFeatures: PricingFeature[] = [
  // Core Features
  { category: "Core Features", name: "Concurrent AI Agents", starter: 1, professional: 5, enterprise: "Unlimited" },
  { category: "Core Features", name: "Monthly Call Minutes", starter: "1,000", professional: "50,000", enterprise: "Custom" },
  { category: "Core Features", name: "Languages Supported", starter: 5, professional: 40, enterprise: 40 },
  { category: "Core Features", name: "Voice Selection", starter: 3, professional: 12, enterprise: 12 },
  
  // Integration & APIs
  { category: "Integration & APIs", name: "API Access", starter: false, professional: true, enterprise: true },
  { category: "Integration & APIs", name: "Webhooks", starter: false, professional: true, enterprise: true },
  { category: "Integration & APIs", name: "CRM Integrations", starter: false, professional: 5, enterprise: "Custom" },
  { category: "Integration & APIs", name: "Calendar Integration", starter: false, professional: true, enterprise: true },
  
  // Support & SLA
  { category: "Support & SLA", name: "Email Support", starter: true, professional: true, enterprise: true },
  { category: "Support & SLA", name: "Priority Support", starter: false, professional: true, enterprise: true },
  { category: "Support & SLA", name: "Phone Support", starter: false, professional: false, enterprise: true },
  { category: "Support & SLA", name: "SLA Guarantee", starter: "99%", professional: "99.5%", enterprise: "99.9%" },
  
  // Analytics & Intelligence
  { category: "Analytics & Intelligence", name: "Real-time Analytics", starter: false, professional: true, enterprise: true },
  { category: "Analytics & Intelligence", name: "Advanced Reporting", starter: false, professional: true, enterprise: true },
  { category: "Analytics & Intelligence", name: "Sentiment Analysis", starter: false, professional: true, enterprise: true },
  { category: "Analytics & Intelligence", name: "Custom Dashboards", starter: false, professional: false, enterprise: true },
  
  // Security & Compliance
  { category: "Security & Compliance", name: "GDPR Compliance", starter: true, professional: true, enterprise: true },
  { category: "Security & Compliance", name: "SOC 2 Certification", starter: true, professional: true, enterprise: true },
  { category: "Security & Compliance", name: "HIPAA Compliance", starter: false, professional: true, enterprise: true },
  { category: "Security & Compliance", name: "Advanced Encryption", starter: false, professional: true, enterprise: true },
  
  // Training & Onboarding
  { category: "Training & Onboarding", name: "Onboarding Call", starter: false, professional: true, enterprise: true },
  { category: "Training & Onboarding", name: "Dedicated Account Manager", starter: false, professional: false, enterprise: true },
  { category: "Training & Onboarding", name: "Custom Training", starter: false, professional: false, enterprise: true },
];

const pricingPlans = [
  {
    name: "Starter",
    monthlyPrice: 99,
    annualPrice: 990,
    description: "Perfect for small teams getting started with AI calling",
    features: [
      "1 concurrent AI agent",
      "1,000 minutes/month",
      "5 languages",
      "Email support",
      "Basic analytics",
      "GDPR compliant",
    ],
    cta: "Start Free Trial",
    highlighted: false,
    icon: Zap,
  },
  {
    name: "Professional",
    monthlyPrice: 499,
    annualPrice: 4990,
    description: "For growing companies scaling customer communication",
    features: [
      "5 concurrent AI agents",
      "50,000 minutes/month",
      "40 languages",
      "API & webhook access",
      "5 CRM integrations",
      "Real-time analytics",
      "Priority support",
      "HIPAA compliant",
      "Custom dashboards",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    icon: TrendingUp,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    description: "Unlimited scale with dedicated support and compliance",
    features: [
      "Unlimited agents",
      "Unlimited minutes",
      "40 languages",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting",
      "Phone support",
      "99.9% SLA",
      "Custom compliance",
    ],
    cta: "Talk to Sales",
    highlighted: false,
    icon: Shield,
  },
];

interface CalculatorState {
  callsPerMonth: number;
  currentCostPerCall: number;
  selectedPlan: 'starter' | 'professional' | 'enterprise';
}

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [calculator, setCalculator] = useState<CalculatorState>({
    callsPerMonth: 1000,
    currentCostPerCall: 0.50,
    selectedPlan: 'professional',
  });
  const [expandedCategory, setExpandedCategory] = useState<string>('Core Features');

  // Calculator logic
  const currentMonthlyCost = calculator.callsPerMonth * calculator.currentCostPerCall;
  const convobridgeMonthly = calculator.selectedPlan === 'starter' ? 99 : 
                              calculator.selectedPlan === 'professional' ? 499 : 
                              1999; // Estimated enterprise
  const monthlySavings = Math.max(0, currentMonthlyCost - convobridgeMonthly);
  const annualSavings = monthlySavings * 12;
  const paybackMonths = convobridgeMonthly > 0 ? Math.ceil(convobridgeMonthly / (monthlySavings || 1)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <FlowLines />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-caption border border-primary/20">
              <Zap className="h-4 w-4" />
              Transparent, Simple Pricing
            </div>
            
            <h1 className="text-display max-w-3xl mx-auto">
              Pay for what you use.
              <span className="block text-primary">Not for complexity.</span>
            </h1>

            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. No surprise charges. Scale from 100 to 100,000 calls without renegotiating contracts. 
              Switch plans anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-caption ${billingPeriod === 'monthly' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-700 transition-colors"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-caption ${billingPeriod === 'annual' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                Annual <span className="text-primary font-semibold">(Save 17%)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {pricingPlans.map((plan) => {
              const Icon = plan.icon;
              const displayPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const pricePerCall = plan.monthlyPrice ? (plan.monthlyPrice / 1000).toFixed(3) : 'Custom';

              return (
                <div
                  key={plan.name}
                  className={`relative stripe-card space-y-6 animate-fade-in-up ${
                    plan.highlighted
                      ? 'ring-2 ring-primary shadow-2xl transform scale-105'
                      : 'opacity-90'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block bg-primary text-white text-caption font-bold px-4 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-h3">{plan.name}</h3>
                    </div>
                    <p className="text-body text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="space-y-2">
                    {displayPrice ? (
                      <>
                        <div className="text-5xl font-bold">
                          ${displayPrice}
                          <span className="text-xl text-muted-foreground font-normal">/month</span>
                        </div>
                        <p className="text-caption text-muted-foreground">
                          ${pricePerCall} per 1,000 calls
                        </p>
                      </>
                    ) : (
                      <div className="text-3xl font-bold">Custom Pricing</div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full text-base"
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <div className="space-y-3 border-t pt-6">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-caption">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Calculate Your Savings</h2>
            <p className="text-body-large text-muted-foreground">
              See exactly how much you'll save by switching to ConvoBridge
            </p>
          </div>

          <div className="stripe-card space-y-8">
            {/* Input Fields */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-caption font-semibold">
                  Calls Per Month: <span className="text-primary">{calculator.callsPerMonth.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="500"
                  value={calculator.callsPerMonth}
                  onChange={(e) => setCalculator({ ...calculator, callsPerMonth: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-caption text-muted-foreground">
                  <span>100</span>
                  <span>100K</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-caption font-semibold">
                  Current Cost Per Call: <span className="text-primary">${calculator.currentCostPerCall.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.10"
                  max="2.00"
                  step="0.05"
                  value={calculator.currentCostPerCall}
                  onChange={(e) => setCalculator({ ...calculator, currentCostPerCall: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-caption text-muted-foreground">
                  <span>$0.10</span>
                  <span>$2.00</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-4 gap-4 border-t pt-8">
              <div className="text-center space-y-2">
                <p className="text-caption text-muted-foreground">Current Monthly Cost</p>
                <p className="text-3xl font-bold text-red-500">${currentMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-caption text-muted-foreground">ConvoBridge Cost</p>
                <p className="text-3xl font-bold">${convobridgeMonthly.toLocaleString()}</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-caption text-muted-foreground">Monthly Savings</p>
                <p className={`text-3xl font-bold ${monthlySavings > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                  ${monthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-caption text-muted-foreground">Annual Savings</p>
                <p className={`text-3xl font-bold ${monthlySavings > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                  ${annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {monthlySavings > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-green-900 dark:text-green-200">
                  <span className="font-bold">You'd save ${monthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/month</span>
                  {paybackMonths > 0 && <span> • Payback period: <strong>{paybackMonths} months</strong></span>}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Detailed Feature Comparison</h2>
            <p className="text-body-large text-muted-foreground">
              Everything you need to choose the perfect plan
            </p>
          </div>

          <div className="space-y-6">
            {Array.from(new Set(pricingFeatures.map((f) => f.category))).map((category) => (
              <div key={category} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category ? '' : category)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                >
                  <h3 className="text-h4 font-semibold">{category}</h3>
                  <span className={`transform transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {expandedCategory === category && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30 border-b">
                        <tr>
                          <th className="text-left px-6 py-3 text-caption font-semibold">Feature</th>
                          <th className="text-center px-4 py-3 text-caption font-semibold">Starter</th>
                          <th className="text-center px-4 py-3 text-caption font-semibold">Professional</th>
                          <th className="text-center px-4 py-3 text-caption font-semibold">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingFeatures
                          .filter((f) => f.category === category)
                          .map((feature, idx) => (
                            <tr key={feature.name} className={idx % 2 === 0 ? 'bg-muted/5' : ''}>
                              <td className="px-6 py-3 text-caption font-medium">{feature.name}</td>
                              <td className="text-center px-4 py-3">
                                {typeof feature.starter === 'boolean' ? (
                                  feature.starter ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-caption font-semibold">{feature.starter}</span>
                                )}
                              </td>
                              <td className="text-center px-4 py-3">
                                {typeof feature.professional === 'boolean' ? (
                                  feature.professional ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-caption font-semibold">{feature.professional}</span>
                                )}
                              </td>
                              <td className="text-center px-4 py-3">
                                {typeof feature.enterprise === 'boolean' ? (
                                  feature.enterprise ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-caption font-semibold">{feature.enterprise}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-h2 mb-4">Pricing FAQ</h2>
            <p className="text-body-large text-muted-foreground">
              Common questions about ConvoBridge pricing
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate charges accordingly.",
              },
              {
                q: "What if I exceed my monthly minutes?",
                a: "We'll notify you when you're approaching your limit. You can upgrade instantly or purchase additional minutes at your plan's rate.",
              },
              {
                q: "Do you offer discounts for annual billing?",
                a: "Yes! Annual plans include a 17% discount compared to monthly billing. Pay once per year and save.",
              },
              {
                q: "Is there a setup fee or hidden charges?",
                a: "No. You only pay the monthly plan price. No setup fees, no hidden charges, no surprise invoices. What you see is what you pay.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, bank transfers, and ACH payments. Enterprise customers can arrange net-30 invoicing.",
              },
              {
                q: "Can I get a refund?",
                a: "We offer a 14-day money-back guarantee on all plans. If you're not satisfied, we'll refund your entire payment.",
              },
              {
                q: "Do you offer free trials?",
                a: "Yes! All plans include a 14-day free trial. No credit card required to get started.",
              },
              {
                q: "How do minute overage charges work?",
                a: "If you exceed your monthly minutes, additional calls are charged at $0.10 per 100 minutes (approximately). We notify you before charging.",
              },
            ].map((faq, idx) => (
              <details key={idx} className="stripe-card cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-body hover:text-primary transition-colors py-4">
                  <span>{faq.q}</span>
                  <span className="transform transition-transform group-open:rotate-180 text-primary">▼</span>
                </summary>
                <p className="text-body text-muted-foreground pt-2 pb-4 border-t">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-h2 animate-fade-in-up">
            Ready to transform your customer communication?
          </h2>
          <p className="text-body-large text-muted-foreground animate-fade-in-up stagger-1">
            Join 500+ businesses using ConvoBridge. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up stagger-2">
            <Button size="lg" className="text-base">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              Schedule Demo
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
