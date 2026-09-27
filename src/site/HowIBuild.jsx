import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { WaveTitle } from "./SectionHead";
import { reducedMotion, scrollToId } from "./hooks";

/*
 * "How I build" — one real-world story, told as a 3D deck of app screens.
 * An HR manager asks an AI assistant to shortlist candidates; each scroll step
 * brings the next screen forward while the previous ones recede behind it.
 * The deck is driven by a single CSS variable (--pos) so scrolling stays smooth.
 */

const STEPS = [
    { title: "A question comes in", plain: "An HR manager asks the company's AI assistant to help with hiring.", why: "AI is only useful if it fits into how people already work.", skills: [["python", "Python"], ["fastapi", "FastAPI"], ["azure", "Azure"]] },
    { title: "It finds the right data", plain: "The assistant searches company documents and keeps only what's relevant — the job description and the applications.", why: "Answers are grounded in real documents, not guesses.", skills: [["rag", "RAG"], ["vector", "Vector search"], ["databricks", "Databricks"]] },
    { title: "Personal data is protected", plain: "Names, emails and ages are masked before the AI sees them.", why: "Candidates are judged on skills, not identity — and GDPR is respected.", skills: [["gdpr", "GDPR"], ["lineage", "Data governance"]] },
    { title: "The agent does the work", plain: "It plans the task and uses tools step by step: read the role, compare skills, explain each match.", why: "Real work gets done, and every step can be followed.", skills: [["langchain", "LangGraph"], ["tool", "Tool calling"], ["eval", "LLM evals"]] },
    { title: "Compliance & security check", plain: "Hiring is “high-risk” under the EU AI Act, so the system flags it and requires a human decision. It also scans for prompt-injection attacks.", why: "Risky output is caught before it reaches anyone.", skills: [["eu", "EU AI Act"], ["owasp", "OWASP LLM Top 10"], ["risk", "Risk classification"]] },
    { title: "A human makes the call", plain: "The recruiter sees a ranked shortlist with reasons and sources — and approves it.", why: "The AI advises. People decide.", skills: [["human", "Human-in-the-loop"], ["answer", "Cited answers"]] },
    { title: "Everything is recorded", plain: "Every step is written to a tamper-proof audit log.", why: "Any decision can be explained to a manager or an auditor later.", skills: [["ledger", "Audit trail"], ["shield", "NIST AI RMF"]] },
];
const N = STEPS.length;
const clamp01 = v => Math.min(1, Math.max(0, v));
const ease = t => t * t * (3 - 2 * t);

