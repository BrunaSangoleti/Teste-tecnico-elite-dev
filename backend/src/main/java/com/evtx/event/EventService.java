package com.evtx.event;

import com.evtx.security.SecurityUser;
import com.evtx.event.dto.EventCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public List<Event> search(String query, String city, LocalDateTime from, LocalDateTime to) {
        // TODO: implement event search with filters
        throw new UnsupportedOperationException("TODO");
    }

    public Event getById(UUID id) {
        // TODO: fetch event by id or throw ResourceNotFoundException
        throw new UnsupportedOperationException("TODO");
    }

    public List<Event> findMine(UUID organizerId) {
        // TODO: return all events owned by the given organizer
        throw new UnsupportedOperationException("TODO");
    }

    public Event create(EventCreateRequest request, SecurityUser organizer) {
        // TODO: build and persist a new Event from the request payload
        throw new UnsupportedOperationException("TODO");
    }

    public void assertOwnership(Event event, UUID organizerId) {
        // TODO: throw ForbiddenActionException if event does not belong to organizerId
        throw new UnsupportedOperationException("TODO");
    }
}
