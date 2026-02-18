
-- Migration 1: Add new enum values (must commit before using in policies)
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'picked_up';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'delivered';
