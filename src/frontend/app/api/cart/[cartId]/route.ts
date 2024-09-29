import {CheckoutFormData} from "@/types/schemas";
import {Order} from "@/types/order";
import {v4 as uuidv4} from "uuid";
import CartGateway from "@/services/cart";
import {NextResponse} from "next/server";
import {Product} from "@/types/product";

export async function GET(req: Request, { params }: { params: { cartId: string }}) {
    try{
        const { cartId } = params;
        // Forward the request to your external API (server-side)
        const response = await CartGateway.getCart(cartId);
        return NextResponse.json(response, {status: 200});
    } catch (error) {
        return NextResponse.json({error: `Failed to get cart: ${error}`}, {status: 500});
    }
}

export async function POST(req: Request, {params}: {params: {cartId: string}}) {
    try {
        const { cartId } = params;
        const body = await req.json() as Product;

        const response = await CartGateway.addToCart(cartId, body);

        return NextResponse.json(response, {status: 200});
    }
    catch (error) {
        return NextResponse.json({error: `Adding to cart failed: ${error}`}, {status: 500});
    }
}
