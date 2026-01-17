import {trace} from "@opentelemetry/api";
import {Cart} from "@/types/cart";
import {Product} from "@/types/product";

const {CART_SERVICE_ADDR = ''} = process.env;


const CartGateway = () => ({
    createCart: async () => {
        return trace
            .getTracer("frontend.cart.gateway")
            .startActiveSpan("createCart", async (span) => {
                try {
                    const response = await fetch(`${CART_SERVICE_ADDR}/api/v1/cart`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to create cart: ${response.status}`);
                    }
                    return await response.json() as Cart
                } catch (err) {
                    console.error("Failed to create a new cart", err);
                    throw err;
                } finally {
                    span.end()
                }
            });
    },
    getCart: async (cartId: string): Promise<Cart> => {
        return trace
            .getTracer("frontend.cart.gateway")
            .startActiveSpan("getCart", async (span) => {
                try {
                    const response = await fetch(`${CART_SERVICE_ADDR}/api/v1/cart/${cartId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to get cart: ${response.status}`);
                    }
                    return await response.json() as Cart
                } catch (err) {
                    console.error("Failed to get cart", err);
                    throw err;
                } finally {
                    span.end()
                }
            });
    },
    addToCart: async(cartId: string|number, product: Product): Promise<Cart> => {
        return trace
            .getTracer("frontend.cart.gateway")
            .startActiveSpan("addToCart", async (span) => {
                try {
                    const response = await fetch(`${CART_SERVICE_ADDR}/api/v1/cart/${cartId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({...product, product_id: product.id, quantity: 1}),
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to add to cart: ${response.status}`);
                    }
                    return await response.json() as Cart
                } catch (e) {
                    console.error("Failed to add item to cart", e);
                    throw e;
                } finally {
                    span.end()
                }
            });
    },
    emptyCart: async(cartId: string|number): Promise<Cart> => {
        return trace
            .getTracer("frontend.cart.gateway")
            .startActiveSpan("emptyCart", async (span) => {
                try {
                    const response = await fetch(`${CART_SERVICE_ADDR}/api/v1/cart/${cartId}/empty`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to empty cart: ${response.status}`);
                    }
                    return await response.json() as Cart
                } catch (e) {
                    console.error("Failed to empty cart", e);
                    throw e;
                } finally {
                    span.end()
                }
            });
    }
});

export default CartGateway();