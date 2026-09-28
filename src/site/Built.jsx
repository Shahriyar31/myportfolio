import Stop, { Opener } from "./Stop";
import { useRef, useState } from "react";
import { Lines } from "./Motion";
import { Icon } from "./Chrome";
import { finePointer } from "./hooks";
import { PROJECTS } from "../data/constants";

/* Simplified EU AI Act risk tiers — an illustration of what Argus automates, not legal advice. */
const TIERS = ["Minimal", "Limited", "High", "Unacceptable"];
const SYSTEMS = [
    { name: "Spam filter", tier: 0, ref: "No specific obligations", why: "Low-impact automation. Voluntary codes of conduct only.", duties: ["Good practice & internal documentation"] },
    { name: "Predictive maintenance", tier: 0, ref: "Minimal risk (not a safety component)", why: "Optimises machines, doesn't decide about people.", duties: ["Monitor performance", "Keep technical docs"] },
    { name: "Customer-service chatbot", tier: 1, ref: "Art. 50 — transparency", why: "People must know they are talking to an AI system.", duties: ["Disclose AI interaction", "Log conversations"] },
    { name: "AI-generated marketing images", tier: 1, ref: "Art. 50 — synthetic content", why: "AI-generated or manipulated content must be marked as such.", duties: ["Machine-readable marking", "Visible disclosure for deepfakes"] },
    { name: "CV screening for hiring", tier: 2, ref: "Annex III — employment", why: "Decides access to work, so it is high-risk.", duties: ["Risk management system", "Data governance", "Human oversight", "Logging & conformity assessment"] },
    { name: "Credit scoring of people", tier: 2, ref: "Annex III — essential services", why: "Affects access to credit for individuals.", duties: ["Risk management system", "Bias testing on data", "Human oversight", "Registration in EU database"] },
    { name: "Social scoring of citizens", tier: 3, ref: "Art. 5 — prohibited practice", why: "Banned outright in the EU.", duties: ["Do not deploy"] },
];

function Classifier() {
    const [sel, setSel] = useState(4);
    const s = SYSTEMS[sel];
    return (
        <div className="clf">
            <div className="clf-pick" role="radiogroup" aria-label="Pick an AI system">
                {SYSTEMS.map((x, i) => (
                    <button key={x.name} role="radio" aria-checked={sel === i} className={`key key-sm ${sel === i ? "is-down" : ""}`} onClick={() => setSel(i)}>{x.name}</button>
                ))}
            </div>
            <div className="clf-out neu-in" aria-live="polite">
                <div className="clf-meter" aria-label={`Risk tier: ${TIERS[s.tier]}`}>
                    {TIERS.map((t, i) => <span key={t} className={`clf-seg t${i} ${i <= s.tier ? "is-on" : ""} ${i === s.tier ? "is-cur" : ""}`}><i />{t}</span>)}
                </div>
                <div className="clf-res" key={sel}>
                    <span className="mono">{s.ref}</span>
                    <b className={`t${s.tier}`}>{TIERS[s.tier]} risk</b>
                    <p>{s.why}</p>
                    <ul>{s.duties.map(d => <li key={d}><Icon n="arrow" size={12} />{d}</li>)}</ul>
                </div>
            </div>
            <p className="clf-note mono">Simplified illustration · not legal advice</p>
        </div>
    );
}

const STATION = { 2: "p-twin", 3: "p-poultry", 4: "p-radiation", 5: "p-stock", 6: "p-books" };
const PLACE = { 2: "The twin buildings", 3: "The barn", 4: "The radar", 5: "The ticker tower", 6: "The library" };

export default function Built() {
    // walking order: a loop around the island that ends at the library, next to the education chapter
    const others = [4, 5, 2, 3, 6].map(id => PROJECTS.find(p => p.id === id)).filter(Boolean);
    return (
        <section id="built" aria-label="Projects">
            <Opener station="overview" n="03" kicker="Projects" title="Walk the project district"
                sub="Every project is a building in the valley. Scroll to walk from one to the next — or click a building in the world." />
            <Stop station="p-argus" side="left" wide>
                <div className="pane-kicker"><span className="chip mono is-live"><span className="dot-live" />Live · free beta</span><span className="pane-where mono">🧪 The Argus lab</span></div>
                <h3 className="pane-title">Argus AI</h3>
                <p className="argus-sub">EU AI Act compliance, as an agent.</p>
                <div className="pane-split">
                    <div>
                        <p className="pane-lede sm">A LangGraph agent classifies AI systems into EU AI Act risk tiers with article-level justification, drafts GDPR DPIAs, checks OWASP LLM Top 10 risks and pauses for a human on high-risk cases — with a SHA-256 hash-chained audit trail.</p>
                        <ul className="stack-tags">{["LangGraph", "FastAPI", "pgvector", "RAGAS", "Terraform", "Azure Container Apps"].map(t => <li key={t} className="neu-in-sm mono">{t}</li>)}</ul>
                        <a className="key key-accent" href="https://eu-ai-act-governance-platform.vercel.app" target="_blank" rel="noreferrer" style={{ marginTop: 14 }}>Visit Argus AI<Icon n="arrow" size={16} /></a>
                    </div>
                    <div className="argus-demo"><span className="mono">Try it — how would the EU AI Act classify…</span><Classifier /></div>
                </div>
            </Stop>
            {others.map((p, i) => (
                <Stop key={p.id} station={STATION[p.id]} side={i % 2 ? "left" : "right"}>
                    <div className="pane-kicker"><span className="chip mono">{p.badge}</span><span className="pane-where mono">📍 {PLACE[p.id]}</span></div>
                    <h3 className="pane-title">{p.title}</h3>
                    <p className="stack-org">{p.sub}</p>
                    <p className="pane-lede sm">{p.desc}</p>
                    <ul className="stack-tags">{p.tags.map(t => <li key={t} className="neu-in-sm mono">{t}</li>)}</ul>
                    {p.link && <a className="key" href={p.link} target="_blank" rel="noreferrer" style={{ marginTop: 14 }}>View code<Icon n="arrow" size={16} /></a>}
                    {i === others.length - 1 && <p className="pane-next mono">Next — where it all started ↓</p>}
                </Stop>
            ))}
        </section>
    );
}
