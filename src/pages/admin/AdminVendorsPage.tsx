import React, { useState } from "react";
import { useAdminVendors, useToggleVendorActive } from "@/hooks/useAdmin";
import { Loader2, Store, Package, ShoppingBag, MapPin, Phone, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const AdminVendorsPage: React.FC = () => {
  const { data: vendors, isLoading } = useAdminVendors();
  const toggleActive = useToggleVendorActive();
  const [search, setSearch] = useState("");

  const filtered = (vendors ?? []).filter((v) => {
    const q = search.toLowerCase();
    return (
      v.store_name?.toLowerCase().includes(q) ||
      v.full_name?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q)
    );
  });

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
          <h2 className="text-2xl font-bold">Vendors</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{vendors?.length ?? 0} registered vendors</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by store or name…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border text-center">
          <Store className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No vendors found.</p>
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

            return (
              <div
                key={vendor.user_id}
                className={`rounded-xl border bg-card p-5 transition-opacity ${
                  vendor.is_active ? "border-border" : "border-destructive/30 opacity-70"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Identity */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-role-vendor/10 shrink-0">
                        <Store className="h-4 w-4 text-role-vendor" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{vendor.store_name || "Unnamed Store"}</p>
                        <p className="text-xs text-muted-foreground">{vendor.full_name || "—"}</p>
                      </div>
                    </div>

                    {/* Address + phone */}
                    <div className="flex flex-col gap-1 mt-2 pl-10">
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
                    </div>
                  </div>

                  {/* Stats + toggle */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* Approval status badge */}
                      {vendor.approval_status === "pending" && (
                        <Badge className="border text-xs bg-brand/10 text-brand border-brand/20">
                          Pending Review
                        </Badge>
                      )}
                      {vendor.approval_status === "rejected" && (
                        <Badge className="border text-xs bg-destructive/10 text-destructive border-destructive/20">
                          Rejected
                        </Badge>
                      )}
                      {/* Active/suspended badge */}
                      <Badge
                        className={`border text-xs ${
                          vendor.is_active
                            ? "bg-role-vendor/10 text-role-vendor border-role-vendor/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        {vendor.is_active ? "Active" : "Suspended"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {vendor.product_count ?? 0} products
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {vendor.order_count ?? 0} orders
                      </span>
                    </div>

                    {/* Suspend / activate toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {vendor.is_active ? "Active" : "Suspended"}
                      </span>
                      <Switch
                        checked={vendor.is_active}
                        disabled={toggleActive.isPending}
                        onCheckedChange={(checked) =>
                          toggleActive.mutate({ userId: vendor.user_id, isActive: checked })
                        }
                      />
                    </div>
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

export default AdminVendorsPage;
