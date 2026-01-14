"use client";

import {useEffect} from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutError({
    error,
    reset,
}: {
    error: Error & {digest?: string};
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
            <h2 className="text-2xl font-bold mb-4">Checkout error</h2>
            <p className="text-muted-foreground mb-6">
                Something went wrong during checkout. Your cart has been preserved.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" asChild>
                    <Link href="/shop">Back to shop</Link>
                </Button>
            </div>
        </div>
    );
}
