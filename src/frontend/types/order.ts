export type Order = {
    user_id: string;
    email: string;
    address: Address;
    credit_card: CreditCard;
}

export type Address = {
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export type CreditCard = {
    card_number: string;
    card_cvv: number;
    card_expiration_month: number;
    card_expiration_year: number;
    card_owner: string;
}
