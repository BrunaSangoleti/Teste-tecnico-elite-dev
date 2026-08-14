package com.evtx.security.dto;

public record LoginResponse(
        String token,
        String tokenType,
        String name,
        String email,
        String role
) {
    public static LoginResponse of(String token, String name, String email, String role) {
        return new LoginResponse(token, "Bearer", name, email, role);
    }
}
