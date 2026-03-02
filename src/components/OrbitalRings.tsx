import { cn } from "@/lib/utils";

/**
 * OrbitalRings — 3D holographic concentric rings with iridescent dots.
 */
export function OrbitalRings({ className, size = 500 }: { className?: string; size?: number }) {
  const rings = [
    { r: size * 0.3, duration: 30, direction: 1, dots: 3, color: "hsl(280 80% 65%)" },
    { r: size * 0.42, duration: 45, direction: -1, dots: 5, color: "hsl(200 90% 60%)" },
    { r: size * 0.55, duration: 60, direction: 1, dots: 2, color: "hsl(36 100% 55%)" },
  ];

  return (
    <div className={cn("absolute pointer-events-none", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="opacity-25"
      >
        <defs>
          <linearGradient id="ring-holo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(280 80% 65%)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="hsl(200 90% 60%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(36 100% 55%)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {rings.map((ring, i) => (
          <g key={i}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={ring.r}
              fill="none"
              stroke="url(#ring-holo)"
              strokeWidth="0.8"
              strokeDasharray="6 12"
            />
            <g
              style={{
                transformOrigin: `${size / 2}px ${size / 2}px`,
                animation: `orbital-spin ${ring.duration}s linear infinite ${ring.direction === -1 ? "reverse" : ""}`,
              }}
            >
              {Array.from({ length: ring.dots }).map((_, d) => {
                const angle = (d / ring.dots) * Math.PI * 2;
                const x = size / 2 + Math.cos(angle) * ring.r;
                const y = size / 2 + Math.sin(angle) * ring.r;
                return (
                  <circle
                    key={d}
                    cx={x}
                    cy={y}
                    r={2.5}
                    fill={ring.color}
                    opacity={0.8}
                  />
                );
              })}
            </g>
          </g>
        ))}
        <style>{`
          @keyframes orbital-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}
