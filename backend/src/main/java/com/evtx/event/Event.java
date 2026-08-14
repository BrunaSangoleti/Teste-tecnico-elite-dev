package com.evtx.event;

import com.evtx.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representa um evento publicado por um organizador, opcionalmente originado
 * de um item do catálogo externo (Ticketmaster Discovery).
 *
 * seatMapEnabled = true  -> reserva por assento individual (tabela Seat)
 * seatMapEnabled = false -> reserva por quantidade (controle via soldCount/capacity)
 */
@Entity
@Table(name = "events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "external_ref_id")
    private String externalRefId;

    @Enumerated(EnumType.STRING)
    @Column(name = "external_source", nullable = false)
    private ExternalSource externalSource;

    @Column(name = "venue_name", nullable = false)
    private String venueName;

    @Column(name = "venue_address")
    private String venueAddress;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(nullable = false)
    private Integer capacity;

    /** Contador de ingressos já vendidos. Usado no modo pista (sem mapa de assentos). */
    @Column(name = "sold_count", nullable = false)
    @Builder.Default
    private Integer soldCount = 0;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "seat_map_enabled", nullable = false)
    private Boolean seatMapEnabled;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EventStatus status = EventStatus.PUBLISHED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
