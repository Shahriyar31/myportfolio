import { useTheme } from "../context/ThemeContext";
import SH from "../components/SectionHeading";
import AboutSection from "../components/AboutSection";
import JourneyTimeline from "../components/JourneyTimeline";

const fm = { fontFamily: "'Inter', sans-serif" };
const sp = { padding: "100px clamp(20px,6vw,120px)", width: "100%" };

export default function About() {
    const { T, dark } = useTheme();
    return (
        <section id="about" className="section" style={{ background: "transparent", overflow: "hidden", position: "relative" }}>
            <div className="sec-inner" style={{ ...sp, position: "relative", zIndex: 1 }}>
                <SH n="01" title="About" T={T} />
                <AboutSection T={T} dark={dark} />
                <div className="rv2" style={{ marginTop: 56 }}>
                    <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 20, height: 1, background: T.a, display: "inline-block" }} />
                        My Journey
                    </div>
                    <JourneyTimeline T={T} />
                </div>
            </div>
        </section>
    );
}
