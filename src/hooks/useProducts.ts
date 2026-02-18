import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // enriched from profiles
  vendor_name?: string | null;
  vendor_store_name?: string | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
}

/** Fetch vendor profile info keyed by user_id */
const fetchVendorProfiles = async (vendorIds: string[]) => {
  if (!vendorIds.length) return {};
  const { data } = await supabase
    .from("profiles")
    .select("user_id, full_name, store_name")
    .in("user_id", vendorIds);
  const map: Record<string, { full_name: string | null; store_name: string | null }> = {};
  (data ?? []).forEach((p) => { map[p.user_id] = p; });
  return map;
};

// ── Vendor: fetch their own products ──────────────────────────────────────
export const useVendorProducts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vendor-products", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });
};

// ── Public: fetch all active products with vendor info ────────────────────
export const usePublicProducts = (category?: string, search?: string) => {
  return useQuery({
    queryKey: ["public-products", category, search],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const products = (data ?? []) as Product[];
      const vendorIds = [...new Set(products.map((p) => p.vendor_id))];
      const profileMap = await fetchVendorProfiles(vendorIds);

      return products.map((p) => ({
        ...p,
        vendor_name: profileMap[p.vendor_id]?.full_name ?? null,
        vendor_store_name: profileMap[p.vendor_id]?.store_name ?? null,
      }));
    },
  });
};

// ── Public: fetch single product ──────────────────────────────────────────
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      const product = data as Product;
      const profileMap = await fetchVendorProfiles([product.vendor_id]);
      return {
        ...product,
        vendor_name: profileMap[product.vendor_id]?.full_name ?? null,
        vendor_store_name: profileMap[product.vendor_id]?.store_name ?? null,
      } as Product;
    },
    enabled: !!id,
  });
};

// ── Mutations ─────────────────────────────────────────────────────────────
export const useCreateProduct = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase.from("products").insert({
        ...data,
        vendor_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-products"] });
      toast({ title: "Product created", description: "Your product is now live." });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const { error } = await supabase.from("products").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-products"] });
      qc.invalidateQueries({ queryKey: ["public-products"] });
      toast({ title: "Product updated" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-products"] });
      qc.invalidateQueries({ queryKey: ["public-products"] });
      toast({ title: "Product deleted" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};

// ── Image upload ──────────────────────────────────────────────────────────
export const uploadProductImage = async (
  file: File,
  vendorId: string
): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
};
