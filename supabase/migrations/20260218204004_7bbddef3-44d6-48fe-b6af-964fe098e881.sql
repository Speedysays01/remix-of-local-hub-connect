
-- Migration 2: Delivery partner RLS policies + tightened vendor update policy

-- Delivery partners: SELECT orders that are ready or in-flight
CREATE POLICY "Delivery partners can view pickup-ready and in-flight orders"
  ON public.orders FOR SELECT
  USING (
    status IN ('ready_for_pickup', 'picked_up', 'delivered')
    AND public.has_role(auth.uid(), 'delivery')
  );

-- Delivery partners: UPDATE only allowed transitions
CREATE POLICY "Delivery partners can update delivery status"
  ON public.orders FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'delivery')
    AND status IN ('ready_for_pickup', 'picked_up')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'delivery')
    AND status IN ('picked_up', 'delivered')
  );

-- Restrict vendors: can only update while order is still pre-pickup
DROP POLICY IF EXISTS "Vendors can update status of their orders" ON public.orders;

CREATE POLICY "Vendors can update status of their orders"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = vendor_id
    AND status IN ('pending', 'accepted')
  )
  WITH CHECK (
    auth.uid() = vendor_id
    AND status IN ('accepted', 'ready_for_pickup', 'cancelled')
  );
