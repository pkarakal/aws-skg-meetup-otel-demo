"use client";

import React from "react";
import { useCartStore, useCartHydration } from "@/stores/cart";
import { cn } from "@/lib/utils";

interface CartBadgeProps {
    className?: string;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ className }) => {
    const { cart } = useCartStore();
    const isHydrated = useCartHydration();

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (!isHydrated || itemCount === 0) {
        return null;
    }

    return (
        <span
            className={cn(
                "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center",
                "rounded-full bg-primary text-[10px] font-semibold text-primary-foreground",
                "animate-in zoom-in-50 duration-200",
                className
            )}
        >
            {itemCount > 99 ? "99+" : itemCount}
        </span>
    );
};
