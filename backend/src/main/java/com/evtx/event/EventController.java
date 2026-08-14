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
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable UUID id) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('ORGANIZADOR')")
    public List<EventResponse> findMine(@AuthenticationPrincipal SecurityUser organizer) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZADOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(
            @Valid @RequestBody EventCreateRequest request,
            @AuthenticationPrincipal SecurityUser organizer
    ) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }
}
