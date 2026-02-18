import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { usePlaceOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, vendorId, clearCart } = useCart();
  const placeOrder = usePlaceOrder();
  const [address, setAddress] = useState("");
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (items.length === 0 && !placed) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-lg">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Add some items before checking out.
        </p>
        <Link to="/dashboard/browse">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto">
        <CheckCircle2 className="h-16 w-16 text-role-vendor mb-4" />
        <h2 className="text-2xl font-bold">Order Placed!</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Your order has been sent to the vendor. You'll be notified when it's accepted.
        </p>
        {orderId && (
          <p className="text-xs text-muted-foreground mt-2">Order #{orderId.slice(0, 8).toUpperCase()}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button onClick={() => navigate("/dashboard/orders")}>
            View My Orders
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard/browse")}>
            Browse More
          </Button>
        </div>
      </div>
    );
  }

  const vendorStoreName = items[0]?.product?.vendor_store_name || items[0]?.product?.vendor_name || "Local Store";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !vendorId) return;

    const id = await placeOrder.mutateAsync({
      vendorId,
      deliveryAddress: address.trim(),
      totalAmount: subtotal,
      items: items.map((i) => ({
        product_id: i.product_id,
        product_name: i.product.name,
        product_price: i.product.price,
        quantity: i.quantity,
      })),
    });
    await clearCart();
    setOrderId(id);
    setPlaced(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </button>

      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left: form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand" />
              Delivery Address
            </h2>
            <div className="space-y-2">
              <Label htmlFor="address">Drop location</Label>
              <Textarea
                id="address"
                placeholder="Enter your full delivery address (building, street, landmark…)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                required
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{address.length}/500</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!address.trim() || placeOrder.isPending}
            className="w-full h-11 brand-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order…
              </>
            ) : (
              `Place Order · ₹${subtotal.toFixed(2)}`
            )}
          </Button>
        </form>

        {/* Right: order summary */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Order Summary</h2>
            <p className="text-xs text-muted-foreground">
              From <span className="font-medium text-foreground">{vendorStoreName}</span>
            </p>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Delivery charges decided by vendor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
