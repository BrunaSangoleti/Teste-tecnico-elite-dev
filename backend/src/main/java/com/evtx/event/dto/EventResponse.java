package com.evtx.event.dto;

import com.evtx.event.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String description,
        String venueName,
        String venueAddress,
        LocalDateTime eventDate,
        Integer capacity,
        Integer soldCount,
        BigDecimal price,
        Boolean seatMapEnabled,
        String status,
        UUID organizerId
) {
    public static EventResponse from(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getVenueName(),
                event.getVenueAddress(),
                event.getEventDate(),
                event.getCapacity(),
                event.getSoldCount(),
                event.getPrice(),
                event.getSeatMapEnabled(),
                event.getStatus().name(),
                event.getOrganizer().getId()
        );
    }
}
