import { useTheme } from "../context/ThemeContext";
import SH from "../components/SectionHeading";
import EduScrollBook from "../components/EduScrollBook";
import { EducationBG } from "../components/SectionBgs";

const sp = { padding: "100px clamp(20px,6vw,120px)", width: "100%" };

export default function Education() {
    const { T } = useTheme();
    return (
        <section id="education" className="section" style={{ background: "transparent", position: "relative", overflow: "visible", padding: 0 }}>
            <EducationBG T={T} />
            <div style={{ ...sp, position: "relative", zIndex: 1, paddingBottom: 40 }}>
                <SH n="05" title="Education" T={T} />
            </div>
            <EduScrollBook T={T} />
        </section>
    );
}
