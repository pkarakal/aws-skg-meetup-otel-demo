package com.pkarakal.catalog.infrastructure.controller;

import com.pkarakal.catalog.CatalogApplication;
import com.pkarakal.catalog.application.service.ProductCatalogService;
import com.pkarakal.catalog.application.service.ProductInventoryService;
import com.pkarakal.catalog.domain.models.Inventory;
import com.pkarakal.catalog.domain.models.Product;
import com.pkarakal.catalog.domain.ports.InventoryCreateResponseDTO;
import com.pkarakal.catalog.domain.ports.InventoryDTO;
import com.pkarakal.catalog.domain.ports.ProductCatalogRepository;
import com.pkarakal.catalog.domain.ports.ProductCreateDTO;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/products")
public class ProductCatalogController {
    private final ProductCatalogService productCatalogService;
    private final ProductInventoryService productInventoryService;
    private static final Logger logger = LoggerFactory.getLogger(ProductCatalogController.class);

    @Autowired
    public ProductCatalogController(ProductCatalogService productCatalogService, ProductInventoryService productInventoryService) {
        this.productCatalogService = productCatalogService;
        this.productInventoryService = productInventoryService;
    }

    @GetMapping
    ResponseEntity<List<Product>> getAllProducts(){
        logger.info("Fetching all products");
        List<Product> products =  this.productCatalogService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(consumes = "multipart/form-data")
    ResponseEntity<Product> createProduct(@RequestPart("product") ProductCreateDTO product, @RequestPart("image") MultipartFile image){
        logger.info("Creating a new product {}", product);
        Product created = this.productCatalogService.addProduct(product, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        logger.info("Fetching product {}", id);
        return this.productCatalogService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    @GetMapping("/{id}/inventory")
    public ResponseEntity<Inventory> getProductInventory(@PathVariable() Long id) {
        logger.info("Fetching inventory for product {}", id);
        return this.productInventoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE, path = "/{id}/inventory")
    ResponseEntity<InventoryCreateResponseDTO> createInventoryEntry(@RequestBody InventoryDTO inventoryDTO, @PathVariable() Long id){
        logger.info("Creating a inventory entry for product {}", inventoryDTO.productId());
        assert inventoryDTO.productId().equals(id);
        InventoryCreateResponseDTO created = this.productInventoryService.createInventory(inventoryDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

}
