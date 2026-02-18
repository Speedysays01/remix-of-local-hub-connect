import React from "react";
import { useDeliveryOrders, useUpdateOrderStatus, STATUS_STYLES, STATUS_LABELS } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bike, Loader2, Store, MapPin, Package, Clock } from "lucide-react";

const DELIVERY_ACTIONS: Partial<Record<OrderStatus, { label: string; to: OrderStatus }>> = {
  ready_for_pickup: { label: "Mark as Picked Up", to: "picked_up" },
  picked_up:        { label: "Mark as Delivered",  to: "delivered" },
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const updateStatus = useUpdateOrderStatus("delivery");
  const action = DELIVERY_ACTIONS[order.status];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {/* Header */}
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
            {new Date(order.updated_at).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Addresses */}
      <div className="space-y-2 rounded-lg bg-muted/40 p-3">
        <div className="flex items-start gap-2 text-xs">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-role-vendor" />
          <div>
            <p className="font-semibold text-foreground">Pickup from vendor</p>
            <p className="text-muted-foreground mt-0.5">
              {order.vendor_address_snapshot || "Address not provided — contact vendor"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-role-user" />
          <div>
            <p className="font-semibold text-foreground">Deliver to customer</p>
            <p className="text-muted-foreground mt-0.5">{order.delivery_address}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      {order.order_items?.length ? (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" /> Items
          </p>
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {item.product_name}{" "}
                <span className="text-foreground font-medium">×{item.quantity}</span>
              </span>
              <span className="font-medium">
                ₹{(item.product_price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground">Order total</span>
        <span className="font-bold text-lg">₹{Number(order.total_amount).toFixed(2)}</span>
      </div>

      {/* Action */}
      {action && (
        <Button
          onClick={() => updateStatus.mutate({ orderId: order.id, status: action.to })}
          disabled={updateStatus.isPending}
          className="w-full h-10 brand-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          {updateStatus.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bike className="mr-2 h-4 w-4" />
          )}
          {action.label}
        </Button>
      )}
    </div>
  );
};

const DeliveryOrdersPage: React.FC = () => {
  const { data: orders, isLoading } = useDeliveryOrders();

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
        <Bike className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-lg">No active orders</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Orders that are ready for pickup will appear here.
        </p>
      </div>
    );
  }

  const readyForPickup = orders.filter((o) => o.status === "ready_for_pickup");
  const pickedUp       = orders.filter((o) => o.status === "picked_up");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Orders</h2>
        <Badge className="bg-brand/10 text-brand border-brand/20 text-sm">
          {orders.length} active
        </Badge>
      </div>

      {readyForPickup.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Ready for Pickup ({readyForPickup.length})
          </h3>
          {readyForPickup.map((order) => <OrderCard key={order.id} order={order} />)}
        </section>
      )}

      {pickedUp.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            In Transit ({pickedUp.length})
          </h3>
          {pickedUp.map((order) => <OrderCard key={order.id} order={order} />)}
        </section>
      )}
    </div>
  );
};

export default DeliveryOrdersPage;
