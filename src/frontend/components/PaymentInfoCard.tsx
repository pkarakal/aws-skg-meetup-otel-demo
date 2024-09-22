import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

interface PaymentInfoCardProps {
    register: any
    errors: any
}

export const PaymentInfoComponent: React.FC<PaymentInfoCardProps> = ({register, errors}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    name="Card Holder"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>Card Holder</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="John Doe" {...register('credit_card.owner')} />
                                </FormControl>
                                <FormMessage>{errors?.credit_card?.owner?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="Card Number"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="XXXX XXXX XXXX XXXX" {...register('credit_card.card_number')} />
                                </FormControl>
                                <FormMessage>{errors?.credit_card?.card_number?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="Expiry Date"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="09/27" {...register('credit_card.expiryDate')} />
                                </FormControl>
                                <FormMessage>{errors?.credit_card?.expiryDate?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="CVV"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="123" {...register('credit_card.cvv')} />
                                </FormControl>
                                <FormMessage>{errors?.credit_card?.cvv?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
            </CardContent>
        </Card>
    )
}


