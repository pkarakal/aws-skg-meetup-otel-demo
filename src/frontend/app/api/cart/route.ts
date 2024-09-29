import CartGateway from "@/services/cart";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    try {

        const response = await CartGateway.createCart();

        return NextResponse.json(response, {status: 200});
    }
    catch (error) {
        return NextResponse.json({error: `Failed to create cart: ${error}`}, {status: 500});
    }
}