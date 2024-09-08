package com.pkarakal.catalog.domain.ports;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductDTO (
        @NotBlank(message = "Name must not be blank") String name,
        String description,
        @NotNull(message = "Price must not be null") @Positive double price,
        @NotNull ImageCreateDTO image
){}