import {CheckoutFormData} from "@/types/schemas";
import {Order} from "@/types/order";
import CheckoutGateway from "@/services/checkout"
import {v4 as uuidv4} from "uuid";
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { cartId: string }}) {
    try{
        const { cartId } = params;
        const body = await req.json();
        const data = body as CheckoutFormData

        const order: Order = {
            user_id: uuidv4(),
            email: data.email,
            address: data.address,
            credit_card: {
                card_number: data.credit_card.card_number,
                card_cvv: parseInt(data.credit_card.cvv),
                card_owner: data.credit_card.owner,
                card_expiration_month: parseInt(data.credit_card.expiryDate.split("/")[0]),
                card_expiration_year: parseInt(`20${data.credit_card.expiryDate.split("/")[1]}`)
            }
        }

        // Forward the request to your external API (server-side)
        const response = await CheckoutGateway.placeOrder(order, cartId);

        if (!response.ok || response.status > 400) {
            return NextResponse.json({error: 'Failed to complete the purchase'}, {status: 500});
        }
        return NextResponse.json({message: "Successfully placed order"}, {status: 200});
    } catch (error) {
        return NextResponse.json({error: `Checkout failed: ${error}`}, {status: 500});
    }
}