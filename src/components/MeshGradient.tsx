import { cn } from "@/lib/utils";

export function MeshGradient({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse-subtle" />
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse-subtle delay-700" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-purple-500/20 blur-[100px] animate-pulse-subtle delay-1000" />
      <div className="absolute bottom-[10%] right-[10%] w-[25%] h-[25%] rounded-full bg-indigo-400/20 blur-[80px] animate-pulse-subtle delay-500" />
    </div>
  );
}