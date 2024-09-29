import {CartItems} from "@/types/product";

export type Cart = {
    id: number
    items: CartItems | null
    total: number
}
