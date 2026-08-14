package com.evtx.ticket;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

/**
 * Token format: base64url(ticketId) + "." + base64url(eventId) + "." + base64url(HMAC-SHA256)
 */
@Service
public class QrCodeService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private final SecretKeySpec signingKey;

    public QrCodeService(@Value("${app.jwt.secret}") String secret) {
        this.signingKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
    }

    public String generateToken(UUID ticketId, UUID eventId) {
        String part1 = b64url(ticketId.toString());
        String part2 = b64url(eventId.toString());
        String payload = part1 + "." + part2;
        String sig = b64url(hmac(payload));
        return payload + "." + sig;
    }

    /** Returns ticketId IF signature is valid; throws IllegalArgumentException otherwise. */
    public UUID verifyAndExtractTicketId(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid token format");
        }
        String payload = parts[0] + "." + parts[1];
        String expectedSig = b64url(hmac(payload));

        // Comparação segura contra timing attacks
        if (!constantTimeEquals(expectedSig, parts[2])) {
            throw new IllegalArgumentException("Invalid token signature");
        }
        return UUID.fromString(new String(
                Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8));
    }

    public byte[] generateQrImage(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code image", e);
        }
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private String b64url(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String b64url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private byte[] hmac(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(signingKey);
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}