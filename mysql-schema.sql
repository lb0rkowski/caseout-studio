-- CASEOUT STUDIO — MySQL Schema
-- Wklej w phpMyAdmin → SQL → Wykonaj

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  date DATE NOT NULL,
  hour INT NOT NULL,
  duration INT NOT NULL DEFAULT 2,
  type VARCHAR(50) NOT NULL DEFAULT 'recording',
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  notes TEXT,
  status ENUM('confirmed','cancelled','pending') NOT NULL DEFAULT 'confirmed',
  INDEX idx_date (date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO bookings (date, hour, duration, type, name, email, phone, notes, status) VALUES
  ('2026-03-03', 14, 4, 'recording', 'Marek Nowak', 'marek@test.pl', '+48 600 100 200', 'Sesja wokalna, 3 tracki', 'confirmed'),
  ('2026-03-05', 10, 8, 'mix', 'Anna Wiśniewska', 'anna@test.pl', '+48 600 300 400', 'Mix albumu', 'confirmed'),
  ('2026-03-10', 16, 2, 'consult', 'Piotr Zieliński', 'piotr@test.pl', '+48 600 500 600', '', 'confirmed');
