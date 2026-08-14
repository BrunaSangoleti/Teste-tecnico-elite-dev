package com.evtx.ticket;

import com.evtx.security.SecurityUser;
import com.evtx.ticket.dto.TicketResponse;
import com.evtx.ticket.dto.ValidateTicketRequest;
import com.evtx.ticket.dto.ValidateTicketResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CLIENTE')")
    public List<TicketResponse> findMine(@AuthenticationPrincipal SecurityUser client) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    @GetMapping(value = "/{id}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    @PreAuthorize("hasRole('CLIENTE')")
    public byte[] getQrImage(@PathVariable UUID id) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    /** Public share link — no authentication required, read-only. */
    @GetMapping("/shared/{shareToken}")
    public TicketResponse getShared(@PathVariable String shareToken) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    @PostMapping("/validate")
    @PreAuthorize("hasRole('PORTARIA')")
    public ValidateTicketResponse validate(@Valid @RequestBody ValidateTicketRequest request) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }
}
