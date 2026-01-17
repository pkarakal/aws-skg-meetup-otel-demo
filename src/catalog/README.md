# Catalog Service

A product catalog microservice built with Java 25 and Spring Boot 3.5, following Spring Modulith architecture patterns.

## Overview

The Catalog service manages the product catalog and inventory for the e-commerce platform. It provides APIs for product
management, inventory tracking, and image storage, with support for event-driven inventory updates via RabbitMQ.

## Technology Stack

- **Language**: Java 25 (Amazon Corretto)
- **Framework**: Spring Boot 3.5.9
- **Architecture**: Spring Modulith
- **Database**: PostgreSQL (with Flyway migrations)
- **Caching**: Redis
- **Messaging**: RabbitMQ (AMQP)
- **Object Storage**: AWS S3 / MinIO
- **Observability**: OpenTelemetry JavaAgent (auto-instrumentation)

## Architecture

The service follows a modular architecture with ports and adapters:

```
catalog/
├── src/main/java/com/pkarakal/catalog/
│   ├── CatalogApplication.java         # Application entry point
│   ├── config/                          # Configuration classes
│   │   ├── AWSS3Config.java            # S3/MinIO configuration
│   │   ├── DatabaseConfig.java         # DataSource configuration
│   │   └── RabbitMQConfig.java         # AMQP configuration
│   ├── domain/
│   │   ├── models/                      # Domain entities
│   │   │   ├── Product.java
│   │   │   ├── Inventory.java
│   │   │   └── Image.java
│   │   └── ports/                       # Repository interfaces & DTOs
│   ├── application/
│   │   ├── service/                     # Business logic
│   │   │   ├── ProductCatalogService.java
│   │   │   └── ProductInventoryService.java
│   │   └── amqp/                        # Message listeners
│   │       └── InventoryUpdateListener.java
│   └── infrastructure/
│       ├── controller/                  # REST controllers
│       │   └── ProductCatalogController.java
│       └── adapter/                     # Repository implementations
│           ├── ProductRepositoryAdapter.java
│           ├── ProductInventoryRepositoryAdapter.java
│           └── storage/S3StorageAdapter.java
└── src/main/resources/
    ├── application.properties           # Default configuration
    ├── application-minio.properties     # MinIO profile
    └── otel.properties                  # OpenTelemetry settings
```

## Prerequisites

- Java 25 (Amazon Corretto recommended)
- PostgreSQL 16
- Redis 7.x
- RabbitMQ 3.13
- MinIO or AWS S3 (for image storage)
- Docker (optional, for containerized development)

## Configuration

### Application Properties

```properties
spring.application.name=catalog
spring.datasource.url=jdbc:postgresql://localhost:5432/shop
spring.datasource.username=backend
spring.datasource.password=pass
spring.flyway.enabled=true
cloud.aws.region.static=eu-west-1
cloud.aws.s3.bucket-name=catalog
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=admin
spring.rabbitmq.password=admin
```

### Environment Variables

| Variable                      | Description         | Default   |
|-------------------------------|---------------------|-----------|
| `SPRING_DATASOURCE_URL`       | PostgreSQL JDBC URL | -         |
| `SPRING_DATASOURCE_USERNAME`  | Database username   | backend   |
| `SPRING_DATASOURCE_PASSWORD`  | Database password   | -         |
| `SPRING_RABBITMQ_HOST`        | RabbitMQ host       | localhost |
| `SPRING_RABBITMQ_PORT`        | RabbitMQ port       | 5672      |
| `SPRING_RABBITMQ_USERNAME`    | RabbitMQ username   | admin     |
| `SPRING_RABBITMQ_PASSWORD`    | RabbitMQ password   | -         |
| `CLOUD_AWS_REGION_STATIC`     | AWS region          | eu-west-1 |
| `CLOUD_AWS_S3_BUCKET_NAME`    | S3 bucket name      | catalog   |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP endpoint       | -         |

### Spring Profiles

- **default**: Standard configuration for local development
- **minio**: Use MinIO as S3-compatible storage

## Running Locally

Ensure PostgreSQL, Redis, RabbitMQ, and MinIO are running, then:

```bash
cd src/catalog
./gradlew bootRun
```

To use MinIO profile:

```bash
./gradlew bootRun --args='--spring.profiles.active=minio'
```

## Building

```bash
# Build JAR
./gradlew build

# Build without tests
./gradlew build -x test

# Run JAR
java -jar build/libs/catalog-0.2.0-SNAPSHOT.jar
```

The Docker image uses the OpenTelemetry JavaAgent for automatic instrumentation.

## API Endpoints

### Products

| Method   | Endpoint             | Description        |
|----------|----------------------|--------------------|
| `GET`    | `/api/products`      | List all products  |
| `GET`    | `/api/products/{id}` | Get product by ID  |
| `POST`   | `/api/products`      | Create new product |
| `PUT`    | `/api/products/{id}` | Update product     |
| `DELETE` | `/api/products/{id}` | Delete product     |

### Inventory

| Method | Endpoint                       | Description               |
|--------|--------------------------------|---------------------------|
| `GET`  | `/api/products/{id}/inventory` | Get inventory for product |
| `POST` | `/api/products/{id}/inventory` | Create inventory entry    |
| `PUT`  | `/api/products/{id}/inventory` | Update inventory          |

### Images

| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| `POST` | `/api/products/{id}/images` | Upload product image |
| `GET`  | `/api/products/{id}/images` | List product images  |

### Example Requests

**List Products**

```bash
curl http://localhost:8080/api/products
```

**Create Product**

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Product",
    "description": "A sample product",
    "price": 29.99
  }'
```

**Update Inventory**

```bash
curl -X PUT http://localhost:8080/api/products/1/inventory \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100}'
```

## Database Migrations

Flyway handles database migrations automatically on startup. Migration scripts are located in
`src/main/resources/db/migration/`.

## Message Queues

The service listens for inventory update messages on RabbitMQ:

- **Queue**: Inventory updates from Checkout service
- **Purpose**: Decrement stock after successful orders

## Observability

The service uses OpenTelemetry JavaAgent for automatic instrumentation:

- **Traces**: HTTP requests, database queries, Redis operations, RabbitMQ messaging
- **Metrics**: JVM metrics, HTTP metrics, database pool metrics
- **Logs**: Trace context automatically injected into logs

In Docker, the JavaAgent is configured via the Dockerfile and `JAVA_TOOL_OPTIONS` environment variable.

## Health Check

Spring Boot Actuator endpoints:

```bash
# Health check
curl http://localhost:8080/actuator/health

# All actuator endpoints
curl http://localhost:8080/actuator
```
