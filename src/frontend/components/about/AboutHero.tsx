import { Badge } from "@/components/ui/badge";

export function AboutHero() {
    return (
        <section className="relative py-24 md:py-36 bg-gradient-to-b from-primary/10 via-background to-background overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                <div className="absolute top-40 right-20 w-1 h-1 bg-primary/40 rounded-full animate-pulse" />
                <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse" />
                <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
                <div className="absolute bottom-20 left-1/2 w-1 h-1 bg-primary/40 rounded-full animate-pulse" />
            </div>
            <div className="container mx-auto px-4 text-center relative">
                <Badge variant="secondary" className="mb-6">
                    Est. 2010
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                    Guiding Humanity&apos;s Gaze
                    <br />
                    <span className="text-primary">Toward the Infinite</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    We believe that everyone deserves to witness the majesty of the cosmos.
                    For over a decade, we&apos;ve been connecting stargazers with the tools
                    they need to explore the universe from their own backyard.
                </p>
            </div>
        </section>
    );
}
