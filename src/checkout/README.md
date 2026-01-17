# Checkout Service

An order orchestrator microservice written in Go that coordinates the checkout flow across cart, catalog, and payment
services.

## Overview

The Checkout service manages the order placement process for the e-commerce platform. It orchestrates interactions
between multiple services:

1. Retrieves cart contents from the Cart service
2. Validates product availability with the Catalog service
3. Processes payment through the Payment service
4. Publishes inventory update events to RabbitMQ

## Technology Stack

- **Language**: Go 1.24
- **Messaging**: RabbitMQ (AMQP)
- **Configuration**: Viper (YAML + environment variables)
- **Observability**: OpenTelemetry (traces, metrics, logs)
- **Logging**: Zap with OTEL bridge

## Architecture

The service follows a clean architecture pattern:

```
checkout/
├── main.go                 # Application entry point
├── config/                 # Configuration loading (Viper)
├── models/                 # Domain models
│   ├── cart.go            # Cart/CartItem models
│   ├── product.go         # Product models
│   └── order.go           # Order models
├── ports/                  # Interface definitions
│   ├── cart/              # Cart repository interface
│   ├── catalog/           # Catalog repository interface
│   └── checkout.go        # Checkout orchestrator interface
├── application/
│   └── service.go         # Business logic / use cases
├── infrastructure/
│   ├── checkout.go        # Checkout orchestrator implementation
│   ├── handlers/          # HTTP handlers (API endpoints)
│   └── clients/           # External service clients
│       ├── cart/          # Cart service HTTP client
│       ├── catalog/       # Catalog service HTTP client
│       ├── payment/       # Payment service HTTP client
│       └── rabbitmq/      # RabbitMQ publisher
├── router/                 # HTTP router setup
└── telemetry/              # OpenTelemetry initialization
```

## Prerequisites

- Go 1.24 or higher
- RabbitMQ 3.13
- Running instances of:
    - Cart service (port 8081)
    - Catalog service (port 8080)
    - Payment service (port 8000)
- Docker (optional, for containerized development)

## Configuration

Configuration is loaded via Viper from `config.yaml` or environment variables.

### Config File (`config.yaml`)

```yaml
port: 8082

catalog:
  protocol: http
  server: localhost
  port: 8080
  path: ""
  timeout: 3

cart:
  protocol: http
  server: localhost
  port: 8081
  path: "/api/v1"
  timeout: 3

payment:
  protocol: http
  server: localhost
  port: 8000
  path: ""
  timeout: 10

rabbitmq:
  host: localhost
  port: 5672
  username: admin
  password: admin
  exchange: inventory_update

telemetry:
  enabled: true
  collector_url: localhost
  collector_port: 4317
```

### Environment Variables

| Variable                   | Description              | Default          |
|----------------------------|--------------------------|------------------|
| `PORT`                     | HTTP server port         | 8082             |
| `CATALOG_PROTOCOL`         | Catalog service protocol | http             |
| `CATALOG_SERVER`           | Catalog service host     | localhost        |
| `CATALOG_PORT`             | Catalog service port     | 8080             |
| `CART_PROTOCOL`            | Cart service protocol    | http             |
| `CART_SERVER`              | Cart service host        | localhost        |
| `CART_PORT`                | Cart service port        | 8081             |
| `PAYMENT_PROTOCOL`         | Payment service protocol | http             |
| `PAYMENT_SERVER`           | Payment service host     | localhost        |
| `PAYMENT_PORT`             | Payment service port     | 8000             |
| `RABBITMQ_HOST`            | RabbitMQ host            | localhost        |
| `RABBITMQ_PORT`            | RabbitMQ port            | 5672             |
| `RABBITMQ_USERNAME`        | RabbitMQ username        | admin            |
| `RABBITMQ_PASSWORD`        | RabbitMQ password        | admin            |
| `RABBITMQ_EXCHANGE`        | RabbitMQ exchange name   | inventory_update |
| `TELEMETRY_ENABLED`        | Enable OpenTelemetry     | true             |
| `TELEMETRY_COLLECTOR_URL`  | OTEL Collector host      | localhost        |
| `TELEMETRY_COLLECTOR_PORT` | OTEL Collector gRPC port | 4317             |

Config file search paths: `.`, `/`, `./config`, `/etc/checkout`

## Running Locally

Ensure all dependent services are running, then:

```bash
cd src/checkout
go run main.go
```

## Building

```bash
# Build binary
go build -o checkout .

# Run binary
./checkout
```

### Docker

```bash
docker build -t checkout:latest .
docker run -p 8082:8082 checkout:latest
```

## API Endpoints

| Method | Endpoint    | Description                      |
|--------|-------------|----------------------------------|
| `POST` | `/checkout` | Process checkout for user's cart |

### Checkout Flow

1. **Retrieve Cart**: Fetches user's cart from Cart service
2. **Validate Products**: Checks product availability and prices with Catalog service
3. **Process Payment**: Sends payment request to Payment service
4. **Publish Events**: Publishes inventory update messages to RabbitMQ
5. **Clear Cart**: Removes items from user's cart after successful checkout

### Example Request

**Process Checkout**

```bash
curl -X POST http://localhost:8082/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "paymentMethod": {
      "type": "credit_card",
      "cardNumber": "4111111111111111",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "cvv": "123"
    },
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    }
  }'
```

### Response

```json
{
  "orderId": "ord-abc123",
  "status": "confirmed",
  "total": 99.99,
  "items": [
    {
      "productId": "prod-1",
      "name": "Sample Product",
      "quantity": 2,
      "price": 49.99
    }
  ]
}
```

## Message Publishing

After successful checkout, the service publishes inventory update messages to RabbitMQ:

- **Exchange**: `inventory_update` (configurable)
- **Message Format**: JSON with product IDs and quantities to decrement

The Catalog service consumes these messages to update inventory levels.

## Observability

The service is fully instrumented with OpenTelemetry:

- **Traces**: HTTP requests, outbound HTTP calls to services, RabbitMQ publishing
- **Metrics**: Host and runtime metrics, HTTP client metrics per service
- **Logs**: Structured logging via Zap with trace context correlation

Each external service client (cart, catalog, payment) has dedicated metrics for:

- Request counts
- Latency histograms
- Error rates

Telemetry is exported via OTLP gRPC to the configured collector.

## Error Handling

The checkout process handles various failure scenarios:

- **Cart empty**: Returns 400 Bad Request
- **Product unavailable**: Returns 409 Conflict with details
- **Payment declined**: Returns 402 Payment Required
- **Service unavailable**: Returns 503 with retry headers
