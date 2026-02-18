import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Store, MapPin, Phone, User, Loader2, CheckCircle2 } from "lucide-react";

// ── Schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  full_name:            z.string().trim().min(1, "Name is required").max(100),
  store_name:           z.string().trim().min(1, "Store name is required").max(100),
  phone:                z.string().trim().max(20).optional(),
  pickup_address_line:  z.string().trim().max(200).optional(),
  city:                 z.string().trim().max(100).optional(),
  state:                z.string().trim().max(100).optional(),
  zip_code:             z.string().trim().max(20).optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Fetch vendor profile ──────────────────────────────────────────────────
const useVendorProfile = (userId: string | undefined) =>
  useQuery({
    queryKey: ["vendor-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, store_name, phone, pickup_address_line, city, state, zip_code")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

// ── Field component ───────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  id: string;
  placeholder?: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
}> = ({ label, id, placeholder, error, registration }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} placeholder={placeholder} {...registration} />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────
const VendorStorePage: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useVendorProfile(user?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        full_name:           profile.full_name ?? "",
        store_name:          profile.store_name ?? "",
        phone:               profile.phone ?? "",
        pickup_address_line: profile.pickup_address_line ?? "",
        city:                profile.city ?? "",
        state:               profile.state ?? "",
        zip_code:            profile.zip_code ?? "",
      });
    }
  }, [profile, reset]);

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name:           values.full_name,
          store_name:          values.store_name,
          phone:               values.phone || null,
          pickup_address_line: values.pickup_address_line || null,
          city:                values.city || null,
          state:               values.state || null,
          zip_code:            values.zip_code || null,
        })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-profile"] });
      toast({ title: "Store profile saved", description: "Your pickup address has been updated." });
    },
    onError: (e: any) => {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Preview how the address snapshot will look
  const previewSnapshot = [
    profile?.store_name,
    profile?.pickup_address_line,
    [profile?.city, profile?.state, profile?.zip_code].filter(Boolean).join(", "),
    profile?.phone,
  ].filter(Boolean).join(" · ");

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Store Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This information is shown to delivery partners as the pickup address on each order.
        </p>
      </div>

      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-8">

        {/* ── Identity ────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-role-vendor/10">
              <User className="h-4 w-4 text-role-vendor" />
            </div>
            <h3 className="font-semibold">Identity</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Your Name"
              id="full_name"
              placeholder="Jane Smith"
              error={errors.full_name?.message}
              registration={register("full_name")}
            />
            <Field
              label="Store Name"
              id="store_name"
              placeholder="Jane's Fresh Produce"
              error={errors.store_name?.message}
              registration={register("store_name")}
            />
          </div>
        </section>

        {/* ── Contact ─────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-role-vendor/10">
              <Phone className="h-4 w-4 text-role-vendor" />
            </div>
            <h3 className="font-semibold">Contact</h3>
          </div>

          <Field
            label="Phone Number"
            id="phone"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            registration={register("phone")}
          />
        </section>

        {/* ── Pickup Address ──────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-role-vendor/10">
              <MapPin className="h-4 w-4 text-role-vendor" />
            </div>
            <div>
              <h3 className="font-semibold">Pickup Address</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Delivery partners see this to collect orders from your store.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Field
              label="Address Line"
              id="pickup_address_line"
              placeholder="Shop 4, Market Street"
              error={errors.pickup_address_line?.message}
              registration={register("pickup_address_line")}
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <Field
                label="City"
                id="city"
                placeholder="Mumbai"
                error={errors.city?.message}
                registration={register("city")}
              />
              <Field
                label="State"
                id="state"
                placeholder="Maharashtra"
                error={errors.state?.message}
                registration={register("state")}
              />
              <Field
                label="ZIP Code"
                id="zip_code"
                placeholder="400001"
                error={errors.zip_code?.message}
                registration={register("zip_code")}
              />
            </div>
          </div>

          {/* Live preview */}
          {previewSnapshot && (
            <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pickup snapshot preview
              </p>
              <p className="text-sm text-foreground">{previewSnapshot}</p>
              <p className="text-xs text-muted-foreground">
                This is what delivery partners will see on new orders.
              </p>
            </div>
          )}
        </section>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting || save.isPending}
            className="brand-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {save.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
            ) : (
              <><CheckCircle2 className="mr-2 h-4 w-4" />Save Profile</>
            )}
          </Button>
          {!isDirty && !save.isPending && (
            <p className="text-xs text-muted-foreground">No unsaved changes</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default VendorStorePage;
