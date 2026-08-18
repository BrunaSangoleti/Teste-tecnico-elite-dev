-- Insere um evento de teste publicado
INSERT INTO events (id, title, description, external_source, venue_name, venue_address, event_date, capacity, sold_count, price, seat_map_enabled, organizer_id, status, image_url)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Festival Elite Dev',
    'Um show incrível de encerramento do desafio Elite Dev, com muito código e café.',
    'MANUAL',
    'Estádio de Testes',
    'Rua dos Desenvolvedores, 100 - Tech City',
    now() + interval '30 days',
    1000,
    0,
    150.00,
    false,
    '11111111-1111-1111-1111-111111111111', -- Ana Organizadora
    'PUBLISHED',
    'https://images.pexels.com/photos/36198798/pexels-photo-36198798.jpeg'
);
