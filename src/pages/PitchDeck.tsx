import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
//  CONVOBRIDGE — PITCH DECK
//  Design Philosophy: Large Typography. Intentional Motion.
//  No clutter. Pure clarity.
// ─────────────────────────────────────────────────────────────

const TOTAL_SLIDES = 11; // Increased for the new platform slide

const ease: any = [0.22, 1, 0.36, 1];
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
      y: d > 0 ? "15%" : "-15%",
      scale: 0.95,
      filter: "blur(12px)",
    }),
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 1.2, ease },
    },
    exit: (d: number) => ({
      opacity: 0,
      y: d < 0 ? "15%" : "-15%",
      scale: 0.95,
      filter: "blur(12px)",
      transition: { duration: 0.8, ease },
    }),
  };

  const isLightSlide = active !== 10; // All slides light except closing slide

  return (
    <div className={`fixed inset-0 overflow-hidden transition-colors duration-1000 ${isLightSlide ? 'bg-[#FAFAFA]' : 'bg-[#1a3fd8]'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      {isLightSlide && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: '100px 100px'
          }}
        />
      )}

      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-[8px]">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="group relative flex items-center justify-center py-2"
          >
            <div className={`
              rounded-full transition-all duration-700 ease-out
              ${active === i
                ? "w-[6px] h-8 " + (isLightSlide ? 'bg-[#1a3fd8]' : 'bg-white')
                : "w-[6px] h-[6px] " + (isLightSlide ? 'bg-black/10 group-hover:bg-black/30' : 'bg-white/20 group-hover:bg-white/50')
              }`
            }/>
            {active === i && (
               <motion.span 
                 layoutId="active-dot-label"
                 className={`absolute right-10 text-[10px] font-mono tracking-widest whitespace-nowrap hidden md:block ${isLightSlide ? 'text-[#1a3fd8]' : 'text-white/60'}`}
               >
                 {String(i + 1).padStart(2, '0')}
               </motion.span>
            )}
          </button>
        ))}
      </div>

      <div className={`fixed bottom-8 left-10 z-50 flex items-center gap-6 transition-colors duration-1000 ${isLightSlide ? 'text-black/30' : 'text-white/40'}`}>
        <div className="font-mono text-[12px] tracking-[0.2em]">
          {String(active + 1).padStart(2, "0")} <span className="mx-2">/</span> {TOTAL_SLIDES}
        </div>
        <div className={`h-[1px] w-24 relative overflow-hidden ${isLightSlide ? 'bg-black/5' : 'bg-white/10'}`}>
           <motion.div 
             className={`absolute inset-y-0 left-0 ${isLightSlide ? 'bg-[#1a3fd8]' : 'bg-white'}`}
             initial={{ width: "0%" }}
             animate={{ width: String(((active + 1) / TOTAL_SLIDES) * 100) + "%" }}
             transition={{ duration: 1, ease }}
           />
        </div>
      </div>

      <div className="fixed top-8 left-10 z-50">
        <span className={`text-[16px] font-bold tracking-tight transition-colors duration-1000 ${isLightSlide ? 'text-black/90' : 'text-white/95'}`}>
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
          className="absolute inset-0 flex items-center justify-center px-6"
        >
          {active === 0 && <S_Title />}
          {active === 1 && <S_Problem />}
          {active === 2 && <S_Solution />}
          {active === 3 && <S_Platform />}
          {active === 4 && <S_Product />}
          {active === 5 && <S_Verticals />}
          {active === 6 && <S_Traction />}
          {active === 7 && <S_Pricing />}
          {active === 8 && <S_Roadmap />}
          {active === 9 && <S_Competitive />}
          {active === 10 && <S_Closing />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function S_Title() {
  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
      <Fade delay={0.2} y={15}>
        <p className="text-[12px] font-bold tracking-[0.4em] uppercase text-[#1a3fd8] mb-12 flex items-center gap-4">
           <span className="w-8 h-[1px] bg-[#1a3fd8]/30" />
           Seed Round 2026
           <span className="w-8 h-[1px] bg-[#1a3fd8]/30" />
        </p>
      </Fade>

      <div className="mb-12 text-black">
        <RevealText delay={0.3}>
          <h1 className="text-[clamp(4.5rem,14vw,11rem)] font-[900] leading-[0.85] tracking-[-0.05em]">
            The Voice<br/>
            <span className="text-[#1a3fd8]">Infrastructure.</span>
          </h1>
        </RevealText>
      </div>

      <Fade delay={0.7} y={20}>
        <p className="text-[clamp(1.2rem,2.5vw,1.8rem)] font-medium text-black/40 leading-relaxed max-w-[700px]">
          Natively multilingual AI agents that connect every business to every customer on Earth. In real-time.
        </p>
      </Fade>

      <Fade delay={1} className="mt-20">
        <div className="flex items-center gap-8 py-4 px-8 bg-white border border-black/5 rounded-full shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] text-black/40">
           <span className="text-[12px] font-mono tracking-[0.1em]">convobridge.in</span>
           <div className="w-[1px] h-4 bg-black/10" />
           <span className="text-[12px] font-mono tracking-[0.1em]">contact@convobridge.in</span>
        </div>
      </Fade>
    </div>
  );
}

function S_Problem() {
  const count = useCounter(5000, 2500);
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <Fade delay={0.1}>
        <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-red-500/80 mb-10">THE GAP</p>
      </Fade>
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(3rem,8vw,6rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-black mb-8">
          Silence is<br/>expensive.
        </h2>
      </RevealText>
      <div className="mt-20 grid md:grid-cols-2 gap-24 items-start">
        <Fade delay={0.6}>
          <div className="relative text-red-500">
             <div className="flex items-baseline gap-2 mb-8">
               <span className="text-[clamp(4rem,7vw,6.5rem)] font-[900] tracking-[-0.03em]">
                 ₹{count.toLocaleString()}
               </span>
               <span className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold opacity-40">Cr</span>
             </div>
             <p className="text-[22px] leading-[1.6] text-black/60 font-medium">
               Annual operational leakage in global hospitality due to broken multilingual support.
             </p>
          </div>
        </Fade>
        <Fade delay={0.8}>
          <div className="space-y-16">
            <div className="border-l-[3px] border-black/5 pl-10">
              <h4 className="text-[24px] font-[800] text-black/80 mb-4 tracking-[-0.02em]">80% Agent Attrition</h4>
              <p className="text-[18px] leading-[1.7] text-black/40 font-medium">
                Voice support is the most stressful job. The burnout is systemic, not situational.
              </p>
            </div>
            <div className="border-l-[3px] border-black/5 pl-10">
              <h4 className="text-[24px] font-[800] text-black/80 mb-4 tracking-[-0.02em]">Multilingual Chaos</h4>
              <p className="text-[18px] leading-[1.7] text-black/40 font-medium">
                Nuance is lost in translation. Real trust requires native modeling.
              </p>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
}

function S_Solution() {
  const pillars = [
    { num: "01", title: "Connect", desc: "Native API hooks that plug into any legacy stack in seconds, not months." },
    { num: "02", title: "Configure", desc: "Domain-specific fine-tuning for hospitality, healthcare, and education." },
    { num: "03", title: "Converse", desc: "40+ natively trained language models. Sub-300ms global latency." },
    { num: "04", title: "Convert", desc: "Continuous improvement loop that turns every call into refined training data." },
  ];
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <Fade delay={0.1}>
        <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#1a3fd8]/80 mb-10">THE BRIDGE</p>
      </Fade>
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(3rem,8vw,6rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-black mb-20">
          Intelligence,<br/>uninterrupted.
        </h2>
      </RevealText>
      <div className="grid md:grid-cols-4 gap-8">
        {pillars.map((p, i) => (
          <Fade key={i} delay={0.4 + i * 0.1} y={20}>
            <div className="group h-full p-8 bg-white border border-black/5 rounded-3xl hover:border-[#1a3fd8]/20 hover:shadow-[0_20px_40px_-20px_rgba(26,63,216,0.15)] transition-all duration-700">
               <span className="text-[14px] font-mono text-[#1a3fd8]/30 mb-8 block">{p.num}</span>
               <h3 className="text-[28px] font-[800] tracking-[-0.03em] text-black/90 mb-4 group-hover:text-[#1a3fd8] transition-colors duration-500">{p.title}</h3>
               <p className="text-[16px] leading-[1.65] text-black/40 font-medium">{p.desc}</p>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
}

function S_Platform() {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row gap-20 items-center">
        <div className="flex-1">
          <Fade delay={0.1}>
            <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#1a3fd8]/80 mb-10">THE PLATFORM</p>
          </Fade>
          <RevealText delay={0.2}>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-black mb-10">
              One link.<br/>
              <span className="text-[#1a3fd8]">Every app.</span>
            </h2>
          </RevealText>
          <Fade delay={0.6}>
            <p className="text-[20px] leading-[1.7] text-black/50 font-medium mb-12 max-w-[500px]">
              We abstracted Voice AI into a configuration layer. Deploy in minutes with ~5 clicks.
            </p>
          </Fade>
          <div className="space-y-6">
            <Fade delay={0.8} y={10}>
               <div className="flex items-center gap-6 p-6 bg-[#1a3fd8]/[0.03] border border-[#1a3fd8]/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-[#1a3fd8] text-white flex items-center justify-center font-bold text-xl shadow-[0_4px_12px_rgba(26,63,216,0.3)]">5</div>
                  <div>
                    <h4 className="text-[18px] font-bold text-black/80">Clicks to Configure</h4>
                    <p className="text-[14px] text-black/40 font-medium">Define voice, language, and knowledge base.</p>
                  </div>
               </div>
            </Fade>
            <Fade delay={0.9} y={10}>
               <div className="flex items-center gap-6 p-6 bg-green-500/[0.03] border border-green-500/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shadow-[0_4px_12px_rgba(34,197,94,0.3)]">1</div>
                  <div>
                    <h4 className="text-[18px] font-bold text-black/80">Link to Integrate</h4>
                    <p className="text-[14px] text-black/40 font-medium">JS snippet or direct API endpoint.</p>
                  </div>
               </div>
            </Fade>
          </div>
        </div>
        <div className="flex-1 w-full max-w-[500px]">
          <Fade delay={0.5} y={40}>
            <div className="aspect-[4/5] bg-white border border-black/5 rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] p-10 relative overflow-hidden">
               <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="w-24 h-4 bg-black/5 rounded-full" />
                    <div className="w-8 h-8 rounded-full bg-black/5" />
                  </div>
                  <div className="space-y-6">
                    <div className="w-full h-12 bg-black/[0.02] rounded-xl flex items-center px-4">
                       <div className="w-32 h-3 bg-[#1a3fd8]/20 rounded-full" />
                    </div>
                    <div className="w-full h-12 bg-black/[0.02] rounded-xl flex items-center px-4">
                       <div className="w-48 h-3 bg-black/5 rounded-full" />
                    </div>
                  </div>
                  <div className="pt-8 grid grid-cols-2 gap-4">
                     {['🌍', '🎙️', '📚', '🚀'].map((emoji, i) => (
                        <div key={i} className="aspect-square bg-black/[0.03] rounded-2xl border border-black/5 flex items-center justify-center text-2xl">
                          {emoji}
                        </div>
                     ))}
                  </div>
                  <div className="pt-8 w-full h-16 bg-[#1a3fd8] rounded-2xl flex items-center justify-center text-white font-bold tracking-tight shadow-[0_10px_30px_-5px_rgba(26,63,216,0.3)]">
                    Go Live
                  </div>
               </div>
            </div>
          </Fade>
        </div>
      </div>
    </div>
  );
}

function S_Product() {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <Fade delay={0.1}>
        <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#1a3fd8]/80 mb-10">THE MOAT</p>
      </Fade>
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(3rem,8vw,6rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-black mb-20">
          Native stacks,<br/>global reach.
        </h2>
      </RevealText>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Native Voices", stat: "40+", unit: "langs", detail: "Modeling from first principles." },
          { label: "Latency", stat: "280", unit: "ms", detail: "Fastest globally modeled voice stack." },
          { label: "Data Mastery", stat: "100", unit: "%", detail: "Real-time analysis on all calls." },
          { label: "Deployment", stat: "10", unit: "min", detail: "Configuration to global live state." },
        ].map((card, i) => (
          <Fade key={i} delay={0.4 + i * 0.1}>
            <div className="bg-white border border-black/5 rounded-[32px] p-8">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-black/30 mb-8">{card.label}</p>
              <div className="flex items-baseline gap-2 mb-6 text-black">
                <span className="text-[3.5rem] font-[900] tracking-[-0.05em]">{card.stat}</span>
                <span className="text-[16px] font-bold opacity-20">{card.unit}</span>
              </div>
              <p className="text-[14px] leading-[1.6] text-black/40 font-medium">{card.detail}</p>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
}

function S_Verticals() {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <Fade delay={0.1}>
        <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#1a3fd8]/80 mb-10">THE DEPTH</p>
      </Fade>
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(3rem,8vw,6rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-black mb-20">
          Two verticals.<br/>Infinite scale.
        </h2>
      </RevealText>
      <div className="grid md:grid-cols-2 gap-10">
        <Fade delay={0.5} y={30}>
          <div className="bg-white border border-black/5 rounded-[40px] p-12">
            <h3 className="text-[32px] font-[900] tracking-[-0.03em] text-black mb-6">Hospitality</h3>
            <p className="text-[18px] leading-[1.7] text-black/40 font-medium mb-12">
              Concierge AI that handles room service nuance and local dialect complaints natively.
            </p>
            <div className="flex gap-4">
              {["Oracle", "Amadeus"].map(t => (
                <span key={t} className="px-5 py-2 rounded-full border border-black/5 text-[12px] font-bold text-black/30 uppercase tracking-widest">{t}</span>
              ))}
            </div>
          </div>
        </Fade>
        <Fade delay={0.7} y={30}>
          <div className="bg-white border border-black/5 rounded-[40px] p-12 border-green-500/10">
            <h3 className="text-[32px] font-[900] tracking-[-0.03em] text-black mb-6">Education</h3>
            <p className="text-[18px] leading-[1.7] text-black/40 font-medium mb-12">
              Handling student intake in regional dialects with sub-zero hallucination.
            </p>
            <div className="flex">
               <span className="px-6 py-3 rounded-full bg-green-500 text-white text-[12px] font-bold tracking-widest uppercase flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                 LIVE @ Nilgiri College
               </span>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
}

function S_Traction() {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <Fade delay={0.1}>
        <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#1a3fd8]/80 mb-10">THE PROOF</p>
      </Fade>
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(3.5rem,8vw,6rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-black mb-20">
          Live in<br/><span className="text-[#1a3fd8]">Production.</span>
        </h2>
      </RevealText>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "MARKET STATUS", value: "LIVE", sub: "Production active.", accent: true },
          { label: "PIPELINE", value: "1 EOI", sub: "Enterprise scale hospitality." },
          { label: "ONBOARDING", value: "₹50K", sub: "Setup fee per unit." },
          { label: "SUBSCRIPTION", value: "₹10K", sub: "Core recurring." },
        ].map((m, i) => (
          <Fade key={i} delay={0.4 + i * 0.1}>
            <div className={`rounded-[40px] p-10 flex flex-col justify-between min-h-[280px] ${m.accent ? 'bg-[#1a3fd8] text-white shadow-[0_40px_80px_-20px_rgba(26,63,216,0.3)]' : 'bg-white border border-black/5'}`}>
              <p className={`text-[11px] font-bold tracking-[0.25em] uppercase ${m.accent ? 'text-white/40' : 'text-black/30'}`}>{m.label}</p>
              <div>
                <p className={`text-[2.5rem] font-[900] tracking-[-0.05em] mb-4 ${m.accent ? 'text-white' : 'text-black'}`}>{m.value}</p>
                <p className={`text-[14px] font-medium leading-[1.5] ${m.accent ? 'text-white/50' : 'text-black/40'}`}>{m.sub}</p>
              </div>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
}

function S_Pricing() {
  return (
    <div className="w-full max-w-[1200px] mx-auto text-center">
      <Fade delay={0.1}>
        <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#1a3fd8]/80 mb-10">THE UNIT ECONOMICS</p>
      </Fade>
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(3rem,8vw,6rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-black mb-20">
          Built to<br/>scale.
        </h2>
      </RevealText>
      <div className="grid md:grid-cols-3 gap-8 text-left">
        {[
          { tier: "Setup", val: "₹50K", sub: "One-time per integration." },
          { tier: "Platform", val: "₹10K", sub: "Recurring monthly fee.", highlight: true },
          { tier: "Activity", val: "₹10", sub: "Per successful interaction." },
        ].map((t, i) => (
          <Fade key={i} delay={0.4 + i * 0.1}>
             <div className={`p-10 rounded-[40px] border ${t.highlight ? 'bg-[#1a3fd8] text-white border-transparent shadow-[0_40px_80px_-20px_rgba(26,63,216,0.3)]' : 'bg-white border-black/5'}`}>
                <p className={`text-[11px] font-bold tracking-[0.25em] uppercase mb-12 ${t.highlight ? 'text-white/40' : 'text-black/30'}`}>{t.tier}</p>
                <h3 className="text-[4rem] font-[900] tracking-[-0.05em] mb-4 leading-none">{t.val}</h3>
                <p className={`text-[15px] font-medium ${t.highlight ? 'text-white/60' : 'text-black/40'}`}>{t.sub}</p>
             </div>
          </Fade>
        ))}
      </div>
    </div>
  );
}

function S_Roadmap() {
  const steps = [
    { year: "2026", step: "01", title: "Foundation", desc: "40+ native language Fine-Tuning." },
    { year: "2026", step: "02", title: "Scale", desc: "5 Enterprise contracts across India." },
    { year: "2027", step: "03", title: "Compliance", desc: "Sovereign AI for Europe readiness." },
    { year: "2027", step: "04", title: "Series A", desc: "₹1.5 Cr ARR benchmark achieved." },
  ];
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(3.5rem,8.5vw,6.5rem)] font-[900] leading-[0.9] tracking-[-0.05em] text-black mb-24">
          Velocity with<br/>intent.
        </h2>
      </RevealText>
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-black/5" />
        <div className="grid grid-cols-4 gap-12 pt-16">
          {steps.map((s, i) => (
            <Fade key={i} delay={0.6 + i * 0.15}>
               <div className="relative">
                  <div className={`absolute -top-[71px] left-0 w-4 h-4 rounded-full ${i === 0 ? 'bg-[#1a3fd8]' : 'bg-black/10'}`} />
                  <p className="text-[12px] font-mono text-[#1a3fd8] mb-4">{s.year} &bull; {s.step}</p>
                  <h4 className="text-[26px] font-[900] tracking-[-0.02em] text-black/90 mb-6">{s.title}</h4>
                  <p className="text-[16px] leading-[1.6] text-black/40 font-medium">{s.desc}</p>
               </div>
            </Fade>
          ))}
        </div>
      </div>
    </div>
  );
}

function S_Competitive() {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <RevealText delay={0.2}>
        <h2 className="text-[clamp(3rem,8vw,6rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-black mb-20">
          The Language<br/><span className="text-[#1a3fd8]">Moat.</span>
        </h2>
      </RevealText>
      <Fade delay={0.5}>
        <div className="bg-white border border-black/5 rounded-[48px] overflow-hidden">
          <div className="grid grid-cols-4 px-12 py-10 border-b border-black/5 bg-black/[0.01] text-[12px] font-bold tracking-[0.2em] uppercase">
            <span className="text-black/30">FEATURE</span>
            <span className="text-[#1a3fd8]">CONVOBRIDGE</span>
            <span className="text-black/30">VAPI</span>
            <span className="text-black/30">REPLICANT</span>
          </div>
          {[
            { tag: "Modeling", cb: "Native 40+", vapi: "Aggregated", rep: "English First" },
            { tag: "Market", cb: "Global South", vapi: "US Enterprise", rep: "Global North" },
            { tag: "Price", cb: "Mass Market", vapi: "Enterprise", rep: "Contract" },
          ].map((r, i) => (
            <div key={i} className="grid grid-cols-4 px-12 py-10 border-b border-black/[0.03] last:border-0 font-bold">
               <span className="text-black/50">{r.tag}</span>
               <span className="text-[#1a3fd8]">✓ {r.cb}</span>
               <span className="text-black/30">{r.vapi}</span>
               <span className="text-black/30">{r.rep}</span>
            </div>
          ))}
        </div>
      </Fade>
    </div>
  );
}

function S_Closing() {
  return (
    <div className="w-full max-w-[1200px] mx-auto text-white px-10">
      <div className="flex flex-col md:flex-row gap-20 items-end">
        <div className="flex-1">
          <Fade delay={0.1}>
            <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-white/40 mb-10">THE CAPITAL</p>
          </Fade>
          <RevealText delay={0.2}>
            <h2 className="text-[clamp(3.5rem,8vw,7rem)] font-[900] leading-[0.85] tracking-[-0.05em] mb-16">
              Fund the<br/>Bridge.
            </h2>
          </RevealText>
          <Fade delay={0.5}>
            <h3 className="text-[5rem] font-[900] tracking-[-0.04em] mb-4 leading-none">₹50 Cr</h3>
            <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-white/30">SEED ROUND &bull; 2026</p>
          </Fade>
        </div>
        <div className="flex-1 space-y-12 pb-10">
           <Stagger stagger={0.12} delay={0.6}>
              {[
                { title: "Native Excellence", desc: "Accelerate fine-tuning for Malayalam, Arabic, and regional Indian dialects." },
                { title: "GCC Deployment", desc: "Scale dedicated infrastructure hubs in UAE and KSA for data sovereignty." },
                { title: "The Enterprise Layer", desc: "Build out the '5-Click' self-serve dashboard for global mid-market SaaS." }
              ].map(item => (
                <div key={item.title} className="border-l border-white/10 pl-10">
                   <h4 className="text-[24px] font-extrabold mb-3">{item.title}</h4>
                   <p className="text-[16px] leading-[1.7] text-white/40 font-medium">{item.desc}</p>
                   <div className="h-1 w-12 bg-white/10 rounded-full mt-4" />
                </div>
              ))}
           </Stagger>
        </div>
      </div>
    </div>
  );
}
