import { Separator } from "@/components/ui/separator";

const stats = [
    { value: "15,000+", label: "Happy Customers" },
    { value: "500+", label: "Monthly Sales" },
    { value: "50+", label: "Years Combined Expertise" }
];

export function BrandStory() {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="lg:w-1/2">
                        <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="text-6xl mb-4">🔭</div>
                                <p className="text-muted-foreground">Telescope Shop Since 2010</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">
                            Bringing the Cosmos Closer Since 2010
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            What started as a small shop run by passionate astronomers has grown into
                            a trusted destination for stargazers worldwide. Our mission remains the same:
                            to help everyone experience the wonder of the night sky.
                        </p>
                        <p className="text-muted-foreground mb-8">
                            Every telescope we sell has been tested by our team. We believe that the right
                            equipment can transform a curious glance at the stars into a lifelong passion
                            for astronomy.
                        </p>
                        <Separator className="mb-8" />
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {stats.map((stat) => (
                                <div key={stat.label}>
                                    <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
