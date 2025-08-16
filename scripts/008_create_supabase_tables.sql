-- Create Evently platform tables in Supabase
-- This script creates all necessary tables for the Evently platform

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  currency TEXT NOT NULL DEFAULT 'EUR',
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket types table
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  quantity INTEGER NOT NULL,
  sold INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  qr_code TEXT NOT NULL UNIQUE,
  unique_link TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPs (Representatives) table
CREATE TABLE IF NOT EXISTS rps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RP Event Assignments table
CREATE TABLE IF NOT EXISTS rp_event_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rp_id UUID REFERENCES rps(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rp_id, event_id)
);

-- Sales table (for RP sales tracking)
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rp_id UUID REFERENCES rps(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_ids UUID[] NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_unique_link ON tickets(unique_link);
CREATE INDEX IF NOT EXISTS idx_rps_user_id ON rps(user_id);
CREATE INDEX IF NOT EXISTS idx_rps_email ON rps(email);
CREATE INDEX IF NOT EXISTS idx_sales_rp_id ON sales(rp_id);
CREATE INDEX IF NOT EXISTS idx_sales_event_id ON sales(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON transactions(event_id);

-- Insert sample data
INSERT INTO events (id, title, description, date, location, currency, organizer_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Tech Conference 2024', 'Annual technology conference featuring the latest innovations', '2024-06-15 09:00:00+00', 'Convention Center, Lisbon', 'EUR', (SELECT id FROM auth.users LIMIT 1)),
  ('550e8400-e29b-41d4-a716-446655440002', 'Music Festival Summer', 'Three-day music festival with international artists', '2024-07-20 18:00:00+00', 'Festival Grounds, Porto', 'EUR', (SELECT id FROM auth.users LIMIT 1)),
  ('550e8400-e29b-41d4-a716-446655440003', 'Business Summit', 'Networking event for entrepreneurs and business leaders', '2024-05-10 10:00:00+00', 'Business Center, Faro', 'CVE', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Insert sample ticket types
INSERT INTO ticket_types (event_id, name, price, currency, quantity) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Early Bird', 99.99, 'EUR', 100),
  ('550e8400-e29b-41d4-a716-446655440001', 'Regular', 149.99, 'EUR', 200),
  ('550e8400-e29b-41d4-a716-446655440001', 'VIP', 299.99, 'EUR', 50),
  ('550e8400-e29b-41d4-a716-446655440002', 'General Admission', 75.00, 'EUR', 500),
  ('550e8400-e29b-41d4-a716-446655440002', 'VIP Pass', 200.00, 'EUR', 100),
  ('550e8400-e29b-41d4-a716-446655440003', 'Standard', 5000.00, 'CVE', 150),
  ('550e8400-e29b-41d4-a716-446655440003', 'Premium', 8000.00, 'CVE', 75)
ON CONFLICT DO NOTHING;
