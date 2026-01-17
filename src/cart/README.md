# Cart Service

A Redis-backed shopping cart microservice written in Go, following clean architecture principles.

## Overview

The Cart service manages shopping cart operations for the e-commerce platform. It provides a RESTful API for adding,
removing, and retrieving cart items, with all data persisted in Redis.

## Technology Stack

- **Language**: Go 1.25
- **Storage**: Redis
- **Configuration**: Viper (YAML + environment variables)
- **Observability**: OpenTelemetry (traces, metrics, logs)
- **Logging**: Zap with OTEL bridge

## Architecture

The service follows a clean architecture pattern:

```
cart/
├── main.go                 # Application entry point
├── config/                 # Configuration loading (Viper)
├── model/                  # Domain models (Cart, CartItem)
├── ports/                  # Interface definitions (Repository)
├── application/            # Business logic and use cases
├── infrastructure/
│   ├── handlers/           # HTTP handlers (API endpoints)
│   └── redis/              # Redis repository implementation
├── router/                 # HTTP router setup
└── telemetry/              # OpenTelemetry initialization
```

## Prerequisites

- Go 1.24 or higher
- Redis 7.x
- Docker (optional, for containerized development)

## Configuration

Configuration is loaded via Viper from `config.yaml` or environment variables.

### Config File (`config.yaml`)

```yaml
port: 8081
redis:
  server: localhost
  port: 6379
  useTLS: false
  auth:
    username: default
    password: "your-password"
telemetry:
  enabled: true
  collector_url: localhost
  collector_port: 4317
```

### Environment Variables

| Variable                   | Description              | Default   |
|----------------------------|--------------------------|-----------|
| `PORT`                     | HTTP server port         | 8081      |
| `REDIS_SERVER`             | Redis host               | localhost |
| `REDIS_PORT`               | Redis port               | 6379      |
| `REDIS_AUTH_PASSWORD`      | Redis password           | -         |
| `TELEMETRY_ENABLED`        | Enable OpenTelemetry     | true      |
| `TELEMETRY_COLLECTOR_URL`  | OTEL Collector host      | localhost |
| `TELEMETRY_COLLECTOR_PORT` | OTEL Collector gRPC port | 4317      |

Config file search paths: `.`, `/`, `./config`, `/etc/cart`

## Running Locally

```bash
# Run the service
cd src/cart
go run main.go
```

## Building

```bash
# Build binary
go build -o cart .

# Run binary
./cart
```

### Docker

```bash
docker build -t cart:latest .
docker run -p 8081:8081 cart:latest
```

## API Endpoints

| Method   | Endpoint                        | Description           |
|----------|---------------------------------|-----------------------|
| `GET`    | `/cart/{userId}`                | Get cart for user     |
| `POST`   | `/cart/{userId}/items`          | Add item to cart      |
| `DELETE` | `/cart/{userId}/items/{itemId}` | Remove item from cart |
| `DELETE` | `/cart/{userId}`                | Clear entire cart     |

### Example Requests

**Get Cart**

```bash
curl http://localhost:8081/cart/123
```

**Add Item**

```bash
curl -X POST http://localhost:8081/cart/123/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod-1", "quantity": 2}'
```

**Clear Cart**

```bash
curl -X DELETE http://localhost:8081/cart/123
```

## Observability

The service is fully instrumented with OpenTelemetry:

- **Traces**: HTTP requests and Redis operations are traced
- **Metrics**: Host and runtime metrics, Redis operation metrics
- **Logs**: Structured logging via Zap with trace context correlation

Telemetry is exported via OTLP gRPC to the configured collector.
