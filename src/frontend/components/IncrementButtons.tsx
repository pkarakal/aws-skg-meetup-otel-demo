import {Button} from "@/components/ui/button";
import React from "react";
import {useCartStore} from "@/stores/cart";
import {Product} from "@/types/product";

interface IncrementButtonsProps {
    product: Product;
    quantity: number;
}

export const IncrementButtons: React.FC<IncrementButtonsProps> = (props) => {
    const {decrementCartItem, incrementCartItem} = useCartStore()
    return (
        <div className="mt-4 mx-auto items-center font-semibold">
            <Button
                onClick={() => decrementCartItem(props.product.id)}
            >
                -
            </Button>
            <span className="px-4 py-2 bg-gray-100 text-gray-700">
            {props.quantity}
          </span>
            <Button
                onClick={() => incrementCartItem(props.product.id)}
            >
                +
            </Button>
        </div>
    )
}