"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useCartHydration } from "@/stores/cart";
import { CartBadge } from "./CartBadge";
import { CartItem } from "./CartItem";
import { CartItemSkeleton } from "./CartItemSkeleton";
import { CartEmptyState } from "./CartEmptyState";
import { CartSummary } from "./CartSummary";
import { TooltipProvider } from "@/components/ui/tooltip";

export const CartDrawer: React.FC = () => {
    const { cart } = useCartStore();
    const isHydrated = useCartHydration();
    const [open, setOpen] = React.useState(false);

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={`Shopping cart with ${itemCount} items`}
                >
                    <ShoppingCart className="h-5 w-5" />
                    <CartBadge />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Your Cart
                        {isHydrated && itemCount > 0 && (
                            <span className="text-sm font-normal text-muted-foreground">
                                ({itemCount} {itemCount === 1 ? "item" : "items"})
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <TooltipProvider>
                    {!isHydrated ? (
                        <div className="flex-1 py-4">
                            <CartItemSkeleton />
                            <Separator />
                            <CartItemSkeleton />
                            <Separator />
                            <CartItemSkeleton />
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <CartEmptyState onClose={() => setOpen(false)} />
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 -mx-6 px-6">
                                <div className="divide-y divide-border">
                                    {cart.map((item) => (
                                        <CartItem key={item.product_id} item={item} />
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="pt-4 mt-auto space-y-4">
                                <Separator />
                                <CartSummary subtotal={subtotal} />

                                <SheetFooter className="flex-col gap-2">
                                    <Button asChild size="lg" className="w-full">
                                        <Link href="/checkout" onClick={() => setOpen(false)}>
                                            Proceed to Checkout
                                        </Link>
                                    </Button>
                                    <SheetClose asChild className="w-full">
                                        <Button variant="outline" size="lg">
                                            <Link href="/cart">View Full Cart</Link>
                                        </Button>
                                    </SheetClose>
                                </SheetFooter>
                            </div>
                        </>
                    )}
                </TooltipProvider>
            </SheetContent>
        </Sheet>
    );
};
