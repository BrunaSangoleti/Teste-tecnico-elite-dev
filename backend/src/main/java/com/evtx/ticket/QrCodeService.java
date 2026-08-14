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
 * Generates and validates the signed token embedded in ticket QR codes.
 *
 * The QR code does NOT carry the raw ticket ID — it carries an HMAC-SHA256 signed payload
 * using the same secret as the JWT (app.jwt.secret). This ensures that no one can forge
 * a valid QR without the server's secret key.
 *
 * Token format: base64url(ticketId.eventId) + "." + base64url(HMAC-SHA256 signature)
 */
@Service
public class QrCodeService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final SecretKeySpec signingKey;

    public QrCodeService(@Value("${app.jwt.secret}") String secret) {
        this.signingKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
    }

    public String generateToken(UUID ticketId, UUID eventId) {
        // TODO: build and sign the payload
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * Returns the ticketId embedded in the token IF the signature is valid.
     * Throws IllegalArgumentException otherwise.
     */
    public UUID verifyAndExtractTicketId(String token) {
        // TODO: split, decode, verify signature, return ticketId
        throw new UnsupportedOperationException("TODO");
    }

    public byte[] generateQrImage(String content) {
        // TODO: render QR code as PNG using ZXing
        throw new UnsupportedOperationException("TODO");
    }
}
