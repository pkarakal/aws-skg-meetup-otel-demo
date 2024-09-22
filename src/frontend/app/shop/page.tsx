import {Products} from "@/types/product";

import React from 'react';
import {ProductCard} from '@/components/product/product-card';
import { trace } from "@opentelemetry/api";


const Shop: React.FC = async () => {
    const {CATALOG_SERVICE_ADDR} = process.env;
    const res = await fetch(`${CATALOG_SERVICE_ADDR}/products`);
    const products: Products = await res.json();

    return (
        <div className="container mx-auto py-2">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto grid-flow-row gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product}/>
                ))}
            </div>
        </div>
    );
};

export default Shop;

