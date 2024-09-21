package com.pkarakal.catalog.application.amqp;

import com.pkarakal.catalog.domain.models.Inventory;
import com.pkarakal.catalog.domain.ports.InventoryDTO;
import com.pkarakal.catalog.domain.ports.InventoryUpdateMessage;
import com.pkarakal.catalog.domain.ports.ProductInventoryRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class InventoryUpdateListener {
    private final ProductInventoryRepository inventoryRepository;

    @Autowired
    public InventoryUpdateListener(ProductInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @RabbitListener(queues = "inventory_update")
    public void handleInventoryUpdate(InventoryUpdateMessage message) {
        Long productId = message.productId();
        int amountOrdered = message.amountOrdered();

        // Fetch the inventory for the product
        Optional<Inventory> inventoryOpt = inventoryRepository.findById(productId);

        if (inventoryOpt.isPresent()) {
            InventoryDTO updatedInventory = getInventoryDTO(inventoryOpt, amountOrdered, productId);

            // Save the updated inventory
            inventoryRepository.save(updatedInventory);
        } else {
            throw new IllegalArgumentException("No inventory found for product: " + productId);
        }
    }

    private static InventoryDTO getInventoryDTO(Optional<Inventory> inventoryOpt, int amountOrdered, Long productId) {
        assert inventoryOpt.isPresent();
        Inventory inventory = inventoryOpt.get();

        // Ensure there is enough stock
        int newQuantity = inventory.quantity() - amountOrdered;
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Not enough stock for product: " + productId);
        }

        // Create a new inventory record with the updated quantity
        return new InventoryDTO(Optional.of(inventory.id()), inventory.product().id(), newQuantity);
    }

}
