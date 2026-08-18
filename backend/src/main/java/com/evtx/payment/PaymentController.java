package com.evtx.payment;

import com.evtx.payment.dto.PaymentRequest;
import com.evtx.payment.dto.PaymentResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
@PreAuthorize("hasRole('CLIENTE')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{reservationId}/pay")
    public ResponseEntity<PaymentResponse> pay(
            @PathVariable UUID reservationId,
            @Valid @RequestBody PaymentRequest request
    ) {
        PaymentResponse response = paymentService.pay(reservationId, request);
        if ("DECLINED".equals(response.status())) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
        }
        return ResponseEntity.ok(response);
    }
}