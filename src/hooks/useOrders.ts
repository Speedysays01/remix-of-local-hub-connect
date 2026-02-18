import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type OrderStatus = "pending" | "accepted" | "ready_for_pickup" | "cancelled";

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

      const orders = (data ?? []) as Order[];
      // Enrich with vendor info
      const vendorIds = [...new Set(orders.map((o) => o.vendor_id))];
      if (vendorIds.length) {
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
      }
      return orders;
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
      // 1. Create order
      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          vendor_id: input.vendorId,
          delivery_address: input.deliveryAddress,
          total_amount: input.totalAmount,
          status: "pending",
        })
        .select("id")
        .single();
      if (oErr) throw oErr;

      // 2. Insert order items
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

// ── Vendor: update order status ───────────────────────────────────────────
export const useUpdateOrderStatus = () => {
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
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      const labels: Record<OrderStatus, string> = {
        accepted: "Order accepted",
        ready_for_pickup: "Order marked ready for pickup",
        cancelled: "Order cancelled",
        pending: "Order updated",
      };
      toast({ title: labels[status] });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};
