import { Sparkles, Users, BookOpen, Leaf } from "lucide-react";

const values = [
    {
        icon: Sparkles,
        title: "Quality Without Compromise",
        description: "We only stock telescopes we would use ourselves. Every product is tested by our team before it reaches your hands."
    },
    {
        icon: Users,
        title: "Community First",
        description: "Astronomy is better together. We foster connections between stargazers through events, forums, and shared discoveries."
    },
    {
        icon: BookOpen,
        title: "Education Always",
        description: "We believe in empowering our customers with knowledge. Our guides, tutorials, and support are always free."
    },
    {
        icon: Leaf,
        title: "Sustainable Stargazing",
        description: "We advocate for dark sky preservation and partner with organizations fighting light pollution."
    }
];

export function OurValues() {
    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Stand For</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Our values guide every decision we make, from the products we stock
                        to the way we support our community.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {values.map((value) => (
                        <div key={value.title} className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <value.icon className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                                <p className="text-muted-foreground">{value.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
