
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pickup_address_line text,
  ADD COLUMN IF NOT EXISTS city               text,
  ADD COLUMN IF NOT EXISTS state              text,
  ADD COLUMN IF NOT EXISTS zip_code           text;
