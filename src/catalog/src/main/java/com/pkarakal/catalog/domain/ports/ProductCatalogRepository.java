package com.pkarakal.catalog.domain.ports;

import com.pkarakal.catalog.domain.models.Product;

import java.util.List;
import java.util.Optional;

public interface ProductCatalogRepository {
    List<Product> findAll();
    Optional<Product> findById(Long id);
    Product save(ProductDTO product);
//    Optional<Product> update(Product product);
    void deleteById(Long id);
}