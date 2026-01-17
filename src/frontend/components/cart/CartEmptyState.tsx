"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartEmptyStateProps {
    onClose?: () => void;
}

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({ onClose }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[200px]">
                Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Button asChild onClick={onClose}>
                <Link href="/shop">Browse Products</Link>
            </Button>
        </div>
    );
};
