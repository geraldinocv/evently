-- Supabase Database Resync Script
-- Adds missing tables, RLS policies, and sample data

-- Create companies table for promoter business information
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    nif TEXT NOT NULL UNIQUE,
    bank_account TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rp_event_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for companies
CREATE POLICY "Users can view own company" ON public.companies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own company" ON public.companies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company" ON public.companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for events
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Organizers can manage own events" ON public.events
    FOR ALL USING (auth.uid() = organizer_id);

-- RLS Policies for tickets
CREATE POLICY "Anyone can view tickets" ON public.tickets
    FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage tickets" ON public.tickets
    FOR ALL USING (
        auth.uid() IN (
            SELECT organizer_id FROM public.events WHERE id = event_id
        )
    );

-- RLS Policies for ticket_types
CREATE POLICY "Anyone can view ticket types" ON public.ticket_types
    FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage ticket types" ON public.ticket_types
    FOR ALL USING (
        auth.uid() IN (
            SELECT organizer_id FROM public.events WHERE id = event_id
        )
    );

-- RLS Policies for RPs
CREATE POLICY "Users can view own RP profile" ON public.rps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own RP profile" ON public.rps
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for sales
CREATE POLICY "RPs can view own sales" ON public.sales
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.rps WHERE id = rp_id
        )
    );

-- RLS Policies for transactions
CREATE POLICY "Anyone can view transactions" ON public.transactions
    FOR SELECT USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_unique_link ON public.tickets(unique_link);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Insert sample data if tables are empty
INSERT INTO public.events (id, title, description, location, date, organizer_id, image_url, currency)
SELECT 
    gen_random_uuid(),
    'Conferência Tech Angola 2024',
    'A maior conferência de tecnologia de Angola com palestrantes internacionais.',
    'Centro de Convenções de Luanda',
    NOW() + INTERVAL '30 days',
    (SELECT id FROM auth.users LIMIT 1),
    '/tech-conference-presentation.png',
    'AOA'
WHERE NOT EXISTS (SELECT 1 FROM public.events);

INSERT INTO public.events (id, title, description, location, date, organizer_id, image_url, currency)
SELECT 
    gen_random_uuid(),
    'Festival de Música Kizomba',
    'Uma noite inesquecível com os melhores artistas de kizomba.',
    'Estádio da Cidadela, Luanda',
    NOW() + INTERVAL '45 days',
    (SELECT id FROM auth.users LIMIT 1),
    '/placeholder.svg?height=400&width=600',
    'AOA'
WHERE (SELECT COUNT(*) FROM public.events) < 2;

-- Add ticket types for sample events
INSERT INTO public.ticket_types (id, event_id, name, price, quantity, sold, currency)
SELECT 
    gen_random_uuid(),
    e.id,
    'Bilhete Geral',
    15000,
    500,
    0,
    'AOA'
FROM public.events e
WHERE NOT EXISTS (SELECT 1 FROM public.ticket_types WHERE event_id = e.id);

INSERT INTO public.ticket_types (id, event_id, name, price, quantity, sold, currency)
SELECT 
    gen_random_uuid(),
    e.id,
    'Bilhete VIP',
    35000,
    100,
    0,
    'AOA'
FROM public.events e
WHERE (SELECT COUNT(*) FROM public.ticket_types WHERE event_id = e.id) < 2;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
