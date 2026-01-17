"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useCartHydration } from "@/stores/cart";
import { CartItem } from "@/components/cart/CartItem";
import { CartItemSkeleton } from "@/components/cart/CartItemSkeleton";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { CartSummary } from "@/components/cart/CartSummary";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function CartPage() {
    const { cart, clearCart } = useCartStore();
    const isHydrated = useCartHydration();

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/shop">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Continue Shopping
                    </Link>
                </Button>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    {isHydrated && cart.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearCart}
                            className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Cart
                        </Button>
                    )}
                </div>
                {isHydrated && itemCount > 0 && (
                    <p className="text-muted-foreground mt-1">
                        {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                    </p>
                )}
            </div>

            <TooltipProvider>
                {!isHydrated ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="p-6">
                                    <CartItemSkeleton />
                                    <Separator />
                                    <CartItemSkeleton />
                                    <Separator />
                                    <CartItemSkeleton />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-10 bg-muted rounded w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : cart.length === 0 ? (
                    <Card className="max-w-md mx-auto">
                        <CardContent className="p-6">
                            <CartEmptyState />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Cart Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="divide-y divide-border">
                                        {cart.map((item) => (
                                            <CartItem key={item.product_id} item={item} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="lg:sticky lg:top-24">
                                <CardHeader>
                                    <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <CartSummary subtotal={subtotal} />
                                    <Button asChild className="w-full" size="lg">
                                        <Link href="/checkout">
                                            Proceed to Checkout
                                        </Link>
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Taxes and shipping calculated at checkout
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </TooltipProvider>
        </div>
    );
}
