import React, { useState } from "react";
import { useAdminOrders } from "@/hooks/useAdmin";
import { STATUS_LABELS, STATUS_STYLES } from "@/hooks/useOrders";
import type { OrderStatus } from "@/hooks/useOrders";
import { Loader2, ShoppingBag, Store, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALL_STATUSES: ("all" | OrderStatus)[] = [
  "all", "pending", "accepted", "ready_for_pickup", "picked_up", "delivered", "cancelled",
];

const STATUS_TAB_LABELS: Record<string, string> = {
  all:              "All",
  pending:          "Pending",
  accepted:         "Accepted",
  ready_for_pickup: "Ready",
  picked_up:        "Picked Up",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

const AdminOrdersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const { data: orders, isLoading } = useAdminOrders(statusFilter);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">All Orders</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {orders?.length ?? 0} orders {statusFilter !== "all" ? `with status "${STATUS_TAB_LABELS[statusFilter]}"` : "total"}
        </p>
      </div>

      {/* Filter tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | OrderStatus)}>
        <TabsList className="flex-wrap h-auto gap-1">
          {ALL_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs">
              {STATUS_TAB_LABELS[s]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !orders?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-border bg-card px-5 py-4 flex flex-wrap items-center justify-between gap-4"
            >
              {/* Left */}
              <div className="space-y-1 min-w-0">
                <p className="text-xs text-muted-foreground font-mono">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[160px]">
                    {order.vendor_store_name || order.vendor_name || "Store"}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{order.delivery_address}</span>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="font-bold">₹{Number(order.total_amount).toFixed(2)}</span>
                <Badge className={`border text-xs ${STATUS_STYLES[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
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

export default AdminOrdersPage;
