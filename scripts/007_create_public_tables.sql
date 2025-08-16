-- Criar tabelas principais no schema public para visibilidade no Neon Console

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public.evently_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(50) DEFAULT 'customer',
    role VARCHAR(50) DEFAULT 'user',
    approval_status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER,
    approved_at TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS public.evently_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    currency VARCHAR(3) DEFAULT 'EUR',
    created_by INTEGER REFERENCES public.evently_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de bilhetes
CREATE TABLE IF NOT EXISTS public.evently_ticket_types (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES public.evently_events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    quantity INTEGER NOT NULL,
    sold INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de bilhetes
CREATE TABLE IF NOT EXISTS public.evently_tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES public.evently_events(id) ON DELETE CASCADE,
    ticket_type_id INTEGER REFERENCES public.evently_ticket_types(id) ON DELETE CASCADE,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20),
    unique_link VARCHAR(255) UNIQUE NOT NULL,
    qr_code TEXT,
    status VARCHAR(50) DEFAULT 'active',
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de RPs (Representantes)
CREATE TABLE IF NOT EXISTS public.evently_rps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.evently_users(id) ON DELETE CASCADE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_sales DECIMAL(10,2) DEFAULT 0.00,
    total_commission DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas dos RPs
CREATE TABLE IF NOT EXISTS public.evently_sales (
    id SERIAL PRIMARY KEY,
    rp_id INTEGER REFERENCES public.evently_rps(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES public.evently_events(id) ON DELETE CASCADE,
    ticket_id INTEGER REFERENCES public.evently_tickets(id) ON DELETE CASCADE,
    sale_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS public.evently_transactions (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES public.evently_tickets(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_evently_users_email ON public.evently_users(email);
CREATE INDEX IF NOT EXISTS idx_evently_events_date ON public.evently_events(date);
CREATE INDEX IF NOT EXISTS idx_evently_tickets_event ON public.evently_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_evently_tickets_unique_link ON public.evently_tickets(unique_link);
CREATE INDEX IF NOT EXISTS idx_evently_sales_rp ON public.evently_sales(rp_id);

-- Inserir dados de exemplo
INSERT INTO public.evently_users (email, password_hash, name, user_type, role, approval_status, email_verified) VALUES
('admin@evently.com', '$2b$10$example', 'Admin Evently', 'admin', 'admin', 'approved', true),
('rp@evently.com', '$2b$10$example', 'RP Exemplo', 'rp', 'user', 'approved', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.evently_events (title, description, date, location, currency, created_by) VALUES
('Concerto de Verão', 'Um concerto incrível ao ar livre', '2024-07-15 20:00:00', 'Parque da Cidade', 'EUR', 1),
('Festival de Música', 'Festival com vários artistas', '2024-08-20 18:00:00', 'Centro de Convenções', 'EUR', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.evently_ticket_types (event_id, name, price, currency, quantity) VALUES
(1, 'Geral', 25.00, 'EUR', 500),
(1, 'VIP', 50.00, 'EUR', 100),
(2, 'Passe Diário', 35.00, 'EUR', 300),
(2, 'Passe Completo', 80.00, 'EUR', 150)
ON CONFLICT DO NOTHING;
