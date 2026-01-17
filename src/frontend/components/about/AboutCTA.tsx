import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, ShoppingBag } from "lucide-react";

export function AboutCTA() {
    return (
        <section className="py-20 md:py-28 bg-gradient-to-t from-primary/10 via-background to-background">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Start Your Journey?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                    Whether you&apos;re buying your first telescope or upgrading your setup,
                    we&apos;re here to help you reach for the stars.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                        <Link href="/shop">
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Browse Telescopes
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="mailto:hello@telescopeshop.com">
                            <Mail className="mr-2 h-5 w-5" />
                            Contact Us
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
