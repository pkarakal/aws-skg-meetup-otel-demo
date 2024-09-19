package com.pkarakal.catalog.domain.ports;

public record InventoryCreateResponseDTO(
        Long id,
        Long product,
        int quantity
) {

}
