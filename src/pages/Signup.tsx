
import { Github, ArrowRight, Eye, EyeOff } from "lucide-react";
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
  const { signup, loginWithOAuth } = useAuth();
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* OAuth Options */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              className="text-base h-12"
              onClick={() => loginWithOAuth('github')}
              disabled={loading}
            >
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base h-12"
              onClick={() => loginWithOAuth('google')}
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>

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
