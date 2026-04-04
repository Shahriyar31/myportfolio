import { useTheme } from "../context/ThemeContext";
import SH from "../components/SectionHeading";
import ProjectShowcase from "../components/ProjectShowcase";
import { ProjectsBG } from "../components/SectionBgs";

const sp = { padding: "100px clamp(20px,6vw,120px)", width: "100%" };

export default function Projects() {
    const { T, dark } = useTheme();
    return (
        <section id="projects" className="section" style={{ background: "transparent", position: "relative" }}>
            <ProjectsBG T={T} />
            <div className="sec-inner" style={{ ...sp }}>
                <SH n="03" title="Projects" T={T} />
                <ProjectShowcase T={T} dark={dark} />
            </div>
        </section>
    );
}
