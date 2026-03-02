import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div
        className="floating-orb w-[700px] h-[700px] opacity-[0.08]"
        style={{
          background: "radial-gradient(circle, hsl(217 91% 50%) 0%, hsl(199 89% 48%) 40%, transparent 70%)",
          top: "-20%",
          right: "-10%",
          animationDuration: "18s",
        }}
      />
      <div
        className="floating-orb w-[500px] h-[500px] opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 48%) 0%, hsl(230 70% 55%) 50%, transparent 70%)",
          bottom: "-5%",
          left: "-8%",
          animationDuration: "25s",
          animationDelay: "-5s",
        }}
      />
      <div
        className="floating-orb w-[400px] h-[400px] opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, hsl(217 91% 60%) 0%, hsl(199 89% 55%) 50%, transparent 70%)",
          top: "50%",
          left: "40%",
          animationDuration: "22s",
          animationDelay: "-10s",
        }}
      />
    </div>
  );
}
