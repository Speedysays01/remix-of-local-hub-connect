
-- 1. Drop and recreate product INSERT policy: suspended vendors cannot add products
DROP POLICY IF EXISTS "Vendors can insert their own products" ON public.products;
CREATE POLICY "Vendors can insert their own products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = vendor_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.is_active = true
  )
);

-- 2. Drop and recreate product UPDATE policy: suspended vendors cannot edit products
DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;
CREATE POLICY "Vendors can update their own products"
ON public.products FOR UPDATE
TO authenticated
USING (
  auth.uid() = vendor_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.is_active = true
  )
);

-- 3. Drop and recreate vendor order status update policy: suspended vendors cannot process orders
DROP POLICY IF EXISTS "Vendors can update status of their orders" ON public.orders;
CREATE POLICY "Vendors can update status of their orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = vendor_id AND
  status = ANY (ARRAY['pending'::order_status, 'accepted'::order_status]) AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.is_active = true
  )
)
WITH CHECK (
  auth.uid() = vendor_id AND
  status = ANY (ARRAY['accepted'::order_status, 'ready_for_pickup'::order_status, 'cancelled'::order_status]) AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.is_active = true
  )
);

-- 4. Ensure public product SELECT policy already filters suspended vendors (re-create to be safe)
DROP POLICY IF EXISTS "Public can view active products from active vendors" ON public.products;
CREATE POLICY "Public can view active products from active vendors"
ON public.products FOR SELECT
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = products.vendor_id AND profiles.is_active = true
  )
);
