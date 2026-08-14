package com.evtx.payment.dto;

public record PaymentResponse(
        String status,      // APPROVED | DECLINED
        String message
) {}
