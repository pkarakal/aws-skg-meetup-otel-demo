"use client";
import React from 'react';
import {useCartStore} from '@/stores/cart';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

export const CartComponent: React.FC = () => {
    const {cart, incrementCartItem, decrementCartItem, clearCart} = useCartStore();

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.map((item) => (
                                <TableRow key={item.product_id}>
                                    <TableCell>
                                        {item.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => decrementCartItem(item.product_id)}
                                            >
                                                -
                                            </Button>
                                            <span className="mx-2">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => incrementCartItem(item.product_id)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4">
                        <p className="text-xl font-semibold">Total: ${total.toFixed(2)}</p>
                        <div className="flex space-x-4 mt-4 font-semibold">
                            <Button variant="destructive" onClick={clearCart}>
                                Clear Cart
                            </Button>
                            <Link href="/checkout" passHref>
                                <Button variant="default">
                                    Proceed to Checkout
                                </Button>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

