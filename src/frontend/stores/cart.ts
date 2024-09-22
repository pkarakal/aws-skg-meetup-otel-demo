import {create} from 'zustand'
import {persist} from 'zustand/middleware';
import {CartItem, CartItems, Product} from "@/types/product";

interface CartState {
    cart: CartItems;
    cartId: string | null;
    cartUrl?: string;
    createCart: () => Promise<void>;
    addToCart: (product: Product) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    incrementCartItem: (productId: number) => Promise<void>;
    decrementCartItem: (productId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    setCartUrl: (cart?: string) => void
}

export const useCartStore = create<CartState>()(
    persist((set) => ({
            cart: [],
            cartId: null,
            cartUrl: undefined,

            createCart: async () => {
                const {cartUrl, setCartUrl} = useCartStore.getState();
                const {CART_SERVICE_ADDR} = process.env;
                if (!cartUrl || cartUrl === '') {
                    setCartUrl(CART_SERVICE_ADDR);
                }
                try {
                    const response = await fetch(`${cartUrl}/api/v1/cart`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const data = await response.json();
                    set({cartId: data.id, cart: []});
                } catch (e) {
                    console.error(e);
                    return Promise.reject(e);
                }
            },

            addToCart: async (product: Product) => {
                const {cartId, createCart, cartUrl} = useCartStore.getState();
                if (!cartId) {
                    await createCart();
                }
                try {
                    await fetch(`${cartUrl}/api/v1/cart/${cartId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({...product, product_id: product.id, quantity: 1}),
                    });
                    set((state: CartState) => {
                        const existingItem = state.cart.find((item) => item.product_id === product.id);
                        if (existingItem) {
                            return {
                                cart: state.cart.map((item) =>
                                    item.product_id === product.id
                                        ? {...item, quantity: item.quantity + 1}
                                        : item
                                ),
                            };
                        } else {
                            return {
                                cart: [...state.cart, {
                                    product_id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    quantity: 1
                                }],
                            };
                        }
                    });
                } catch (e) {
                    console.error(e);
                    return Promise.reject(e);
                }
            },

            incrementCartItem: async (productId: number) => {
                const {cartId, cart, cartUrl} = useCartStore.getState();
                if (!cartId) {
                    return Promise.reject();
                }
                try {
                    const res = await fetch(`${cartUrl}/api/v1/cart/${cartId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(cart.filter(x => x.product_id == productId).at(0))
                    });
                    if (!res) {
                        return Promise.reject("Failed to increment cart item")
                    }
                    set((state) => ({
                        cart: state.cart.map((item) =>
                            item.product_id === productId ? {...item, quantity: item.quantity + 1} : item
                        ),
                    }));
                } catch (e) {
                    console.error(e)
                    return Promise.reject(e)
                }
            },

            decrementCartItem: async (productId: number) => {
                const {cartId, cart, cartUrl} = useCartStore.getState();
                if (!cartId) {
                    return Promise.reject()
                }
                const item = cart.filter(x => x.product_id === productId);
                let body = {...item[0], product_id: productId, quantity: item[0].quantity - 1};
                await fetch(`${cartUrl}/api/v1/cart/${cartId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body), // Assuming the API supports this
                });
                set((state) => {
                    const item = state.cart.find((item) => item.product_id === productId);
                    if (item && item.quantity > 1) {
                        return {
                            cart: state.cart.map((cartItem) =>
                                cartItem.product_id === productId
                                    ? {...cartItem, quantity: cartItem.quantity - 1}
                                    : cartItem
                            ),
                        };
                    } else {
                        return {
                            cart: state.cart.filter((cartItem) => cartItem.product_id !== productId),
                        };
                    }
                });
            },

            removeFromCart: async (productId: number) => {
                const {cartId, cartUrl, cart} = useCartStore.getState();
                if (!cartId) {
                    return Promise.reject()
                }
                const item = cart.filter(x => x.product_id === productId);
                const body = {...item[0], quantity: 0}
                await fetch(`${cartUrl}/api/v1/cart/${cartId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body)
                })
                set((state) => ({cart: state.cart.filter((item) => item.product_id !== productId)}));
            },
            clearCart: async () => {
                set({cart: []})
                const {cartId, cartUrl} = useCartStore.getState();
                if (cartId) {
                    await fetch(`${cartUrl}/api/v1/cart/${cartId}/empty`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                }
            },
            setCartUrl: (cart?: string) => {
                set((state) => ({cartUrl: cart}));
            }
        }),
        {
            name: 'cart-storage'
        }
    )
);
