-- Dados de teste exigidos pelo desafio. Senha para TODOS os usuários abaixo: senha123
-- Hash BCrypt de "senha123" (custo 10). Gere o seu próprio com o BCryptPasswordEncoder se preferir trocar.
-- Ver README para instruções de como gerar um novo hash.

INSERT INTO users (id, name, email, password_hash, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Ana Organizadora', 'organizador@evtx.com', '$2b$10$LuQa5L1FmGe5hVFuU9v2O./GXGUp4LDNJtS.E4cpmA8nKOneWSCyi', 'ORGANIZADOR'),
    ('22222222-2222-2222-2222-222222222222', 'Bruno Cliente', 'cliente1@evtx.com', '$2b$10$LuQa5L1FmGe5hVFuU9v2O./GXGUp4LDNJtS.E4cpmA8nKOneWSCyi', 'CLIENTE'),
    ('33333333-3333-3333-3333-333333333333', 'Carla Cliente', 'cliente2@evtx.com', '$2b$10$LuQa5L1FmGe5hVFuU9v2O./GXGUp4LDNJtS.E4cpmA8nKOneWSCyi', 'CLIENTE'),
    ('44444444-4444-4444-4444-444444444444', 'Diego Portaria', 'portaria@evtx.com', '$2b$10$LuQa5L1FmGe5hVFuU9v2O./GXGUp4LDNJtS.E4cpmA8nKOneWSCyi', 'PORTARIA');

