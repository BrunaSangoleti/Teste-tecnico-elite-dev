package com.evtx.event;

import com.evtx.event.dto.EventCreateRequest;
import com.evtx.security.SecurityUser;
import com.evtx.shared.exception.ForbiddenActionException;
import com.evtx.shared.exception.ResourceNotFoundException;
import com.evtx.user.User;
import com.evtx.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserService userService;

    public List<Event> search(String query, String city, LocalDateTime from, LocalDateTime to) {
        return eventRepository.search(query, city, from, to);
    }

    public Event getById(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    }

    public List<Event> findMine(UUID organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }

    @Transactional
    public Event create(EventCreateRequest request, SecurityUser organizer) {
        User organizerUser = userService.getById(organizer.getId());

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .externalRefId(request.externalRefId())
                .externalSource(ExternalSource.MANUAL)
                .venueName(request.venueName())
                .venueAddress(request.venueAddress())
                .eventDate(request.eventDate())
                .capacity(request.capacity())
                .price(request.price())
                .seatMapEnabled(request.seatMapEnabled())
                .organizer(organizerUser)
                .build();

        return eventRepository.save(event);
    }

    public void assertOwnership(Event event, UUID organizerId) {
        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new ForbiddenActionException("You do not own this event");
        }
    }
}