import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OrderStatus } from "@/hooks/useOrders";

// ── Types ─────────────────────────────────────────────────────────────────
export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  store_name: string | null;
  phone: string | null;
  pickup_address_line: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_active: boolean;
  approval_status: string | null;
  created_at: string;
  // enriched
  role?: string;
  product_count?: number;
  order_count?: number;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  vendor_id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  vendor_address_snapshot: string | null;
  created_at: string;
  updated_at: string;
  // enriched
  vendor_store_name?: string | null;
  vendor_name?: string | null;
}

export interface PlatformStats {
  totalUsers: number;
  totalVendors: number;
  totalDelivery: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
}

// ── Platform stats ────────────────────────────────────────────────────────
export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      const [rolesRes, ordersRes] = await Promise.all([
        supabase.from("user_roles").select("role"),
        supabase.from("orders").select("status, total_amount"),
      ]);

      const roles = rolesRes.data ?? [];
      const orders = ordersRes.data ?? [];

      const byStatus: Record<string, number> = {};
      let totalRevenue = 0;
      for (const o of orders) {
        byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
        totalRevenue += Number(o.total_amount);
      }

      return {
        totalUsers:    roles.filter((r) => r.role === "user").length,
        totalVendors:  roles.filter((r) => r.role === "vendor").length,
        totalDelivery: roles.filter((r) => r.role === "delivery").length,
        totalOrders:   orders.length,
        totalRevenue,
        ordersByStatus: byStatus,
      };
    },
  });

// ── All vendors with product + order counts ───────────────────────────────
export const useAdminVendors = () =>
  useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async (): Promise<AdminProfile[]> => {
      // Get all vendor user_ids
      const { data: vendorRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "vendor");

      const vendorIds = (vendorRoles ?? []).map((r) => r.user_id);
      if (!vendorIds.length) return [];

      const [profilesRes, productsRes, ordersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, user_id, full_name, store_name, phone, pickup_address_line, city, state, zip_code, is_active, approval_status, created_at")
          .in("user_id", vendorIds),
        supabase.from("products").select("vendor_id"),
        supabase.from("orders").select("vendor_id"),
      ]);

      const productCounts: Record<string, number> = {};
      (productsRes.data ?? []).forEach((p) => {
        productCounts[p.vendor_id] = (productCounts[p.vendor_id] ?? 0) + 1;
      });

      const orderCounts: Record<string, number> = {};
      (ordersRes.data ?? []).forEach((o) => {
        orderCounts[o.vendor_id] = (orderCounts[o.vendor_id] ?? 0) + 1;
      });

      return (profilesRes.data ?? []).map((p) => ({
        ...p,
        role: "vendor",
        product_count: productCounts[p.user_id] ?? 0,
        order_count:   orderCounts[p.user_id] ?? 0,
      })) as AdminProfile[];
    },
  });

// ── All users (role = user) ───────────────────────────────────────────────
export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<AdminProfile[]> => {
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "user");

      const ids = (userRoles ?? []).map((r) => r.user_id);
      if (!ids.length) return [];

      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, phone, is_active, created_at")
        .in("user_id", ids);

      return (data ?? []).map((p) => ({ ...p, role: "user" })) as AdminProfile[];
    },
  });

// ── All delivery partners ─────────────────────────────────────────────────
export const useAdminDelivery = () =>
  useQuery({
    queryKey: ["admin-delivery"],
    queryFn: async (): Promise<AdminProfile[]> => {
      const { data: deliveryRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "delivery");

      const ids = (deliveryRoles ?? []).map((r) => r.user_id);
      if (!ids.length) return [];

      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, phone, is_active, created_at")
        .in("user_id", ids);

      return (data ?? []).map((p) => ({ ...p, role: "delivery" })) as AdminProfile[];
    },
  });

// ── All orders ────────────────────────────────────────────────────────────
export const useAdminOrders = (statusFilter?: OrderStatus | "all") =>
  useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async (): Promise<AdminOrder[]> => {
      let q = supabase
        .from("orders")
        .select("id, user_id, vendor_id, status, total_amount, delivery_address, vendor_address_snapshot, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        q = q.eq("status", statusFilter);
      }

      const { data, error } = await q;
      if (error) throw error;

      const orders = (data ?? []) as AdminOrder[];
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
        vendor_name:       pMap[o.vendor_id]?.full_name ?? null,
        vendor_store_name: pMap[o.vendor_id]?.store_name ?? null,
      }));
    },
  });

// ── Toggle vendor active ──────────────────────────────────────────────────
export const useToggleVendorActive = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      qc.invalidateQueries({ queryKey: ["admin-vendors"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["public-products"] });
      toast({
        title: isActive ? "Vendor activated" : "Vendor suspended",
        description: isActive
          ? "The vendor is now active and visible publicly."
          : "The vendor and their products are now hidden.",
      });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};
