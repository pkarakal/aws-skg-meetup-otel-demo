"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    size?: "sm" | "default";
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    quantity,
    onIncrement,
    onDecrement,
    isLoading = false,
    disabled = false,
    size = "default",
}) => {
    const buttonSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
    const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                className={cn(buttonSize)}
                onClick={onDecrement}
                disabled={disabled || isLoading}
                aria-label="Decrease quantity"
            >
                {isLoading ? (
                    <Loader2 className={cn(iconSize, "animate-spin")} />
                ) : (
                    <Minus className={iconSize} />
                )}
            </Button>
            <span className={cn(
                "min-w-[2rem] text-center font-medium tabular-nums",
                size === "sm" ? "text-sm" : "text-base"
            )}>
                {quantity}
            </span>
            <Button
                variant="outline"
                size="icon"
                className={cn(buttonSize)}
                onClick={onIncrement}
                disabled={disabled || isLoading}
                aria-label="Increase quantity"
            >
                {isLoading ? (
                    <Loader2 className={cn(iconSize, "animate-spin")} />
                ) : (
                    <Plus className={iconSize} />
                )}
            </Button>
        </div>
    );
};
