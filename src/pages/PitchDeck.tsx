import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// ─────────────────────────────────────────────────────────────
//  CONVOBRIDGE — PITCH DECK
//  Design Philosophy: Clean. Fast. Honest.
//  Typography is the brand. Whitespace is the luxury.
// ─────────────────────────────────────────────────────────────

const TOTAL_SLIDES = 10;

const ease = [0.22, 1, 0.36, 1];
const springConfig = { type: "spring" as const, stiffness: 100, damping: 30 };

// Animated counter hook
function useCounter(end: number, duration = 2000, startOnMount = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!startOnMount || started) return;
    setStarted(true);
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, startOnMount, started]);

  return count;
}

// Stagger children wrapper
const Stagger = ({ children, stagger = 0.08, delay = 0, className = "" }: {
  children: React.ReactNode; stagger?: number; delay?: number; className?: string;
}) => (
  <motion.div className={className}>
    {React.Children.map(children, (child, i) => (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: delay + i * stagger }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

// Line reveal text
const RevealText = ({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1.1, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  </div>
);

// Fade element
const Fade = ({ children, delay = 0, className = "", y = 30 }: {
  children: React.ReactNode; delay?: number; className?: string; y?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function PitchDeck() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const locked = useRef(false);
  const touchStart = useRef(0);

  const go = useCallback((to: number) => {
    if (locked.current || to < 0 || to >= TOTAL_SLIDES || to === active) return;
    locked.current = true;
    setDir(to > active ? 1 : -1);
    setActive(to);
    setTimeout(() => { locked.current = false; }, 1100);
  }, [active]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 30) return;
      go(active + (e.deltaY > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", " "].includes(e.key)) { e.preventDefault(); go(active + 1); }
      if (["ArrowUp", "ArrowLeft"].includes(e.key)) { e.preventDefault(); go(active - 1); }
    };
    const onTouchStart = (e: TouchEvent) => { touchStart.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStart.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 60) go(active + (delta > 0 ? 1 : -1));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [active, go]);

  const slideVariants = {
    enter: (d: number) => ({
      opacity: 0,
      y: d > 0 ? "8%" : "-8%",
      scale: 0.97,
      filter: "blur(6px)",
    }),
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 1, ease },
    },
    exit: (d: number) => ({
      opacity: 0,
      y: d < 0 ? "8%" : "-8%",
      scale: 0.97,
      filter: "blur(6px)",
      transition: { duration: 0.7, ease },
    }),
  };

  const isLightSlide = active !== 9; // All slides light except closing slide

  return (
    <div className={`fixed inset-0 overflow-hidden transition-colors duration-1000 ${isLightSlide ? 'bg-[#FAFAFA]' : 'bg-[#1a3fd8]'}`}>
      {/* Subtle Grid Pattern on light slides */}
      {isLightSlide && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      )}

      {/* Navigation dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-[6px]">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="group flex items-center gap-3"
          >
            <div className={`
              rounded-full transition-all duration-500 ease-out
              ${active === i
                ? `w-[6px] h-7 ${isLightSlide ? 'bg-[#1a3fd8]' : 'bg-white'}`
                : `w-[6px] h-[6px] ${isLightSlide ? 'bg-black/15 group-hover:bg-black/40' : 'bg-white/30 group-hover:bg-white/60'}`
              }`
            }/>
          </button>
        ))}
      </div>

      {/* Slide counter */}
      <div className={`fixed bottom-6 left-8 z-50 font-mono text-[11px] tracking-[0.2em] transition-colors duration-1000 ${isLightSlide ? 'text-black/30' : 'text-white/40'}`}>
        {String(active + 1).padStart(2, "0")} / {TOTAL_SLIDES}
      </div>

      {/* Wordmark */}
      <div className="fixed top-7 left-8 z-50">
        <span className={`text-[15px] font-semibold tracking-tight transition-colors duration-1000 ${isLightSlide ? 'text-black/80' : 'text-white/90'}`}>
          convo<span className={`transition-colors duration-1000 ${isLightSlide ? 'text-[#1a3fd8]' : 'text-white'}`}>bridge</span>
        </span>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={active}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center"
        >
          {active === 0 && <S_Title />}
          {active === 1 && <S_Problem />}
          {active === 2 && <S_Solution />}
          {active === 3 && <S_Product />}
          {active === 4 && <S_Verticals />}
          {active === 5 && <S_Traction />}
          {active === 6 && <S_Pricing />}
          {active === 7 && <S_Roadmap />}
          {active === 8 && <S_Competitive />}
          {active === 9 && <S_Closing />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════════
function S_Title() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 flex flex-col items-center text-center">
      <Fade delay={0.2}>
        <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-black/40 mb-10">Seed Round — March 2026</p>
      </Fade>

      <div className="mb-10">
        <RevealText delay={0.3}>
          <h1 className="text-[clamp(4rem,12vw,10rem)] font-[750] leading-[0.9] tracking-[-0.04em] text-black/90">
            Convo<span className="text-[#1a3fd8]">Bridge</span>
          </h1>
        </RevealText>
      </div>

      <Fade delay={0.7}>
        <p className="text-[clamp(1.1rem,2.2vw,1.6rem)] font-light text-black/45 leading-relaxed max-w-[600px]">
          AI voice agents that speak every language.<br/>Natively. In real-time.
        </p>
      </Fade>

      <Fade delay={1} className="mt-16">
        <p className="text-[12px] tracking-[0.25em] text-black/30 font-medium">contact@convobridge.in</p>
      </Fade>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.9, ease }}
        className="w-[120px] h-[1px] bg-black/10 mt-12 origin-center"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 2 — THE PROBLEM
// ═══════════════════════════════════════════════════════════
function S_Problem() {
  const count = useCounter(5000, 2200);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8">
      <Fade delay={0.1}>
        <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-red-500/70 mb-8">The Problem</p>
      </Fade>

      <RevealText delay={0.2}>
        <h2 className="text-[clamp(2.8rem,7vw,5.5rem)] font-[750] leading-[1] tracking-[-0.03em] text-black/90 mb-6">
          Global enterprise<br/>is bleeding.
        </h2>
      </RevealText>

      <Fade delay={0.6} className="mt-14 flex flex-col md:flex-row gap-16 items-start">
        <div className="flex-1">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-[clamp(3rem,6vw,5rem)] font-[800] tracking-[-0.03em] text-red-500/90">
              ₹{count.toLocaleString()}
            </span>
            <span className="text-[clamp(1.2rem,2.5vw,2rem)] font-light text-red-500/60 ml-2">Cr / year</span>
          </div>
          <p className="text-[18px] leading-[1.75] text-black/50 max-w-[480px]">
            Hospitality sector annual loss from broken voice interactions — agent attrition, mistranslation, and dropped handoffs compound into systemic failure with no fix in sight.
          </p>
        </div>

        <div className="flex-1">
          <div className="border-l-[2px] border-black/8 pl-8">
            <p className="text-[22px] font-[600] leading-[1.5] text-black/75 mb-4">
              Contact center agents quit at record rates.
            </p>
            <p className="text-[16px] leading-[1.8] text-black/40">
              Unsupported multilingual load — no tooling, no relief, no path forward. Each departure resets the cost clock.
            </p>
          </div>
        </div>
      </Fade>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 3 — THE SOLUTION
// ═══════════════════════════════════════════════════════════
function S_Solution() {
  const pillars = [
    { num: "01", title: "Connect", desc: "REST-API integration. No infrastructure replacement. Plug into any legacy stack in days." },
    { num: "02", title: "Configure", desc: "Domain-trained AI agents for hospitality and education. 95% accuracy out of the box." },
    { num: "03", title: "Converse", desc: "40+ natively modeled languages. Not translated — natively trained. Sub-300ms latency." },
    { num: "04", title: "Convert", desc: "Every call logged, billed, fed back into the model. A continuous improvement loop." },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8">
      <Fade delay={0.1}>
        <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#1a3fd8]/60 mb-8">The Solution</p>
      </Fade>

      <RevealText delay={0.2}>
        <h2 className="text-[clamp(2.8rem,7vw,5rem)] font-[750] leading-[1] tracking-[-0.03em] text-black/90 mb-16">
          Four steps to live.
        </h2>
      </RevealText>

      <div className="space-y-0">
        {pillars.map((p, i) => (
          <Fade key={i} delay={0.4 + i * 0.12}>
            <div className="group flex items-start gap-8 py-8 border-t border-black/6 last:border-b hover:bg-black/[0.015] transition-colors duration-500 px-4 -mx-4 rounded-lg cursor-default">
              <span className="text-[13px] font-mono text-[#1a3fd8]/40 pt-2 shrink-0 w-6">{p.num}</span>
              <h3 className="text-[clamp(1.8rem,4vw,2.8rem)] font-[700] tracking-[-0.02em] text-black/85 w-[260px] shrink-0 group-hover:text-[#1a3fd8] transition-colors duration-500">
                {p.title}
              </h3>
              <p className="text-[16px] leading-[1.8] text-black/40 pt-2 max-w-[400px]">{p.desc}</p>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 4 — PRODUCT
// ═══════════════════════════════════════════════════════════
function S_Product() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8">
      <Fade delay={0.1}>
        <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#1a3fd8]/60 mb-8">Production-Ready</p>
      </Fade>

      <RevealText delay={0.2}>
        <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-[750] leading-[1.05] tracking-[-0.03em] text-black/90 mb-20">
          The multilingual moat<br/>is live.
        </h2>
      </RevealText>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Native Voice Stack", stat: "40+", unit: "languages", detail: "French, Arabic, Hindi, Malayalam. Natively modeled — not synthesized from English." },
          { label: "Response Latency", stat: "<300", unit: "ms", detail: "Indistinguishable from human response time. Real-time speech-to-speech at scale." },
          { label: "Domain Accuracy", stat: "95", unit: "%", detail: "Hospitality and education. Trained on vertical-specific dialogue — not generic corpus data." },
          { label: "Integration", stat: "REST", unit: "API", detail: "Plug into Salesforce, SAP, or a legacy PBX without a single infrastructure change." },
        ].map((card, i) => (
          <Fade key={i} delay={0.4 + i * 0.1}>
            <div className="group bg-white border border-black/[0.06] rounded-2xl p-7 hover:shadow-[0_8px_40px_-12px_rgba(26,63,216,0.12)] hover:border-[#1a3fd8]/15 transition-all duration-600">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-black/30 mb-6">{card.label}</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-[2.8rem] font-[800] tracking-[-0.04em] text-black/85 group-hover:text-[#1a3fd8] transition-colors duration-500">{card.stat}</span>
                <span className="text-[14px] font-medium text-black/30">{card.unit}</span>
              </div>
              <p className="text-[13px] leading-[1.7] text-black/35">{card.detail}</p>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 5 — VERTICALS
// ═══════════════════════════════════════════════════════════
function S_Verticals() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8">
      <Fade delay={0.1}>
        <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#1a3fd8]/60 mb-8">Vertical Focus</p>
      </Fade>

      <RevealText delay={0.2}>
        <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-[750] leading-[1.05] tracking-[-0.03em] text-black/90 mb-6">
          Two verticals.<br/>Precision-engineered.
        </h2>
      </RevealText>
      <Fade delay={0.5}>
        <p className="text-[18px] text-black/40 leading-[1.75] mb-16 max-w-[550px]">Built for the sectors where language barriers cost the most.</p>
      </Fade>

      <div className="grid md:grid-cols-2 gap-6">
        <Fade delay={0.5}>
          <div className="bg-white border border-black/[0.06] rounded-2xl p-10 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1a3fd8]/8 flex items-center justify-center">
                <span className="text-[18px]">🏨</span>
              </div>
              <h3 className="text-[28px] font-[700] tracking-[-0.02em] text-black/85">Hospitality</h3>
            </div>
            <p className="text-[16px] leading-[1.75] text-black/45 mb-8">
              24/7 concierge AI in 40+ languages. Handles bookings, complaints, and room service natively.
            </p>
            <div className="flex gap-3 flex-wrap">
              {["Oracle PMS", "Amadeus", "Booking Engine"].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full bg-black/[0.03] text-[11px] font-semibold tracking-[0.1em] text-black/40 uppercase">{t}</span>
              ))}
            </div>
          </div>
        </Fade>

        <Fade delay={0.65}>
          <div className="bg-white border border-black/[0.06] rounded-2xl p-10 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/8 flex items-center justify-center">
                <span className="text-[18px]">🎓</span>
              </div>
              <h3 className="text-[28px] font-[700] tracking-[-0.02em] text-black/85">Education</h3>
            </div>
            <p className="text-[16px] leading-[1.75] text-black/45 mb-8">
              Student inquiry handling in regional languages. 95% domain accuracy on curriculum and enrollment queries.
            </p>
            <div className="flex gap-3 flex-wrap">
              <span className="px-3 py-1.5 rounded-full bg-green-500/8 text-[11px] font-semibold tracking-[0.1em] text-green-700/60 uppercase flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-green-500 animate-pulse" />
                Live — Nilgiri College
              </span>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 6 — TRACTION
// ═══════════════════════════════════════════════════════════
function S_Traction() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8">
      <Fade delay={0.1}>
        <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#1a3fd8]/60 mb-8">Traction — March 2026</p>
      </Fade>

      <RevealText delay={0.2}>
        <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-[750] leading-[1.05] tracking-[-0.03em] text-black/90 mb-20">
          Live in production.
        </h2>
      </RevealText>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Status", value: "LIVE", sub: "Nilgiri College, Coimbatore", accent: true },
          { label: "Pipeline", value: "1 EOI", sub: "Expression of Interest received" },
          { label: "Onboarding", value: "₹50K", sub: "Contract value per integration" },
          { label: "Subscription", value: "₹9.9K", sub: "Monthly recurring per account" },
        ].map((m, i) => (
          <Fade key={i} delay={0.4 + i * 0.1}>
            <div className={`
              rounded-2xl p-8 flex flex-col justify-between min-h-[220px]
              ${m.accent
                ? 'bg-[#1a3fd8] text-white'
                : 'bg-white border border-black/[0.06]'
              }
            `}>
              <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase ${m.accent ? 'text-white/50' : 'text-black/30'}`}>{m.label}</p>
              <div>
                <p className={`text-[clamp(1.8rem,3.5vw,2.5rem)] font-[800] tracking-[-0.03em] mb-2 ${m.accent ? 'text-white' : 'text-black/85'}`}>{m.value}</p>
                <p className={`text-[13px] leading-[1.5] ${m.accent ? 'text-white/60' : 'text-black/35'}`}>{m.sub}</p>
              </div>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 7 — PRICING
// ═══════════════════════════════════════════════════════════
function S_Pricing() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8">
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(2.8rem,7vw,5rem)] font-[750] leading-[1] tracking-[-0.03em] text-black/90 mb-4">Pricing</h2>
      </RevealText>
      <Fade delay={0.4}>
        <p className="text-[18px] text-black/40 mb-16">Built for compounding. Every tier unlocks the next.</p>
      </Fade>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          {
            tier: "Setup", price: "₹50,000", unit: "one-time", highlight: false,
            points: ["Full platform integration", "Domain-specific model training", "Voice profile configuration", "Onboarding and go-live support"],
            tagline: "Pay once, run forever."
          },
          {
            tier: "Subscription", price: "₹9,999", unit: "/ month", highlight: true,
            points: ["Full platform & dashboard access", "Continuous model updates", "Analytics and call reporting", "Predictable revenue base"],
            tagline: "The primary engine."
          },
          {
            tier: "Usage", price: "₹10", unit: "/ successful call", highlight: false,
            points: ["Billed only on successful calls", "Zero charge on failed/dropped", "Trust-aligned — pay for outcomes", "Scales with client volume"],
            tagline: "Pure upside. Zero risk."
          },
        ].map((t, i) => (
          <Fade key={i} delay={0.5 + i * 0.1}>
            <div className={`
              rounded-2xl p-8 flex flex-col h-full
              ${t.highlight
                ? 'bg-[#1a3fd8] text-white shadow-[0_16px_60px_-12px_rgba(26,63,216,0.35)]'
                : 'bg-white border border-black/[0.06]'
              }
            `}>
              <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase mb-5 ${t.highlight ? 'text-white/50' : 'text-black/30'}`}>{t.tier}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-[2rem] font-[800] tracking-[-0.03em] ${t.highlight ? 'text-white' : 'text-black/85'}`}>{t.price}</span>
                <span className={`text-[13px] font-medium ${t.highlight ? 'text-white/50' : 'text-black/30'}`}>{t.unit}</span>
              </div>
              <p className={`text-[13px] mb-7 ${t.highlight ? 'text-white/50' : 'text-black/35'}`}>{t.tagline}</p>
              <div className={`w-full h-[1px] mb-6 ${t.highlight ? 'bg-white/15' : 'bg-black/6'}`} />
              <ul className="space-y-3 flex-1">
                {t.points.map((p, j) => (
                  <li key={j} className={`text-[13px] flex items-start gap-3 ${t.highlight ? 'text-white/70' : 'text-black/45'}`}>
                    <span className={`mt-1.5 w-[4px] h-[4px] rounded-full shrink-0 ${t.highlight ? 'bg-white/40' : 'bg-[#1a3fd8]/40'}`} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Fade>
        ))}
      </div>

      <Fade delay={0.9}>
        <div className="text-center py-5 border-t border-black/6">
          <p className="text-[14px] text-black/40">
            At 200 calls/day per client — Year 1 ARR: <span className="font-[700] text-black/70">₹1.2 Cr</span>
            <span className="mx-3 text-black/15">|</span>
            Year 2 with 10 clients: <span className="font-[700] text-[#1a3fd8]">₹6 Cr+</span>
          </p>
        </div>
      </Fade>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 8 — ROADMAP
// ═══════════════════════════════════════════════════════════
function S_Roadmap() {
  const phases = [
    { time: "Now", label: "Phase 1", items: ["Nilgiri College live — platform in production", "First Expression of Interest received", "40+ language voice stack stable"] },
    { time: "Q2–Q3 2026", label: "Growth", items: ["5 enterprise clients signed", "GCC market entry — UAE and KSA", "Arabic and English vertical deepened"] },
    { time: "Q4 2026", label: "Compliance", items: ["GDPR and EU AI Act compliant", "French and Dutch sovereign AI readiness", "Compliance-first, infrastructure-light"] },
    { time: "Q1–Q2 2027", label: "Series A", items: ["₹1.2 Cr ARR achieved", "20+ enterprise clients across 3 regions", "Series A prep initiated"] },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8">
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-[750] leading-[1.05] tracking-[-0.03em] text-black/90 mb-20">
          From first deployment<br/>to Series A.
        </h2>
      </RevealText>

      {/* Timeline bar */}
      <div className="relative">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease }}
          className="absolute top-0 left-0 right-0 h-[1px] bg-black/10 origin-left"
        />

        <div className="grid grid-cols-4 gap-6 pt-10">
          {phases.map((p, i) => (
            <Fade key={i} delay={0.5 + i * 0.12}>
              <div className="relative">
                {/* Dot on timeline */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.15, ...springConfig }}
                  className={`absolute -top-10 left-0 w-[8px] h-[8px] rounded-full ${i === 0 ? 'bg-[#1a3fd8]' : 'bg-black/15'}`}
                />
                <p className={`text-[12px] font-semibold tracking-[0.15em] uppercase mb-2 ${i === 0 ? 'text-[#1a3fd8]' : 'text-black/30'}`}>{p.time}</p>
                <h3 className="text-[22px] font-[700] tracking-[-0.01em] text-black/80 mb-5">{p.label}</h3>
                <ul className="space-y-3">
                  {p.items.map((item, j) => (
                    <li key={j} className="text-[13px] leading-[1.6] text-black/40 flex items-start gap-2.5">
                      <span className="mt-[7px] w-[3px] h-[3px] rounded-full bg-black/15 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 9 — COMPETITIVE
// ═══════════════════════════════════════════════════════════
function S_Competitive() {
  const rows = [
    { feature: "Language coverage", cb: "40+ natively modeled", vapi: "Multiple supported", rep: "English + limited" },
    { feature: "Target market", cb: "India, GCC, EU mid-market", vapi: "US enterprise only", rep: "US enterprise only" },
    { feature: "Entry pricing", cb: "₹9,999/mo", vapi: "$300+/mo USD", rep: "Enterprise contract" },
    { feature: "Agent latency", cb: "Sub-300ms native", vapi: "~800ms", rep: "~500ms" },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8">
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-[750] leading-[1.05] tracking-[-0.03em] text-black/90 mb-4">
          Why ConvoBridge wins.
        </h2>
      </RevealText>
      <Fade delay={0.4}>
        <p className="text-[18px] text-black/40 mb-16">US-centric platforms weren't built for this.</p>
      </Fade>

      <Fade delay={0.5}>
        <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 px-8 py-5 border-b border-black/[0.04]">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-black/25">Feature</span>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#1a3fd8]/60">ConvoBridge</span>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-black/25">Vapi</span>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-black/25">Replicant</span>
          </div>

          {rows.map((r, i) => (
            <Fade key={i} delay={0.55 + i * 0.08} y={10}>
              <div className="grid grid-cols-4 gap-4 px-8 py-6 border-b border-black/[0.03] last:border-0 hover:bg-[#1a3fd8]/[0.015] transition-colors duration-400">
                <span className="text-[14px] font-[600] text-black/60">{r.feature}</span>
                <span className="text-[14px] font-[600] text-[#1a3fd8]">
                  <span className="mr-1.5">✓</span>{r.cb}
                </span>
                <span className="text-[13px] text-black/30 flex items-center gap-1.5">
                  <span className="text-red-400/60">✕</span>{r.vapi}
                </span>
                <span className="text-[13px] text-black/30 flex items-center gap-1.5">
                  <span className="text-red-400/60">✕</span>{r.rep}
                </span>
              </div>
            </Fade>
          ))}
        </div>
      </Fade>

      <Fade delay={1}>
        <p className="text-center text-[14px] text-black/30 mt-10 italic">
          "Democratizing AI access — even kirana stores can leverage AI."
        </p>
      </Fade>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SLIDE 10 — CLOSING / THE ASK  (blue background)
// ═══════════════════════════════════════════════════════════
function S_Closing() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 text-white">
      <div className="flex flex-col md:flex-row gap-16 items-start">
        <div className="flex-1">
          <Fade delay={0.1}>
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-white/35 mb-8">The Ask</p>
          </Fade>

          <RevealText delay={0.2}>
            <h2 className="text-[clamp(2.8rem,7vw,5rem)] font-[750] leading-[1] tracking-[-0.03em] text-white mb-12">
              Closing the<br/>seed round.
            </h2>
          </RevealText>

          <Fade delay={0.6}>
            <div className="inline-block">
              <p className="text-[clamp(3rem,8vw,5.5rem)] font-[800] tracking-[-0.04em] text-white">₹50 Cr</p>
              <p className="text-[13px] tracking-[0.2em] uppercase text-white/35 font-semibold mt-2">Seed Round — March 2026</p>
            </div>
          </Fade>
        </div>

        <div className="flex-1 pt-8">
          <Fade delay={0.5}>
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white/30 mb-10">Use of Funds</p>
          </Fade>

          <Stagger stagger={0.1} delay={0.6} className="space-y-10">
            {[
              { num: "01", title: "Engineering depth", desc: "Expand the core voice model team. Accelerate Arabic, Malayalam, and next-tier language fine-tuning." },
              { num: "02", title: "GCC market expansion", desc: "10 new hospitality and education enterprise contracts in UAE and KSA within 18 months." },
              { num: "03", title: "Compliance infrastructure", desc: "GDPR and EU AI Act certification. Sovereign AI compliance layer — no physical European presence required." },
            ].map((item) => (
              <div key={item.num} className="flex gap-6">
                <span className="text-[14px] font-mono text-white/20 pt-1 shrink-0">{item.num}</span>
                <div>
                  <h4 className="text-[22px] font-[700] text-white/90 mb-2">{item.title}</h4>
                  <p className="text-[14px] leading-[1.75] text-white/45">{item.desc}</p>
                </div>
              </div>
            ))}
          </Stagger>

          <Fade delay={1.2}>
            <div className="mt-14 pt-8 border-t border-white/10">
              <p className="text-[13px] text-white/35 tracking-[0.1em]">
                contact@convobridge.in &nbsp;·&nbsp; Seed Round &nbsp;·&nbsp; ₹50 Cr &nbsp;·&nbsp; March 2026
              </p>
            </div>
          </Fade>
        </div>
      </div>
    </div>
  );
}
