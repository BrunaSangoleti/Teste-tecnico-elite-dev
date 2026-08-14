package com.evtx.ticket.dto;

/** result: VALIDO | INVALIDO | JA_UTILIZADO | EVENTO_ERRADO */
public record ValidateTicketResponse(
        String result,
        String message
) {}
