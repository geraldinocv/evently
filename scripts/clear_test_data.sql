-- Script para limpar todos os dados de teste
-- Execute este script para remover eventos, tickets e dados relacionados

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = replica;

-- Limpar tickets primeiro (devido às chaves estrangeiras)
DELETE FROM tickets;

-- Limpar eventos
DELETE FROM events;

-- Limpar perfis de usuários (opcional - descomente se quiser limpar usuários também)
-- DELETE FROM profiles;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = DEFAULT;

-- Resetar sequências para começar do ID 1 novamente
ALTER SEQUENCE events_id_seq RESTART WITH 1;
ALTER SEQUENCE tickets_id_seq RESTART WITH 1;

-- Verificar se os dados foram removidos
SELECT 'Events count:' as table_name, COUNT(*) as count FROM events
UNION ALL
SELECT 'Tickets count:' as table_name, COUNT(*) as count FROM tickets
UNION ALL
SELECT 'Profiles count:' as table_name, COUNT(*) as count FROM profiles;
