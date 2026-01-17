export default function FeaturedProductsSkeleton() {
    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
                    Featured Telescopes
                </h2>
                <p className="text-muted-foreground text-center mb-12">
                    Loading products...
                </p>
            </div>
        </section>
    );
}