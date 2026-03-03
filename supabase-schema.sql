-- CASEOUT STUDIO — Supabase Schema
-- Supabase Dashboard → SQL Editor → New Query → wklej → Run

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  duration INTEGER NOT NULL DEFAULT 2 CHECK (duration > 0 AND duration <= 12),
  type TEXT NOT NULL DEFAULT 'recording',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  order_number TEXT,
  package_id TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Każdy może dodać rezerwację i czytać (kalendarz)
CREATE POLICY "Anyone can insert bookings" ON bookings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read bookings" ON bookings FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT TO anon WITH CHECK (true);

-- Service role (admin API) ma pełny dostęp
CREATE POLICY "Service full bookings" ON bookings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service full messages" ON messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Demo data
INSERT INTO bookings (date, hour, duration, type, name, email, phone, notes, status) VALUES
  ('2026-03-03', 14, 4, 'recording', 'Marek Nowak', 'marek@test.pl', '+48 600 100 200', 'Sesja wokalna, 3 tracki', 'confirmed'),
  ('2026-03-05', 10, 8, 'mix', 'Anna Wiśniewska', 'anna@test.pl', '+48 600 300 400', 'Mix albumu', 'confirmed'),
  ('2026-03-10', 16, 2, 'consult', 'Piotr Zieliński', 'piotr@test.pl', '+48 600 500 600', '', 'confirmed');
