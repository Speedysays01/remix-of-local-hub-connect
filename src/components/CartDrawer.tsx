import React from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartDrawer: React.FC = () => {
  const { isOpen, setIsOpen, items, totalItems, subtotal, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
            {totalItems > 0 && (
              <span className="ml-1 rounded-full bg-brand/10 text-brand text-xs font-semibold px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium">Your cart is empty</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add items from the browse page to get started.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setIsOpen(false)}
            >
              Browse products
            </Button>
          </div>
        ) : (
          <>
            {/* Vendor notice */}
            {items[0]?.product.vendor_store_name && (
              <p className="text-xs text-muted-foreground px-1 -mt-2 mb-1">
                From <span className="font-medium text-foreground">{items[0].product.vendor_store_name || items[0].product.vendor_name || "Local Store"}</span>
              </p>
            )}

            {/* Item list */}
            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-border bg-card p-3"
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs">
                        N/A
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ₹{item.product.price.toFixed(2)} each
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateQty(item.id, item.quantity - 1)
                            : removeItem(item.id)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Price + remove */}
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-sm font-bold text-role-vendor">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-lg">₹{subtotal.toFixed(2)}</span>
              </div>
              <Button
                className="w-full h-11 brand-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard/checkout");
                }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
