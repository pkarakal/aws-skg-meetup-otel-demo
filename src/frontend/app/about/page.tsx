import { AboutHero } from "@/components/about/AboutHero";
import { OurMission } from "@/components/about/OurMission";
import { Timeline } from "@/components/about/Timeline";
import { TeamSection } from "@/components/about/TeamSection";
import { OurValues } from "@/components/about/OurValues";
import { AboutCTA } from "@/components/about/AboutCTA";

export default function About() {
    return (
        <main>
            <AboutHero />
            <OurMission />
            <Timeline />
            <TeamSection />
            <OurValues />
            <AboutCTA />
        </main>
    );
}
