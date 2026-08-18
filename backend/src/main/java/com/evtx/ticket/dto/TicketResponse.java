package com.evtx.ticket.dto;

import com.evtx.ticket.Ticket;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        UUID eventId,
        String eventTitle,
        String venueName,
        java.time.LocalDateTime eventDate,
        String imageUrl,
        String ownerName,
        String status,
        String shareToken,
        String qrToken,
        Instant usedAt
) {
    public static TicketResponse from(Ticket t) {
        return new TicketResponse(
                t.getId(),
                t.getEvent().getId(),
                t.getEvent().getTitle(),
                t.getEvent().getVenueName(),
                t.getEvent().getEventDate(),
                t.getEvent().getImageUrl(),
                t.getOwnerName(),
                t.getStatus().name(),
                t.getShareToken(),
                t.getQrToken(),
                t.getUsedAt()
        );
    }
}