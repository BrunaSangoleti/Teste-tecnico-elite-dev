package com.evtx.catalog;

import com.evtx.catalog.dto.CatalogItemDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
@Tag(name = "External Catalog")
public class CatalogController {

    private final CatalogProvider catalogProvider;

    @GetMapping("/search")
    @PreAuthorize("hasRole('ORGANIZADOR')")
    public List<CatalogItemDTO> search(@RequestParam String query) {
        return catalogProvider.search(query);
    }
}
