package com.evtx.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByOrganizerId(UUID organizerId);

    @Query(value = """
        SELECT * FROM events
        WHERE status = 'PUBLISHED'
          AND (cast(:city as varchar) IS NULL
               OR LOWER(venue_address) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (cast(:from_dt as timestamp) IS NULL
               OR event_date >= cast(:from_dt as timestamp))
          AND (cast(:to_dt as timestamp) IS NULL
               OR event_date <= cast(:to_dt as timestamp))
          AND (cast(:search as varchar) IS NULL
               OR LOWER(title) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY event_date ASC
        """, nativeQuery = true)
    List<Event> search(
            @Param("search") String search,
            @Param("city") String city,
            @Param("from_dt") LocalDateTime from,
            @Param("to_dt") LocalDateTime to
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
