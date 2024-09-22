import React from "react";
import {useCartStore} from "@/stores/cart";


export const CartTotalComponent: React.FC = () => {
    const {cart} = useCartStore();

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="mt-6 text-right">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <p className="text-lg justify-end font-semibold">Total: ${total.toFixed(2)}</p>
        </div>
    )
}