package com.pkarakal.catalog.domain.models;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "inventory")
public record Inventory(
        @Id()
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(columnDefinition = "bigserial")
        long id,
        @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL) @JoinColumn(name = "product_id")
        Product product,
        @Column(nullable = false)
        int quantity
) {
}
