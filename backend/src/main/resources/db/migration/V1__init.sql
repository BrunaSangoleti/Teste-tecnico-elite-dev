-- Extensão para geração de UUID no Postgres
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('ORGANIZADOR','CLIENTE','PORTARIA')),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    external_ref_id   VARCHAR(100),
    external_source   VARCHAR(20) NOT NULL CHECK (external_source IN ('TICKETMASTER','MANUAL')),
    venue_name        VARCHAR(200) NOT NULL,
    venue_address     VARCHAR(255),
    event_date        TIMESTAMP NOT NULL,
    capacity          INTEGER NOT NULL CHECK (capacity > 0),
    sold_count        INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
    price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    seat_map_enabled  BOOLEAN NOT NULL,
    organizer_id      UUID NOT NULL REFERENCES users(id),
    status            VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED','CANCELLED')),
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_sold_within_capacity CHECK (sold_count <= capacity)
);

CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_events_organizer ON events(organizer_id);

CREATE TABLE seats (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    seat_row    VARCHAR(10) NOT NULL,
    seat_number INTEGER NOT NULL,
    sector      VARCHAR(50),
    status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','RESERVED','SOLD')),
    version     INTEGER NOT NULL DEFAULT 0,
    UNIQUE (event_id, seat_row, seat_number)
);

CREATE INDEX idx_seats_event_status ON seats(event_id, status);

CREATE TABLE reservations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id      UUID NOT NULL REFERENCES events(id),
    client_id     UUID NOT NULL REFERENCES users(id),
    quantity      INTEGER,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT'
                  CHECK (status IN ('PENDING_PAYMENT','CONFIRMED','DECLINED','EXPIRED')),
    total_amount  NUMERIC(10,2) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_client ON reservations(client_id);

CREATE TABLE reservation_seats (
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    seat_id        UUID NOT NULL REFERENCES seats(id),
    PRIMARY KEY (reservation_id, seat_id)
);

CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id   UUID NOT NULL UNIQUE REFERENCES reservations(id),
    status           VARCHAR(20) NOT NULL CHECK (status IN ('APPROVED','DECLINED')),
    simulated_method VARCHAR(50) NOT NULL,
    processed_at     TIMESTAMP NOT NULL
);

CREATE TABLE tickets (
    id              UUID PRIMARY KEY,
    reservation_id  UUID NOT NULL REFERENCES reservations(id),
    event_id        UUID NOT NULL REFERENCES events(id),
    seat_id         UUID REFERENCES seats(id),
    owner_name      VARCHAR(150) NOT NULL,
    qr_token        TEXT NOT NULL,
    share_token     VARCHAR(64) NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID','USED','CANCELLED')),
    used_at         TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_reservation ON tickets(reservation_id);
CREATE INDEX idx_tickets_share_token ON tickets(share_token);
