-- =============================================
-- Shatha Glow Store — Supabase Schema
-- شغّل هاي الأوامر في Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    description  TEXT,
    price        NUMERIC(10,2) NOT NULL DEFAULT 0,
    image_url    TEXT,
    category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    stock        INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id            SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone         TEXT NOT NULL,
    city          TEXT,
    address       TEXT NOT NULL,
    items         JSONB NOT NULL DEFAULT '[]',
    total         NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes         TEXT,
    status        TEXT DEFAULT 'pending',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
);

-- كلمة مرور الأدمن الافتراضية (غيّرها من لوحة التحكم)
INSERT INTO settings (key, value) VALUES
    ('admin_password', 'shatha2025'),
    ('admin_token',    '')
ON CONFLICT (key) DO NOTHING;
