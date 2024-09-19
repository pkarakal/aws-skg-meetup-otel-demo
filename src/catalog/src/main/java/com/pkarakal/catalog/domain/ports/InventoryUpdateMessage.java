package com.pkarakal.catalog.domain.ports;

public record InventoryUpdateMessage(
        long productId,
        int amountOrdered
) {
}
