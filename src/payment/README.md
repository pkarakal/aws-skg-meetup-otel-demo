# Payment Service

A mock payment processing microservice built with Python and FastAPI, designed to run as an AWS Lambda function.

## Overview

The Payment service simulates payment processing for the e-commerce platform. It provides a RESTful API for processing
payment requests with mock success/failure responses. The service is designed to run both locally (via Uvicorn) and as
an AWS Lambda function (via Mangum adapter).

**Note**: This is a demo service with simulated payment processing (70% success rate, random delays). Do not use for
real payment processing.

## Technology Stack

- **Language**: Python 3.14
- **Framework**: FastAPI
- **Lambda Adapter**: Mangum
- **Package Manager**: uv
- **Observability**: OpenTelemetry (traces, metrics, logs)
- **Deployment**: AWS SAM (Serverless Application Model)

## Architecture

```
payment/
├── main.py              # FastAPI application and Lambda handler
├── pyproject.toml       # Project dependencies (uv)
├── template.yaml        # AWS SAM deployment template
└── README.md
```

## Prerequisites

- Python 3.14
- uv (Python package manager)
- Docker (optional, for containerized development)
- AWS SAM CLI (for Lambda deployment)
- AWS CLI (configured for Lambda deployment)

## Configuration

### Environment Variables

| Variable                      | Description                | Default              |
|-------------------------------|----------------------------|----------------------|
| `LOG_LEVEL`                   | Logging level              | INFO                 |
| `OTEL_SERVICE_NAME`           | OpenTelemetry service name | payment-service      |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP endpoint URL          | -                    |
| `OTEL_PROPAGATORS`            | Context propagators        | tracecontext,baggage |

### Lambda-specific Variables

When deployed to AWS Lambda, additional variables are set:

| Variable                                | Description                  |
|-----------------------------------------|------------------------------|
| `AWS_LAMBDA_EXEC_WRAPPER`               | OpenTelemetry Lambda wrapper |
| `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS` | Disabled instrumentations    |

## Running Locally

### With uv (Recommended)

```bash
cd src/payment

# Install dependencies
uv sync

# Run the service
uv run uvicorn main:app --reload --port 8000
```

### With OpenTelemetry Instrumentation

For local development with full telemetry:

```bash
cd src/payment

# Install dev dependencies (includes OTEL instrumentation)
uv sync --group dev

# Run with auto-instrumentation
OTEL_SERVICE_NAME=payment-service uv run opentelemetry-instrument uvicorn main:app --port 8000
```

## API Endpoints

| Method | Endpoint    | Description       |
|--------|-------------|-------------------|
| `POST` | `/payments` | Process a payment |
| `GET`  | `/health`   | Health check      |

### Process Payment

**Request**

```bash
curl -X POST http://localhost:8000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "EUR",
    "card_number": "4111111111111111",
    "card_holder": "John Doe",
    "expiry_date": "12/25",
    "cvv": "123"
  }'
```

**Success Response (70% probability)**

```json
{
  "status": "SUCCESS",
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "failure_reason": null,
  "message": "Payment of 99.99 EUR processed successfully"
}
```

**Failure Response (30% probability)**

```json
{
  "status": "FAILED",
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "failure_reason": "CARD_DECLINED",
  "message": "The card was declined by the issuing bank"
}
```

### Failure Reasons

The service randomly returns one of these failure reasons:

| Code                 | Description                                           |
|----------------------|-------------------------------------------------------|
| `CARD_DECLINED`      | The card was declined by the issuing bank             |
| `INSUFFICIENT_FUNDS` | The account has insufficient funds                    |
| `EXPIRED_CARD`       | The card has expired                                  |
| `INVALID_CVV`        | The CVV code provided is invalid                      |
| `SUSPECTED_FRAUD`    | The transaction was flagged as potentially fraudulent |
| `NETWORK_ERROR`      | A network error occurred while processing             |
| `ISSUER_UNAVAILABLE` | The card issuer is currently unavailable              |

### Health Check

```bash
curl http://localhost:8000/health
```

Response:

```json
{
  "status": "healthy"
}
```

## AWS Lambda Deployment

### Using SAM CLI

```bash
cd src/payment

# Build the Lambda package
sam build

# Deploy (interactive)
sam deploy --guided

# Deploy with saved config
sam deploy
```

### SAM Template

The `template.yaml` configures:

- Python 3.14 runtime
- 256 MB memory, 30-second timeout
- OpenTelemetry Lambda layers (instrumentation + collector)
- API Gateway integration

### Lambda Layers

The deployment includes AWS-managed OpenTelemetry layers:

- `opentelemetry-python-0_13_0` - Python auto-instrumentation
- `opentelemetry-collector-amd64-0_13_0` - OTLP collector sidecar

## API Documentation

When running locally, FastAPI provides automatic API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Observability

The service exports the following telemetry:

### Metrics

| Metric              | Type      | Description                 |
|---------------------|-----------|-----------------------------|
| `payments.total`    | Counter   | Total payment requests      |
| `payments.failures` | Counter   | Failed payments (by reason) |
| `payments.duration` | Histogram | Payment processing duration |

### Traces

- `process_payment` - Main payment processing span
- `payment_gateway_call` - Simulated gateway call (2-5s delay)

### Span Attributes

| Attribute                | Description                |
|--------------------------|----------------------------|
| `payment.amount`         | Transaction amount         |
| `payment.currency`       | Currency code              |
| `payment.transaction_id` | Generated transaction ID   |
| `payment.status`         | SUCCESS or FAILED          |
| `payment.failure_reason` | Failure reason (if failed) |

## Development Notes

- The service simulates processing delays (2-5 seconds) to mimic real payment gateway behavior
- Success rate is fixed at 70% for demo purposes
- Transaction IDs are UUIDs generated for each request
- The Mangum adapter allows the same FastAPI app to run on Lambda without code changes
