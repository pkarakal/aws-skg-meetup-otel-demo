package com.pkarakal.catalog.application.service;

import com.pkarakal.catalog.domain.models.Inventory;
import com.pkarakal.catalog.domain.models.Product;
import com.pkarakal.catalog.domain.ports.*;
import com.pkarakal.catalog.domain.ports.storage.StorageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.xml.catalog.CatalogException;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ProductInventoryService {
    private final ProductInventoryRepository inventoryRepository;

    private final Logger logger = LoggerFactory.getLogger(ProductInventoryService.class);

    @Autowired
    public ProductInventoryService(ProductInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<Inventory> getAllInventoryEntries() {
        logger.info("Get all inventory entries");
        return inventoryRepository.findAll();
    }

    public InventoryCreateResponseDTO createInventory(InventoryDTO inventoryDTO) {
        Optional<Inventory> inventoryOpt = inventoryRepository.findById(inventoryDTO.productId());
        var inventory = inventoryOpt.map(value -> new InventoryDTO(Optional.of(value.id()), value.product().id(), inventoryDTO.quantity())).orElse(inventoryDTO);
        return inventoryRepository.save(inventory);
    }

    public Optional<Inventory> findById(Long id) {
        logger.debug("Finding inventory by product id {}", id);
        return inventoryRepository.findById(id);
    }
}