import { useEffect, useState } from "react";
import { goTo } from "./hooks";
import { mark } from "./progress";

/*
 * Incident 2 — "Keep it legal". Legal wants to know which of five AI ideas the company may
 * build. The visitor sorts each into an EU AI Act risk tier; Argus gives its second opinion.
 * Simplified illustration of the Act, not legal advice.
 */

const TIERS = [["Minimal", "t0"], ["Limited", "t1"], ["High", "t2"], ["Prohibited", "t3"]];
const CASES = [
    { name: "Predictive maintenance for turbines", tier: 0, ref: "No specific obligations", why: "It optimises machines and doesn't decide anything about people.", duty: "Good practice: monitoring and documentation." },
    { name: "Customer-service chatbot", tier: 1, ref: "Art. 50: transparency", why: "People must be told they are talking to an AI.", duty: "Disclose the AI; label generated content." },
    { name: "CV screening for hiring", tier: 2, ref: "Annex III: employment", why: "It affects who gets a job, so it's high-risk.", duty: "Risk management, data governance, human oversight, logging, conformity assessment." },
    { name: "Emotion recognition on employees", tier: 3, ref: "Art. 5: prohibited practice", why: "Inferring emotions of people at work is banned (outside medical or safety uses).", duty: "Don't build it." },
    { name: "AI-generated marketing images", tier: 1, ref: "Art. 50: synthetic content", why: "AI-generated media must be marked as such.", duty: "Machine-readable marking; disclose deepfakes." },
];

export default function KeepLegal() {
    const [i, setI] = useState(0), [picks, setPicks] = useState([]), [skip, setSkip] = useState(false);
    const cur = CASES[i], last = picks[picks.length - 1], showing = picks.length > i; // answered the current card
    const done = picks.length === CASES.length || skip;
    const score = picks.filter((p, k) => p === CASES[k].tier).length;

    useEffect(() => { if (picks.length === CASES.length) mark("legal", "solved", { score: `${score}/${CASES.length}` }); else if (skip) mark("legal", "skipped"); }, [picks, skip, score]);

    const pick = t => {
        if (showing || done) return;
        setPicks(p => [...p, t]);
    };

    return (
        <div className="demo-body">
                <div className="inc-kick mono"><span className="inc-clock">Demo 2</span><span>Keep it legal</span><span className="inc-tag">EU AI Act · AI governance</span></div>
                <h3 className="pane-title">Legal asks: which of our AI ideas are even allowed?</h3>
                <p className="pane-lede sm">Five ideas land on your desk. Sort each one into its EU AI Act risk level. Argus, my compliance agent, gives a second opinion.</p>

                {!done && <>
                    <div className="kl-progress mono" aria-label={`Case ${i + 1} of ${CASES.length}`}>{CASES.map((c, k) => <i key={c.name} className={k < picks.length ? (picks[k] === c.tier ? "is-ok" : "is-bad") : k === i ? "is-cur" : ""} />)}<span>Case {i + 1} / {CASES.length}</span></div>
                    <div className="kl-card" key={i}><span className="mono">AI idea</span><b>{cur.name}</b></div>
                    <div className="kl-tiers" role="group" aria-label="Risk level">
                        {TIERS.map(([t, c], k) => <button key={t} className={`kl-tier ${c} ${showing && k === cur.tier ? "is-right" : ""} ${showing && k === last && k !== cur.tier ? "is-wrong" : ""}`} onClick={() => pick(k)} disabled={showing}>{t}</button>)}
                    </div>
                    {showing && (
                        <div className={`kl-argus ${last === cur.tier ? "is-ok" : "is-bad"}`} aria-live="polite">
                            <span className="mono">Argus · second opinion</span>
                            <p><b>{last === cur.tier ? "Agreed" : `I'd say ${TIERS[cur.tier][0]}`}.</b> {cur.ref}. {cur.why}</p>
                            <p className="kl-duty"><span className="mono">What you must do</span>{cur.duty}</p>
                            <button className="bi-ask" onClick={() => setI(v => v + 1)}>{i < CASES.length - 1 ? "Next idea →" : "Send to Legal →"}</button>
                        </div>
                    )}
                    {!showing && <button className="bi-skip mono" onClick={() => setSkip(true)}>Skip — show what this proves</button>}
                </>}

                {done && (
                    <div className="inc-proof">
                        <b>✓ Sent to Legal{picks.length === CASES.length ? `: you matched Argus on ${score} of ${CASES.length}` : ""}.</b>
                        <p><span className="mono">In plain words</span>Before a company builds an AI, I work out what the law allows and what it requires. Then I build that into the product.</p>
                        <p><span className="mono">Under the hood</span>EU AI Act risk classification (Art. 5, Art. 50, Annex III), GDPR impact assessments, human-in-the-loop review, and hash-chained audit trails. Argus automates this with a LangGraph agent and RAG over the regulation text.</p>
                        <div className="dj-proof"><span className="mono">Proof</span><a href="https://eu-ai-act-governance-platform.vercel.app" target="_blank" rel="noreferrer">Argus AI (live)</a><button onClick={() => goTo("experience")}>AI governance at Nordex</button></div>
                        <p className="kl-note mono">Simplified illustration · not legal advice</p>
                    </div>
                )}
        </div>
    );
}
