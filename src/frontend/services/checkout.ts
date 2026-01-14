import {Order} from "@/types/order";
import { trace } from "@opentelemetry/api";

const { CHECKOUT_SERVICE_ADDR = '' } = process.env;


const CheckoutGateway = () => ({
    placeOrder: async (order: Order, cartId: string | string[] | undefined) => {
        return trace
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
                } catch (e) {
                    console.error("Failed to place order", e)
                    return new Response(JSON.stringify({ error: "Checkout service unavailable" }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                } finally {
                    span.end()
                }
            });
    },
});

export default CheckoutGateway();