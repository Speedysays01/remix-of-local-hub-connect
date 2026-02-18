
-- 1. Add approval_status enum
CREATE TYPE public.vendor_approval_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Add approval_status column to profiles (default pending — only relevant for vendors)
ALTER TABLE public.profiles
  ADD COLUMN approval_status public.vendor_approval_status NOT NULL DEFAULT 'pending';

-- 3. All existing vendors who already have products/are active → auto-approve them
-- (so we don't break existing data)
UPDATE public.profiles
SET approval_status = 'approved'
WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'vendor'
);

-- 4. Non-vendor profiles don't need an approval status; we'll just leave them as 'approved'
-- to keep the column consistent (customers/delivery/admin are always 'approved')
UPDATE public.profiles
SET approval_status = 'approved'
WHERE user_id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'vendor'
);

-- 5. Update the public product visibility RLS policy to also require approval_status = 'approved'
DROP POLICY IF EXISTS "Public can view active products from active vendors" ON public.products;

CREATE POLICY "Public can view active products from active vendors"
ON public.products
FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = products.vendor_id
      AND profiles.is_active = true
      AND profiles.approval_status = 'approved'
  )
);

-- 6. Vendors can only insert products if approved
DROP POLICY IF EXISTS "Vendors can insert their own products" ON public.products;

CREATE POLICY "Vendors can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  auth.uid() = vendor_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_active = true
      AND profiles.approval_status = 'approved'
  )
);

-- 7. Vendors can only update products if approved
DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;

CREATE POLICY "Vendors can update their own products"
ON public.products
FOR UPDATE
USING (
  auth.uid() = vendor_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_active = true
      AND profiles.approval_status = 'approved'
  )
)
WITH CHECK (
  auth.uid() = vendor_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_active = true
      AND profiles.approval_status = 'approved'
  )
);

-- 8. Vendors can only accept/update orders if approved
DROP POLICY IF EXISTS "Vendors can update status of their orders" ON public.orders;

CREATE POLICY "Vendors can update status of their orders"
ON public.orders
FOR UPDATE
USING (
  auth.uid() = vendor_id
  AND status = ANY (ARRAY['pending'::order_status, 'accepted'::order_status])
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_active = true
      AND profiles.approval_status = 'approved'
  )
)
WITH CHECK (
  auth.uid() = vendor_id
  AND status = ANY (ARRAY['accepted'::order_status, 'ready_for_pickup'::order_status, 'cancelled'::order_status])
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_active = true
      AND profiles.approval_status = 'approved'
  )
);

-- 9. Admins can update approval_status (already covered by "Admins can update any profile" policy)
-- No new policy needed.
