import { cn } from "@/lib/utils";

interface AnimatedBeamProps {
  className?: string;
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  duration?: number;
  delay?: number;
}

export function AnimatedBeam({ 
  className, 
  x1 = "0%", 
  y1 = "50%", 
  x2 = "100%", 
  y2 = "50%",
  duration = 3,
  delay = 0
}: AnimatedBeamProps) {
  return (
    <svg className={cn("absolute inset-0 w-full h-full pointer-events-none overflow-visible", className)}>
      <defs>
        <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <mask id="beam-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
        </mask>
      </defs>
      
      {/* Background Line */}
      <line 
        x1={x1} y1={y1} x2={x2} y2={y2} 
        stroke="hsl(var(--border))" 
        strokeWidth="1" 
        strokeDasharray="4 4"
      />

      {/* Animated Beam */}
      <path
        d={`M ${x1.replace('%', '')} ${y1.replace('%', '')} L ${x2.replace('%', '')} ${y2.replace('%', '')}`}
        stroke="url(#beam-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="animate-beam"
        style={{ 
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`
        }}
      />
    </svg>
  );
}