-- Dados de teste exigidos pelo desafio. Senha para TODOS os usuários abaixo: senha123
-- Hash BCrypt de "senha123" (custo 10). Gere o seu próprio com o BCryptPasswordEncoder se preferir trocar.
-- Ver README para instruções de como gerar um novo hash.

INSERT INTO users (id, name, email, password_hash, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Ana Organizadora', 'organizador@evtx.com', '$2b$10$LuQa5L1FmGe5hVFuU9v2O./GXGUp4LDNJtS.E4cpmA8nKOneWSCyi', 'ORGANIZADOR'),
    ('22222222-2222-2222-2222-222222222222', 'Bruno Cliente', 'cliente1@evtx.com', '$2b$10$LuQa5L1FmGe5hVFuU9v2O./GXGUp4LDNJtS.E4cpmA8nKOneWSCyi', 'CLIENTE'),
    ('33333333-3333-3333-3333-333333333333', 'Carla Cliente', 'cliente2@evtx.com', '$2b$10$LuQa5L1FmGe5hVFuU9v2O./GXGUp4LDNJtS.E4cpmA8nKOneWSCyi', 'CLIENTE'),
    ('44444444-4444-4444-4444-444444444444', 'Diego Portaria', 'portaria@evtx.com', '$2b$10$LuQa5L1FmGe5hVFuU9v2O./GXGUp4LDNJtS.E4cpmA8nKOneWSCyi', 'PORTARIA');

-- Evento no modo PISTA (quantidade), pronto pra reservar sem depender de seed de assentos
INSERT INTO events (id, title, description, external_source, venue_name, venue_address, event_date, capacity, sold_count, price, seat_map_enabled, organizer_id, status)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Show Bandas Indie - Edição Verão',
    'Evento de teste semeado para avaliação do desafio.',
    'MANUAL',
    'Arena Central',
    'Av. Principal, 1000 - São Paulo/SP',
    now() + interval '30 days',
    200,
    0,
    150.00,
    false,
    '11111111-1111-1111-1111-111111111111',
    'PUBLISHED'
);

-- Evento no modo MAPA DE ASSENTOS (cinema/teatro), com alguns assentos semeados
INSERT INTO events (id, title, description, external_source, venue_name, venue_address, event_date, capacity, sold_count, price, seat_map_enabled, organizer_id, status)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    'Peça de Teatro - Sessão Única',
    'Evento de teste semeado com mapa de assentos.',
    'MANUAL',
    'Teatro Municipal',
    'Rua das Artes, 200 - São Paulo/SP',
    now() + interval '20 days',
    20,
    0,
    80.00,
    true,
    '11111111-1111-1111-1111-111111111111',
    'PUBLISHED'
);

-- 20 assentos (4 fileiras x 5 poltronas) para o evento acima
INSERT INTO seats (event_id, seat_row, seat_number, sector, status)
SELECT '66666666-6666-6666-6666-666666666666', r.row, n.num, 'PLATEIA', 'AVAILABLE'
FROM (VALUES ('A'), ('B'), ('C'), ('D')) AS r(row)
CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS n(num);
