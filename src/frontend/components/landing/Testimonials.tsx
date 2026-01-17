import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
    {
        quote: "The telescope I bought exceeded my expectations. The first time I saw Saturn's rings, I was speechless. The team's guidance in choosing the right model was invaluable.",
        author: "Sarah M.",
        role: "Amateur Astronomer"
    },
    {
        quote: "Outstanding customer service! When I had questions about setup, their support team walked me through everything. My kids now look forward to our weekly stargazing nights.",
        author: "James K.",
        role: "Parent & Educator"
    },
    {
        quote: "As a professional photographer, I needed a telescope that could work with my camera equipment. They helped me find the perfect setup for astrophotography.",
        author: "Elena R.",
        role: "Astrophotographer"
    }
];

export function Testimonials() {
    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
                    What Our Customers Say
                </h2>
                <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                    Join thousands of satisfied astronomers who found their perfect telescope with us.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.author}>
                            <CardContent className="pt-6">
                                <Quote className="h-8 w-8 text-primary/40 mb-4" />
                                <p className="text-muted-foreground mb-6">
                                    &ldquo;{testimonial.quote}&rdquo;
                                </p>
                                <div>
                                    <div className="font-semibold">{testimonial.author}</div>
                                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
