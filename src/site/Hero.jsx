import { useState } from "react";
import { Fade, Chars, Magnetic } from "./Motion";
import { scrollToId } from "./hooks";
import { useChat, ask } from "./chat";
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

const PICKS = ["What are your strongest skills?", "Are you open to work?", "What is Argus AI?"];

/* Ask my brain: the real assistant answers in the hero while the neuron portrait lights up. */
function AskBrain() {
    const { msgs, typing, busy } = useChat();
    const [q, setQ] = useState(""), [asked, setAsked] = useState(false);
    const go = text => { if (!text.trim() || busy) return; setAsked(true); setQ(""); ask(text); };
    const last = [...msgs].reverse().find(m => m.r === "b");
    return (
        <div className="v-ask">
            <form onSubmit={e => { e.preventDefault(); go(q); }}>
                <span className="v-ask-dot" aria-hidden="true" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask my brain anything about me…" aria-label="Ask my AI about Farhan" maxLength={300} />
                <button disabled={busy || !q.trim()}>{busy ? "Thinking…" : "Ask"}</button>
            </form>
            <div className="v-ask-picks">{PICKS.map(p => <button key={p} onClick={() => go(p)} disabled={busy}>{p}</button>)}</div>
            {asked && <p className="v-ask-a" aria-live="polite">{busy && !typing ? <span className="v-ask-think">My neurons are firing…</span> : (typing || last?.t)}</p>}
        </div>
    );
}

/* The hero is about me: my face, made of neurons, that you can talk to. */
export default function Hero({ ready, onQuick }) {
    return (
        <section id="home" className="v-hero" data-node="0">
            <div className="v-wrap v-hero-grid">
                <div className="v-hero-copy">
                    <Fade play={ready} delay={100}><span className="v-chip mono"><i className="dot-live" />Open to roles · Hamburg, Germany</span></Fade>
                    <Chars as="h1" className="v-h1" play={ready} delay={250} stagger={34} lines={[NAME.split(" ")[0], <em>{NAME.split(" ").slice(1).join(" ")}</em>]} />
                    <Fade play={ready} delay={700}><p className="v-claim">{TITLE} who builds AI you can <b>trust</b>.</p></Fade>
                    <Fade play={ready} delay={850}><p className="v-lede">{FOCUS.replace(/\.$/, "")}: RAG, AI agents, and the guardrails that keep them safe and legal.</p></Fade>
                    <Fade play={ready} delay={1000}><AskBrain /></Fade>
                    <Fade play={ready} delay={1150} className="v-ctas">
                        <Magnetic><button className="v-btn is-main" onClick={onQuick}>Quick read · 60 s</button></Magnetic>
                        <Magnetic><button className="v-btn" onClick={() => scrollToId("challenge")}>Explore my brain ↓</button></Magnetic>
                    </Fade>
                </div>
            </div>
            <Fade play={ready} delay={1600} className="v-hero-hint"><p className="v-hint mono"><i />That's me, in neurons. Move your cursor to fire them.</p></Fade>
        </section>
    );
}
