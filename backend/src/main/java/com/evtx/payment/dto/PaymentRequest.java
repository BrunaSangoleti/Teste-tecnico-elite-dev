package com.evtx.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PaymentRequest(
        @NotBlank String method,          // ex.: "CREDIT_CARD"
        @NotBlank @Pattern(regexp = "\\d{16}") String cardNumber
) {}
