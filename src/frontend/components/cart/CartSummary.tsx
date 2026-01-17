"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
    subtotal: number;
    shipping?: number;
    className?: string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
    subtotal,
    shipping = 0,
    className,
}) => {
    const total = subtotal + shipping;

    return (
        <div className={className}>
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};
