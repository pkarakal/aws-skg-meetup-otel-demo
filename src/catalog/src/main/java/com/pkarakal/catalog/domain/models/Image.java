package com.pkarakal.catalog.domain.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "images")
public record Image(
        @Id()
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(columnDefinition = "bigserial")
        Long id,
        @Column @NotNull String fileName,
        @Column String url,
        @Column String contentType,
        @Column @NotNull @Positive Long size
) {
}
