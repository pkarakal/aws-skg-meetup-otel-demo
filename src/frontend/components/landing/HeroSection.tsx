import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative py-20 md:py-32 bg-gradient-to-b from-background via-muted/30 to-background">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
                    Explore the Universe from Your Backyard
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                    Discover our curated collection of premium telescopes, designed for beginners
                    and seasoned astronomers alike. Your journey through the cosmos starts here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                        <Link href="/shop">Shop Telescopes</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/about">Our Story</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
