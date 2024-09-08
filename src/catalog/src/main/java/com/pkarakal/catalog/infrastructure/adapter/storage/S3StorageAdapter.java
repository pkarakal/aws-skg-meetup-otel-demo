package com.pkarakal.catalog.infrastructure.adapter.storage;

import com.pkarakal.catalog.domain.ports.storage.StorageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.model.FileUpload;
import software.amazon.awssdk.transfer.s3.model.Upload;
import software.amazon.awssdk.transfer.s3.model.UploadFileRequest;
import software.amazon.awssdk.transfer.s3.model.UploadRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class S3StorageAdapter implements StorageRepository {
    private final ExecutorService executorService;
    private S3TransferManager s3TransferManager;
    private final S3AsyncClient s3Client;

    private final boolean isMinioEnabled;

    private final String minioUrl;

    @Value("${cloud.aws.s3.bucket-name}")
    private String bucketName;

    private final Logger logger = LoggerFactory.getLogger(S3StorageAdapter.class);

    @Autowired
    public S3StorageAdapter(
            S3AsyncClient s3Client,
            @Value("${minio.enabled}") boolean isMinioEnabled,
            @Value("${minio.url}") String minioUrl
    ) {
        this.s3Client = s3Client;
        this.s3TransferManager = S3TransferManager.builder().s3Client(s3Client).build();
        this.isMinioEnabled = isMinioEnabled;
        this.minioUrl = minioUrl;
        this.executorService = Executors.newFixedThreadPool(10);
    }

    @Override
    public String store(MultipartFile file, String fileName) throws IOException {
        if (file.isEmpty()) {
            logger.error("File received is empty {}", fileName);
            throw new IllegalArgumentException("File is empty");
        }

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();
//        UploadFileRequest req = UploadFileRequest.builder()
//                .putObjectRequest(putObjectRequest)
//                .source(AsyncRequestBody.fromInputStream(file.getInputStream(), file.getSize(), s3Client))
//                .build();
//        FileUpload upload = s3TransferManager.uploadFile(req);
//        upload.completionFuture().join();
        PutObjectResponse putObjectResponse = s3Client.putObject(putObjectRequest, AsyncRequestBody.fromBytes(file.getBytes())).join();

        if (!putObjectResponse.sdkHttpResponse().isSuccessful()) {
            logger.error("Failed to store file {}", fileName);
            logger.error(putObjectResponse.sdkHttpResponse().toString());
            throw new IOException("Failed to upload file to S3");
        }
        return formatFileName(fileName);
    }

    private String formatFileName(String fileName) {
        var urlPrefix = isMinioEnabled ? String.format("%s/%s/", minioUrl, bucketName) : String.format("https://%s.s3.amazonaws.com/", bucketName);
        return urlPrefix + fileName;
    }

    @Override
    public String load(String filename) throws IOException {
        logger.debug("Fetching file {} from backend", filename);

        GetObjectRequest req = GetObjectRequest.builder().bucket(bucketName).key(filename).build();
        GetObjectResponse res = s3Client.getObject(req, Paths.get(filename)).join();

        if (!res.sdkHttpResponse().isSuccessful()) {
            logger.error("Failed to load file {}", filename);
            throw new FileNotFoundException("Failed to load file " + filename);
        }
        logger.info("Successfully loaded file {}", filename);
        return filename;
    }
}
