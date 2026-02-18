
-- ── cart_items ─────────────────────────────────────────────────────────────
CREATE TABLE public.cart_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL,
  product_id     uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id      uuid NOT NULL,
  quantity       integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at     timestamp with time zone NOT NULL DEFAULT now(),
  updated_at     timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── orders ─────────────────────────────────────────────────────────────────
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'accepted',
  'ready_for_pickup',
  'cancelled'
);

CREATE TABLE public.orders (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL,
  vendor_id             uuid NOT NULL,
  status                public.order_status NOT NULL DEFAULT 'pending',
  total_amount          numeric NOT NULL CHECK (total_amount >= 0),
  delivery_address      text NOT NULL,
  vendor_address_snapshot text,
  created_at            timestamp with time zone NOT NULL DEFAULT now(),
  updated_at            timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can view orders for their store"
  ON public.orders FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update status of their orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = vendor_id);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── order_items ────────────────────────────────────────────────────────────
CREATE TABLE public.order_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      uuid NOT NULL REFERENCES public.products(id),
  product_name    text NOT NULL,
  product_price   numeric NOT NULL,
  quantity        integer NOT NULL CHECK (quantity > 0),
  created_at      timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of their own orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items into their own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view items of their orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.vendor_id = auth.uid()
    )
  );
