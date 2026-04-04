import { useTheme } from "../context/ThemeContext";
import SH from "../components/SectionHeading";
import ContactTerminal from "../components/ContactTerminal";
import { ContactBG } from "../components/SectionBgs";

const sp = { padding: "100px clamp(20px,6vw,120px)", width: "100%" };

export default function Contact() {
    const { T, dark } = useTheme();
    return (
        <section id="contact" className="section" style={{ background: "transparent", position: "relative" }}>
            <ContactBG T={T} />
            <div className="sec-inner" style={{ ...sp }}>
                <SH n="07" title="Contact" T={T} />
                <div className="rv" style={{ marginTop: 24 }}>
                    <ContactTerminal T={T} dark={dark} />
                </div>
            </div>
        </section>
    );
}
