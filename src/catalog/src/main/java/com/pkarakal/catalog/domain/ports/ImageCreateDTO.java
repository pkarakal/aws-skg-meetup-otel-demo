package com.pkarakal.catalog.domain.ports;

public record ImageCreateDTO(
        String fileName,
        String url,
        String contentType,
        long size
) {}