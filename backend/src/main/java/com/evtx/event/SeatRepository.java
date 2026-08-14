package com.evtx.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SeatRepository extends JpaRepository<Seat, UUID> {

    List<Seat> findByEventId(UUID eventId);

    List<Seat> findByEventIdAndStatus(UUID eventId, SeatStatus status);

    /**
     * Update atômico e condicional: só marca como RESERVED se ainda estiver AVAILABLE.
     * rowsAffected == 0 => assento já não está mais disponível (outro cliente chegou primeiro).
     */
    @Modifying
    @Query("UPDATE Seat s SET s.status = 'RESERVED' WHERE s.id = :seatId AND s.status = 'AVAILABLE'")
    int tryReserveSeat(@Param("seatId") UUID seatId);
}
