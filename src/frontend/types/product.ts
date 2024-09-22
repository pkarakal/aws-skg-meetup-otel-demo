import {Image} from "@/types/image";

export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    image: Image
}

export type Products = Array<Product>;

export type CartItem = {
    product_id: number;
    name: string
    quantity: number;
    price: number;
}

export type CartItems = CartItem[]
