package com.pkarakal.catalog.domain.ports.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;

public interface StorageRepository {
    String store(MultipartFile file, String fileName) throws IOException;
    String load(String fileName) throws IOException;
    URL generateSignedURL(String fileName);
}
