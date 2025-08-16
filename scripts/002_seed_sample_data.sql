-- Insert sample data for testing
INSERT INTO evently.users (id, email, name, user_type, phone) VALUES
('org1', 'organizer@evently.com', 'João Silva', 'organizer', '+351912345678'),
('rp1', 'rp1@evently.com', 'Maria Santos', 'rp', '+351987654321'),
('rp2', 'rp2@evently.com', 'Pedro Costa', 'rp', '+351923456789')
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO evently.events (id, title, description, date, location, category, organizer_id) VALUES
('event1', 'Festival de Verão 2025', 'O maior festival de música do verão português', '2025-12-15 20:00:00+00', 'Parque da Cidade, Porto', 'Música', 'org1'),
('event2', 'Conferência Tech Lisboa', 'Conferência sobre as últimas tendências em tecnologia', '2025-11-20 09:00:00+00', 'Centro de Congressos de Lisboa', 'Tecnologia', 'org1')
ON CONFLICT (id) DO NOTHING;

-- Insert ticket types
INSERT INTO evently.ticket_types (event_id, name, price, quantity) VALUES
('event1', 'Geral', 45.00, 1000),
('event1', 'VIP', 85.00, 200),
('event2', 'Early Bird', 120.00, 150),
('event2', 'Regular', 180.00, 300);

-- Insert sample RPs
INSERT INTO evently.rps (id, user_id, organizer_id, commission_rate) VALUES
('rp_001', 'rp1', 'org1', 15.00),
('rp_002', 'rp2', 'org1', 12.00)
ON CONFLICT (id) DO NOTHING;

-- Assign events to RPs
INSERT INTO evently.rp_event_assignments (rp_id, event_id) VALUES
('rp_001', 'event1'),
('rp_001', 'event2'),
('rp_002', 'event1')
ON CONFLICT (rp_id, event_id) DO NOTHING;
