import { useEffect, useState } from "react";
import { Lines, Fade } from "./Motion";
import { Icon } from "./Chrome";
import { useChat, ask, setDraft, cancelDemo, runDemo } from "./chat";
import { scrollToId, reducedMotion } from "./hooks";

const ROLES = ["AI Engineer", "AI Governance", "Data Governance", "AI Security", "Agentic Development"];
const CHIPS = ["What does Farhan do?", "What value can he bring?", "Is he open to work?"];

function RoleTicker() {
    const [i, setI] = useState(0);
    useEffect(() => {
        if (reducedMotion()) return;
        const t = setInterval(() => setI(v => (v + 1) % ROLES.length), 2200);
        return () => clearInterval(t);
    }, []);
    return (
        <span className="ticker neu-in-sm" aria-label={ROLES.join(", ")}>
            <span className="ticker-track" style={{ transform: `translateY(${-i * 1.7}em)` }} aria-hidden="true">
                {ROLES.map(r => <span key={r}>{r}</span>)}
            </span>
        </span>
    );
}

export default function Hero({ ready, onOpenCv }) {
    const { draft, busy, msgs, typing } = useChat();
    const last = typing || [...msgs].reverse().find(m => m.r === "b")?.t;
    useEffect(() => { if (ready) runDemo(); }, [ready]);

    return (
        <section id="home" className="hero" data-station="hero">
            <div className="hero-inner wrap">
                <div className="hero-copy">
                    <Fade play={ready} delay={80}>
                        <span className="chip mono"><span className="dot-live" />Open to new roles · Hamburg, Germany</span>
                    </Fade>
                    <h1 className="hero-name" aria-label="Farhan Shahriyar">
                        <Lines play={ready} delay={150} stagger={110} lines={["Farhan", "Shahriyar"]} />
                    </h1>
                    <Fade play={ready} delay={380} className="hero-role"><span>I work as</span><RoleTicker /></Fade>
                    <Fade play={ready} delay={500}>
                        <p className="hero-lede">I build <strong>AI that companies can trust</strong> — agents that do real work, on well-governed data, with security and EU AI Act compliance built in.</p>
                    </Fade>
                    <Fade play={ready} delay={640} className="askbar">
                        <form className="askbar-form neu-in" onSubmit={e => { e.preventDefault(); ask(draft); }}>
                            <img className="askbar-avatar" src="/images/profile-cartoon.jpg" alt="" />
                            <input value={draft} onFocus={cancelDemo} onChange={e => { cancelDemo(); setDraft(e.target.value); }} placeholder="Ask my AI anything about me…" aria-label="Ask Farhan's AI a question" maxLength={300} />
                            <button type="submit" className="key key-accent send" disabled={busy || !draft.trim()} aria-label="Ask"><Icon n="arrow" size={18} /></button>
                        </form>
                        <div className="askbar-chips">{CHIPS.map(c => <button key={c} className="key key-sm" onClick={() => { cancelDemo(); ask(c); }}>{c}</button>)}</div>
                        <p className={`askbar-answer ${last ? "is-on" : ""}`} aria-live="polite">
                            {busy && !typing ? <span className="dots"><i /><i /><i /></span> : <>{last}{typing && <span className="caret" />}</>}
                        </p>
                    </Fade>
                    <Fade play={ready} delay={760} className="hero-ctas">
                        <button className="key key-accent" onClick={() => scrollToId("bring")}>See what I do<Icon n="arrow" size={18} /></button>
                        <button className="key" onClick={() => scrollToId("game")}>Play the game</button>
                        <button className="key" onClick={onOpenCv}>Résumé</button>
                    </Fade>
                </div>
            </div>
            <Fade play={ready} delay={1400} className="hero-hint mono"><span className="neu-in-sm hint-key">↝</span>Move your mouse through me · click anywhere</Fade>
        </section>
    );
}
