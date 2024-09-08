package com.pkarakal.catalog.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.transfer.s3.S3TransferManager;

import java.net.URI;

@Configuration
public class AWSS3Config {

    private final Logger logger = LoggerFactory.getLogger(AWSS3Config.class);

    @Value("${minio.enabled}")
    private boolean minioEnabled;

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.access-key}")
    private String minioAccessKey;

    @Value("${minio.secret-key}")
    private String minioSecretKey;

    @Value("${cloud.aws.region.static}")
    private String awsRegion;

    @Value("${cloud.aws.s3.bucket-name}")
    private String bucketName;


    @Primary
    @Bean
    public S3AsyncClient s3Client() {
        if (minioEnabled) {
            var client =  S3AsyncClient.builder()
                    .endpointOverride(URI.create(minioUrl))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(minioAccessKey, minioSecretKey)))
                    .region(Region.EU_WEST_1)
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .build())
                    .build();
            // Create bucket if it doesn't exist (for MinIO)
            CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            try {
                client.createBucket(createBucketRequest);
            } catch (BucketAlreadyOwnedByYouException _) {
                // do nothing
                logger.info("Bucket {} already exists. Ignoring error", bucketName);
            }
            return client;
        }
        return S3AsyncClient.builder()
                .region(Region.of(awsRegion))
                .build();
    }
}
