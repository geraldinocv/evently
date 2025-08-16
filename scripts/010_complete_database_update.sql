-- Script completo para atualizar a database Supabase com todas as funcionalidades da plataforma Evently

-- 1. Criar tabela de empresas para promotores
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  nif VARCHAR(50) NOT NULL UNIQUE,
  bank_account VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Atualizar tabela de eventos para incluir company_id e currency
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';

-- 3. Atualizar tabela de ticket_types para incluir currency
ALTER TABLE ticket_types 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';

-- 4. Atualizar tabela de tickets para incluir unique_link
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS unique_link VARCHAR(255) UNIQUE;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_events_company_id ON events(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_unique_link ON tickets(unique_link);

-- 6. Atualizar políticas RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política para promotores verem apenas suas próprias empresas
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (auth.uid() = user_id);

-- Política para promotores criarem suas próprias empresas
CREATE POLICY "Users can create own company" ON companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para promotores atualizarem suas próprias empresas
CREATE POLICY "Users can update own company" ON companies
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para admins verem todas as empresas
CREATE POLICY "Admins can view all companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 7. Função para gerar unique_link automaticamente
CREATE OR REPLACE FUNCTION generate_unique_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_link IS NULL THEN
    NEW.unique_link := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para gerar unique_link automaticamente
DROP TRIGGER IF EXISTS trigger_generate_unique_link ON tickets;
CREATE TRIGGER trigger_generate_unique_link
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_unique_link();

-- 9. Inserir dados de exemplo para teste
INSERT INTO companies (user_id, company_name, nif, bank_account, contact_email, status) 
VALUES 
  ((SELECT id FROM auth.users LIMIT 1), 'Evently Eventos Lda', '123456789', 'PT50 0000 0000 0000 0000 0000 00', 'contato@evently.cv', 'approved')
ON CONFLICT (nif) DO NOTHING;

-- 10. Atualizar eventos existentes com moeda padrão
UPDATE events SET currency = 'CVE' WHERE currency IS NULL;
UPDATE ticket_types SET currency = 'CVE' WHERE currency IS NULL;

-- 11. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Aplicar trigger de updated_at nas tabelas necessárias
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Confirmar que o script foi executado com sucesso
SELECT 'Database atualizada com sucesso! Todas as funcionalidades da plataforma Evently foram implementadas.' AS status;
