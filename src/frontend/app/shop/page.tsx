import type {GetServerSideProps, InferGetServerSidePropsType} from 'next'
import React from 'react';
import CatalogGateway from '@/services/catalog'
import {ProductCard} from '@/components/product/product-card';
import {Products} from "@/types/product";

// type ShopProps = {
//     products: Products
// }
//
// export const getServerSideProps = (async() => {
//     try {
//         const data = await CatalogGateway.getProducts()
//         return {props: {products: data}}
//     } catch (e) {
//         console.log("Failed to fetch products")
//         return {props: {products: []}};
//     }
// }) satisfies GetServerSideProps<ShopProps>

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

