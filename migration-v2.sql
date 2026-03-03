-- Run this in Supabase SQL Editor to add new columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_id TEXT;
CREATE INDEX IF NOT EXISTS idx_bookings_order ON bookings (order_number);
