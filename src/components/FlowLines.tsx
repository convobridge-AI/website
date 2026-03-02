export function FlowLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.4 }}
    >
      <defs>
        <linearGradient id="flow-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="hsl(217 91% 60%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(230 91% 65%)" stopOpacity="0.2" />
        </linearGradient>
        
        <linearGradient id="flow-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(230 91% 65%)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="hsl(217 91% 60%)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Flow Line 1 - Top curve */}
      <path
        d="M 0,120 Q 300,80 600,140 T 1200,120"
        fill="none"
        stroke="url(#flow-gradient-1)"
        strokeWidth="2"
        className="animate-flow-line stagger-1"
      />

      {/* Flow Line 2 - Middle curve */}
      <path
        d="M 0,300 Q 400,240 800,320 T 1200,280"
        fill="none"
        stroke="url(#flow-gradient-2)"
        strokeWidth="2"
        className="animate-flow-line stagger-2"
      />

      {/* Flow Line 3 - Bottom curve */}
      <path
        d="M 0,480 Q 350,420 700,500 T 1200,460"
        fill="none"
        stroke="url(#flow-gradient-1)"
        strokeWidth="2"
        className="animate-flow-line stagger-3"
      />
    </svg>
  );
}
