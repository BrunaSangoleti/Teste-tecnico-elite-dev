package com.evtx.reservation;

import com.evtx.reservation.dto.ReservationCreateRequest;
import com.evtx.reservation.dto.ReservationResponse;
import com.evtx.security.SecurityUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations")
@PreAuthorize("hasRole('CLIENTE')")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(
            @Valid @RequestBody ReservationCreateRequest request,
            @AuthenticationPrincipal SecurityUser client
    ) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    @GetMapping("/mine")
    public List<ReservationResponse> findMine(@AuthenticationPrincipal SecurityUser client) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }
}
