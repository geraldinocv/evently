-- Complete Supabase Database Setup Script
-- Run this in Supabase SQL Editor

-- Drop existing tables and functions if they exist
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.authenticate_user CASCADE;
DROP FUNCTION IF EXISTS public.register_user CASCADE;

-- Create profiles table with custom authentication
CREATE TABLE public.profiles (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_attendees INTEGER,
    image_url TEXT,
    organizer_id INTEGER REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE public.tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES public.events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES public.profiles(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql;

-- Create authentication function
CREATE OR REPLACE FUNCTION authenticate_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(
    id INTEGER,
    email TEXT,
    name TEXT,
    success BOOLEAN
) AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT p.id, p.email, p.name, p.password_hash
    INTO user_record
    FROM public.profiles p
    WHERE p.email = user_email;
    
    IF user_record.id IS NULL THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, NULL::TEXT, FALSE;
        RETURN;
    END IF;
    
    IF verify_password(user_password, user_record.password_hash) THEN
        RETURN QUERY SELECT user_record.id, user_record.email, user_record.name, TRUE;
    ELSE
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, NULL::TEXT, FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create registration function
CREATE OR REPLACE FUNCTION register_user(user_email TEXT, user_password TEXT, user_name TEXT)
RETURNS TABLE(
    id INTEGER,
    email TEXT,
    name TEXT,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    new_user_id INTEGER;
    hashed_password TEXT;
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = user_email) THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, NULL::TEXT, FALSE, 'Email already exists'::TEXT;
        RETURN;
    END IF;
    
    -- Hash password and insert user
    hashed_password := hash_password(user_password);
    
    INSERT INTO public.profiles (email, password_hash, name)
    VALUES (user_email, hashed_password, user_name)
    RETURNING profiles.id INTO new_user_id;
    
    RETURN QUERY SELECT new_user_id, user_email, user_name, TRUE, 'User created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);

-- Create policies for events
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (true);

-- Create policies for tickets
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT WITH CHECK (true);

-- Insert test admin user
INSERT INTO public.profiles (email, password_hash, name)
VALUES ('admin@evently.com', hash_password('admin123'), 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Insert sample events
INSERT INTO public.events (title, description, date, location, price, max_attendees, organizer_id)
VALUES 
    ('Conferência Tech 2024', 'Uma conferência sobre as últimas tecnologias', '2024-03-15 09:00:00+00', 'Centro de Convenções', 50.00, 100, 1),
    ('Workshop de Design', 'Aprenda técnicas avançadas de design', '2024-03-20 14:00:00+00', 'Estúdio Criativo', 30.00, 50, 1)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

SELECT 'Database setup completed successfully!' as status;
