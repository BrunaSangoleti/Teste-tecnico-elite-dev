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
        return ticketService.findMine(client.getId())
                .stream()
                .map(TicketResponse::from)
                .toList();
    }

    @GetMapping(value = "/{id}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    @PreAuthorize("hasRole('CLIENTE')")
    public byte[] getQrImage(@PathVariable UUID id) {
        return ticketService.getQrImage(id);
    }

    /** Link público — sem login necessário */
    @GetMapping("/shared/{shareToken}")
    public TicketResponse getShared(@PathVariable String shareToken) {
        return TicketResponse.from(ticketService.getByShareToken(shareToken));
    }

    @PostMapping("/validate")
    @PreAuthorize("hasRole('PORTARIA')")
    public ValidateTicketResponse validate(@Valid @RequestBody ValidateTicketRequest request) {
        return ticketService.validate(request.code(), request.eventId());
    }
}