/* ── The seven screens ─────────────────────────────────────────────── */
const Check = () => <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const SCREENS = [
    () => (
        <div className="s-chat">
            <div className="s-msg u"><span className="s-av">HR</span><p>Shortlist the best candidates for our Data Engineer role.</p></div>
            <div className="s-msg b"><span className="s-av ai">AI</span><p>On it. I'll find the right documents, protect personal data, check the rules — and let you make the final call.</p></div>
            <div className="s-typing"><i /><i /><i /></div>
        </div>
    ),
    () => (
        <div className="s-find">
            <div className="s-search neu-in-sm"><Logo n="rag" size={16} /><span>Data Engineer · role &amp; applications</span><i className="s-scan" /></div>
            <ul className="s-files">
                {[["Job description — Data Engineer", 96, 1], ["Application — Candidate A", 91, 1], ["Application — Candidate B", 88, 1], ["Application — Candidate C", 83, 1], ["Canteen menu, October", 4, 0], ["Office party photos", 2, 0]].map(([t, v, ok], k) => (
                    <li key={t} className={ok ? "" : "is-skip"} style={{ "--k": k, "--v": `${v}%` }}>
                        <Logo n="docs" size={15} /><span className="s-fname">{t}</span>
                        <span className="s-rel"><i /></span><span className="mono">{ok ? `${v}%` : "skipped"}</span>
                    </li>
                ))}
            </ul>
        </div>
    ),
    () => (
        <div className="s-cv">
            <div className="s-cv-card neu-sm">
                {[["Name", "Priya Sharma", 1], ["Email", "priya.s@mail.com", 1], ["Age", "29", 1], ["Photo", "attached", 1], ["Skills", "Python · Spark · SQL · Airflow", 0], ["Experience", "4 years in data engineering", 0]].map(([k, v, mask], j) => (
                    <div key={k} className={`s-row ${mask ? "is-mask" : "is-keep"}`} style={{ "--k": j }}>
                        <span className="mono">{k}</span>
                        <span className="s-val"><span>{v}</span>{mask ? <i className="s-bar" /> : null}</span>
                        <span className="s-tag mono">{mask ? "masked" : "kept"}</span>
                    </div>
                ))}
            </div>
            <span className="s-badge"><Logo n="gdpr" size={15} />GDPR · personal data masked</span>
        </div>
    ),
    () => (
        <div className="s-agent">
            <ul className="s-plan">
                {["Read the role requirements", "Compare each candidate's skills", "Score and explain every match", "Cite the source of each claim"].map((t, j) => (
                    <li key={t} style={{ "--k": j }}><span className="s-tick"><Check /></span>{t}</li>
                ))}
            </ul>
            <pre className="s-log neu-in-sm">
                {["→ read_document(\"job_description\")", "→ compare_skills(A, B, C)", "→ score_candidates()", "✓ plan complete"].map((l, j) => <span key={l} style={{ "--k": j }}>{l}</span>)}
            </pre>
        </div>
    ),
    () => (
        <div className="s-check">
            <div className="s-meter">
                {["Minimal", "Limited", "High", "Unacceptable"].map((t, j) => <span key={t} className={`t${j}`} style={{ "--k": j }}><i />{t}</span>)}
            </div>
            <div className="s-verdict"><b>High risk · Employment</b><span className="mono">EU AI Act · Annex III</span></div>
            <ul className="s-checks">
                <li style={{ "--k": 0 }}><span className="s-ok"><Check /></span>Prompt-injection scan — clean<span className="mono">OWASP</span></li>
                <li style={{ "--k": 1 }}><span className="s-ok"><Check /></span>Personal data masked<span className="mono">GDPR</span></li>
                <li style={{ "--k": 2 }} className="is-warn"><span className="s-ok">!</span>Human decision required<span className="mono">Art. 14</span></li>
            </ul>
        </div>
    ),
    () => (
        <div className="s-human">
            <ul className="s-rank">
                {[["B", 92, "Spark & SQL, 4 years"], ["A", 85, "Strong Python, 2 years"], ["C", 71, "SQL, learning Spark"]].map(([c, v, why], j) => (
                    <li key={c} style={{ "--k": j, "--v": `${v}%` }}>
                        <span className="s-pos">{j + 1}</span>
                        <span className="s-who"><b>Candidate {c}</b><span>{why}</span></span>
                        <span className="s-score"><i /></span><b className="s-num">{v}</b>
                        <span className="s-src mono">source ↗</span>
                    </li>
                ))}
            </ul>
            <div className="s-actions">
                <span className="key key-sm">Adjust</span>
                <span className="key key-sm key-accent s-approve">Approve shortlist</span>
            </div>
            <span className="s-toast"><Check />Approved by the recruiter</span>
        </div>
    ),
    () => (
        <div className="s-ledger">
            {[["Question", "a3f9"], ["Data found", "7c12"], ["Data masked", "e04b"], ["Agent plan", "91d7"], ["Checks", "5ba0"], ["Approved", "c8e3"]].map(([t, h], j) => (
                <div key={t} className="s-block neu-sm" style={{ "--k": j }}>
                    <span className="mono">#{j + 1}</span><b>{t}</b><code>{h}…</code>
                </div>
            ))}
            <span className="s-seal"><Logo n="ledger" size={16} />Tamper-evident · fully explainable</span>
        </div>
    ),
];
const TITLES = ["HR Assistant", "Document search", "Privacy filter", "Agent", "Compliance", "Review", "Audit log"];

