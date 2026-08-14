# EVTX Backend — Event & Ticketing Platform

A RESTful backend for an event and ticketing platform, built with **Java 21 + Spring Boot 3.3**.  
This repository represents the **initial architecture skeleton**: domain structure, database schema, security configuration, and all API endpoint contracts are defined. Business logic is intentionally left as `TODO` stubs — the project is meant to serve as a clean, opinionated starting point for development.

---

## Architecture

### Package-by-Feature (Domain-Driven Structure)

The project follows a **package-by-feature** (also known as domain-based or vertical-slice) structure rather than the traditional horizontal layering (`controller/`, `service/`, `repository/`).

```
com.evtx
├── catalog/        # External catalog integration (Ticketmaster API)
├── config/         # Cross-cutting configuration (Security, OpenAPI, HTTP clients)
├── event/          # Event and Seat domain — entity, repository, service, controller
├── payment/        # Payment simulation domain
├── reservation/    # Reservation domain with concurrency-safe stock control
├── security/       # JWT authentication — filter, service, SecurityUser adapter
├── shared/         # Shared DTOs and global exception handling
├── ticket/         # Ticket domain — issuance, QR code, gate validation
└── user/           # User domain — entity, repository, UserDetailsService
```

**Why package-by-feature?**

- **Cohesion**: everything related to a domain concept lives together. When you work on `reservation`, you touch only the `reservation/` package.
- **Scalability**: each package is a natural boundary for future extraction into a separate service (or module) if the application grows.
- **Readability**: navigating the codebase by intent, not by technical layer — closer to how business stakeholders describe the system.
- **Avoids cross-cutting coupling**: horizontal layering tends to create services that know too much about unrelated entities. Vertical slices enforce tighter, more explicit dependencies.

This choice was made deliberately over the default `controller/service/repository` structure that Spring Initializr promotes, because the domain model was clear from the start and the team prefers intent-driven navigation.

---

## Technology Choices

### Core Framework

| Technology | Version | Why |
|---|---|---|
| **Java** | 21 (LTS) | Latest LTS with virtual threads (Project Loom), modern record syntax, and pattern matching. Chosen for long-term support and modern language features. |
| **Spring Boot** | 3.3.4 | Convention-over-configuration; minimal boilerplate for production-grade applications. The parent POM manages all dependency versions coherently. |

### Web Layer

| Technology | Why |
|---|---|
| **Spring Web** (`spring-boot-starter-web`) | Provides the embedded Tomcat server and the full Spring MVC stack for building REST controllers. Zero external server setup needed. |
| **Spring Validation** (`spring-boot-starter-validation`) | Integrates Bean Validation (Jakarta) directly into controller method parameters via `@Valid`. Reduces repetitive null/range checks in service code and returns structured 400 responses automatically. |

### Persistence

| Technology | Why |
|---|---|
| **Spring Data JPA** (`spring-boot-starter-data-jpa`) | ORM abstraction over Hibernate. Repository interfaces like `JpaRepository` eliminate boilerplate CRUD, while `@Query` with JPQL allows custom queries when needed. The `@Version` annotation enables optimistic locking for concurrency control without external locks. |
| **PostgreSQL** | Chosen over MySQL for native `UUID` support (`gen_random_uuid()` via `pgcrypto`), robust `CHECK` constraints, and a generous free tier on cloud platforms (Render, Railway). The `soldCount <= capacity` constraint is enforced at the database level — not just the application layer — for true data integrity. |
| **Flyway** | Database migrations as versioned SQL files tracked in version control. Schema is the source of truth; Hibernate is set to `ddl-auto: validate` (read-only) on purpose. This means the application refuses to start if the schema does not match the entity model — preventing silent drift. |

### Security

