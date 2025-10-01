-- Insert sample events (only if table is empty)
INSERT INTO events (title, description, date, location, price, max_attendees, image_url)
SELECT 
  'Festival de Música de Verão',
  'Um incrível festival de música com artistas locais e internacionais',
  NOW() + INTERVAL '30 days',
  'Praia de Santa Maria, Sal',
  2500.00,
  500,
  '/placeholder.svg?height=400&width=600'
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);

INSERT INTO events (title, description, date, location, price, max_attendees, image_url)
SELECT 
  'Conferência de Tecnologia CV',
  'Conferência sobre inovação e tecnologia em Cabo Verde',
  NOW() + INTERVAL '45 days',
  'Praia, Santiago',
  1500.00,
  200,
  '/placeholder.svg?height=400&width=600'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Conferência de Tecnologia CV');

INSERT INTO events (title, description, date, location, price, max_attendees, image_url)
SELECT 
  'Noite de Stand-up Comedy',
  'Uma noite de risos com comediantes cabo-verdianos',
  NOW() + INTERVAL '15 days',
  'Mindelo, São Vicente',
  800.00,
  150,
  '/placeholder.svg?height=400&width=600'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Noite de Stand-up Comedy');
