package com.evtx.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * code = conteúdo lido do QR, OU código digitado manualmente pela portaria
 * (ver TicketService: o código manual pode ser um formato mais curto/legível
 * associado ao mesmo ticket - decisão de implementação em aberto, documentar no README).
 */
public record ValidateTicketRequest(
        @NotBlank String code,
        @NotNull UUID eventId
) {}
