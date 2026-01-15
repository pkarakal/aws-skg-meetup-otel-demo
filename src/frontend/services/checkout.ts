import {CheckoutResponse, Order} from "@/types/order";
import { trace } from "@opentelemetry/api";

const { CHECKOUT_SERVICE_ADDR = '' } = process.env;


const CheckoutGateway = () => ({
    placeOrder: async (order: Order, cartId: string | string[] | undefined): Promise<{ok: boolean, data?: CheckoutResponse}> => {
        return trace
            .getTracer("frontend.checkout.gateway")
            .startActiveSpan("postPlaceOrder", async (span) => {
                try {
                    const response = await fetch(`${CHECKOUT_SERVICE_ADDR}/api/v1/checkout/${cartId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(order)
                    });

                    if (!response.ok) {
                        return { ok: false };
                    }

                    const data = await response.json() as CheckoutResponse;
                    return { ok: true, data };
                } catch (e) {
                    console.error("Failed to place order", e)
                    return { ok: false };
                } finally {
                    span.end()
                }
            });
    },
});

export default CheckoutGateway();