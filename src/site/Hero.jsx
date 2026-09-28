import { Fade, Lines, Chars, Magnetic } from "./Motion";
import { scrollToId } from "./hooks";
import { useProgress } from "./progress";
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
    const verified = useProgress().verdict?.status === "solved";
    return (
        <section id="home" className="v-hero">
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
                </div>
                <div className="v-hero-card">
                    <div className="v-glass-hero" data-glass data-explode="0" />
                    <Fade play={ready} delay={900} className="v-glass-cap">
                        <span className="mono">Most AI is a black box.</span>
                        <b>I build glass boxes.</b>
                        <small>Four layers you can see into: input shield, AI judge, my AI, output scan.</small>
                        <div className={`v-stamp mono ${verified ? "is-ok" : ""}`}>{verified ? <>Verified<small>by you ✓</small></> : <>Don't believe it?<small>break it below ↓</small></>}</div>
                    </Fade>
                </div>
            </div>
        </section>
    );
}
