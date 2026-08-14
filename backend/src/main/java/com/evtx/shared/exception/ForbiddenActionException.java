package com.evtx.shared.exception;

import org.springframework.http.HttpStatus;

/** Ex.: organizador tentando editar evento que não é dele. */
public class ForbiddenActionException extends ApiException {
    public ForbiddenActionException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