| Technology | Why |
|---|---|
| **Spring Security** (`spring-boot-starter-security`) | Industry-standard security framework for Spring. Provides `AuthenticationManager`, `UserDetailsService` integration, method-level authorization (`@PreAuthorize`), and stateless session configuration in a few lines of code. |
| **JJWT** (`jjwt-api` / `jjwt-impl` / `jjwt-jackson`) | The most widely used JWT library for Java. Provides a fluent builder API for token creation and a parser with built-in signature verification. Chosen for its explicit, readable API and active maintenance. The split into `api`/`impl`/`jackson` artifacts follows the library's own recommendation for compile vs runtime scoping. |

**Security design decisions:**
- **Stateless JWT**: no server-side session storage. Every request is self-contained. Scales horizontally without shared session infrastructure.
- **Role-based access control**: three roles (`ORGANIZADOR`, `CLIENTE`, `PORTARIA`) enforced at the endpoint level via `@PreAuthorize("hasRole('...')")`.
- **QR code integrity**: ticket QR codes carry an HMAC-SHA256 signed payload (reusing the JWT secret), not the raw ticket UUID. The gate recomputes the signature at validation time — no database table of "valid tokens" needed, and no forgery without the server secret.

### External Integration

| Technology | Why |
|---|---|
| **Spring's `RestClient`** | Modern, fluent HTTP client introduced in Spring 6.1 (replaces `RestTemplate`). Used for Ticketmaster Discovery API calls. Configured as a Spring bean in `ExternalApiConfig` with base URL pre-set. |
| **Ticketmaster Discovery API** | Chosen as the external event catalog source because its data model (venue name, venue address, event date) maps naturally to the internal `Event` entity. A movie database (e.g., TMDb) was considered but rejected — movies don't carry session venues or start times natively. |

### Other Libraries

| Technology | Why |
|---|---|
| **ZXing** (`com.google.zxing`) | Google's widely used, dependency-free QR code generation library. Generates ticket QR images as PNG byte arrays served directly from the API (`produces = IMAGE_PNG_VALUE`). |
| **SpringDoc OpenAPI** (`springdoc-openapi-starter-webmvc-ui`) | Auto-generates Swagger UI from controller annotations with zero XML configuration. The UI is available at `/docs` in development for easy manual testing. |
| **Lombok** | Eliminates boilerplate: `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@RequiredArgsConstructor`. Excluded from the final JAR (compile-time only). |

### Infrastructure

| Technology | Why |
|---|---|
| **Docker Compose** | Single command (`docker compose up -d`) spins up a PostgreSQL 16 container with health check. Removes the need for local Postgres installation during development. |
| **H2 (test scope)** | In-memory database for unit and integration tests only. Never used at runtime. |

---

## Concurrency Strategy

Two mechanisms prevent double-selling under concurrent requests:

1. **Seat-map mode** — `SeatRepository.tryReserveSeat(seatId)`:  
   `UPDATE Seat SET status = 'RESERVED' WHERE id = :id AND status = 'AVAILABLE'`  
   If `rowsAffected == 0`, the seat was already taken. The transaction rolls back all seats atomically — no partial reservations.

2. **General-admission mode** — `EventRepository.tryReserveQuantity(eventId, qty)`:  
   `UPDATE Event SET soldCount = soldCount + :qty WHERE id = :id AND soldCount + :qty <= capacity`  
   Conditional increment ensures capacity is never exceeded.

3. **Gate validation** — `TicketRepository.tryMarkAsUsed(ticketId)`:  
   `UPDATE Ticket SET status = 'USED' WHERE id = :id AND status = 'VALID'`  
   Prevents the same ticket from being validated twice even under concurrent gate scanners.

---

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+
- Docker (for local Postgres)

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL 16 at `localhost:5432`, database `evtx`, user `evtx`, password `evtx`.

### 2. Environment variables (optional in dev)

```bash
export JWT_SECRET="replace-with-a-strong-secret-at-least-32-bytes"
export TICKETMASTER_API_KEY="your-key-here"   # only needed for catalog search
```

If not set, `application.yml` falls back to safe development defaults. **Do not use the defaults in production.**

### 3. Run the application

