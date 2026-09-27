import SectionHead from "./SectionHead";
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

/* Generative cover so every card has its own mark without stock art */
function Cover({ seed }) {
    const rnd = (k => () => ((k = (k * 16807) % 2147483647) / 2147483647))(seed * 7919 + 13);
    const kind = seed % 3, paths = [];
    if (kind === 0) for (let i = 0; i < 14; i++) { const y = 12 + i * 9, a = 5 + rnd() * 12, f = 0.02 + rnd() * 0.03; let d = `M0 ${y}`; for (let x = 0; x <= 240; x += 8) d += ` L${x} ${(y + Math.sin(x * f + i) * a).toFixed(1)}`; paths.push([d, i === 7]); }
    else if (kind === 1) for (let r = 8; r < 150; r += 10) paths.push([`M${120 + r} 70 A${r} ${r} 0 1 0 ${120 - r} 70 A${r} ${r} 0 1 0 ${120 + r} 70`, r === 48]);
    else for (let i = 0; i < 26; i++) { const x = 10 + i * 8.8, h = 12 + Math.abs(Math.sin(i * 0.5 + rnd())) * 90 * (0.4 + rnd() * 0.6); paths.push([`M${x} 130 L${x} ${130 - h}`, i === 17]); }
    return (
        <svg viewBox="0 0 240 140" className="cover" aria-hidden="true">
            {paths.map(([d, hot], i) => <path key={i} d={d} fill="none" stroke={hot ? "var(--accent)" : "var(--fg)"} strokeOpacity={hot ? 1 : 0.22} strokeWidth={hot ? 2 : 1} />)}
        </svg>
    );
}

function TiltCard({ p }) {
    const ref = useRef(null);
    const move = e => {
        if (!finePointer()) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        ref.current.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
        ref.current.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
        ref.current.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
        ref.current.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
    };
    const leave = () => { ref.current.style.setProperty("--rx", "0deg"); ref.current.style.setProperty("--ry", "0deg"); };
    const Tag = p.link ? "a" : "div";
    return (
        <Tag ref={ref} className="proj neu" href={p.link || undefined} target={p.link ? "_blank" : undefined} rel="noreferrer" onPointerMove={move} onPointerLeave={leave}>
            <div className="proj-cover neu-in-sm"><Cover seed={p.id} /><span className="chip mono">{p.badge}</span></div>
            <div className="proj-body">
                <span className="mono">{p.sub}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <ul>{p.tags.slice(0, 4).map(t => <li key={t} className="mono">{t}</li>)}</ul>
            </div>
            {p.link && <span className="proj-go neu-sm" aria-hidden="true"><Icon n="arrow" size={16} /></span>}
        </Tag>
    );
}

export default function Built() {
    const others = PROJECTS.filter(p => p.title !== "Argus AI");
    return (
        <section id="built" className="act wrap">
            <SectionHead n="05" kicker="Projects" title="Things I've built" sub="A live AI compliance platform and hands-on data and ML projects. Try the classifier below." />

            <article className="argus neu-lg">
                <div className="argus-text">
                    <span className="chip mono"><span className="dot-live" />Live · free beta</span>
                    <h3 className="argus-title">Argus AI</h3>
                    <p className="argus-sub">EU AI Act compliance, as an agent.</p>
                    <p className="argus-body">
                        A LangGraph agent classifies AI systems into EU AI Act risk tiers with article-level justification, drafts GDPR DPIAs, checks OWASP LLM Top 10 risks and pauses for a human on high-risk cases. RAG over the regulation in pgvector, a SHA-256 hash-chained audit trail, and regulatory-change monitoring.
                    </p>
                    <ul className="argus-stack">{["LangGraph", "FastAPI", "pgvector", "RAGAS", "Terraform", "Azure Container Apps", "GitHub Actions"].map(t => <li key={t} className="neu-in-sm mono">{t}</li>)}</ul>
                    <div className="argus-ctas">
                        <a className="key key-accent" href="https://eu-ai-act-governance-platform.vercel.app" target="_blank" rel="noreferrer">Visit Argus AI<Icon n="arrow" size={16} /></a>
                    </div>
                </div>
                <div className="argus-demo">
                    <span className="mono">Try it — how would the EU AI Act classify…</span>
                    <Classifier />
                </div>
            </article>

            <div className="projs">{others.map(p => <TiltCard key={p.id} p={p} />)}</div>
        </section>
    );
}
