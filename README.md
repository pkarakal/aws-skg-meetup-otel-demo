# AWS SKG Meetup: OpenTelemetry Demo

A polyglot microservices demo application showcasing end-to-end observability with OpenTelemetry. This e-commerce
platform demonstrates distributed tracing, metrics collection, and structured logging across services written in Go,
Java, Python, and TypeScript.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  Frontend                                   │
│                            (Next.js / TypeScript)                           │
│                                  :3001                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                    │                    │
                    ▼                    ▼                    ▼
        ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │       Cart        │ │      Catalog      │ │     Checkout      │
        │    (Go 1.25)      │ │  (Java 25/Spring) │ │    (Go 1.24)      │
        │      :8081        │ │       :8080       │ │      :8082        │
        └───────────────────┘ └───────────────────┘ └───────────────────┘
                │                    │                    │
                ▼                    ▼                    ▼
        ┌───────────┐    ┌─────────────────────┐  ┌───────────────────┐
        │   Redis   │    │    PostgreSQL       │  │     Payment       │
        │           │    │    Redis │ MinIO    │  │ (Python/FastAPI)  │
        └───────────┘    │    RabbitMQ         │  │   AWS Lambda      │
                         └─────────────────────┘  └───────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         OpenTelemetry Collector                             │
│                            :4317 (gRPC) :4318 (HTTP)                        │
└─────────────────────────────────────────────────────────────────────────────┘
         │                         │                         │
         ▼                         ▼                         ▼
   ┌───────────┐            ┌───────────┐            ┌───────────┐
   │   Tempo   │            │   Mimir   │            │   Loki    │
   │  (Traces) │            │ (Metrics) │            │  (Logs)   │
   └───────────┘            └───────────┘            └───────────┘
         │                         │                         │
         └─────────────────────────┴─────────────────────────┘
                                   │
                                   ▼
                            ┌───────────┐
                            │  Grafana  │
                            │   :3000   │
                            └───────────┘
```

## Services

| Service      | Technology                | Port   | Description                                                             |
|--------------|---------------------------|--------|-------------------------------------------------------------------------|
| **Frontend** | Next.js 14 / TypeScript   | 3001   | Web UI with App Router, Zustand state management, Radix UI components   |
| **Cart**     | Go 1.25                   | 8081   | Redis-backed shopping cart with clean architecture                      |
| **Catalog**  | Java 25 / Spring Boot 3.5 | 8080   | Product catalog with PostgreSQL, Redis caching, RabbitMQ, MinIO storage |
| **Checkout** | Go 1.24                   | 8082   | Order orchestrator coordinating cart, catalog, and payment services     |
| **Payment**  | Python 3.14 / FastAPI     | Lambda | Mock payment processing deployed as AWS Lambda                          |

## Prerequisites

### Required Tools

| Tool               | Version                          | Purpose                                 |
|--------------------|----------------------------------|-----------------------------------------|
| **Docker**         | 24+                              | Container runtime for local development |
| **Docker Compose** | v2+                              | Multi-container orchestration           |
| **Go**             | 1.24+                            | Cart and Checkout services              |
| **Java**           | 25 (Amazon Corretto recommended) | Catalog service                         |
| **Node.js**        | 20+                              | Frontend development                    |
| **Python**         | 3.14                             | Payment service                         |
| **uv**             | Latest                           | Python package manager                  |
| **AWS SAM CLI**    | Latest                           | Payment Lambda deployment (optional)    |

### Optional Tools

| Tool          | Purpose                       |
|---------------|-------------------------------|
| **kubectl**   | Kubernetes cluster management |
| **Helm**      | Kubernetes package manager    |
| **Terraform** | Infrastructure provisioning   |

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd aws-meetup
```

### 2. Start with Docker Compose (Recommended)

This starts all services including the observability stack:

```bash
docker-compose up -d
```

Wait for all services to be healthy, then access:

- **Frontend**: http://localhost:3001
- **Grafana**: http://localhost:3000 (admin/admin)
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### 3. Stop Services

```bash
docker-compose down
```

To also remove volumes (database data, etc.):

```bash
docker-compose down -v
```

## Local Development

For active development, you can run individual services locally while keeping infrastructure in Docker.

### Start Infrastructure Only

```bash
docker-compose up -d postgres redis rabbitmq minio otel-collector tempo mimir loki grafana
```

