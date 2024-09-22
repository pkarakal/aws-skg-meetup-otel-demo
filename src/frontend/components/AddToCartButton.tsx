import {Button} from "@/components/ui/button";
import React from "react";
import {Product} from "@/types/product";
import {useCartStore} from "@/stores/cart";

interface AddToCartButtonProps {
    product: Product
}

export const AddToCartButtonComponent: React.FC<AddToCartButtonProps> = (props) => {
    const {addToCart} = useCartStore();
    return (
        <Button
            onClick={() => addToCart(props.product)}
            className="mt-4 w-full font-semibold"
            variant="default"
        >
            Add to Cart
        </Button>
    )
}