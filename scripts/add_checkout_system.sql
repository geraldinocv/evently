-- Creating checkout requests table for organizers to request payouts
CREATE TABLE IF NOT EXISTS public.checkout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id INTEGER REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adding RLS policies for checkout requests
ALTER TABLE public.checkout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view their own checkout requests" ON public.checkout_requests
  FOR SELECT USING (organizer_id = (SELECT id FROM public.profiles WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Organizers can create checkout requests" ON public.checkout_requests
  FOR INSERT WITH CHECK (organizer_id = (SELECT id FROM public.profiles WHERE email = auth.jwt() ->> 'email'));

-- Creating function to calculate organizer earnings
CREATE OR REPLACE FUNCTION get_organizer_earnings(organizer_id_param INTEGER)
RETURNS TABLE (
  total_earnings NUMERIC,
  pending_earnings NUMERIC,
  total_tickets_sold INTEGER,
  events_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(t.total_price), 0) as total_earnings,
    COALESCE(SUM(CASE WHEN t.payment_status = 'completed' THEN t.total_price ELSE 0 END), 0) as pending_earnings,
    COALESCE(SUM(t.quantity), 0)::INTEGER as total_tickets_sold,
    COUNT(DISTINCT e.id)::INTEGER as events_count
  FROM public.events e
  LEFT JOIN public.tickets t ON e.id = t.event_id
  WHERE e.organizer_id = organizer_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creating indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkout_requests_organizer_id ON public.checkout_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_checkout_requests_status ON public.checkout_requests(status);
