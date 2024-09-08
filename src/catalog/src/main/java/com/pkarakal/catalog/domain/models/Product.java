package com.pkarakal.catalog.domain.models;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "products")
public record Product(
        @Id()
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(columnDefinition = "bigserial")
        Long id,
        @Column  String name,
        @Column String description,
        @Column @Positive @NotNull Double price,
        @Nullable @OneToOne(cascade = CascadeType.ALL) @JoinColumn(name="image") Image image
) {}
