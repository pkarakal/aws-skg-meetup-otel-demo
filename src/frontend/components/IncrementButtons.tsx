"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { Product } from "@/types/product";

interface IncrementButtonsProps {
    product: Product;
    quantity: number;
}

export const IncrementButtons: React.FC<IncrementButtonsProps> = ({ product, quantity }) => {
    const { decrementCartItem, incrementCartItem } = useCartStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleDecrement = async () => {
        setIsLoading(true);
        try {
            await decrementCartItem(product.id);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIncrement = async () => {
        setIsLoading(true);
        try {
            await incrementCartItem(product.id);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 mx-auto flex items-center font-semibold">
            <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={isLoading}
                aria-label="Decrease quantity"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Minus className="h-4 w-4" />
                )}
            </Button>
            <span className="px-4 py-2 min-w-[3rem] text-center bg-secondary text-secondary-foreground rounded-md mx-1">
                {quantity}
            </span>
            <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={isLoading}
                aria-label="Increase quantity"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Plus className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
};
