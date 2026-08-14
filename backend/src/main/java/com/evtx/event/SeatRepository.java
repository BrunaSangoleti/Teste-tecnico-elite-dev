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


    @Modifying
    @Query(value = "UPDATE seats SET status = 'RESERVED', version = version + 1 " +
            "WHERE id = :seatId AND status = 'AVAILABLE'",
            nativeQuery = true)
    int tryReserveSeat(@Param("seatId") UUID seatId);
}
