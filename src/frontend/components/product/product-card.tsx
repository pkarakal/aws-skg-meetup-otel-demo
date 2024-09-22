"use client";
import {Card, CardTitle, CardDescription, CardHeader, CardFooter} from '@/components/ui/card';
import {useCartStore} from "@/stores/cart";
import {Product} from "@/types/product";
import Image from "next/image";
import {IncrementButtons} from "@/components/IncrementButtons";
import {AddToCartButtonComponent} from "@/components/AddToCartButton";
import {Separator} from "@radix-ui/react-dropdown-menu";
import React from "react";

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({product}) => {
    const {cart} = useCartStore();
    const cartItem = cart.find((item) => item.product_id === product.id);

    return (
        <Card className="p-4">
            <CardHeader className="relative w-full h-48 mb-4">
                <Image
                    src={product.image.url}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                />
            </CardHeader>
            <CardTitle className="mx-auto">{product.name}</CardTitle>
            <Separator/>
            <CardDescription>{product.description}</CardDescription>
            <p className="text-lg font-semibold mt-2">${product.price.toFixed(2)}</p>
            <CardFooter>
                {cartItem ?
                    (
                        <IncrementButtons product={product} quantity={cartItem.quantity}/>
                    ) : (
                        <AddToCartButtonComponent product={product}/>
                    )}

            </CardFooter>
        </Card>
    );
};
