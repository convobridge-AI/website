import React from 'react';
import { Phone, PhoneOff, Volume2, AlertCircle, Loader2 } from "lucide-react";
import { useLiveApi } from '@/hooks/useLiveApi';
import { cn } from '@/lib/utils';

type WidgetProps = {
  variant?: "floating" | "hero";
  agentConfig?: {
    name: string;
    voice: string;
    systemPrompt?: string;
    context?: string;
    languages: string[];
    personality: string;
    template: string;
  };
  testScenario?: string;
  onCallEnd?: (duration: number, transcript: string) => void;
};

// Internal Button component 
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'default' | 'destructive' | 'ghost' | 'secondary'; 
  size?: 'default' | 'sm' | 'lg' | 'icon' 
}> = ({ className = '', variant = 'default', size = 'default', children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-primary text-white hover:brightness-110",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-50",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export function LiveDemoWidget({ variant = "floating", agentConfig, testScenario, onCallEnd }: WidgetProps) {
  const { connectionState, connect, disconnect, volume, setVolume, error } = useLiveApi();
  const [callStartTime, setCallStartTime] = React.useState<number | null>(null);
  const [callTranscript, setCallTranscript] = React.useState<string>("");

  const handleCall = () => {
    setCallStartTime(Date.now());
    setCallTranscript("");
    connect({
      systemPrompt: agentConfig?.systemPrompt || undefined,
      testScenario: testScenario || undefined,
      voice: agentConfig?.voice || undefined,
      context: agentConfig?.context || undefined,
      agentName: agentConfig?.name || undefined,
    });
  };

  const handleEnd = () => {
    if (callStartTime && onCallEnd) {
      const duration = Math.round((Date.now() - callStartTime) / 1000);
      const transcript = callTranscript || "Call completed successfully. [No transcript recorded]";
      onCallEnd(duration, transcript);
    }
    disconnect();
  };

  // Hero Variant
  if (variant === "hero") {
    return (
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="relative p-6 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10">
          <div className="absolute top-0 right-0 p-4">
            <div className={cn(
              "h-3 w-3 rounded-full transition-colors duration-500",
              connectionState === 'connected' ? "bg-green-500 animate-pulse" : 
              connectionState === 'connecting' ? "bg-yellow-400 animate-pulse" : "bg-gray-300 dark:bg-gray-600"
            )} />
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-950 dark:text-gray-50">Try it now</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {agentConfig ? `Test ${agentConfig.name}` : "Have a live conversation with ConvoBridge"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {connectionState === "idle" || connectionState === "error" ? (
              <Button onClick={handleCall} size="lg" className="w-full shadow-lg">
                <Phone className="mr-2 h-5 w-5" />
                Start Live Call
              </Button>
            ) : connectionState === "connecting" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary/20 animate-ping absolute" />
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center relative">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-600 dark:text-gray-400">Establishing secure connection...</p>
                <Button onClick={handleEnd} variant="secondary" size="lg" className="w-full">
                  Cancel
                </Button>
              </div>
            ) : (
              // Connected State
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-center py-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 animate-pulse absolute" />
                    <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center relative shadow-lg shadow-green-500/30">
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_0ms]" />
                        <div className="w-1 h-5 bg-white rounded-full animate-[bounce_1s_infinite_200ms]" />
                        <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_400ms]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Listening...</span>
                  </div>

                  {agentConfig && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 pt-3 border-t">
                      <p><strong>Agent:</strong> {agentConfig.name}</p>
                      <p><strong>Voice:</strong> {agentConfig.voice}</p>
                      <p><strong>Languages:</strong> {agentConfig.languages.join(", ")}</p>
                      {testScenario && <p><strong>Scenario:</strong> {testScenario}</p>}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                <Button onClick={handleEnd} variant="destructive" size="lg" className="w-full shadow-lg">
                  <PhoneOff className="mr-2 h-5 w-5" />
                  End Call
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Floating Variant
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="glass rounded-2xl p-4 shadow-2xl max-w-sm w-80 border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              connectionState === 'connected' ? "bg-green-500 animate-pulse" : 
              connectionState === 'connecting' ? "bg-yellow-400 animate-pulse" : "bg-gray-400"
            )} />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-50">ConvoBridge</span>
          </div>
          {connectionState !== "idle" && connectionState !== "error" && (
            <button 
              onClick={handleEnd} 
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="End call"
            >
              <PhoneOff className="h-4 w-4" />
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mb-2">{error}</p>
        )}

        {connectionState === "idle" || connectionState === "error" ? (
          <Button onClick={handleCall} size="default" className="w-full">
            <Phone className="mr-2 h-4 w-4" />
            Connect
          </Button>
        ) : connectionState === "connecting" ? (
          <div className="text-center py-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Connecting...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50/80 dark:bg-gray-800/80 rounded-lg p-3 flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Audio Active</span>
              <div className="flex gap-0.5 items-end h-4">
                <div className="w-1 bg-green-500 rounded-sm animate-[pulse_1s_ease-in-out_infinite] h-2"></div>
                <div className="w-1 bg-green-500 rounded-sm animate-[pulse_1.5s_ease-in-out_infinite] h-4"></div>
                <div className="w-1 bg-green-500 rounded-sm animate-[pulse_1.2s_ease-in-out_infinite] h-3"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-1">
              <Volume2 className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
