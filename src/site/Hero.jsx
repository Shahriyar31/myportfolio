import { useEffect, useRef, useState } from "react";
import { Lines, Fade } from "./Motion";
import { Icon } from "./Chrome";
import Logo from "./Logo";
import DataWind from "./DataWind";
import { useChat, ask, setDraft, cancelDemo, runDemo } from "./chat";
import { scrollToId, finePointer, reducedMotion } from "./hooks";

const ROLES = ["AI Engineer", "AI Governance", "Data Governance", "AI Security", "Agentic Development"];

/* Two orbits of the tools I use — inner: AI & governance, outer: data & cloud */
const INNER = [["langchain", "LangGraph — AI agents"], ["python", "Python"], ["eu", "EU AI Act"], ["owasp", "OWASP — AI security"], ["fastapi", "FastAPI"], ["gdpr", "GDPR"]];
const OUTER = [["databricks", "Databricks"], ["azure", "Microsoft Azure"], ["spark", "Apache Spark"], ["docker", "Docker"], ["kafka", "Apache Kafka"], ["terraform", "Terraform"], ["postgres", "PostgreSQL"], ["kubernetes", "Kubernetes"]];

const FACTS = [
    ["work", "Now", "Data & AI at Nordex Group", "work"],
    ["built", "Building", "Argus AI — EU AI Act platform", "built"],
    ["grad", "Studying", "MSc Data Science, TUHH", "education"],
];
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

function Ring({ items, cls, dur }) {
    return (
        <div className={`ring3d ${cls}`} style={{ "--dur": `${dur}s`, "--n": items.length }}>
            <div className="ring3d-spin">
                {items.map(([logo, label], i) => (
                    <div key={logo} className="slot" style={{ "--a": `${(360 / items.length) * i}deg` }}>
                        <div className="unspin">
                            <div className="upright">
                                <span className="coin" tabIndex={0} aria-label={label}>
                                    <Logo n={logo} size={cls === "inner" ? 26 : 24} />
                                    <span className="coin-tip mono">{label}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Portrait({ ready }) {
    const ref = useRef(null);
    const { msgs, typing, busy } = useChat();
    const last = typing || (busy ? "" : [...msgs].reverse().find(m => m.r === "b")?.t);
    // Gentle tilt of the whole orbit system toward the cursor
    useEffect(() => {
        if (!finePointer() || reducedMotion()) return;
        const el = ref.current;
        let raf = 0;
        const move = e => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
                el.style.setProperty("--tx", `${(-y * 8).toFixed(2)}deg`);
                el.style.setProperty("--ty", `${(x * 10).toFixed(2)}deg`);
            });
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
    }, []);
    return (
        <div className="orbit-wrap">
        <div className={`orbit ${ready ? "is-in" : ""}`} ref={ref}>
            <div className="orbit-stage">
                <Ring items={OUTER} cls="outer" dur={46} />
                <Ring items={INNER} cls="inner" dur={30} />
                <figure className="portrait neu-lg">
                    <img src="/images/profile-suit.jpg" alt="Farhan Shahriyar" width="793" height="777" fetchPriority="high" />
                </figure>
            </div>
        </div>
            <div className={`bubble-say neu ${last || busy ? "is-on" : ""}`} aria-live="polite">
                <span className="bubble-who mono"><img src="/images/profile-cartoon.jpg" alt="" />Farhan's AI</span>
                {busy && !typing ? <span className="dots"><i /><i /><i /></span> : <p>{last}{typing && <span className="caret" />}</p>}
            </div>
        </div>
    );
}

export default function Hero({ ready, onOpenCv }) {
    const { draft, busy } = useChat();
    useEffect(() => { if (ready) runDemo(); }, [ready]);

    return (
        <section id="home" className="hero">
            <DataWind className="hero-wind" />
            <span className="wind-legend mono" aria-hidden="true"><i className="raw" />raw data<i className="arrow">→</i><i className="clean" />trusted, governed data</span>
            <div className="hero-inner wrap">
                <div className="hero-copy">
                    <Fade play={ready} delay={80}>
                        <span className="chip mono"><span className="dot-live" />Open to new roles · Hamburg, Germany</span>
                    </Fade>
                    <h1 className="hero-name" aria-label="Farhan Shahriyar">
                        <Lines play={ready} delay={150} stagger={110} lines={["Farhan Shahriyar"]} />
                    </h1>
                    <Fade play={ready} delay={380} className="hero-role">
                        <span>I work as</span><RoleTicker />
                    </Fade>
                    <Fade play={ready} delay={500}>
                        <p className="hero-lede">
                            I build <strong>AI that companies can trust</strong> — assistants and agents that do real work, running on well-governed data, with security and EU AI Act compliance built in from day one.
                        </p>
                    </Fade>

                    <Fade play={ready} delay={640} className="askbar">
                        <form className="askbar-form neu-in" onSubmit={e => { e.preventDefault(); ask(draft); }}>
                            <img className="askbar-avatar" src="/images/profile-cartoon.jpg" alt="" />
                            <input
                                value={draft}
                                onFocus={cancelDemo}
                                onChange={e => { cancelDemo(); setDraft(e.target.value); }}
                                placeholder="Ask my AI anything about me…"
                                aria-label="Ask Farhan's AI a question"
                                maxLength={300}
                            />
                            <button type="submit" className="key key-accent send" disabled={busy || !draft.trim()} aria-label="Ask"><Icon n="arrow" size={18} /></button>
                        </form>
                        <div className="askbar-chips">
                            {CHIPS.map(c => <button key={c} className="key key-sm" onClick={() => { cancelDemo(); ask(c); }}>{c}</button>)}
                        </div>
                    </Fade>

                    <Fade play={ready} delay={760} className="hero-ctas">
                        <button className="key key-accent" onClick={() => scrollToId("bring")}>See what I do<Icon n="arrow" size={18} /></button>
                        <button className="key" onClick={() => scrollToId("built")}>My projects</button>
                        <button className="key" onClick={onOpenCv}>Résumé</button>
                    </Fade>
                </div>

                <Fade play={ready} delay={250} className="hero-visual">
                    <Portrait ready={ready} />
                </Fade>
            </div>

            <Fade play={ready} delay={900} className="facts-strip wrap">
                {FACTS.map(([icon, k, v, id]) => (
                    <button key={k} className="fact neu-sm" onClick={() => scrollToId(id)}>
                        <span className="fact-ico neu-in-sm"><Icon n={icon} size={18} /></span>
                        <span><span className="mono">{k}</span><b>{v}</b></span>
                    </button>
                ))}
            </Fade>
        </section>
    );
}
