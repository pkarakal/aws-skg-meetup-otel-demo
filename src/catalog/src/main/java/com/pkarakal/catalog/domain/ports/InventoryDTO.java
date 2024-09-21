package com.pkarakal.catalog.domain.ports;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.Optional;

public record InventoryDTO(
        Optional<Long> id,
        Long productId,
        @NotNull(message = "Quantity must not be null") @PositiveOrZero int quantity
) {
}
