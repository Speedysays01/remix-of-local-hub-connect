import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/hooks/useProducts";

export interface CartItem {
  id: string;          // cart_items.id
  product_id: string;
  vendor_id: string;
  quantity: number;
  product: Product;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  vendorId: string | null;         // the single vendor constraint
  addItem: (product: Product, qty?: number) => Promise<void>;
  updateQty: (cartItemId: string, qty: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  totalItems: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [productCache, setProductCache] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // ── Load cart from DB ────────────────────────────────────────────────────
  const loadCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const { data: cartRows, error } = await supabase
        .from("cart_items")
        .select("id, product_id, vendor_id, quantity")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (!cartRows?.length) { setItems([]); return; }

      // batch-fetch products
      const productIds = [...new Set(cartRows.map((r) => r.product_id))];
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);
      if (pErr) throw pErr;

      const pMap: Record<string, Product> = {};
      (products ?? []).forEach((p) => { pMap[p.id] = p as Product; });
      setProductCache(pMap);

      setItems(
        cartRows
          .filter((r) => pMap[r.product_id])
          .map((r) => ({
            id: r.id,
            product_id: r.product_id,
            vendor_id: r.vendor_id,
            quantity: r.quantity,
            product: pMap[r.product_id],
          }))
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const vendorId = items.length > 0 ? items[0].vendor_id : null;

  // ── Add item ─────────────────────────────────────────────────────────────
  const addItem = async (product: Product, qty = 1) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please log in to add items to your cart.", variant: "destructive" });
      return;
    }
    if (product.stock_quantity < 1) {
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }

    // Single-vendor guard
    if (vendorId && vendorId !== product.vendor_id) {
      toast({
        title: "Different vendor",
        description: "Your cart already has items from another store. Clear it first or complete your current order.",
        variant: "destructive",
      });
      return;
    }

    // Check if already in cart
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock_quantity) {
        toast({ title: "Not enough stock", variant: "destructive" });
        return;
      }
      await updateQty(existing.id, newQty);
      return;
    }

    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: product.id,
      vendor_id: product.vendor_id,
      quantity: qty,
    });
    if (error) {
      toast({ title: "Error adding to cart", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Added to cart", description: `${product.name} added.` });
    await loadCart();
    setIsOpen(true);
  };

  // ── Update quantity ──────────────────────────────────────────────────────
  const updateQty = async (cartItemId: string, qty: number) => {
    const item = items.find((i) => i.id === cartItemId);
    if (item && qty > item.product.stock_quantity) {
      toast({ title: "Not enough stock", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: qty })
      .eq("id", cartItemId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.map((i) => i.id === cartItemId ? { ...i, quantity: qty } : i));
  };

  // ── Remove item ──────────────────────────────────────────────────────────
  const removeItem = async (cartItemId: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  // ── Clear cart ───────────────────────────────────────────────────────────
  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, vendorId, addItem, updateQty, removeItem, clearCart, subtotal, totalItems, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};
