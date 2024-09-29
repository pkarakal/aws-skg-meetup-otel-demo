import {trace} from "@opentelemetry/api";
import {Cart} from "@/types/cart";
import {Product, Products} from "@/types/product";

const {CATALOG_SERVICE_ADDR = ''} = process.env;


const CatalogGateway = () => ({
    getProducts: async(): Promise<Products> => {
        return await trace
            .getTracer("frontend.catalog.gateway")
            .startActiveSpan("getProducts", async(span) => {
                try {
                    const response = await fetch(`${CATALOG_SERVICE_ADDR}/products`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return await response.json() as Products
                } catch (e) {
                    console.error("Failed to get all products")
                    return Promise.reject()
                }
                finally {
                    span.end();
                }
            });
    }
});

export default CatalogGateway();