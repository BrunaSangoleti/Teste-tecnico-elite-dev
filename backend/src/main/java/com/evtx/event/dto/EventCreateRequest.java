package com.evtx.event.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventCreateRequest(
        @NotBlank String title,
        String description,
        String externalRefId,       // null se o evento for cadastrado manualmente
        @NotBlank String venueName,
        String venueAddress,
        @NotNull @Future LocalDateTime eventDate,
        @NotNull @Min(1) Integer capacity,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        @NotNull Boolean seatMapEnabled
        // Se seatMapEnabled = true, o organizador define os assentos em uma chamada
        // separada (POST /api/events/{id}/seats) para não sobrecarregar este DTO.
) {}
