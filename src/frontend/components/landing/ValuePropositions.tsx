import { Telescope, Shield, Truck, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
    {
        icon: Telescope,
        title: "Expert-Curated Selection",
        description: "Every telescope in our collection is hand-picked by astronomy experts for quality and performance."
    },
    {
        icon: Shield,
        title: "2-Year Warranty",
        description: "Shop with confidence knowing every purchase is backed by our comprehensive warranty coverage."
    },
    {
        icon: Truck,
        title: "Free Shipping",
        description: "Enjoy free shipping on all orders. Your new telescope arrives safely at your doorstep."
    },
    {
        icon: Star,
        title: "Lifetime Support",
        description: "Our team of astronomers is here to help you get the most out of your stargazing experience."
    }
];

export function ValuePropositions() {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                    Why Choose Telescope Shop
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => (
                        <Card key={feature.title} className="text-center">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex justify-center">
                                    <feature.icon className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
