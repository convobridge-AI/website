
import { ArrowRight, Eye, EyeOff, Mail, Lock, CheckCircle2, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetStep = "email" | "sent";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<ResetStep>("email");
  const [resetLoading, setResetLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !resetEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setResetLoading(true);
    try {
      // Call the Supabase RPC which generates the token and returns it
      const { data, error } = await supabase.rpc("create_password_reset_token", {
        user_email_param: resetEmail,
      });
      if (error) throw error;

      // If a token was generated, send the email via Edge Function
      if (data?.token) {
        await supabase.functions.invoke("send-reset-email", {
          body: {
            email: data.email,
            name: data.name,
            token: data.token,
            reset_url: `${window.location.origin}/reset-password?token=${data.token}`,
          },
        });
      }
      // Always show "sent" — never reveal if email exists (security)
      setResetStep("sent");
    } catch (err: any) {
      console.error("Reset error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotModal = () => {
    setForgotOpen(false);
    setResetEmail("");
    setResetStep("email");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <a href="/" className="font-bold text-xl hover:text-primary transition-colors">ConvoBridge</a>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md">
        <div className="space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-h1">Welcome back</h1>
            <p className="text-body-large text-muted-foreground">Sign in to your ConvoBridge account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-body-small font-semibold">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                  disabled={loading}
                  className="h-12 text-base pl-10"
                />
              </div>
              {form.formState.errors.email && (
                <div className="text-destructive text-sm mt-1">{form.formState.errors.email.message as string}</div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-body-small font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => { setForgotOpen(true); setResetEmail(form.getValues("email")); }}
                  className="text-caption text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...form.register("password")}
                  disabled={loading}
                  className="h-12 text-base pl-10 pr-12"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <div className="text-destructive text-sm mt-1">{form.formState.errors.password.message as string}</div>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full text-base" disabled={loading || !form.formState.isValid}>
              {loading ? (
                <><Loader className="animate-spin mr-2 h-5 w-5" /> Signing In...</>
              ) : (
                <>Sign In <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </form>

          {/* Footer links */}
          <div className="text-center text-caption text-muted-foreground space-y-2">
            <p>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              {" • "}
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </p>
            <p>Need help? <a href="/contact-us" className="text-primary hover:text-primary/80 transition-colors">Contact support</a></p>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ─────────────────────────────────────────── */}
      <Dialog open={forgotOpen} onOpenChange={closeForgotModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              {resetStep === "email"
                ? "Enter your account email. We'll send a reset link valid for 1 hour."
                : "Check your inbox!"}
            </DialogDescription>
          </DialogHeader>

          {resetStep === "email" ? (
            <div className="space-y-4 pt-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                  className="pl-10 h-11"
                />
              </div>
              <Button
                onClick={handleForgotPassword}
                disabled={resetLoading || !resetEmail}
                className="w-full"
              >
                {resetLoading ? (
                  <><Loader className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold">Reset link sent to</p>
                <p className="text-primary font-mono text-sm">{resetEmail}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Check your inbox and spam folder. The link expires in 1 hour.
                </p>
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={closeForgotModal}>
                Back to Sign In
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
