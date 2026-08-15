package com.evtx.ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    List<Ticket> findByReservationClientId(UUID clientId);

    Optional<Ticket> findByShareToken(String shareToken);

    /**
     * Update atômico e condicional: só marca como USED se ainda estiver VALID.
     * rowsAffected == 0 => já foi usado ou nunca existiu.
     */
    @Modifying
    @Query(value = "UPDATE tickets SET status = 'USED', used_at = NOW() " +
            "WHERE id = :id AND status = 'VALID'",
            nativeQuery = true)
    int tryMarkAsUsed(@Param("id") UUID id);
}