package com.evtx.payment;

import com.evtx.event.EventRepository;
import com.evtx.event.SeatRepository;
import com.evtx.payment.dto.PaymentRequest;
import com.evtx.payment.dto.PaymentResponse;
import com.evtx.reservation.Reservation;
import com.evtx.reservation.ReservationRepository;
import com.evtx.reservation.ReservationStatus;
import com.evtx.shared.exception.ConflictException;
import com.evtx.shared.exception.ResourceNotFoundException;
import com.evtx.ticket.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final TicketService ticketService;

    @Transactional
    public PaymentResponse pay(UUID reservationId, PaymentRequest request) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found: " + reservationId));

        if (paymentRepository.findByReservationId(reservationId).isPresent()) {
            throw new ConflictException("This reservation has already been paid.");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING_PAYMENT) {
            throw new ConflictException(
                    "Reservation is not awaiting payment. Status: " + reservation.getStatus());
        }

        boolean approved = !request.cardNumber().endsWith("0000");
        PaymentStatus paymentStatus = approved ? PaymentStatus.APPROVED : PaymentStatus.DECLINED;

        Payment payment = Payment.builder()
                .reservation(reservation)
                .status(paymentStatus)
                .simulatedMethod(request.method())
                .processedAt(Instant.now())
                .build();
        paymentRepository.save(payment);

        if (approved) {
            reservation.setStatus(ReservationStatus.CONFIRMED);

            if (Boolean.TRUE.equals(reservation.getEvent().getSeatMapEnabled())) {
                reservation.getSeats().forEach(s -> seatRepository.markAsSold(s.getId()));
            }

            reservationRepository.save(reservation);
            ticketService.issueTicketsFor(reservation);

            return new PaymentResponse("APPROVED",
                    "Payment approved. Your tickets have been issued.");

        } else {
            reservation.setStatus(ReservationStatus.DECLINED);

            if (Boolean.TRUE.equals(reservation.getEvent().getSeatMapEnabled()) && !reservation.getSeats().isEmpty()) {
                reservation.getSeats().forEach(s -> seatRepository.releaseReservation(s.getId()));
                eventRepository.releaseQuantity(reservation.getEvent().getId(), reservation.getSeats().size());
            } else if (reservation.getQuantity() != null) {
                eventRepository.releaseQuantity(
                        reservation.getEvent().getId(), reservation.getQuantity());
            }

            reservationRepository.save(reservation);

            return new PaymentResponse("DECLINED",
                    "Payment declined. Please check your card details.");
        }
    }
}