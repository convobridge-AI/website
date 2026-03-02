import { cn } from "@/lib/utils";

/**
 * GridPattern — 3D perspective grid with holographic accent lines.
 */
export function GridPattern({ className, fade = true }: { className?: string; fade?: boolean }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-white/[0.04]"
            />
          </pattern>
          <linearGradient id="grid-holo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(280 80% 65%)" stopOpacity="0.08" />
            <stop offset="33%" stopColor="hsl(200 90% 60%)" stopOpacity="0.05" />
            <stop offset="66%" stopColor="hsl(36 100% 55%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(330 80% 60%)" stopOpacity="0.05" />
          </linearGradient>
          {fade && (
            <radialGradient id="grid-fade" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          )}
          {fade && (
            <mask id="grid-mask">
              <rect width="100%" height="100%" fill="url(#grid-fade)" />
            </mask>
          )}
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
          mask={fade ? "url(#grid-mask)" : undefined}
        />
        {/* Holographic accent line */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#grid-holo)" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}
