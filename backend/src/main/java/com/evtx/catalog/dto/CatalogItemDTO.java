package com.evtx.catalog.dto;

import java.time.LocalDateTime;

/** Representação simplificada de um item do catálogo externo, já normalizada para o nosso domínio. */
public record CatalogItemDTO(
        String externalId,
        String title,
        String description,
        String venueName,
        String venueAddress,
        LocalDateTime suggestedDate,
        String imageUrl
) {}
