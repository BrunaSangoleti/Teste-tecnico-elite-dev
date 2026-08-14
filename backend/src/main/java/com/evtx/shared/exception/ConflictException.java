package com.evtx.shared.exception;

import org.springframework.http.HttpStatus;

/** Usada para: assento já vendido, ingresso já validado, capacidade esgotada, etc. */
public class ConflictException extends ApiException {
    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
