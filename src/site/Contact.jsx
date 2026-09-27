import { useState } from "react";
import { Lines, Fade, Magnetic } from "./Motion";
import { SOCIALS } from "./Chrome";
import { useHamburgTime, scrollToId } from "./hooks";

const EMAIL = "shahriyarfarhan3101@gmail.com";

export default function Contact({ onOpenCv }) {
    const [copied, setCopied] = useState(false);
    const time = useHamburgTime();
    const copy = async () => {
        try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 2000); }
        catch { window.location.href = `mailto:${EMAIL}`; }
    };

    return (
        <section id="contact" className="contact">
            <div className="wrap">
                <Fade className="sec-meta">
                    <span className="label">(07)</span>
                    <span className="label">Contact</span>
                    <span className="label">Replies within a day or two</span>
                </Fade>
                <h2 className="contact-title">
                    <Lines lines={["Let's build", <>something <em>trustworthy.</em></>]} />
                </h2>
                <Fade className="contact-row" delay={200}>
                    <a className="contact-mail" href={`mailto:${EMAIL}`} data-cursor="Write">{EMAIL}</a>
                    <Magnetic><button className="btn btn-ghost btn-sm" onClick={copy} aria-live="polite">{copied ? "Copied ✓" : "Copy email"}</button></Magnetic>
                </Fade>
                <div className="contact-grid">
                    <Fade><span className="label">Elsewhere</span>{SOCIALS.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer">{l} ↗</a>)}</Fade>
                    <Fade delay={60}><span className="label">Résumé</span><button style={{ textAlign: "left", width: "fit-content" }} onClick={onOpenCv}>View CV ↗</button></Fade>
                    <Fade delay={120}><span className="label">Location</span><span>Hamburg, Germany</span><span className="label">{time}</span></Fade>
                    <Fade delay={180}><span className="label">Availability</span><span>Full-time &amp; working-student roles in AI and data engineering</span></Fade>
                </div>
            </div>
            <footer className="footer">
                <span className="label">© {new Date().getFullYear()} Farhan Shahriyar</span>
                <span className="label">Designed &amp; built in Hamburg</span>
                <button className="label to-top" onClick={() => scrollToId("home")}>Back to top ↑</button>
            </footer>
        </section>
    );
}
