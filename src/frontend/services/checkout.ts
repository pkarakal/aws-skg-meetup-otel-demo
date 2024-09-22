import {Order} from "@/types/order";
import { trace } from "@opentelemetry/api";

const { CHECKOUT_SERVICE_ADDR = '' } = process.env;


const CheckoutGateway = () => ({
    placeOrder: async (order: Order, cartId: string | string[] | undefined) => {
        return await trace
            .getTracer("fronted.checkout.gateway")
            .startActiveSpan("postPlaceOrder", async (span) => {
                try {
                    return await fetch(`${CHECKOUT_SERVICE_ADDR}/api/v1/checkout/${cartId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(order)
                    });
                } finally {
                    span.end()
                }
            });
    },
});

export default CheckoutGateway();