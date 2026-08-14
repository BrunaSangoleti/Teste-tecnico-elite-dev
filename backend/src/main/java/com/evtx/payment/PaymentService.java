package com.evtx.payment;

import com.evtx.payment.dto.PaymentRequest;
import com.evtx.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    /**
     * Simulates payment processing.
     * Deterministic rule: card number ending in "0000" is declined, anything else is approved.
     * On approval, triggers ticket issuance via TicketService.
     */
    @Transactional
    public PaymentResponse pay(UUID reservationId, PaymentRequest request) {
        // TODO: validate reservation status, simulate payment, update status, issue tickets if approved
        throw new UnsupportedOperationException("TODO");
    }
}
