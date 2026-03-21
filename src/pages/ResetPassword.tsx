
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Step = "form" | "success" | "invalid";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [step, setStep] = useState<Step>("form");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  // Validate token exists on mount
  useEffect(() => {
    if (!token) {
      setStep("invalid");
    }
    setValidating(false);
  }, [token]);

  const handleReset = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("reset_password_with_token", {
        token_param: token,
        new_password_param: password,
      });
      if (error) throw error;
      if (!data?.success) {
        setStep("invalid");
        return;
      }
      setStep("success");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. The link may have expired.");
      setStep("invalid");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute top-6 left-6">
        <a href="/" className="font-bold text-xl hover:text-primary transition-colors">ConvoBridge</a>
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {step === "form" && (
          <div className="bg-card border rounded-2xl p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Set new password</h1>
              <p className="text-muted-foreground text-sm">Choose a strong password for your account.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">New Password</label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length > i * 3 ? (password.length >= 12 ? "bg-green-500" : password.length >= 8 ? "bg-yellow-400" : "bg-red-400") : "bg-muted"
                      }`} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={`h-12 ${confirm && confirm !== password ? "border-red-400" : ""}`}
                />
                {confirm && confirm !== password && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleReset}
              disabled={loading || !password || password !== confirm}
              className="w-full h-12 text-base"
            >
              {loading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Password"}
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="bg-card border rounded-2xl p-8 shadow-sm text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Password updated!</h2>
            <p className="text-muted-foreground text-sm">You can now sign in with your new password.</p>
            <Button onClick={() => navigate("/login")} className="w-full mt-2">Go to Sign In</Button>
          </div>
        )}

        {step === "invalid" && (
          <div className="bg-card border rounded-2xl p-8 shadow-sm text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold">Link invalid or expired</h2>
            <p className="text-muted-foreground text-sm">
              This reset link has expired or already been used. <br />
              Password reset links are valid for 1 hour.
            </p>
            <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
