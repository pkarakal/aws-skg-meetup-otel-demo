package com.pkarakal.catalog.application.service;

import com.pkarakal.catalog.domain.models.Image;
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
import java.net.URL;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
public class ProductCatalogService {
    private final ProductCatalogRepository productRepository;
    private final StorageRepository storageRepository;

    private final Logger logger = LoggerFactory.getLogger(ProductCatalogService.class);

    @Autowired
    public ProductCatalogService(
            ProductCatalogRepository productRepository,
            StorageRepository storageRepository
    ) {
        this.productRepository = productRepository;
        this.storageRepository = storageRepository;
    }

    public List<Product> getAllProducts() {
        logger.info("Get all products");
        var products =  productRepository.findAll();
        return products.stream().map(value -> {
            assert value.image() != null;
            URL presignedUrl = storageRepository.generateSignedURL(value.image().fileName());
            var image = new Image(
                    value.image().id(),
                    value.image().fileName(),
                    presignedUrl.toString(),
                    value.image().contentType(),
                    value.image().size()
            );
            return new Product(
                    value.id(),
                    value.name(),
                    value.description(),
                    value.price(),
                    image
            );
        }).collect(Collectors.toList());
    }
    
    public Product addProduct(ProductCreateDTO productDTO, MultipartFile image) {
        logger.debug("Saving image {} for {} in object storage", image.getOriginalFilename(), productDTO.name());
        String imageUrl;
        try {
            imageUrl = storageRepository.store(image, image.getOriginalFilename());
        } catch (IOException e) {
            logger.error("Failed to store image", e);
            throw new CatalogException("Failed to store image");
        }
        logger.debug("Successfully saved image");

        ImageCreateDTO imageDTO = new ImageCreateDTO(
                image.getOriginalFilename(),
                imageUrl,
                image.getContentType(),
                image.getSize()
        );

        ProductDTO product = new ProductDTO(
                productDTO.name(),
                productDTO.description(),
                productDTO.price(),
                imageDTO
        );

        logger.debug("Saving product in the database");


        return productRepository.save(product);
    }

    public Optional<Product> findById(Long id) {
        logger.debug("Finding product by id {}", id);
        Optional<Product> product = productRepository.findById(id);
        return product.map(value -> {
            assert value.image() != null;
            URL presignedUrl = storageRepository.generateSignedURL(value.image().fileName());
            var image = new Image(
                    value.image().id(),
                    value.image().fileName(),
                    presignedUrl.toString(),
                    value.image().contentType(),
                    value.image().size()
            );
            return Optional.of(new Product(
                    value.id(),
                    value.name(),
                    value.description(),
                    value.price(),
                    image
            ));
        }).orElse(Optional.empty());
    }

    public void deleteProductById(Long id) {
        productRepository.deleteById(id);
    }
}