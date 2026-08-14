package com.evtx.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.UUID;

/**
 * Handles JWT generation and validation.
 * Claims: subject = user email, userId, role.
 * Signing algorithm: HS256 (HMAC-SHA256), key injected via app.jwt.secret.
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMinutes;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(SecurityUser user) {
        // TODO: build JWT with subject, userId, role claims and expiration
        throw new UnsupportedOperationException("TODO");
    }

    public String extractEmail(String token) {
        // TODO: parse claims and return subject
        throw new UnsupportedOperationException("TODO");
    }

    public UUID extractUserId(String token) {
        // TODO: parse claims and return userId as UUID
        throw new UnsupportedOperationException("TODO");
    }

    public boolean isValid(String token, String expectedEmail) {
        // TODO: verify subject matches and token is not expired
        throw new UnsupportedOperationException("TODO");
    }
}
