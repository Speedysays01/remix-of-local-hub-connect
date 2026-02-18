
-- Add store_name to profiles for vendor branding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_name text;

-- Create products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  images text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own products (all statuses)
CREATE POLICY "Vendors can view their own products"
  ON public.products FOR SELECT
  USING (auth.uid() = vendor_id);

-- Anyone (authenticated or anon) can view active products from any vendor
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Vendors can insert their own products
CREATE POLICY "Vendors can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

-- Vendors can update their own products
CREATE POLICY "Vendors can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = vendor_id);

-- Vendors can delete their own products
CREATE POLICY "Vendors can delete their own products"
  ON public.products FOR DELETE
  USING (auth.uid() = vendor_id);

-- Auto-update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Allow public to read vendor profile info (store name) for product listings
CREATE POLICY "Vendor profiles are publicly readable"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (public.has_role(user_id, 'vendor'));

-- Create product-images storage bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Vendors can upload to their own folder
CREATE POLICY "Vendors can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Vendors can update/delete their own images
CREATE POLICY "Vendors can manage their product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Vendors can delete their product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view product images (bucket is public)
CREATE POLICY "Product images are publicly viewable"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'product-images');
