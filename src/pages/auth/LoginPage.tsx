import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { ROLE_DASHBOARDS } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Zap, AlertCircle } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { role } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (role) {
      navigate(ROLE_DASHBOARDS[role] || "/dashboard", { replace: true });
    }
  }, [role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Fetch role and redirect
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      const userRole = (roleData?.role as AppRole) || "user";
      navigate(ROLE_DASHBOARDS[userRole] || "/dashboard", { replace: true });
    }

    setLoading(false);
  };

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
            Hyperlocal delivery,<br />
            <span className="text-brand">at lightning speed.</span>
          </h1>
          <p className="text-lg text-sidebar-foreground">
            Connecting customers, vendors, and delivery partners — all in one platform.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Customers", color: "hsl(var(--role-user))", desc: "Browse & order" },
              { label: "Vendors", color: "hsl(var(--role-vendor))", desc: "Manage your store" },
              { label: "Delivery", color: "hsl(var(--role-delivery))", desc: "Pick up & deliver" },
              { label: "Admin", color: "hsl(var(--role-admin))", desc: "Platform control" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4"
                style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
              >
                <div className="text-sm font-semibold" style={{ color: item.color }}>
                  {item.label}
                </div>
                <div className="text-xs text-sidebar-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-sidebar-foreground/50">
          © 2024 SwiftLocal. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SwiftLocal</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-brand hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
