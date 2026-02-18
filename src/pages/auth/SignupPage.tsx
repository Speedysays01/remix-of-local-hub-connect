import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/contexts/AuthContext";
import { ROLE_DASHBOARDS } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle } from "lucide-react";

const ROLES: { value: AppRole; label: string; description: string; color: string }[] = [
  { value: "user", label: "Customer", description: "Browse & order from local stores", color: "var(--role-user)" },
  { value: "vendor", label: "Vendor", description: "List products & manage orders", color: "var(--role-vendor)" },
  { value: "delivery", label: "Delivery Partner", description: "Pick up & deliver orders", color: "var(--role-delivery)" },
];

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          role: selectedRole,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // After a short delay redirect to login
    setTimeout(() => navigate("/login"), 3000);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center space-y-4 animate-fade-in">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-role-vendor/15">
              <CheckCircle className="h-8 w-8 text-role-vendor" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a confirmation link to <strong>{email}</strong>. Please verify your email to activate your account.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-gradient flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">SwiftLocal</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Join the fastest<br />
            <span className="text-brand">local commerce</span><br />
            network.
          </h1>
          <p className="text-lg text-sidebar-foreground">
            Whether you're shopping, selling, or delivering — there's a role for you.
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/50">
          © 2024 SwiftLocal. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SwiftLocal</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
            <p className="mt-2 text-muted-foreground">Choose your role and get started</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Role Selector */}
            <div className="space-y-2">
              <Label>I am a...</Label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                      selectedRole === r.value
                        ? "border-brand bg-brand/5"
                        : "border-border hover:border-border/80 hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ background: `hsl(${r.color})` }}
                    />
                    <div>
                      <div className="text-sm font-semibold">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.description}</div>
                    </div>
                    {selectedRole === r.value && (
                      <CheckCircle className="ml-auto h-4 w-4 text-brand shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full brand-gradient text-white font-semibold hover:opacity-90 transition-opacity"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
