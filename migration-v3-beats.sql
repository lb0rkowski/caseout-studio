-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS beats (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  bpm INTEGER DEFAULT 140,
  key TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  price INTEGER NOT NULL DEFAULT 200,
  audio_url TEXT NOT NULL,
  cover_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'hidden'))
);

ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read beats" ON beats FOR SELECT TO anon USING (true);
CREATE POLICY "Service full beats" ON beats FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Demo beats
INSERT INTO beats (title, bpm, key, tags, price, audio_url, status) VALUES
  ('Midnight Drill', 140, 'Cm', 'drill,dark,808', 299, '', 'active'),
  ('Neon Trap', 150, 'Fm', 'trap,melodic,piano', 199, '', 'active'),
  ('Warsaw Phonk', 130, 'Am', 'phonk,drift,aggressive', 249, '', 'active');
