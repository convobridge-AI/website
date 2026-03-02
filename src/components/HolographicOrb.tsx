import { cn } from "@/lib/utils";

export function HolographicOrb({ className, size = 300 }: { className?: string; size?: number }) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full blur-[60px] opacity-20"
        style={{
          background: "conic-gradient(from 0deg, hsl(217 91% 50%), hsl(199 89% 48%), hsl(230 70% 55%), hsl(217 91% 60%), hsl(217 91% 50%))",
          animation: "holo-shift 8s ease-in-out infinite",
          backgroundSize: "300% 300%",
        }}
      />
      <div
        className="absolute inset-[15%] rounded-full"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, hsla(0 0% 100% / 0.4), transparent 50%),
            radial-gradient(circle at 70% 70%, hsla(217 91% 50% / 0.3), transparent 40%),
            conic-gradient(from 45deg, hsl(199 89% 48% / 0.4), hsl(217 91% 50% / 0.3), hsl(230 70% 55% / 0.4), hsl(217 91% 60% / 0.3), hsl(199 89% 48% / 0.4))
          `,
          backgroundSize: "100% 100%, 100% 100%, 300% 300%",
          animation: "orb-rotate 12s linear infinite",
          boxShadow: `
            inset 0 0 60px hsla(0 0% 100% / 0.2),
            inset -20px -20px 40px hsla(217 91% 50% / 0.15),
            0 0 40px hsla(199 89% 48% / 0.1)
          `,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "18%", left: "20%", width: "35%", height: "25%",
          background: "linear-gradient(180deg, hsla(0 0% 100% / 0.5), transparent)",
          borderRadius: "50%",
          transform: "rotate(-20deg)",
          filter: "blur(3px)",
        }}
      />
      <div
        className="absolute inset-[25%] rounded-full border border-primary/10"
        style={{ animation: "orb-rotate 20s linear infinite reverse" }}
      />
      <style>{`
        @keyframes orb-rotate {
          0% { background-position: 0% 50%, 0% 0%, 0% 50%; }
          100% { background-position: 0% 50%, 100% 100%, 300% 50%; }
        }
      `}</style>
    </div>
  );
}
