import { useState } from "react";
import { Phone, PhoneOff, Volume2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WidgetState = "idle" | "ringing" | "connected";

export function LiveDemoWidget({ variant = "floating" }: { variant?: "floating" | "hero" }) {
  const [state, setState] = useState<WidgetState>("idle");
  const [volume, setVolume] = useState(80);

  const handleCall = () => {
    setState("ringing");
    setTimeout(() => setState("connected"), 2000);
  };

  const handleEnd = () => {
    setState("idle");
  };

  if (variant === "hero") {
    return (
      <div className="stripe-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0" />
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-h4 mb-2">Try it now</h4>
              <p className="text-muted-foreground text-caption">Call our AI agent instantly</p>
            </div>
            <div className={cn(
              "h-3 w-3 rounded-full",
              state === "connected" ? "bg-green-500 animate-pulse" : "bg-muted"
            )} />
          </div>

          {state === "idle" && (
            <Button onClick={handleCall} size="lg" className="w-full animate-fade-in-up">
              <Phone className="mr-2 h-5 w-5" />
              Start Demo Call
            </Button>
          )}

          {state === "ringing" && (
            <div className="animate-fade-in-up space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-primary/20 animate-ping absolute" />
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center relative">
                    <Phone className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <p className="text-center text-muted-foreground">Connecting...</p>
              <Button onClick={handleEnd} variant="destructive" size="lg" className="w-full">
                <PhoneOff className="mr-2 h-5 w-5" />
                Cancel
              </Button>
            </div>
          )}

          {state === "connected" && (
            <div className="animate-fade-in-up space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-caption">Live call in progress</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="flex-1 h-2"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <select className="flex-1 bg-background border rounded-md px-3 py-1.5 text-sm">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button onClick={handleEnd} variant="destructive" size="lg" className="w-full">
                <PhoneOff className="mr-2 h-5 w-5" />
                End Call
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Floating variant
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="glass rounded-2xl p-4 shadow-xl max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              state === "connected" ? "bg-green-500 animate-pulse" : "bg-muted"
            )} />
            <span className="text-caption font-semibold">Live Demo</span>
          </div>
          {state !== "idle" && (
            <Button onClick={handleEnd} variant="ghost" size="icon" className="h-8 w-8">
              <PhoneOff className="h-4 w-4" />
            </Button>
          )}
        </div>

        {state === "idle" && (
          <Button onClick={handleCall} className="w-full">
            <Phone className="mr-2 h-4 w-4" />
            Try Demo
          </Button>
        )}

        {state === "ringing" && (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-primary/20 animate-ping absolute" />
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center relative">
                  <Phone className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </div>
            <p className="text-caption text-muted-foreground mt-3">Connecting...</p>
          </div>
        )}

        {state === "connected" && (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Call active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
