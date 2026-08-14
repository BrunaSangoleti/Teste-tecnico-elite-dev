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

    @Modifying
    @Query(value = "UPDATE seats SET status = 'SOLD', version = version + 1 " +
            "WHERE id = :seatId AND status = 'RESERVED'",
            nativeQuery = true)
    int markAsSold(@Param("seatId") UUID seatId);

    @Modifying
    @Query(value = "UPDATE seats SET status = 'AVAILABLE', version = version + 1 " +
            "WHERE id = :seatId AND status = 'RESERVED'",
            nativeQuery = true)
    int releaseReservation(@Param("seatId") UUID seatId);
}