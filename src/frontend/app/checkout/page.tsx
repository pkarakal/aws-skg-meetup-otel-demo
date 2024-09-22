"use client";
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useState} from 'react';
import {useCartStore} from '@/stores/cart';
import {Button} from '@/components/ui/button';
import {CheckoutFormData, checkoutSchema} from "@/types/schemas";
import {Form} from "@/components/ui/form";
import {AddressCardComponent} from "@/components/AddressCard";
import {PaymentInfoComponent} from "@/components/PaymentInfoCard";
import {CartTotalComponent} from "@/components/CartTotalComponent";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const CheckoutPage: React.FC = () => {
    const {cartId, cart, createCart} = useCartStore();
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
    });

    async function onSubmit(formData: CheckoutFormData) {
        setIsSubmitting(true)
        try {
            const resp = await fetch(`/api/checkout/${cartId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            if (!resp.ok) {
                const respErr = await resp.json()
                throw new Error("Got an error when submitting form" + respErr?.message)
            }
            toast.success("Successfully submitted form")
            form.reset()
            await createCart()
            router.replace("/shop")
        } catch (e){
            console.error(e)
            toast.error("Failed to submit the form")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            {/* If no items in cart */}
            {cart.length === 0 ? (
                <p>Your cart is empty. Go back to the <a href="/shop" className="text-blue-500">Shop</a>.</p>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AddressCardComponent register={form.register} errors={form.formState.errors}/>
                            <PaymentInfoComponent register={form.register} errors={form.formState.errors}/>
                        </div>

                        <div className="flex flex-col items-end mt-6">
                            <CartTotalComponent/>
                            <div className="mt-6">
                                <Button type="submit" className="w-full md:w-auto">
                                    Complete Purchase
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};

export default CheckoutPage;
