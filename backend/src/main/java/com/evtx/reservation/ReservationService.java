package com.evtx.reservation;

import com.evtx.reservation.dto.ReservationCreateRequest;
import com.evtx.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    /**
     * Creates a reservation atomically.
     * - Seat-map mode: attempts to reserve each Seat individually via conditional update.
     *   If any seat is no longer AVAILABLE, the whole transaction rolls back (no partial reservation).
     * - General-admission mode: attempts to increment soldCount without exceeding capacity.
     */
    @Transactional
    public Reservation create(ReservationCreateRequest request, SecurityUser client) {
        // TODO: implement reservation creation with concurrency-safe stock control
        throw new UnsupportedOperationException("TODO");
    }

    public List<Reservation> findMine(UUID clientId) {
        // TODO: return all reservations for the given client
        throw new UnsupportedOperationException("TODO");
    }

    public Reservation getById(UUID id) {
        // TODO: fetch reservation by id or throw ResourceNotFoundException
        throw new UnsupportedOperationException("TODO");
    }
}
