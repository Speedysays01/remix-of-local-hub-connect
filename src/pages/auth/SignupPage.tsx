import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/contexts/AuthContext";
import { ROLE_DASHBOARDS } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";

const ROLES: { value: AppRole; label: string; description: string; color: string }[] = [
  { value: "user", label: "Customer", description: "Browse & order from local stores", color: "var(--role-user)" },
  { value: "vendor", label: "Vendor", description: "List products & manage orders", color: "var(--role-vendor)" },
  { value: "delivery", label: "Delivery Partner", description: "Pick up & deliver orders", color: "var(--role-delivery)" },
];

// ── Vendor business info step ─────────────────────────────────────────────
interface VendorFields {
  storeName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
}

const VendorBusinessStep: React.FC<{
  fields: VendorFields;
  onChange: (f: VendorFields) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}> = ({ fields, onChange, onBack, onSubmit, loading, error }) => {
  const set = (key: keyof VendorFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...fields, [key]: e.target.value });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Business details</h2>
        <p className="mt-2 text-muted-foreground">
          We need this to verify your business before you go live.
        </p>
      </div>

      <div className="rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand">
        Your account will be reviewed by our team before you can start selling.
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="storeName">Store / Business name <span className="text-destructive">*</span></Label>
          <Input id="storeName" placeholder="e.g. Fresh Bakes by Priya" value={fields.storeName} onChange={set("storeName")} className="h-11" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number <span className="text-destructive">*</span></Label>
          <Input id="phone" type="tel" placeholder="+91 98765 43210" value={fields.phone} onChange={set("phone")} className="h-11" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine">Pickup address line <span className="text-destructive">*</span></Label>
          <Input id="addressLine" placeholder="123, MG Road" value={fields.addressLine} onChange={set("addressLine")} className="h-11" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
            <Input id="city" placeholder="Bangalore" value={fields.city} onChange={set("city")} className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
            <Input id="state" placeholder="Karnataka" value={fields.state} onChange={set("state")} className="h-11" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip / PIN code <span className="text-destructive">*</span></Label>
          <Input id="zipCode" placeholder="560001" value={fields.zipCode} onChange={set("zipCode")} className="h-11" required />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="h-11 flex-1">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={onSubmit}
          className="h-11 flex-1 brand-gradient text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {loading ? "Creating account..." : "Submit for review"}
          {!loading && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────
const SignupPage: React.FC = () => {
  const [step, setStep] = useState<"account" | "vendor-business">("account");

  // Step 1 fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("user");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 fields (vendor only)
  const [vendorFields, setVendorFields] = useState<VendorFields>({
    storeName: "", phone: "", addressLine: "", city: "", state: "", zipCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // ── Step 1 submit ──────────────────────────────────────────────────────
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (selectedRole === "vendor") {
      setStep("vendor-business");
    } else {
      handleFinalSignup();
    }
  };

  // ── Final signup (called after step 1 for non-vendors, or step 2 for vendors) ──
  const handleFinalSignup = async (vendor?: VendorFields) => {
    // Validate vendor fields
    if (vendor) {
      const missing = Object.entries(vendor).find(([, v]) => !v.trim());
      if (missing) {
        setError("Please fill in all business details.");
        return;
      }
    }

    setLoading(true);
    setError("");

    const { data: signUpData, error: authError } = await supabase.auth.signUp({
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

    const userId = signUpData.user?.id;

    // If vendor, update profile with business info + set approval_status = pending
    if (vendor && userId) {
      await supabase.from("profiles").update({
        store_name: vendor.storeName,
        phone: vendor.phone,
        pickup_address_line: vendor.addressLine,
        city: vendor.city,
        state: vendor.state,
        zip_code: vendor.zipCode,
        approval_status: "pending",
      }).eq("user_id", userId);
    }

    // If auto-confirm is on, session exists immediately — redirect
    if (signUpData.session) {
      if (selectedRole === "vendor") {
        // Vendor goes to their dashboard (will see pending screen)
        navigate(ROLE_DASHBOARDS["vendor"]);
      } else {
        navigate(ROLE_DASHBOARDS[selectedRole]);
      }
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate("/login"), 3500);
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center space-y-4 animate-fade-in">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-role-vendor/15">
              <CheckCircle className="h-8 w-8 text-role-vendor" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">
            {selectedRole === "vendor" ? "Application submitted!" : "Check your email"}
          </h2>
          <p className="text-muted-foreground">
            {selectedRole === "vendor"
              ? <>Your vendor account is <strong>under review</strong>. We'll notify you once approved. Please verify your email at <strong>{email}</strong> to activate your account.</>
              : <>We've sent a confirmation link to <strong>{email}</strong>. Please verify your email to activate your account.</>
            }
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

          {step === "vendor-business" && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <p className="text-sm font-semibold text-white">Vendor Approval Process</p>
              <div className="space-y-2 text-sm text-sidebar-foreground">
                {["Submit your business details", "Admin reviews your application", "Get approved & start selling"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-xs font-bold shrink-0">{i + 1}</div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-sidebar-foreground/50">
          © 2024 SwiftLocal. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SwiftLocal</span>
          </div>

          {step === "vendor-business" ? (
            <VendorBusinessStep
              fields={vendorFields}
              onChange={setVendorFields}
              onBack={() => { setStep("account"); setError(""); }}
              onSubmit={() => handleFinalSignup(vendorFields)}
              loading={loading}
              error={error}
            />
          ) : (
            <>
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

              <form onSubmit={handleStep1} className="space-y-5">
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
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ background: `hsl(${r.color})` }} />
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
                  <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
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
                  {loading ? "Creating account..." : selectedRole === "vendor" ? "Continue →" : "Create account"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-brand hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
