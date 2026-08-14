package com.evtx.ticket;

import com.evtx.event.Seat;
import com.evtx.reservation.Reservation;
import com.evtx.shared.exception.ResourceNotFoundException;
import com.evtx.ticket.dto.ValidateTicketResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final QrCodeService qrCodeService;

    @Transactional
    public List<Ticket> issueTicketsFor(Reservation reservation) {
        List<Ticket> tickets = new ArrayList<>();
        String ownerName = reservation.getClient().getName();

        if (Boolean.TRUE.equals(reservation.getEvent().getSeatMapEnabled())) {
            // Modo mapa: um ingresso por assento
            for (Seat seat : reservation.getSeats()) {
                tickets.add(buildAndSave(reservation, seat, ownerName));
            }
        } else {
            // Modo pista: um ingresso por unidade
            for (int i = 0; i < reservation.getQuantity(); i++) {
                tickets.add(buildAndSave(reservation, null, ownerName));
            }
        }

        return tickets;
    }

    @Transactional(readOnly = true)
    public List<Ticket> findMine(UUID clientId) {
        return ticketRepository.findByReservationClientId(clientId);
    }

    @Transactional(readOnly = true)
    public Ticket getByShareToken(String shareToken) {
        return ticketRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    @Transactional(readOnly = true)
    public byte[] getQrImage(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        return qrCodeService.generateQrImage(ticket.getQrToken());
    }

    /**
     * Implementado no Passo 10.
     * Outcomes: VALIDO | INVALIDO | JA_UTILIZADO | EVENTO_ERRADO
     */
    @Transactional
    public ValidateTicketResponse validate(String code, UUID eventId) {
        throw new UnsupportedOperationException("TODO - Passo 10");
    }

    // ── helper ───────────────────────────────────────────────────────────────

    private Ticket buildAndSave(Reservation reservation, Seat seat, String ownerName) {
        // Gera ID antes para assinar o token
        UUID ticketId = UUID.randomUUID();
        String qrToken = qrCodeService.generateToken(ticketId, reservation.getEvent().getId());
        String shareToken = UUID.randomUUID().toString().replace("-", "");

        Ticket ticket = Ticket.builder()
                .id(ticketId)
                .reservation(reservation)
                .event(reservation.getEvent())
                .seat(seat)
                .ownerName(ownerName)
                .qrToken(qrToken)
                .shareToken(shareToken)
                .build();

        return ticketRepository.save(ticket);
    }
}