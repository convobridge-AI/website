
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, BarChart3, Shield, Zap, Globe2, Users, Rocket, Target } from "lucide-react";

const ease = [0.16, 1, 0.3, 1];

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease, delay }}
  >
    {children}
  </motion.div>
);

export default function InvestmentTermSheet() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <FadeIn>
            <div className="flex justify-center mb-6">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                convo<span className="text-blue-600">bridge</span>
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
              Strategic Investment Term Sheet
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Investment Proposal for Strategic Anchor Round — March 2026
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium border-blue-200 text-blue-700 bg-blue-50">
                Confidential
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium border-green-200 text-green-700 bg-green-50">
                Strategic Entry
              </Badge>
            </div>
          </FadeIn>
        </div>

        <div className="space-y-8">
          {/* Key Terms Card */}
          <FadeIn delay={0.1}>
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-900 text-white">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Primary Investment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableCell className="font-semibold text-slate-600 w-1/3 py-4 pl-6">Investment Amount</TableCell>
                      <TableCell className="text-slate-900 font-bold py-4 pr-6">₹1,00,00,000 (₹1 Crore)</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableCell className="font-semibold text-slate-600 py-4 pl-6">Pre-Money Valuation</TableCell>
                      <TableCell className="text-slate-900 font-bold py-4 pr-6">₹20,00,00,000 (₹20 Crores)</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableCell className="font-semibold text-slate-600 py-4 pl-6">Equity Offered</TableCell>
                      <TableCell className="text-slate-900 font-bold py-4 pr-6">4.76% (Post-Money)</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableCell className="font-semibold text-slate-600 py-4 pl-6">Security Type</TableCell>
                      <TableCell className="text-slate-900 py-4 pr-6">Compulsorily Convertible Debentures (CCD)</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableCell className="font-semibold text-slate-600 py-4 pl-6">Governance</TableCell>
                      <TableCell className="text-slate-900 py-4 pr-6">Board Observer Seat + Quarterly Strategic Review</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Allocation of Funds */}
          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={0.2}>
              <Card className="h-full border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-blue-600" />
                    Capital Allocation
                  </CardTitle>
                  <CardDescription>12-month growth milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="mt-1 p-1 bg-blue-100 rounded text-blue-700 text-xs font-bold">50%</div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">AI Engineering Depth</p>
                          <p className="text-xs text-slate-500">2x Senior AI Engineers for Native Model fine-tuning</p>
                        </div>
                      </div>
                    </li>
                    <li className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="mt-1 p-1 bg-blue-100 rounded text-blue-700 text-xs font-bold">25%</div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">GTM & GCC Expansion</p>
                          <p className="text-xs text-slate-500">Sales capture in UAE/KSA education verticals</p>
                        </div>
                      </div>
                    </li>
                    <li className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="mt-1 p-1 bg-blue-100 rounded text-blue-700 text-xs font-bold">25%</div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Ops & Compliance</p>
                          <p className="text-xs text-slate-500">GDPR/Sovereign AI infrastructure readiness</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card className="h-full border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Valuation Benchmarks
                  </CardTitle>
                  <CardDescription>Why ₹20 Cr is a Strategic Value</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Replacement Cost</p>
                    <p className="text-sm text-slate-700">₹2 Cr+ to replicate the sub-300ms orchestration layer.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Revenue Multiple</p>
                    <p className="text-sm text-slate-700">15x–20x projected Year 1 ARR (₹1.2 Cr target).</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Market Moat</p>
                    <p className="text-sm text-slate-700">Native Arabic/Malayalam/Hindi models (Unfair Advantage).</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Strategic Rights */}
          <FadeIn delay={0.4}>
            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-900">Strategic Anchor Rights (The "Nilgiri Special")</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Founder's Rate Guarantee</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        Nilgiri College locks in a fixed ₹4,999/mo subscription for 36 months, regardless of future platform price parity.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                      <Globe2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Right of First Refusal (ROFR)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        The Investor shall have the right to maintain their current ownership percentage in the upcoming ₹50 Cr Seed Round.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Footer Note */}
          <FadeIn delay={0.5}>
            <div className="text-center pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                This term sheet is for discussion purposes only and is not a binding commitment to invest.
              </p>
              <p className="text-xs text-slate-400 mt-2 italic">
                "We aren't just building a service; we are building the standard communication layer for the region."
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
