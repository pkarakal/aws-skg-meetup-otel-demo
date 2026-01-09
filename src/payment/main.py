import asyncio
import logging
import random
import time
import uuid
from enum import Enum

from fastapi import FastAPI
from mangum import Mangum
from opentelemetry import metrics, trace
from pydantic import BaseModel

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

payment_counter = meter.create_counter(
    name="payments.total",
    description="Total number of payment requests",
    unit="1",
)

payment_failure_counter = meter.create_counter(
    name="payments.failures",
    description="Total number of failed payments",
    unit="1",
)

payment_duration_histogram = meter.create_histogram(
    name="payments.duration",
    description="Duration of payment processing",
    unit="s",
)


class PaymentStatus(str, Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class FailureReason(str, Enum):
    CARD_DECLINED = "CARD_DECLINED"
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
    EXPIRED_CARD = "EXPIRED_CARD"
    INVALID_CVV = "INVALID_CVV"
    SUSPECTED_FRAUD = "SUSPECTED_FRAUD"
    NETWORK_ERROR = "NETWORK_ERROR"
    ISSUER_UNAVAILABLE = "ISSUER_UNAVAILABLE"


FAILURE_MESSAGES = {
    FailureReason.CARD_DECLINED: "The card was declined by the issuing bank",
    FailureReason.INSUFFICIENT_FUNDS: "The account has insufficient funds for this transaction",
    FailureReason.EXPIRED_CARD: "The card has expired",
    FailureReason.INVALID_CVV: "The CVV code provided is invalid",
    FailureReason.SUSPECTED_FRAUD: "The transaction was flagged as potentially fraudulent",
    FailureReason.NETWORK_ERROR: "A network error occurred while processing the payment",
    FailureReason.ISSUER_UNAVAILABLE: "The card issuer is currently unavailable",
}


class PaymentRequest(BaseModel):
    amount: float
    currency: str = "EUR"
    card_number: str
    card_holder: str
    expiry_date: str
    cvv: str


class PaymentResponse(BaseModel):
    status: PaymentStatus
    transaction_id: str
    failure_reason: FailureReason | None = None
    message: str


app = FastAPI(
    title="Payment Service",
    description="A mock payment processing service",
    version="1.0.0",
)


@app.post("/payments", response_model=PaymentResponse)
async def process_payment(payment: PaymentRequest) -> PaymentResponse:
    start_time = time.perf_counter()
    attributes = {"currency": payment.currency}

    logger.info(
        "Received payment request",
        extra={"amount": payment.amount, "currency": payment.currency},
    )

    payment_counter.add(1, attributes)

    with tracer.start_as_current_span("process_payment") as span:
        span.set_attribute("payment.amount", payment.amount)
        span.set_attribute("payment.currency", payment.currency)

        # Simulate processing delay (2-5 seconds)
        with tracer.start_as_current_span("payment_gateway_call"):
            logger.debug("Calling payment gateway")
            delay = random.uniform(2, 5)
            await asyncio.sleep(delay)

        # Generate a unique transaction ID using UUID
        transaction_id = str(uuid.uuid4())
        span.set_attribute("payment.transaction_id", transaction_id)

        # Randomly determine if payment succeeds (70% success rate)
        is_successful = random.random() < 0.7

        duration = time.perf_counter() - start_time
        payment_duration_histogram.record(duration, attributes)

        if is_successful:
            span.set_attribute("payment.status", PaymentStatus.SUCCESS.value)
            logger.info(
                "Payment processed successfully",
                extra={
                    "transaction_id": transaction_id,
                    "amount": payment.amount,
                    "currency": payment.currency,
                    "duration_seconds": duration,
                },
            )
            return PaymentResponse(
                status=PaymentStatus.SUCCESS,
                transaction_id=transaction_id,
                failure_reason=None,
                message=f"Payment of {payment.amount} {payment.currency} processed successfully",
            )
        else:
            failure_reason = random.choice(list(FailureReason))
            span.set_attribute("payment.status", PaymentStatus.FAILED.value)
            span.set_attribute("payment.failure_reason", failure_reason.value)
            payment_failure_counter.add(1, {**attributes, "reason": failure_reason.value})
            logger.warning(
                "Payment failed",
                extra={
                    "transaction_id": transaction_id,
                    "amount": payment.amount,
                    "currency": payment.currency,
                    "failure_reason": failure_reason.value,
                    "duration_seconds": duration,
                },
            )
            return PaymentResponse(
                status=PaymentStatus.FAILED,
                transaction_id=transaction_id,
                failure_reason=failure_reason,
                message=FAILURE_MESSAGES[failure_reason],
            )


@app.get("/health")
async def health_check() -> dict:
    return {"status": "healthy"}


# Lambda handler using Mangum
handler = Mangum(app)


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting payment service on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
