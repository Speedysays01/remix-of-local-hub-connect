
-- ── 1. Vendor suspension flag on profiles ─────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ── 2. Admin: read all profiles ───────────────────────────────────────────
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ── 3. Admin: update any profile (e.g. toggle is_active) ─────────────────
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ── 4. Admin: read all orders ─────────────────────────────────────────────
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ── 5. Admin: read all order_items ───────────────────────────────────────
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ── 6. Admin: read all user_roles ────────────────────────────────────────
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ── 7. Tighten public product visibility: hide suspended vendors' products ─
-- Drop the old permissive policy and replace with a guarded one
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

CREATE POLICY "Public can view active products from active vendors"
  ON public.products FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = products.vendor_id
        AND profiles.is_active = true
    )
  );
