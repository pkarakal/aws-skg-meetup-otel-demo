package com.pkarakal.catalog.domain.ports;

import com.pkarakal.catalog.domain.models.Inventory;
import com.pkarakal.catalog.domain.models.Product;

import java.util.List;
import java.util.Optional;

public interface ProductInventoryRepository {
    List<Inventory> findAll();
    Optional<Inventory> findById(Long id);
    InventoryCreateResponseDTO save(InventoryDTO inventory);
}
