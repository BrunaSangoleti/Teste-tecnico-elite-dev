package com.evtx.event;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"event_id", "seat_row", "seat_number"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "seat_row", nullable = false)
    private String row;

    @Column(name = "seat_number", nullable = false)
    private Integer number;

    /** Ex.: PISTA, PLATEIA, VIP. Livre para o organizador nomear setores. */
    private String sector;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SeatStatus status = SeatStatus.AVAILABLE;

    /** Controle de concorrência otimista - protege contra dupla venda em corrida. */
    @Version
    private Integer version;
}
