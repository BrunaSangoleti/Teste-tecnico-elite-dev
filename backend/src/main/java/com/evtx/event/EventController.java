package com.evtx.event;

import com.evtx.event.dto.EventCreateRequest;
import com.evtx.event.dto.EventResponse;
import com.evtx.security.SecurityUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events")
public class EventController {

    private final EventService eventService;

    @GetMapping
    public List<EventResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return eventService.search(search, city, from, to)
                .stream()
                .map(EventResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable UUID id) {
        return EventResponse.from(eventService.getById(id));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('ORGANIZADOR')")
    public List<EventResponse> findMine(@AuthenticationPrincipal SecurityUser organizer) {
        return eventService.findMine(organizer.getId())
                .stream()
                .map(EventResponse::from)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZADOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(
            @Valid @RequestBody EventCreateRequest request,
            @AuthenticationPrincipal SecurityUser organizer
    ) {
        return EventResponse.from(eventService.create(request, organizer));
    }
}
