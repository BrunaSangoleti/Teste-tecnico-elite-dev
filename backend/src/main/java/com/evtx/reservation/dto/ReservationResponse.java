package com.evtx.reservation.dto;

import com.evtx.reservation.Reservation;

import java.math.BigDecimal;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        UUID eventId,
        String status,
        BigDecimal totalAmount
) {
    public static ReservationResponse from(Reservation r) {
        return new ReservationResponse(
                r.getId(),
                r.getEvent().getId(),
                r.getStatus().name(),
                r.getTotalAmount()
        );
    }
}
