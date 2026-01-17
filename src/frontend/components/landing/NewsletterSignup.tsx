"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
    return (
        <section className="py-16 md:py-24 bg-muted">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Stay Connected with the Stars
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Subscribe to our newsletter for astronomy tips, product updates,
                    and exclusive offers delivered straight to your inbox.
                </p>
                <form
                    className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        className="bg-background"
                    />
                    <Button type="submit">
                        Subscribe
                    </Button>
                </form>
            </div>
        </section>
    );
}
