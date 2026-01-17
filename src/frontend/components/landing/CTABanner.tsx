import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTABanner() {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Ready to Explore the Universe?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Start your astronomical journey today with a telescope that matches your ambitions.
                </p>
                <Button asChild size="lg">
                    <Link href="/shop">Shop Now</Link>
                </Button>
            </div>
        </section>
    );
}
