import {z} from "zod";

export const checkoutSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email("Invalid email address"),
    address: z.object({
        street_address: z.string().min(5, "Address should be at least 5 characters"),
        city: z.string(),
        state: z.string(),
        postal_code: z.string(),
        country: z.string()
    }),
    credit_card : z.object({
        card_number: z.string().regex(/^\d{16}$/, "Credit card number must be 16 digits"),
        expiryDate: z
            .string()
            .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Expiry date must be in MM/YY format"),
        cvv: z.string().regex(/^\d{3}$/, "CVV must be 3 digits"),
        owner: z.string().min(2, "Name must be at least 2 characters long")
    })
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
