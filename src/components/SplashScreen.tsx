import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), 2200);
    const completeTimer = setTimeout(onComplete, 2900);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-background",
        "transition-opacity duration-700",
        phase === "exit" && "opacity-0 pointer-events-none"
      )}
    >
      {/* Blue orbs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
        style={{
          background: "conic-gradient(from 0deg, hsl(217 91% 50%), hsl(199 89% 48%), hsl(230 70% 55%), hsl(217 91% 60%), hsl(217 91% 50%))",
          top: "-30%",
          right: "-20%",
          animation: "orb-float 15s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 48%), hsl(217 91% 60%))",
          bottom: "-20%",
          left: "-15%",
          animation: "orb-float 20s ease-in-out infinite reverse",
        }}
      />

      {/* Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `hsl(${[217, 199, 230][i % 3]} ${80 + i % 10}% ${50 + i % 15}%)`,
              opacity: 0.25,
              animation: `splash-float ${6 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div
        className={cn(
          "absolute w-[700px] h-[350px] rounded-full blur-[100px] transition-all duration-[1500ms]",
          phase === "enter" ? "opacity-0 scale-50" : "opacity-100 scale-100"
        )}
        style={{
          background: "radial-gradient(ellipse, hsla(217 91% 50% / 0.1) 0%, hsla(199 89% 48% / 0.06) 40%, transparent 70%)",
        }}
      />

      {/* Glass card */}
      <div
        className={cn(
          "relative z-10 px-16 py-12 rounded-3xl transition-all duration-[1200ms]",
          phase === "enter" ? "opacity-0 scale-90" : "opacity-100 scale-100"
        )}
        style={{
          background: "hsla(217 91% 97% / 0.6)",
          backdropFilter: "blur(40px)",
          border: "1px solid hsla(217 91% 50% / 0.1)",
          boxShadow: "inset 0 1px 0 hsla(0 0% 100% / 0.6), 0 20px 80px hsla(217 91% 50% / 0.08)",
        }}
      >
        <h1
          className={cn(
            "font-display font-extrabold tracking-[-0.04em] transition-all duration-[1200ms] ease-out text-center",
            "text-5xl sm:text-7xl md:text-8xl text-foreground",
            phase === "enter"
              ? "opacity-0 scale-95 blur-sm translate-y-4"
              : "opacity-100 scale-100 blur-0 translate-y-0"
          )}
        >
          Convo
          <span className="holo-text">Bridge</span>
        </h1>

        <p
          className={cn(
            "mt-4 text-sm sm:text-base tracking-[0.2em] uppercase transition-all duration-[1000ms] delay-500 text-center text-muted-foreground",
            phase === "enter" ? "opacity-0 translate-y-2" : phase === "hold" ? "opacity-60" : "opacity-0"
          )}
        >
          Intelligent Voice AI
        </p>

        <div
          className={cn(
            "mx-auto mt-6 h-[1px] transition-all duration-[1200ms] delay-300",
            phase === "enter" ? "w-0 opacity-0" : "w-48 opacity-80"
          )}
          style={{
            background: "linear-gradient(90deg, transparent, hsl(217 91% 50%), hsl(199 89% 48%), hsl(230 70% 55%), transparent)",
          }}
        />
      </div>

      <style>{`
        @keyframes splash-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.4; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.25; }
          75% { transform: translateY(-30px) translateX(15px); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
