-- =====================================================
-- SCRIPT PARA RECRIAR COMPLETAMENTE A BASE DE DADOS
-- =====================================================

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ticket_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rp_event_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rps DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Event organizers can update their events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view ticket types" ON public.ticket_types;
DROP POLICY IF EXISTS "Event organizers can manage ticket types" ON public.ticket_types;
DROP POLICY IF EXISTS "Anyone can view tickets" ON public.tickets;
DROP POLICY IF EXISTS "Authenticated users can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON public.transactions;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Limpar todas as tabelas (manter estrutura)
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.tickets CASCADE;
TRUNCATE TABLE public.ticket_types CASCADE;
TRUNCATE TABLE public.sales CASCADE;
TRUNCATE TABLE public.rp_event_assignments CASCADE;
TRUNCATE TABLE public.rps CASCADE;
TRUNCATE TABLE public.events CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- =====================================================
-- RECRIAR FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, name, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rp_event_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - PROFILES
-- =====================================================

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - EVENTS
-- =====================================================

CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Event organizers can update their events" ON public.events
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Event organizers can delete their events" ON public.events
  FOR DELETE USING (auth.uid() = organizer_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - TICKET TYPES
-- =====================================================

CREATE POLICY "Anyone can view ticket types" ON public.ticket_types
  FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage ticket types" ON public.ticket_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = ticket_types.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - TICKETS
-- =====================================================

CREATE POLICY "Anyone can view tickets" ON public.tickets
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - TRANSACTIONS
-- =====================================================

CREATE POLICY "Anyone can view transactions" ON public.transactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - RPS
-- =====================================================

CREATE POLICY "Users can view own RP profile" ON public.rps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own RP profile" ON public.rps
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - RP EVENT ASSIGNMENTS
-- =====================================================

CREATE POLICY "RPs can view their assignments" ON public.rp_event_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rps 
      WHERE rps.id = rp_event_assignments.rp_id 
      AND rps.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - SALES
-- =====================================================

CREATE POLICY "RPs can view their sales" ON public.sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rps 
      WHERE rps.id = sales.rp_id 
      AND rps.user_id = auth.uid()
    )
  );

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public.ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type_id ON public.tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON public.transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_rps_user_id ON public.rps(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_rp_id ON public.sales(rp_id);
CREATE INDEX IF NOT EXISTS idx_sales_event_id ON public.sales(event_id);

-- =====================================================
-- RESETAR SEQUÊNCIAS
-- =====================================================

-- As tabelas usam UUID, então não há sequências para resetar

-- =====================================================
-- VERIFICAR CONFIGURAÇÃO
-- =====================================================

SELECT 'Database recreated successfully!' as status;

-- Verificar tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
