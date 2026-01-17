import { Separator } from "@/components/ui/separator";

const milestones = [
    {
        year: "2010",
        title: "The First Light",
        description: "Founded in a small garage by two astronomy professors who believed quality telescopes shouldn't cost a fortune."
    },
    {
        year: "2013",
        title: "Going Online",
        description: "Launched our e-commerce platform, bringing our curated selection to stargazers across the country."
    },
    {
        year: "2016",
        title: "10,000 Customers",
        description: "Reached a milestone of helping ten thousand families discover the wonders of the night sky."
    },
    {
        year: "2019",
        title: "Expert Support Team",
        description: "Assembled a team of professional astronomers to provide lifetime support to every customer."
    },
    {
        year: "2022",
        title: "Community Launch",
        description: "Started hosting monthly virtual stargazing events, connecting our community of amateur astronomers."
    },
    {
        year: "2024",
        title: "The Next Frontier",
        description: "Expanded our catalog to include astrophotography equipment, helping customers capture the cosmos."
    }
];

export function Timeline() {
    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey Through Time</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        From a small garage to a trusted name in astronomy equipment—here&apos;s how we got here.
                    </p>
                </div>
                <div className="relative">
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
                    <div className="space-y-12">
                        {milestones.map((milestone, index) => (
                            <div
                                key={milestone.year}
                                className={`flex flex-col md:flex-row items-center gap-8 ${
                                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                }`}
                            >
                                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                                    <div className="bg-background p-6 rounded-lg shadow-sm border">
                                        <span className="text-primary font-bold text-lg">{milestone.year}</span>
                                        <h3 className="text-xl font-semibold mt-2 mb-3">{milestone.title}</h3>
                                        <p className="text-muted-foreground">{milestone.description}</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm z-10">
                                    {milestone.year.slice(2)}
                                </div>
                                <div className="flex-1 hidden md:block" />
                            </div>
                        ))}
                    </div>
                </div>
                <Separator className="mt-16" />
            </div>
        </section>
    );
}