```bash
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.  
Interactive Swagger UI: `http://localhost:8080/docs`.

### 4. Database migrations

Flyway runs automatically on startup:
- `V1__init.sql` — creates the full schema
- `V2__seed_data.sql` — seeds test data

---

## Project Structure

```
evtx-backend/
├── docker-compose.yml                        # Local development Postgres
├── lombok.config                             # Lombok: addLombokGeneratedAnnotation = true
├── pom.xml
└── src/
    └── main/
        ├── java/com/evtx/
        │   ├── EvtxApplication.java           # Spring Boot entry point
        │   ├── catalog/
        │   │   ├── CatalogProvider.java        # Interface — catalog data source contract
        │   │   ├── TicketmasterClient.java     # Ticketmaster Discovery API client
        │   │   └── dto/
        │   │       └── CatalogItemDTO.java
        │   ├── config/
        │   │   ├── ExternalApiConfig.java      # RestClient bean for Ticketmaster
        │   │   ├── OpenApiConfig.java          # Swagger / SpringDoc customization
        │   │   └── SecurityConfig.java         # Spring Security filter chain + CORS
        │   ├── event/
        │   │   ├── Event.java                  # JPA entity
        │   │   ├── EventController.java        # REST endpoints
        │   │   ├── EventRepository.java        # JPA repository + custom JPQL queries
        │   │   ├── EventService.java           # Business logic
        │   │   ├── EventStatus.java            # Enum: PUBLISHED, CANCELLED
        │   │   ├── ExternalSource.java         # Enum: TICKETMASTER, MANUAL
        │   │   ├── Seat.java                   # JPA entity (@Version for optimistic locking)
        │   │   ├── SeatRepository.java         # Conditional update for seat reservation
        │   │   ├── SeatStatus.java             # Enum: AVAILABLE, RESERVED, SOLD
        │   │   └── dto/
        │   │       ├── EventCreateRequest.java
        │   │       └── EventResponse.java
        │   ├── payment/
        │   │   ├── Payment.java
        │   │   ├── PaymentController.java
        │   │   ├── PaymentRepository.java
        │   │   ├── PaymentService.java         # Simulated gateway (deterministic rule)
        │   │   ├── PaymentStatus.java          # Enum: APPROVED, DECLINED
        │   │   └── dto/
        │   │       ├── PaymentRequest.java
        │   │       └── PaymentResponse.java
        │   ├── reservation/
        │   │   ├── Reservation.java
        │   │   ├── ReservationController.java
        │   │   ├── ReservationRepository.java
        │   │   ├── ReservationService.java     # Core concurrency logic (seat + quantity modes)
        │   │   ├── ReservationStatus.java      # Enum: PENDING_PAYMENT, CONFIRMED, DECLINED, EXPIRED
        │   │   └── dto/
        │   │       ├── ReservationCreateRequest.java
        │   │       └── ReservationResponse.java
        │   ├── security/
        │   │   ├── AuthenticationController.java  # POST /api/auth/login
        │   │   ├── JwtAuthFilter.java             # OncePerRequestFilter — Bearer token extraction
        │   │   ├── JwtService.java                # Token generation and validation (JJWT)
        │   │   ├── SecurityUser.java              # UserDetails adapter wrapping the User entity
        │   │   └── dto/
        │   │       ├── LoginRequest.java
        │   │       └── LoginResponse.java
        │   ├── shared/
        │   │   ├── dto/
        │   │   │   └── ErrorResponse.java          # Standardized error response body
        │   │   └── exception/
        │   │       ├── ApiException.java
        │   │       ├── ConflictException.java
        │   │       ├── ForbiddenActionException.java
        │   │       ├── GlobalExceptionHandler.java # @RestControllerAdvice
        │   │       └── ResourceNotFoundException.java
        │   ├── ticket/
        │   │   ├── QrCodeService.java             # HMAC-SHA256 token generation + ZXing rendering
        │   │   ├── Ticket.java
        │   │   ├── TicketController.java
        │   │   ├── TicketRepository.java          # Atomic tryMarkAsUsed query
        │   │   ├── TicketService.java             # Issuance + gate validation logic
        │   │   ├── TicketStatus.java              # Enum: VALID, USED, CANCELLED
        │   │   └── dto/
        │   │       ├── TicketResponse.java
        │   │       ├── ValidateTicketRequest.java
        │   │       └── ValidateTicketResponse.java
        │   └── user/
        │       ├── User.java
        │       ├── UserRepository.java
        │       ├── UserRole.java                  # Enum: ORGANIZADOR, CLIENTE, PORTARIA
        │       └── UserService.java               # Implements UserDetailsService
        └── resources/
            ├── application.yml                    # Base config (port, Jackson, JWT, Swagger path)
            ├── application-dev.yml               # Dev overrides (datasource, Flyway, logging)
            └── db/migration/
                ├── V1__init.sql                   # Full schema: users, events, seats, reservations, payments, tickets
                └── V2__seed_data.sql              # Test data: 4 users, 2 events
```

