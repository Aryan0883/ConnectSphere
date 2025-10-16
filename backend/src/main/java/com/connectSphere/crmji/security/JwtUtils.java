package com.ConnectSphere.crmji.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT utility class for handling JSON Web Token operations.
 * This version is compatible with JJWT 0.12.5 which has a completely new API.
 *
 * Key changes from previous versions:
 * - Jwts.builder() now returns JwtBuilder
 * - Signing uses Keys.hmacShaKeyFor() for secret key
 * - Parser uses Jwts.parser().verifyWith().build()
 * - Exception handling is different
 */
@Component
public class JwtUtils {

    @Value("${app.jwt.secret}") // Injected from application.properties: app.jwt.secret=your-256-bit-secret
    private String jwtSecret;

    @Value("${app.jwt.expirationMs}") // Injected from application.properties: app.jwt.expirationMs=86400000
    private int jwtExpirationMs;

    /**
     * Generates a JWT token from authentication object using JJWT 0.12.5 API
     * @param authentication the Spring Security authentication object
     * @return a signed JWT token string
     */
    public String generateJwtToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return Jwts.builder()
                .subject(userPrincipal.getEmail()) // Use email as subject (new API: .subject() instead of .setSubject())
                .issuedAt(new Date()) // Token creation time
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Token expiration time
                .signWith(getSigningKey(), Jwts.SIG.HS512) // Sign with secret key using new API
                .compact();
    }

    /**
     * Creates a signing key from the secret string using JJWT 0.12.5 API
     * @return SecretKey for signing JWTs
     */
    private SecretKey getSigningKey() {
        // The secret must be at least 256 bits (32 characters) for HS512
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Extracts the email (subject) from a JWT token using JJWT 0.12.5 API
     * @param token the JWT token string
     * @return the email address from the token
     */
    public String getEmailFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey()) // New API: verifyWith() instead of setSigningKey()
                .build()
                .parseSignedClaims(token) // New API: parseSignedClaims() instead of parseClaimsJws()
                .getPayload()
                .getSubject();
    }

    /**
     * Validates a JWT token's signature and expiration using JJWT 0.12.5 API
     * @param authToken the JWT token string to validate
     * @return true if the token is valid, false otherwise
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException e) {
            // JJWT 0.12.5 has different exception handling
            System.out.println("JWT validation error: " + e.getMessage());
            // You can be more specific with exception types if needed:
            // if (e instanceof ExpiredJwtException) { ... }
            // if (e instanceof MalformedJwtException) { ... }
            // if (e instanceof SecurityException) { ... }
        } catch (IllegalArgumentException e) {
            System.out.println("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }
}