export default function HowIBuild() {
    const sectionRef = useRef(null);
    const deckRef = useRef(null);
    const [step, setStep] = useState(0);
    const [over, setOver] = useState(false);
    const [prog, setProg] = useState(0);

    useEffect(() => {
        let raf = 0;
        const update = () => {
            const el = sectionRef.current;
            const total = el.offsetHeight - innerHeight;
            const p = clamp01(-el.getBoundingClientRect().top / total) * (N + 1); // N steps + overview
            const whole = Math.floor(p);
            // hold each screen for most of its slot, then glide to the next
            let pos = whole + ease(clamp01((p - whole - 0.62) / 0.38));
            pos = Math.min(pos, N - 1);
            if (reducedMotion()) pos = Math.round(pos);
            deckRef.current.style.setProperty("--pos", pos.toFixed(3));
            setStep(Math.round(pos));
            setOver(p >= N);
            setProg(clamp01(p / N));
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        update();
        window.addEventListener("scroll", on, { passive: true });
        window.addEventListener("resize", on);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
    }, []);

    const jump = i => {
        const el = sectionRef.current;
        const y = el.offsetTop + ((i + 0.3) / (N + 1)) * (el.offsetHeight - innerHeight);
        window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: "smooth" });
    };

    return (
        <section id="how" className="hb" ref={sectionRef} aria-label="How I build trustworthy AI, shown with a hiring example">
            <div className="hb-stage">
                <div className="hb-grid wrap">
                    <div className="hb-left">
                        <header className="hb-head">
                            <span className="head-kicker"><span className="head-n neu-sm mono">02</span><span className="mono">How I build</span><span className="head-rule" /></span>
                            <WaveTitle text="AI that's useful — and safe" className="sm" />
                            <p className="head-sub">Follow one real request through a system like the ones I build.</p>
                        </header>

                        <ol className="hb-list">
                            <span className="hb-track" aria-hidden="true"><i style={{ transform: `scaleY(${prog})` }} /></span>
                            {STEPS.map((s, i) => (
                                <li key={s.title} className={`${i === step && !over ? "is-on" : ""} ${i < step || over ? "is-done" : ""}`}>
                                    <button onClick={() => jump(i)}><span className="hb-dot">{i + 1}</span><span className="hb-t">{s.title}</span></button>
                                    <div className="hb-more"><div>
                                        <p>{s.plain}</p>
                                        <p className="hb-why"><span className="mono">Why it matters</span>{s.why}</p>
                                        <ul className="hb-skills">{s.skills.map(([l, n]) => <li key={n} className="tool neu-sm"><Logo n={l} size={15} /><span>{n}</span></li>)}</ul>
                                    </div></div>
                                </li>
                            ))}
                        </ol>

                        <div className={`hb-sum neu ${over ? "is-on" : ""}`}>
                            <b>That's the loop I bring to every project.</b>
                            <span>Useful AI in the middle — with privacy, compliance, human oversight and an audit trail around it.</span>
                            <div className="hb-ctas">
                                <button className="key key-sm key-accent" onClick={() => scrollToId("work")}>See my experience</button>
                                <button className="key key-sm" onClick={() => scrollToId("built")}>See Argus AI</button>
                            </div>
                        </div>
                    </div>

                    <div className="hb-right">
                        <span className="chip mono hb-scenario"><span className="dot-live" />Example · AI that helps HR shortlist candidates</span>
                        <div className={`deck ${over ? "is-over" : ""}`}>
                            <div className="deck-rig" ref={deckRef}>
                                {SCREENS.map((Screen, i) => (
                                    <div key={i} className={`panel neu-lg ${i <= step || over ? "is-seen" : ""} ${i === step && !over ? "is-on" : ""}`} style={{ "--i": i, "--fx": i - 3, "--fa": Math.abs(i - 3) }}>
                                        <div className="panel-bar"><span className="panel-dots"><i /><i /><i /></span><span className="mono">{TITLES[i]}</span><span className="mono panel-n">{i + 1} / {N}</span></div>
                                        <div className="panel-body"><Screen /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="hb-mobile-step" aria-live="polite"><b>{step + 1}. {STEPS[step].title}</b>{STEPS[step].plain}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
