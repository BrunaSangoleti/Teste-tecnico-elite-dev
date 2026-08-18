-- Habilita o mapa de assentos para o evento de teste
UPDATE events
SET seat_map_enabled = true
WHERE id = '55555555-5555-5555-5555-555555555555';

-- Insere 12 assentos para 'Camarote' (Filas A, B, C; 4 por fila)
INSERT INTO seats (event_id, sector, seat_row, seat_number, status)
SELECT 
    '55555555-5555-5555-5555-555555555555',
    'Camarote',
    chr(64 + r),
    n,
    'AVAILABLE'
FROM generate_series(1, 3) AS r(r)
CROSS JOIN generate_series(1, 4) AS n(n);

-- Insere 12 assentos para 'Camarote Premium VIP' (Filas D, E, F; 4 por fila)
INSERT INTO seats (event_id, sector, seat_row, seat_number, status)
SELECT 
    '55555555-5555-5555-5555-555555555555',
    'Camarote Premium VIP',
    chr(67 + r),
    n,
    'AVAILABLE'
FROM generate_series(1, 3) AS r(r)
CROSS JOIN generate_series(1, 4) AS n(n);
