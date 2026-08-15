package com.evtx.catalog;

import com.evtx.catalog.dto.CatalogItemDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TicketmasterClient implements CatalogProvider {

    private final RestClient ticketmasterRestClient;

    @Value("${app.catalog.ticketmaster.api-key}")
    private String apiKey;

    @Override
    public List<CatalogItemDTO> search(String query) {
        if (apiKey == null || apiKey.isBlank() || "SUA_CHAVE_AQUI".equals(apiKey)) {
            System.out.println("⚠️ Ticketmaster API Key não configurada. Integração desativada.");
            return Collections.emptyList();
        }

        try {
            TicketmasterResponse response = ticketmasterRestClient.get()
                    .uri("/events.json?apikey={key}&keyword={query}&size=10", apiKey, query)
                    .retrieve()
                    .body(TicketmasterResponse.class);

            if (response == null || response.embedded() == null || response.embedded().events() == null) {
                return Collections.emptyList();
            }

            return response.embedded().events().stream()
                    .map(this::toDto)
                    .toList();
        } catch (Exception e) {
            System.err.println("❌ Erro ao buscar no Ticketmaster: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    private CatalogItemDTO toDto(TicketmasterEvent evt) {
        String imageUrl = evt.images() != null && !evt.images().isEmpty()
                ? evt.images().get(0).url() : null;

        LocalDateTime date = null;
        if (evt.dates() != null && evt.dates().start() != null && evt.dates().start().dateTime() != null) {
            try {
                date = ZonedDateTime.parse(evt.dates().start().dateTime()).toLocalDateTime();
            } catch (Exception ignored) {}
        }

        String venueName = "Local a definir";
        String venueAddress = "";

        if (evt.embedded() != null && evt.embedded().venues() != null && !evt.embedded().venues().isEmpty()) {
            TicketmasterVenue venue = evt.embedded().venues().get(0);
            venueName = venue.name() != null ? venue.name() : venueName;
            if (venue.address() != null && venue.address().line1() != null) {
                venueAddress = venue.address().line1();
                if (venue.city() != null && venue.city().name() != null) {
                    venueAddress += ", " + venue.city().name();
                }
            }
        }

        return new CatalogItemDTO(
                evt.id(),
                evt.name(),
                evt.description() != null ? evt.description() : "Sem descrição detalhada.",
                venueName,
                venueAddress,
                date,
                imageUrl
        );
    }

    // ── Records DTOs Internos para Mapear o JSON do Ticketmaster ──────────────

    public record TicketmasterResponse(@JsonProperty("_embedded") Embedded embedded) {}
    public record Embedded(List<TicketmasterEvent> events, List<TicketmasterVenue> venues) {}
    public record TicketmasterEvent(
            String id, String name, String description,
            List<Image> images, Dates dates,
            @JsonProperty("_embedded") Embedded embedded
    ) {}
    public record Image(String url) {}
    public record Dates(Start start) {}
    public record Start(String dateTime) {}
    public record TicketmasterVenue(String name, Address address, City city) {}
    public record Address(String line1) {}
    public record City(String name) {}
}