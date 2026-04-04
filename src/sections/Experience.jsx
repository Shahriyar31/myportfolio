import { useTheme } from "../context/ThemeContext";
import SH from "../components/SectionHeading";
import ExperienceShowcase from "../components/ExperienceShowcase";
import { ExperienceBG } from "../components/SectionBgs";

export default function Experience() {
    const { T, dark } = useTheme();
    return (
        <section id="experience" style={{ background: "transparent", position: "relative" }}>
            <ExperienceBG T={T} />
            <ExperienceShowcase T={T} dark={dark} SectionHeading={<SH n="02" title="Experience" T={T} />} />
        </section>
    );
}
