package com.pkarakal.catalog.infrastructure.adapter;

import com.pkarakal.catalog.domain.models.Image;
import com.pkarakal.catalog.domain.models.Product;
import com.pkarakal.catalog.domain.ports.ProductCatalogRepository;
import com.pkarakal.catalog.domain.ports.ProductDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ProductRepositoryAdapter implements ProductCatalogRepository {
    private final JdbcClient jdbcClient;
    private final Logger logger = LoggerFactory.getLogger(ProductRepositoryAdapter.class);

    @Autowired
    public ProductRepositoryAdapter(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<Product> productRowMapper = (rs, rowNum) -> {
        var image = new Image(
                rs.getLong("image"),
                rs.getString("file_name"),
                rs.getString("url"),
                rs.getString("content_type"),
                rs.getLong("size")
        );
        return new Product(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("description"),
            rs.getDouble("price"),
            image
        );
    };


    @Override
    public List<Product> findAll() {
        logger.info("Searching for all products in the database");
        return jdbcClient.sql("SELECT * FROM products p left join images i on p.image = i.id")
                .query(productRowMapper)
                .list();
    }

    @Override
    public Optional<Product> findById(Long id) {
        logger.info("Searching for product with id {} in the database", id);
        return jdbcClient.sql("SELECT * FROM products p JOIN images i ON p.image = i.id WHERE p.id = :id ")
                .param("id", id)
                .query(productRowMapper)
                .optional();
    }

    @Override
    public Product save(ProductDTO product) {
        logger.info("Saving new product {} in the database", product);
        assert product.image() != null;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        logger.debug("saving image entry to the database");
        jdbcClient.sql("INSERT INTO images(file_name, url, content_type, size) values(?, ?, ?, ?)")
                .params(List.of(product.image().fileName(), product.image().url(), product.image().contentType(), product.image().size()))
                .update(keyHolder);
        var imageKeys = keyHolder.getKeys();

        Image image = new Image((Long) imageKeys.get("id"), (String) imageKeys.get("file_name"), (String) imageKeys.get("url"), (String) imageKeys.get("content_type"), (Long) imageKeys.get("size"));

        logger.debug("saving product in the database");
        jdbcClient.sql("INSERT INTO products(name,description, image,price) values(?,?,?,?)")
                .params(List.of(product.name(), product.description(), image.id(), product.price()))
                .update(keyHolder);
        return new Product((Long) keyHolder.getKeys().get("id"), product.name(), product.description(), product.price(), image);
    }

    @Override
    public void deleteById(Long id) {
    }
}
