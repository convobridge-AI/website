
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  company: z.string().optional(),
});

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", company: "" },
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await signup(values.email, values.password, values.name, values.company);
    } catch (err: any) {
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <a href="/" className="font-bold text-xl hover:text-primary transition-colors">ConvoBridge</a>
      </div>
      <div className="w-full max-w-md">
        <div className="space-y-8 animate-fade-in-up">
          <div className="text-center space-y-3">
            <h1 className="text-h1">Create your account</h1>
            <p className="text-body-large text-muted-foreground">
              Sign up to get started with ConvoBridge
            </p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-body-small font-semibold">Name</label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                {...form.register("name")}
                disabled={loading}
                className="h-12 text-base"
              />
              {form.formState.errors.name && (
                <div className="text-destructive text-sm mt-1">{form.formState.errors.name.message as string}</div>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-body-small font-semibold">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
                disabled={loading}
                className="h-12 text-base"
              />
              {form.formState.errors.email && (
                <div className="text-destructive text-sm mt-1">{form.formState.errors.email.message as string}</div>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="company" className="text-body-small font-semibold">Company (optional)</label>
              <Input
                id="company"
                type="text"
                placeholder="Your company"
                {...form.register("company")}
                disabled={loading}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-body-small font-semibold">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...form.register("password")}
                  disabled={loading}
                  className="h-12 text-base pr-12"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <div className="text-destructive text-sm mt-1">{form.formState.errors.password.message as string}</div>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full text-base" disabled={loading || !form.formState.isValid}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Signing Up...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          <p className="text-center text-body-small text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
