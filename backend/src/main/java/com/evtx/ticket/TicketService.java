package com.evtx.ticket;

import com.evtx.reservation.Reservation;
import com.evtx.ticket.dto.ValidateTicketResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final QrCodeService qrCodeService;

    /**
     * Called by PaymentService after payment approval.
     * Issues one ticket per seat (seat-map mode) or one per quantity unit (general-admission mode).
     * Each ticket is individually validatable at the gate.
     */
    @Transactional
    public List<Ticket> issueTicketsFor(Reservation reservation) {
        // TODO: generate signed QR token for each ticket and persist
        throw new UnsupportedOperationException("TODO");
    }

    public List<Ticket> findMine(UUID clientId) {
        // TODO: return all tickets belonging to the given client
        throw new UnsupportedOperationException("TODO");
    }

    public Ticket getByShareToken(String shareToken) {
        // TODO: fetch ticket by public share token or throw ResourceNotFoundException
        throw new UnsupportedOperationException("TODO");
    }

    public byte[] getQrImage(UUID ticketId) {
        // TODO: generate and return the QR code image as PNG bytes
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * Validates a ticket at the gate. Returns one of four outcomes required by the challenge:
     * VALID, INVALID (bad or forged QR), ALREADY_USED, WRONG_EVENT.
     * Uses a conditional atomic update (tryMarkAsUsed) to prevent double-validation under concurrency.
     */
    @Transactional
    public ValidateTicketResponse validate(String code, UUID eventId) {
        // TODO: verify HMAC signature, check event match, attempt atomic status update
        throw new UnsupportedOperationException("TODO");
    }
}
