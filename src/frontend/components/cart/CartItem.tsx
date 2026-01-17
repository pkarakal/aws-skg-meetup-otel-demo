"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QuantitySelector } from "./QuantitySelector";
import { useCartStore } from "@/stores/cart";
import { CartItem as CartItemType } from "@/types/product";

interface CartItemProps {
    item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { incrementCartItem, decrementCartItem, removeFromCart } = useCartStore();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const handleIncrement = async () => {
        setIsUpdating(true);
        try {
            await incrementCartItem(item.product_id);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDecrement = async () => {
        setIsUpdating(true);
        try {
            await decrementCartItem(item.product_id);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            await removeFromCart(item.product_id);
        } finally {
            setIsRemoving(false);
        }
    };

    const itemTotal = item.price * item.quantity;

    return (
        <div className="flex gap-4 py-4">
            <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                <span className="text-2xl">📦</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h4 className="font-medium text-sm leading-tight truncate">
                            {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            ${item.price.toFixed(2)} each
                        </p>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                                onClick={handleRemove}
                                disabled={isRemoving || isUpdating}
                            >
                                {isRemoving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Remove item</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <QuantitySelector
                        quantity={item.quantity}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                        isLoading={isUpdating}
                        disabled={isRemoving}
                        size="sm"
                    />
                    <span className="font-medium text-sm">
                        ${itemTotal.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};
