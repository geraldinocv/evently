-- Criar tabela para rastrear notificações
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id),
  type VARCHAR(20) NOT NULL, -- 'sms', 'email', 'push'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campo phone na tabela profiles se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Inserir dados de exemplo
INSERT INTO notifications (user_id, type, title, message, metadata) VALUES
((SELECT user_id FROM profiles LIMIT 1), 'sms', 'Teste SMS', 'Mensagem de teste', '{"test": true}');
