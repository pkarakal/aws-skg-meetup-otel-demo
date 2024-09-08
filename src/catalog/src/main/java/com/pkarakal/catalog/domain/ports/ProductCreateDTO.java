package com.pkarakal.catalog.domain.ports;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.web.multipart.MultipartFile;

public record ProductCreateDTO(
        @NotBlank(message = "Name must not be blank") String name,
        String description,
        @NotNull(message = "Price must not be null") @Positive double price
) {}
