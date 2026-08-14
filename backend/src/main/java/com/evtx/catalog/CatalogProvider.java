package com.evtx.catalog;

import com.evtx.catalog.dto.CatalogItemDTO;

import java.util.List;


public interface CatalogProvider {

    List<CatalogItemDTO> search(String query);
}
