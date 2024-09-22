import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

interface AddressCardProps {
    register: any
    errors: any
}

export const AddressCardComponent: React.FC<AddressCardProps> = ({register, errors}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    name="FullName"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="Full Name" {...register('name')} />
                                </FormControl>
                                <FormMessage>{errors.name?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="Email"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email"
                                           placeholder="john.doe@example.com" {...register('email')} />
                                </FormControl>
                                <FormMessage>{errors.email?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="Street Address"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="Street Address" {...register('address.street_address')} />
                                </FormControl>
                                <FormMessage>{errors?.address?.street_address?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="City"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="Athens" {...register('address.city')} />
                                </FormControl>
                                <FormMessage>{errors?.address?.city?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="Postal Code"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="104 31" {...register('address.postal_code')} />
                                </FormControl>
                                <FormMessage>{errors?.address?.postal_code?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="State"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="Attica" {...register('address.state')} />
                                </FormControl>
                                <FormMessage>{errors?.address?.state?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    name="Country"
                    render={() => {
                        return (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input type="text"
                                           placeholder="Greece" {...register('address.country')} />
                                </FormControl>
                                <FormMessage>{errors?.address?.country?.message}</FormMessage>
                            </FormItem>
                        )
                    }}
                />
            </CardContent>
        </Card>
    )
}


