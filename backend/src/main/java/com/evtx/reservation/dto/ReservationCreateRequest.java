package com.evtx.reservation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Um dos dois campos deve vir preenchido, dependendo de event.seatMapEnabled:
 * - seatIds: modo mapa de assentos
 * - quantity: modo pista
 * Validação de "qual campo é obrigatório" fica no ReservationService, pois depende do evento.
 */
public record ReservationCreateRequest(
        @NotNull UUID eventId,
        List<UUID> seatIds,
        @Min(1) Integer quantity
) {}
