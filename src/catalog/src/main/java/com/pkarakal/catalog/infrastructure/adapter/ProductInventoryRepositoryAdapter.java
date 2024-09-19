package com.pkarakal.catalog.infrastructure.adapter;

import com.pkarakal.catalog.domain.models.Image;
import com.pkarakal.catalog.domain.models.Inventory;
import com.pkarakal.catalog.domain.models.Product;
import com.pkarakal.catalog.domain.ports.*;
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
public class ProductInventoryRepositoryAdapter implements ProductInventoryRepository {
    private final JdbcClient jdbcClient;
    private final Logger logger = LoggerFactory.getLogger(ProductInventoryRepositoryAdapter.class);

    @Autowired
    public ProductInventoryRepositoryAdapter(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<Inventory> inventoryRowMapper = (rs, rowNum) -> {
        var image = new Image(
                rs.getLong("image"),
                rs.getString("file_name"),
                rs.getString("url"),
                rs.getString("content_type"),
                rs.getLong("size")
        );
        var product = new Product(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getDouble("price"),
                image
        );

        return new Inventory(
                rs.getLong("id"),
                product,
                rs.getInt("quantity")
        );
    };


    @Override
    public List<Inventory> findAll() {
        logger.info("Searching for all inventory entries in the database");
        return jdbcClient.sql("SELECT * FROM inventory i left join products p on i.product_id = p.id left join images im on p.image = im.id")
                .query(inventoryRowMapper)
                .list();
    }

    @Override
    public Optional<Inventory> findById(Long id) {
        logger.info("Searching for inventory of product with id {} in the database", id);
        return jdbcClient.sql("SELECT * FROM inventory i JOIN products p ON i.product_id = p.id JOIN images im ON p.image = im.id WHERE i.product_id = :id ")
                .param("id", id)
                .query(inventoryRowMapper)
                .optional();
    }

    @Override
    public InventoryCreateResponseDTO save(InventoryDTO inventory) {
        logger.info("Saving new inventory {} in the database", inventory);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sqlStatement = inventory.id().isPresent() ?
                "UPDATE inventory SET quantity = ? WHERE id = ?" :
                "INSERT INTO inventory(product_id, quantity) values(?, ?)";
        List<Number> params = inventory.id().isPresent() ?
                List.of(inventory.quantity(), inventory.id().get()) :
                List.of(inventory.productId(), inventory.quantity());
        logger.debug("saving inventory entry to the database");
        jdbcClient.sql(sqlStatement)
                .params(params)
                .update(keyHolder);
        return new InventoryCreateResponseDTO((Long) keyHolder.getKeys().get("id"), (Long) keyHolder.getKeys().get("product_id"), (int) keyHolder.getKeys().get("quantity"));
    }
}
