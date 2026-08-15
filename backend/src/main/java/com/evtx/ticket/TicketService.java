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

    private final TicketRepository ticketRepository;   // ← corrigido
    private final QrCodeService qrCodeService;

    @Transactional
    public List<Ticket> issueTicketsFor(Reservation reservation) {
        List<Ticket> tickets = new ArrayList<>();
        String ownerName = reservation.getClient().getName();

        if (Boolean.TRUE.equals(reservation.getEvent().getSeatMapEnabled())) {
            for (Seat seat : reservation.getSeats()) {
                tickets.add(buildAndSave(reservation, seat, ownerName));
            }
        } else {
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

    @Transactional
    public ValidateTicketResponse validate(String code, UUID eventId) {

        // 1. Verifica a assinatura HMAC do QR Token
        UUID ticketId;
        try {
            ticketId = qrCodeService.verifyAndExtractTicketId(code);
        } catch (IllegalArgumentException e) {
            return new ValidateTicketResponse("INVALIDO",
                    "QR Code inválido ou adulterado.");
        }

        // 2. Busca o ingresso no banco
        Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket == null) {
            return new ValidateTicketResponse("INVALIDO",
                    "Ingresso não encontrado.");
        }

        // 3. Verifica se pertence ao evento correto
        if (!ticket.getEvent().getId().equals(eventId)) {
            return new ValidateTicketResponse("EVENTO_ERRADO",
                    "Este ingresso pertence a outro evento.");
        }

        // 4. Update atômico — evita uso duplo em requisições concorrentes
        int affected = ticketRepository.tryMarkAsUsed(ticketId);
        if (affected == 0) {
            return new ValidateTicketResponse("JA_UTILIZADO",
                    "Este ingresso já foi utilizado.");
        }

        // 5. Sucesso
        String seat = ticket.getSeat() != null
                ? "Fila " + ticket.getSeat().getRow() + " / Nº " + ticket.getSeat().getNumber()
                : "Pista Geral";

        return new ValidateTicketResponse("VALIDO",
                "Entrada liberada! Bem-vindo(a), " + ticket.getOwnerName() +
                        ". Assento: " + seat);
    }

    // ── helper ───────────────────────────────────────────────────────────────

    private Ticket buildAndSave(Reservation reservation, Seat seat, String ownerName) {
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