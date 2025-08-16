-- Create Evently platform tables
CREATE SCHEMA IF NOT EXISTS evently;

-- Users table (extending the existing auth system)
CREATE TABLE IF NOT EXISTS evently.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('organizer', 'rp', 'admin')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS evently.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  organizer_id TEXT NOT NULL REFERENCES evently.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket types table
CREATE TABLE IF NOT EXISTS evently.ticket_types (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES evently.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  sold INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPs table
CREATE TABLE IF NOT EXISTS evently.rps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES evently.users(id),
  organizer_id TEXT NOT NULL REFERENCES evently.users(id),
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RP Event assignments
CREATE TABLE IF NOT EXISTS evently.rp_event_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rp_id TEXT NOT NULL REFERENCES evently.rps(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES evently.events(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rp_id, event_id)
);

-- Tickets table
CREATE TABLE IF NOT EXISTS evently.tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES evently.events(id),
  ticket_type_id TEXT NOT NULL REFERENCES evently.ticket_types(id),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  rp_id TEXT REFERENCES evently.rps(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table (for RP sales tracking)
CREATE TABLE IF NOT EXISTS evently.sales (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rp_id TEXT NOT NULL REFERENCES evently.rps(id),
  event_id TEXT NOT NULL REFERENCES evently.events(id),
  ticket_type_id TEXT NOT NULL REFERENCES evently.ticket_types(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS evently.transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id TEXT REFERENCES evently.tickets(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer ON evently.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON evently.events(date);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON evently.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON evently.tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_rps_organizer ON evently.rps(organizer_id);
CREATE INDEX IF NOT EXISTS idx_sales_rp ON evently.sales(rp_id);
CREATE INDEX IF NOT EXISTS idx_sales_event ON evently.sales(event_id);