### Run Services Locally

**Cart Service (Go)**

```bash
cd src/cart
go run main.go
```

**Catalog Service (Java)**

```bash
cd src/catalog
./gradlew bootRun
```

**Checkout Service (Go)**

```bash
cd src/checkout
go run main.go
```

**Payment Service (Python)**

```bash
cd src/payment
uv sync
uv run uvicorn main:app --reload --port 8000
```

**Frontend (Next.js)**

```bash
cd src/frontend
npm ci
npm run dev
```

## Building Docker Images

```bash
# Build all images
docker build -t cart:latest src/cart/
docker build -t catalog:latest src/catalog/
docker build -t checkout:latest src/checkout/
docker build -t frontend:latest src/frontend/

# Or use docker-compose
docker-compose build
```

## Configuration

### Environment Variables

Services are configured via environment variables. Key variables include:

| Variable                      | Service            | Description                      |
|-------------------------------|--------------------|----------------------------------|
| `CATALOG_SERVICE_ADDR`        | Frontend, Checkout | Catalog service URL              |
| `CART_SERVICE_ADDR`           | Frontend, Checkout | Cart service URL                 |
| `CHECKOUT_SERVICE_ADDR`       | Frontend           | Checkout service URL             |
| `PAYMENT_SERVICE_ADDR`        | Checkout           | Payment service URL              |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | All                | OpenTelemetry Collector endpoint |
| `REDIS_HOST`                  | Cart, Catalog      | Redis connection host            |
| `POSTGRES_HOST`               | Catalog            | PostgreSQL host                  |
| `RABBITMQ_HOST`               | Catalog, Checkout  | RabbitMQ host                    |

### Go Services (Cart, Checkout)

Use Viper with YAML config files. Config is searched in:

- Current directory (`config.yaml`)
- `/config/`
- `/etc/{service}/`

Environment variables override config file values.

### Java Service (Catalog)

Standard Spring Boot configuration via `application.yaml` and environment variables.

### Frontend

Environment variables loaded from `.env` or system environment.

## Observability

All services are instrumented with OpenTelemetry for:

- **Distributed Tracing**: End-to-end request tracking across services
- **Metrics**: Service health, latency, throughput
- **Structured Logging**: Correlated logs with trace context

### Accessing Telemetry Data

1. Open Grafana at http://localhost:3000
2. Navigate to **Explore**
3. Select data source:
    - **Tempo** for traces
    - **Mimir** for metrics
    - **Loki** for logs

### OTLP Endpoints

| Protocol | Port | URL                          |
|----------|------|------------------------------|
| gRPC     | 4317 | `otel-collector:4317`        |
| HTTP     | 4318 | `http://otel-collector:4318` |

## Project Structure

```
aws-meetup/
├── src/
│   ├── cart/           # Go shopping cart service
│   ├── catalog/        # Java product catalog service
│   ├── checkout/       # Go checkout orchestrator
│   ├── payment/        # Python payment processor (Lambda)
│   └── frontend/       # Next.js web application
├── deployment/         # Helm charts for Kubernetes
├── kubernetes/         # Terraform for AWS EKS
├── telemetry/          # OpenTelemetry Collector configuration
├── docker-compose.yml  # Local development setup
└── README.md
```

## Key Ports Reference

| Service/Component   | Port  |
|---------------------|-------|
| Frontend            | 3001  |
| Catalog             | 8080  |
| Cart                | 8081  |
| Checkout            | 8082  |
| Payment (local)     | 8000  |
| Grafana             | 3000  |
| OTLP gRPC           | 4317  |
| OTLP HTTP           | 4318  |
| RabbitMQ Management | 15672 |
| PostgreSQL          | 5432  |
| Redis               | 6379  |

## Troubleshooting

### Services not starting

1. Ensure Docker is running
2. Check if ports are available: `lsof -i :3001` (or relevant port)
3. View logs: `docker-compose logs -f <service-name>`

### Database connection issues

1. Verify infrastructure is running: `docker-compose ps`
2. Check PostgreSQL logs: `docker-compose logs postgres`
3. Ensure migrations completed (Catalog service runs Flyway on startup)

### No traces appearing in Grafana

1. Verify OTEL Collector is running: `docker-compose logs otel-collector`
2. Check service OTLP endpoint configuration
3. Ensure Tempo is receiving data: Check Tempo logs
