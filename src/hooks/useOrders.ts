import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "ready_for_pickup"
  | "picked_up"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  vendor_id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  vendor_address_snapshot: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  // enriched
  vendor_store_name?: string | null;
  vendor_name?: string | null;
}

/** Human-readable labels for all statuses */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:          "Pending",
  accepted:         "Accepted",
  ready_for_pickup: "Ready for Pickup",
  picked_up:        "Picked Up",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

/** Tailwind classes per status */
export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:          "bg-amber-100 text-amber-700 border-amber-200",
  accepted:         "bg-blue-100 text-blue-700 border-blue-200",
  ready_for_pickup: "bg-violet-100 text-violet-700 border-violet-200",
  picked_up:        "bg-orange-100 text-orange-700 border-orange-200",
  delivered:        "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled:        "bg-red-100 text-red-600 border-red-200",
};

// ── Helpers ───────────────────────────────────────────────────────────────
const enrichWithVendors = async (orders: Order[]) => {
  const vendorIds = [...new Set(orders.map((o) => o.vendor_id))];
  if (!vendorIds.length) return orders;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, store_name")
    .in("user_id", vendorIds);
  const pMap: Record<string, { full_name: string | null; store_name: string | null }> = {};
  (profiles ?? []).forEach((p) => { pMap[p.user_id] = p; });
  return orders.map((o) => ({
    ...o,
    vendor_name: pMap[o.vendor_id]?.full_name ?? null,
    vendor_store_name: pMap[o.vendor_id]?.store_name ?? null,
  }));
};

// ── User: fetch their own orders ──────────────────────────────────────────
export const useUserOrders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return enrichWithVendors((data ?? []) as Order[]);
    },
    enabled: !!user,
  });
};

// ── Vendor: fetch orders for their store ──────────────────────────────────
export const useVendorOrders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vendor-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
    enabled: !!user,
  });
};

// ── Delivery: fetch orders available for pickup / in-flight ───────────────
export const useDeliveryOrders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["delivery-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .in("status", ["ready_for_pickup", "picked_up"])
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return enrichWithVendors((data ?? []) as Order[]);
    },
    enabled: !!user,
    refetchInterval: 30_000, // poll every 30 s
  });
};

// ── Delivery: fetch completed deliveries (history) ────────────────────────
export const useDeliveryHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["delivery-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("status", "delivered")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return enrichWithVendors((data ?? []) as Order[]);
    },
    enabled: !!user,
  });
};

// ── Place order mutation ──────────────────────────────────────────────────
export interface PlaceOrderInput {
  vendorId: string;
  deliveryAddress: string;
  totalAmount: number;
  items: { product_id: string; product_name: string; product_price: number; quantity: number }[];
}

export const usePlaceOrder = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: PlaceOrderInput): Promise<string> => {
      // Snapshot the vendor's full pickup address at order time (immutable string)
      const { data: vp } = await supabase
        .from("profiles")
        .select("store_name, pickup_address_line, city, state, zip_code, phone")
        .eq("user_id", input.vendorId)
        .single();

      const addressLine = [vp?.pickup_address_line, vp?.city, vp?.state, vp?.zip_code]
        .filter(Boolean)
        .join(", ");

      const vendorAddressSnapshot = [
        vp?.store_name,
        addressLine,
        vp?.phone,
      ]
        .filter(Boolean)
        .join(" · ") || null;

      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          vendor_id: input.vendorId,
          delivery_address: input.deliveryAddress,
          total_amount: input.totalAmount,
          status: "pending",
          vendor_address_snapshot: vendorAddressSnapshot,
        })
        .select("id")
        .single();
      if (oErr) throw oErr;

      const { error: iErr } = await supabase.from("order_items").insert(
        input.items.map((item) => ({ ...item, order_id: order.id }))
      );
      if (iErr) throw iErr;

      return order.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-orders"] });
      toast({ title: "Order placed!", description: "Your order has been sent to the vendor." });
    },
    onError: (e: any) => {
      toast({ title: "Order failed", description: e.message, variant: "destructive" });
    },
  });
};

// ── Generic status update (used by both vendor and delivery) ──────────────
export const useUpdateOrderStatus = (role: "vendor" | "delivery" = "vendor") => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      if (role === "vendor") {
        qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      } else {
        qc.invalidateQueries({ queryKey: ["delivery-orders"] });
        qc.invalidateQueries({ queryKey: ["delivery-history"] });
      }
      qc.invalidateQueries({ queryKey: ["user-orders"] });
      toast({ title: STATUS_LABELS[status] });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};

