package com.evtx.catalog;

import com.evtx.catalog.dto.CatalogItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * CatalogProvider implementation backed by the Ticketmaster Discovery API v2.
 * Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 *
 * Maps Ticketmaster event fields (venue, date, name) to the internal CatalogItemDTO,
 * normalizing the external data model to the domain contract.
 */
@Component
@RequiredArgsConstructor
public class TicketmasterClient implements CatalogProvider {

    private final RestClient ticketmasterRestClient;

    @Value("${app.catalog.ticketmaster.api-key}")
    private String apiKey;

    @Override
    public List<CatalogItemDTO> search(String query) {
        // TODO: call /events.json with apikey and keyword, map _embedded.events to CatalogItemDTO list
        throw new UnsupportedOperationException("TODO");
    }
}
