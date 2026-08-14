package com.evtx.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ExternalApiConfig {

    /**
     * RestClient dedicado ao catálogo externo (Ticketmaster Discovery).
     * Base URL e API key configuradas em application.yml (app.catalog.ticketmaster.*).
     */
    @Bean
    public RestClient ticketmasterRestClient(
            org.springframework.core.env.Environment env
    ) {
        String baseUrl = env.getProperty("app.catalog.ticketmaster.base-url");
        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}
