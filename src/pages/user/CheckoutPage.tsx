import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { usePlaceOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, MapPin, ShoppingBag, Loader2, CheckCircle2, FlaskConical, ShieldCheck, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

// ── Payment simulation steps shown during the 5-second fake processing ──
const PAYMENT_STEPS = [
  { label: "Verifying order details…", icon: ShoppingBag },
  { label: "Connecting to payment gateway…", icon: CreditCard },
  { label: "Authorising transaction…", icon: ShieldCheck },
  { label: "Confirming with vendor…", icon: CheckCircle2 },
];

const TOTAL_MS = 5000;
const STEP_MS = TOTAL_MS / PAYMENT_STEPS.length; // 1250 ms per step

// ── Test-mode banner shown on the checkout form ──
const TestModeBanner: React.FC = () => (
  <div className="flex items-center gap-2.5 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
    <FlaskConical className="h-4 w-4 shrink-0 text-yellow-600" />
    <span>
      <span className="font-semibold">Test Mode Enabled</span> — Payment gateway integration coming soon.
    </span>
  </div>
);

// ── Full-screen mock payment processor ──
const PaymentProcessingScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [elapsed, setElapsed] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const ms = Date.now() - start;
      setElapsed(ms);
      setStepIndex(Math.min(Math.floor(ms / STEP_MS), PAYMENT_STEPS.length - 1));
      if (ms >= TOTAL_MS) {
        clearInterval(interval);
        onDone();
      }
    }, 80);
    return () => clearInterval(interval);
  }, [onDone]);

  const progress = Math.min((elapsed / TOTAL_MS) * 100, 100);
  const StepIcon = PAYMENT_STEPS[stepIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Test mode badge */}
      <div className="mb-10 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
        <FlaskConical className="h-3.5 w-3.5" />
        Test Mode — No real payment processed
      </div>

      {/* Animated icon */}
      <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary transition-all"
          style={{
            transform: `rotate(${(progress / 100) * 360}deg)`,
            transition: "transform 80ms linear",
          }}
        />
        <StepIcon className="h-8 w-8 text-primary" />
      </div>

      {/* Current step label */}
      <h2 className="mb-1 text-xl font-bold tracking-tight">
        Processing payment
        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          TEST MODE
        </span>
      </h2>
      <p className="mb-8 text-sm text-muted-foreground transition-all">
        {PAYMENT_STEPS[stepIndex].label}
      </p>

      {/* Progress bar */}
      <div className="w-72">
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Step dots */}
      <div className="mt-8 flex gap-3">
        {PAYMENT_STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
              i < stepIndex
                ? "border-primary bg-primary text-primary-foreground"
                : i === stepIndex
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            {i < stepIndex ? "✓" : i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main checkout page ────────────────────────────────────────────────────
const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, vendorId, clearCart } = useCart();
  const placeOrder = usePlaceOrder();
  const [address, setAddress] = useState("");
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<null | {
    vendorId: string;
    deliveryAddress: string;
    totalAmount: number;
    items: { product_id: string; product_name: string; product_price: number; quantity: number }[];
  }>(null);

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

  const vendorStoreName =
    items[0]?.product?.vendor_store_name ||
    items[0]?.product?.vendor_name ||
    "Local Store";

  // Step 1: user submits → show payment screen, stash order payload
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !vendorId) return;

    setPendingOrder({
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
    setShowPaymentScreen(true);
  };

  // Step 2: payment screen done → actually place order
  const handlePaymentDone = async () => {
    setShowPaymentScreen(false);
    if (!pendingOrder) return;
    try {
      const id = await placeOrder.mutateAsync(pendingOrder);
      await clearCart();
      setOrderId(id);
      setPlaced(true);
    } catch {
      // toast already shown by the mutation's onError
    }
  };

  return (
    <>
      {showPaymentScreen && (
        <PaymentProcessingScreen onDone={handlePaymentDone} />
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
            <FlaskConical className="h-3 w-3" />
            Test Mode
          </div>
        </div>

        {/* Test mode banner */}
        <TestModeBanner />

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
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
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
    </>
  );
};

export default CheckoutPage;
