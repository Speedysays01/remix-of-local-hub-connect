import React from "react";
import { useUserOrders, STATUS_STYLES, STATUS_LABELS } from "@/hooks/useOrders";
import { ShoppingBag, Loader2, Store, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserOrdersPage: React.FC = () => {
  const { data: orders, isLoading } = useUserOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-lg">No orders yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Once you place your first order, it will appear here.
        </p>
        <Link to="/dashboard/browse">
          <Button variant="outline">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-sm">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {order.vendor_store_name || order.vendor_name || "Local Store"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
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

          {/* Items */}
          {order.order_items?.length ? (
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
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
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-xs">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{order.delivery_address}</span>
            </div>
            <span className="font-bold text-lg">₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserOrdersPage;
