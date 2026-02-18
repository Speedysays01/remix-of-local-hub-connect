import React from "react";
import { useAdminDelivery } from "@/hooks/useAdmin";
import { Loader2, Bike, Phone, Calendar } from "lucide-react";

const AdminDeliveryPage: React.FC = () => {
  const { data: partners, isLoading } = useAdminDelivery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Delivery Partners</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{partners?.length ?? 0} registered riders</p>
      </div>

      {!partners?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border text-center">
          <Bike className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No delivery partners yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-3 px-5 py-3 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
            <span>Name</span>
            <span>Phone</span>
            <span>Joined</span>
          </div>
          {partners.map((p, i) => (
            <div
              key={p.user_id}
              className={`grid grid-cols-3 px-5 py-3.5 items-center text-sm ${
                i < partners.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-role-delivery/10 shrink-0">
                  <Bike className="h-3.5 w-3.5 text-role-delivery" />
                </div>
                <span className="font-medium truncate">{p.full_name || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {p.phone ? (
                  <>
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{p.phone}</span>
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>
                  {new Date(p.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeliveryPage;
