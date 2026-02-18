import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Store, MapPin, Phone, Clock, CheckCircle, XCircle, Search, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface PendingVendor {
  user_id: string;
  full_name: string | null;
  store_name: string | null;
  phone: string | null;
  pickup_address_line: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at: string;
  approval_status: string;
}

const usePendingVendors = () =>
  useQuery({
    queryKey: ["admin-pending-vendors"],
    queryFn: async (): Promise<PendingVendor[]> => {
      // Get vendor user_ids
      const { data: vendorRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "vendor");

      const vendorIds = (vendorRoles ?? []).map((r) => r.user_id);
      if (!vendorIds.length) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, store_name, phone, pickup_address_line, city, state, zip_code, created_at, approval_status")
        .in("user_id", vendorIds)
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as PendingVendor[];
    },
  });

const useUpdateVendorApproval = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: status })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["admin-pending-vendors"] });
      qc.invalidateQueries({ queryKey: ["admin-vendors"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: status === "approved" ? "Vendor approved ✓" : "Vendor rejected",
        description:
          status === "approved"
            ? "The vendor is now live and can start selling."
            : "The vendor application has been rejected.",
      });
    },
    onError: (e: Error) => {
      useToast().toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};

const AdminVendorApprovalsPage: React.FC = () => {
  const { data: vendors, isLoading } = usePendingVendors();
  const approvalMutation = useUpdateVendorApproval();
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = (vendors ?? []).filter((v) => {
    const q = search.toLowerCase();
    return (
      v.store_name?.toLowerCase().includes(q) ||
      v.full_name?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q)
    );
  });

  const handleAction = async (userId: string, status: "approved" | "rejected") => {
    setProcessingId(userId);
    await approvalMutation.mutateAsync({ userId, status });
    setProcessingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Vendor Approvals</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vendors?.length ?? 0} pending application{(vendors?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border text-center">
          <CheckCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No pending applications</p>
          <p className="text-xs text-muted-foreground mt-1">
            All vendor applications have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((vendor) => {
            const addressParts = [
              vendor.pickup_address_line,
              vendor.city,
              vendor.state,
              vendor.zip_code,
            ].filter(Boolean).join(", ");

            const signupDate = new Date(vendor.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const isProcessing = processingId === vendor.user_id;

            return (
              <div
                key={vendor.user_id}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-brand/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Identity */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-role-vendor/10 shrink-0">
                        <Store className="h-4.5 w-4.5 text-role-vendor" />
                      </div>
                      <div>
                        <p className="font-semibold">{vendor.store_name || "Unnamed Store"}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {vendor.full_name || "—"}
                        </div>
                      </div>
                      <Badge className="ml-2 border bg-role-vendor/10 text-role-vendor border-role-vendor/20 text-[10px]">
                        <Clock className="h-3 w-3 mr-1" /> Pending
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1 pl-11">
                      {addressParts && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{addressParts}</span>
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Applied on {signupDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isProcessing || approvalMutation.isPending}
                      onClick={() => handleAction(vendor.user_id, "rejected")}
                      className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={isProcessing || approvalMutation.isPending}
                      onClick={() => handleAction(vendor.user_id, "approved")}
                      className="bg-role-vendor/15 text-role-vendor hover:bg-role-vendor/25 border border-role-vendor/30"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminVendorApprovalsPage;
