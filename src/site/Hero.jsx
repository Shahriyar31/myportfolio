import { Fade, Lines, Chars, Magnetic } from "./Motion";
import { scrollToId } from "./hooks";
import { NAME, TITLE, FOCUS } from "../data/profile";

/* Section header used across the page: index, one short title, one line. */
export function Head({ n, kicker, title, sub }) {
    return (
        <header className="v-head">
            <Fade><span className="v-kick mono"><b>{n}</b>{kicker}</span></Fade>
            <Chars as="h2" className="v-h2" stagger={14} lines={Array.isArray(title) ? title : [title]} />
            {sub && <Fade delay={120}><p className="v-sub">{sub}</p></Fade>}
        </header>
    );
}

/* The claim. Everything a recruiter needs is on this one screen. */
export default function Hero({ ready, onQuick }) {
    return (
        <section id="home" className="v-hero" data-cam="hero">
            <div className="v-wrap v-hero-grid">
                <div className="v-hero-copy">
                    <Fade play={ready} delay={100}><span className="v-chip mono"><i className="dot-live" />Open to roles · Hamburg, Germany</span></Fade>
                    <Chars as="h1" className="v-h1" play={ready} delay={250} stagger={38} lines={["I build AI", "you can", <em>trust.</em>]} />
                    <Fade play={ready} delay={600}><p className="v-lede"><b>{NAME}</b>, {TITLE}. {FOCUS.replace(/\.$/, "")}: RAG, AI agents, and the guardrails that keep them safe and legal.</p></Fade>
                    <Fade play={ready} delay={750} className="v-ctas">
                        <Magnetic><button className="v-btn is-main" onClick={onQuick}>Quick read · 60 s</button></Magnetic>
                        <Magnetic><button className="v-btn" onClick={() => scrollToId("challenge")}>Try to break my AI ↓</button></Magnetic>
                    </Fade>
                    <Fade play={ready} delay={900}><p className="v-proof mono">Now: AI &amp; Data Engineering at Nordex · Argus AI live · M.Sc. TUHH</p></Fade>
                    <Fade play={ready} delay={1400}><p className="v-hint mono"><i />Move your cursor: you're firing my neurons. Click anywhere for a burst.</p></Fade>
                </div>
            </div>
        </section>
    );
}
