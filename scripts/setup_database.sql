-- Database Setup Script for Evently Platform
-- This script sets up the necessary tables, policies, and test data

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rp_event_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Public can view ticket types" ON ticket_types;
DROP POLICY IF EXISTS "Event organizers can manage ticket types" ON ticket_types;
DROP POLICY IF EXISTS "Public can view tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for events
CREATE POLICY "Public can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Create RLS policies for ticket_types
CREATE POLICY "Public can view ticket types" ON ticket_types
  FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage ticket types" ON ticket_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = ticket_types.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- Create RLS policies for tickets
CREATE POLICY "Public can view tickets" ON tickets
  FOR SELECT USING (true);

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() IS NULL);

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (buyer_email = auth.email() OR auth.role() = 'service_role');

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() IS NULL);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, name, created_at, updated_at)
  VALUES (gen_random_uuid(), new.id, new.raw_user_meta_data->>'name', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert test users (these will be created in auth.users via Supabase Auth)
-- You need to register these users through the application first

-- Insert sample events (only after you have registered users)
INSERT INTO events (id, title, description, location, date, organizer_id, image_url, currency, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Conferência Tech 2024', 'Uma conferência sobre as últimas tecnologias', 'Praia, Cabo Verde', '2024-03-15 09:00:00+00', 
   (SELECT user_id FROM profiles LIMIT 1), 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', 'CVE', now(), now()),
  (gen_random_uuid(), 'Workshop de Programação', 'Aprenda a programar do zero', 'Mindelo, Cabo Verde', '2024-03-20 14:00:00+00', 
   (SELECT user_id FROM profiles LIMIT 1), 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8', 'CVE', now(), now())
ON CONFLICT DO NOTHING;

-- Insert sample ticket types for the events
INSERT INTO ticket_types (id, event_id, name, price, quantity, sold, currency, created_at)
SELECT 
  gen_random_uuid(),
  e.id,
  'Bilhete Geral',
  2500,
  100,
  0,
  'CVE',
  now()
FROM events e
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (id, event_id, name, price, quantity, sold, currency, created_at)
SELECT 
  gen_random_uuid(),
  e.id,
  'Bilhete VIP',
  5000,
  50,
  0,
  'CVE',
  now()
FROM events e
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type_id ON tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_email ON transactions(buyer_email);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
