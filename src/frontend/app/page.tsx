import { HeroSection } from "@/components/landing/HeroSection";
import { ValuePropositions } from "@/components/landing/ValuePropositions";
import { BrandStory } from "@/components/landing/BrandStory";
import { Testimonials } from "@/components/landing/Testimonials";
import { NewsletterSignup } from "@/components/landing/NewsletterSignup";
import { CTABanner } from "@/components/landing/CTABanner";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import CatalogGateway from "@/services/catalog";
import {Products} from "@/types/product";

export const dynamic = 'force-dynamic';

export default async function Home() {
    let products: Products = [];

    try {
        const allProducts = await CatalogGateway.getProducts();
        products = allProducts.slice(0, 3);
    } catch {
        products = [];
    }

    return (
        <main>
            <HeroSection />
            <ValuePropositions />
            {products.length === 0 ? (
                <section className="py-16 md:py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
                            Featured Telescopes
                        </h2>
                        <p className="text-muted-foreground text-center mb-12">
                            Unable to load products. Please try again later.
                        </p>
                    </div>
                </section>
            ) : (
                <FeaturedProducts products={products} />
            )}
            <BrandStory />
            <Testimonials />
            <NewsletterSignup />
            <CTABanner />
        </main>
    );
}
