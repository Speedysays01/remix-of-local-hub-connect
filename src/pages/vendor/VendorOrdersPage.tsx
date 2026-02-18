import React, { useState } from "react";
import { useVendorOrders, useUpdateOrderStatus, OrderStatus } from "@/hooks/useOrders";
import { Loader2, ClipboardList, MapPin, Clock, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:          "bg-amber-100 text-amber-700 border-amber-200",
  accepted:         "bg-blue-100 text-blue-700 border-blue-200",
  ready_for_pickup: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled:        "bg-red-100 text-red-600 border-red-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:          "Pending",
  accepted:         "Accepted",
  ready_for_pickup: "Ready for Pickup",
  cancelled:        "Cancelled",
};

const TRANSITIONS: Record<OrderStatus, { label: string; to: OrderStatus }[]> = {
  pending:          [{ label: "Accept order", to: "accepted" }, { label: "Cancel order", to: "cancelled" }],
  accepted:         [{ label: "Mark ready for pickup", to: "ready_for_pickup" }, { label: "Cancel order", to: "cancelled" }],
  ready_for_pickup: [],
  cancelled:        [],
};

const OrderCard: React.FC<{ order: ReturnType<typeof useVendorOrders>["data"] extends (infer T)[] | undefined ? T : never }> = ({ order }) => {
  const updateStatus = useUpdateOrderStatus();

  const actions = TRANSITIONS[order.status];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm font-medium mt-0.5">Customer order</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={`border text-xs ${STATUS_STYLES[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Items */}
      {order.order_items?.length ? (
        <div className="space-y-2 rounded-lg bg-muted/40 p-3">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {item.product_name}{" "}
                <span className="text-foreground font-medium">×{item.quantity}</span>
              </span>
              <span className="font-medium">₹{(item.product_price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-xs">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand" />
          <span className="line-clamp-2">{order.delivery_address}</span>
        </div>
        <span className="font-bold text-lg">₹{Number(order.total_amount).toFixed(2)}</span>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-2 pt-1">
          {actions.length === 1 ? (
            <Button
              size="sm"
              variant={actions[0].to === "cancelled" ? "destructive" : "default"}
              className={actions[0].to !== "cancelled" ? "brand-gradient text-primary-foreground" : ""}
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ orderId: order.id, status: actions[0].to })}
            >
              {actions[0].label}
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                className="brand-gradient text-primary-foreground flex-1"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ orderId: order.id, status: actions[0].to })}
              >
                {actions[0].label}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ orderId: order.id, status: "cancelled" })}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const VendorOrdersPage: React.FC = () => {
  const { data: orders, isLoading } = useVendorOrders();
  const [tab, setTab] = useState<"active" | "all">("active");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeOrders = (orders ?? []).filter((o) => o.status === "pending" || o.status === "accepted");
  const allOrders = orders ?? [];
  const displayed = tab === "active" ? activeOrders : allOrders;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Incoming Orders</h2>
        {activeOrders.length > 0 && (
          <Badge className="bg-brand/10 text-brand border-brand/20 text-sm">
            {activeOrders.length} active
          </Badge>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "all")}>
        <TabsList>
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="all">All Orders ({allOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border">
              <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">No orders here</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tab === "active"
                  ? "New customer orders will appear here in real-time."
                  : "You haven't received any orders yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorOrdersPage;
