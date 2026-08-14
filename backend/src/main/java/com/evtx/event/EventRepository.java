package com.evtx.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByOrganizerId(UUID organizerId);

    @Query("""
            SELECT e FROM Event e
            WHERE e.status = 'PUBLISHED'
              AND (:city IS NULL OR LOWER(e.venueAddress) LIKE LOWER(CONCAT('%', :city, '%')))
              AND (:from IS NULL OR e.eventDate >= :from)
              AND (:to IS NULL OR e.eventDate <= :to)
              AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY e.eventDate ASC
            """)
    List<Event> search(
            @Param("search") String search,
            @Param("city") String city,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Update atômico e condicional: só incrementa se ainda houver capacidade.
     * rowsAffected == 0 => sem estoque (usar no modo "pista").
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("""
            UPDATE Event e SET e.soldCount = e.soldCount + :qty
            WHERE e.id = :eventId AND e.soldCount + :qty <= e.capacity
            """)
    int tryReserveQuantity(@Param("eventId") UUID eventId, @Param("qty") int qty);
}
