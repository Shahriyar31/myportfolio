import { useTheme } from "../context/ThemeContext";
import SH from "../components/SectionHeading";
import Skills3D from "../components/Skills3D";

const fm = { fontFamily: "'Inter', sans-serif" };
const sf = { fontFamily: "'Sora', sans-serif" };
const sp = { padding: "100px clamp(20px,6vw,120px)", width: "100%" };

export default function Skills() {
    const { T, dark } = useTheme();
    return (
        <section id="skills" className="section" style={{ background: "transparent", position: "relative", overflow: "hidden", minHeight: "100vh", maxWidth: "100vw" }}>
            <div style={{ ...sp, position: "relative", zIndex: 1, paddingBottom: 0 }}>
                <SH n="04" title="Skills" T={T} />
                <div className="rv" style={{ textAlign: "center", marginBottom: 28 }}>
                    <p style={{ ...sf, fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, color: T.t, marginBottom: 10, lineHeight: 1.1, letterSpacing: "-.02em" }}>
                        Explore the{" "}
                        <span style={{ color: T.a, fontStyle: "italic" }}>Knowledge Galaxy</span>
                    </p>
                    <p style={{ ...fm, fontSize: 12, color: T.m, letterSpacing: ".08em", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
                        A holographic visualization of 26 skills across 4 expert domains.
                    </p>
                </div>
            </div>
            <div style={{ width: "100%", overflowX: "hidden", position: "relative", zIndex: 1 }}>
                <Skills3D T={T} dark={dark} />
            </div>
        </section>
    );
}
