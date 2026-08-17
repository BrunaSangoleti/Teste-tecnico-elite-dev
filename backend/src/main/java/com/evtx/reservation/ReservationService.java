package com.evtx.reservation;

import com.evtx.event.Event;
import com.evtx.event.EventRepository;
import com.evtx.event.Seat;
import com.evtx.event.SeatRepository;
import com.evtx.reservation.dto.ReservationCreateRequest;
import com.evtx.security.SecurityUser;
import com.evtx.shared.exception.ConflictException;
import com.evtx.shared.exception.ResourceNotFoundException;
import com.evtx.user.User;
import com.evtx.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final UserService userService;

    @Transactional
    public Reservation create(ReservationCreateRequest request, SecurityUser client) {

        // 1. Carrega o evento
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + request.eventId()));

        // 2. Carrega o usuário cliente (entidade gerenciada)
        User clientUser = userService.getById(client.getId());

        Reservation reservation;

        if (Boolean.TRUE.equals(event.getSeatMapEnabled()) && request.seatIds() != null && !request.seatIds().isEmpty()) {
            // ── MODO MAPA DE ASSENTOS ──────────────────────────────────────────
            List<Seat> reservedSeats = new ArrayList<>();
            for (UUID seatId : request.seatIds()) {
                // Update condicional: só reserva se status = AVAILABLE
                int affected = seatRepository.tryReserveSeat(seatId);
                if (affected == 0) {
                    throw new ConflictException(
                            "Seat " + seatId + " is no longer available.");
                }
                Seat seat = seatRepository.findById(seatId)
                        .orElseThrow(() -> new ResourceNotFoundException("Seat not found: " + seatId));
                reservedSeats.add(seat);
            }

            BigDecimal totalAmount = event.getPrice()
                    .multiply(BigDecimal.valueOf(request.seatIds().size()));

            reservation = Reservation.builder()
                    .event(event)
                    .client(clientUser)
                    .seats(reservedSeats)
                    .totalAmount(totalAmount)
                    .build();

        } else {
            // ── MODO PISTA / QUANTIDADE ────────────────────────────────────────
            if (request.quantity() == null || request.quantity() < 1) {
                throw new ConflictException("Quantity must be at least 1 for this event.");
            }

            // Update atômico: incrementa soldCount só se não ultrapassar capacity
            int affected = eventRepository.tryReserveQuantity(event.getId(), request.quantity());
            if (affected == 0) {
                throw new ConflictException(
                        "Not enough capacity. Only " +
                                (event.getCapacity() - event.getSoldCount()) + " spots left.");
            }

            BigDecimal totalAmount = event.getPrice()
                    .multiply(BigDecimal.valueOf(request.quantity()));

            reservation = Reservation.builder()
                    .event(event)
                    .client(clientUser)
                    .quantity(request.quantity())
                    .totalAmount(totalAmount)
                    .build();
        }

        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public List<Reservation> findMine(UUID clientId) {
        return reservationRepository.findByClientId(clientId);
    }

    @Transactional(readOnly = true)
    public Reservation getById(UUID id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
    }

    @Transactional
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000) // Roda a cada 1 minuto
    public void cleanupExpiredReservations() {
        // Reservas expiram após 10 minutos (600 segundos) se não forem pagas
        java.time.Instant threshold = java.time.Instant.now().minusSeconds(600);
        List<Reservation> expired = reservationRepository.findByStatusAndCreatedAtBefore(
                ReservationStatus.PENDING_PAYMENT, threshold);

        for (Reservation reservation : expired) {
            reservation.setStatus(ReservationStatus.EXPIRED);

            if (Boolean.TRUE.equals(reservation.getEvent().getSeatMapEnabled())) {
                reservation.getSeats().forEach(s -> seatRepository.releaseReservation(s.getId()));
            } else {
                eventRepository.releaseQuantity(
                        reservation.getEvent().getId(), reservation.getQuantity());
            }

            reservationRepository.save(reservation);
        }
    }
}