import { Card, CardContent } from "@/components/ui/card";
import { Compass, Eye, Heart } from "lucide-react";

const pillars = [
    {
        icon: Compass,
        title: "Our Mission",
        description: "To democratize astronomy by making high-quality telescopes accessible to everyone, from curious beginners to seasoned observers."
    },
    {
        icon: Eye,
        title: "Our Vision",
        description: "A world where every person has looked up at the night sky through a telescope and felt the profound connection to the cosmos."
    },
    {
        icon: Heart,
        title: "Our Promise",
        description: "Every telescope we sell comes with our commitment to your success. We don't just sell equipment—we nurture astronomers."
    }
];

export function OurMission() {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pillars.map((pillar) => (
                        <Card key={pillar.title} className="border-none shadow-lg bg-gradient-to-b from-muted/50 to-background">
                            <CardContent className="pt-8 text-center">
                                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                                    <pillar.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{pillar.title}</h3>
                                <p className="text-muted-foreground">{pillar.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
