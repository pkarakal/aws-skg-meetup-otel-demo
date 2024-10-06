import type {GetServerSideProps, InferGetServerSidePropsType} from 'next'
import React from 'react';
import CatalogGateway from '@/services/catalog'
import {ProductCard} from '@/components/product/product-card';
import {Products} from "@/types/product";

export const revalidate = 60;
export const dynamic = 'force-dynamic';


const Shop: React.FC = async () => {
    const products = await CatalogGateway.getProducts();

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

