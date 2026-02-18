import React from "react";
import { useDeliveryHistory, STATUS_STYLES, STATUS_LABELS } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Loader2, Store, MapPin } from "lucide-react";

const DeliveryHistoryPage: React.FC = () => {
  const { data: orders, isLoading } = useDeliveryHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border">
        <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-lg">No deliveries yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Completed deliveries will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Delivery History</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-border bg-card p-5 space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-medium">
                <Store className="h-4 w-4 text-muted-foreground" />
                {order.vendor_store_name || order.vendor_name || "Local Store"}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge className={`border text-xs ${STATUS_STYLES[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(order.updated_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{order.delivery_address}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Order total</span>
            <span className="font-bold">₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveryHistoryPage;