---

## API Overview

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/events` | Public | List/search published events |
| `GET` | `/api/events/{id}` | Public | Get event details |
| `GET` | `/api/events/mine` | ORGANIZADOR | Events owned by the authenticated organizer |
| `POST` | `/api/events` | ORGANIZADOR | Create a new event |
| `POST` | `/api/reservations` | CLIENTE | Create a reservation (seat-map or general-admission) |
| `GET` | `/api/reservations/mine` | CLIENTE | Client's reservations |
| `POST` | `/api/payments/{reservationId}/pay` | CLIENTE | Process simulated payment |
| `GET` | `/api/tickets/mine` | CLIENTE | Client's issued tickets |
| `GET` | `/api/tickets/{id}/qrcode` | CLIENTE | Get QR code image (PNG) |
| `GET` | `/api/tickets/shared/{shareToken}` | Public | View shared ticket (read-only) |
| `POST` | `/api/tickets/validate` | PORTARIA | Validate a ticket at the gate |

---

## AI Usage

This project was developed with AI assistance. Here is an honest and transparent breakdown:

**What the AI did:**
- Provided a structured architecture roadmap: suggested domain package organization, entity modeling, Flyway migration strategy, and JWT filter integration.
- Generated initial boilerplate for entity classes, repository interfaces, and DTO records based on requirements I described.
- Suggested the HMAC-SHA256 approach for QR code signing as an alternative to storing tokens in a separate database table.
- Suggested the conditional `UPDATE` pattern (optimistic concurrency via JPQL) for seat and stock reservation.

**What I decided and why:**
- **Package-by-feature over horizontal layers**: I chose this after the AI presented both options. I already work with this structure in day-to-day projects and find it easier to navigate.
- **PostgreSQL over MySQL**: I made this call — I'm already familiar with Postgres and its UUID support (`gen_random_uuid()`) is cleaner.
- **Ticketmaster over TMDb**: I evaluated both options the AI listed and chose Ticketmaster because its data model (venue + date + event name) maps directly to what an organizer needs to fill in. A movie database doesn't naturally carry session venue or start time.
- **JJWT over Spring Security OAuth2**: I use JJWT regularly at work; it's straightforward and doesn't pull in an OAuth2 server dependency for a simple stateless JWT use case.
- **Three roles (ORGANIZADOR, CLIENTE, PORTARIA)**: I defined the roles and their scope. The AI helped translate them into Spring Security configuration.
- **Simulated payment gateway** (card ending in `0000` = declined): I chose this deterministic rule for simplicity during development — easy to explain, easy to test both paths.
- **ZXing for QR codes**: I selected this after the AI listed options. It's a well-known Google library I had seen used in production before.

**What remains to be implemented manually:**
- All `TODO` stubs in service classes
- Full integration tests
- Pagination in Ticketmaster client
- PENDING_PAYMENT reservation expiry (scheduler)
- Frontend (React)
