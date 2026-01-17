import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const team = [
    {
        name: "Dr. Eleanor Vance",
        role: "Co-Founder & CEO",
        bio: "Former astrophysics professor with 25 years of experience. Discovered two minor planets and authored three books on amateur astronomy.",
        specialty: "Deep Sky Objects"
    },
    {
        name: "Marcus Chen",
        role: "Co-Founder & CTO",
        bio: "Optical engineer who spent a decade designing telescope systems for observatories before bringing his expertise to consumer telescopes.",
        specialty: "Optical Design"
    },
    {
        name: "Sarah Okonkwo",
        role: "Head of Customer Experience",
        bio: "Lifelong stargazer and educator who has introduced thousands of students to astronomy. Leads our support and community initiatives.",
        specialty: "Planetary Observation"
    },
    {
        name: "James Rodriguez",
        role: "Lead Product Curator",
        bio: "Professional astrophotographer whose work has been published in National Geographic. Tests every telescope before it makes our catalog.",
        specialty: "Astrophotography"
    }
];

export function TeamSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The Stargazers Behind the Shop</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Our team combines decades of professional astronomy experience with a genuine passion
                        for helping others discover the cosmos.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {team.map((member) => (
                        <Card key={member.name} className="overflow-hidden">
                            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>
                            <CardContent className="pt-6">
                                <h3 className="font-bold text-lg">{member.name}</h3>
                                <p className="text-primary text-sm mb-3">{member.role}</p>
                                <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
                                <Badge variant="outline">{member.specialty}</Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
