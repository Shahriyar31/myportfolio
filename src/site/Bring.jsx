import { Fade } from "./Motion";
import { WaveTitle } from "./SectionHead";
import Logo from "./Logo";
import { Icon } from "./Chrome";
import { scrollToId } from "./hooks";

/* What I bring — one capability per screen; the particles form its symbol */
const SCENES = [
    {
        shape: "network", n: "01", kicker: "AI engineering & agents", title: "AI that does real work",
        promise: "I build AI assistants and agents that answer from your documents, use tools, and hand over to a person when it matters.",
        gets: ["From idea to a deployed product", "Measured with evaluations, not guesswork"],
        tools: [["python", "Python"], ["langchain", "LangGraph"], ["rag", "RAG"], ["fastapi", "FastAPI"], ["azure", "Azure"]],
        proof: [["Nordex AI assistant", "work"], ["Argus AI", "built"]],
    },
    {
        shape: "eu", n: "02", kicker: "AI governance & compliance", title: "Ready for regulation",
        promise: "I sort AI use cases by EU AI Act risk, map their GDPR duties, and design the governance process around them.",
        gets: ["Compliance built in, not bolted on", "Documentation an auditor can follow"],
        tools: [["eu", "EU AI Act"], ["gdpr", "GDPR"], ["shield", "NIST AI RMF"], ["risk", "Risk classes"]],
        proof: [["Governance lifecycle", "work"], ["Argus AI", "built"]],
    },
    {
        shape: "lock", n: "03", kicker: "AI security", title: "Hard to trick",
        promise: "I test and harden AI against the known attacks — prompt injection, data leaks, unsafe tool use — and log everything it does.",
        gets: ["Fewer surprises in production", "An audit trail for every decision"],
        tools: [["owasp", "OWASP LLM Top 10"], ["human", "Human-in-the-loop"], ["ledger", "Audit trails"]],
        proof: [["Play the game ↓", "game"], ["Argus AI", "built"]],
    },
    {
        shape: "data", n: "04", kicker: "Data engineering & governance", title: "Data you can trust",
        promise: "I turn messy data into reliable, well-owned data — pipelines on Databricks and Spark, streams with Kafka, clear lineage.",
        gets: ["Analysis-ready data", "Know where every number came from"],
        tools: [["databricks", "Databricks"], ["spark", "Spark"], ["sql", "SQL"], ["kafka", "Kafka"]],
        proof: [["Nordex data platform", "work"], ["Streaming projects", "built"]],
    },
];

export default function Bring() {
    return (
        <section id="bring" className="bring2" aria-label="What I bring">
            <header className="bring2-intro wrap" data-shape="ambient" data-side="center" data-dim="0.55">
                <span className="head-kicker"><span className="head-n neu-sm mono">01</span><span className="mono">What I bring</span><span className="head-rule" /></span>
                <WaveTitle text="Four ways I can help your team" />
                <p className="head-sub">Scroll — each one takes shape.</p>
            </header>
            {SCENES.map(s => (
                <article key={s.n} className="scene wrap" data-shape={s.shape} data-side="right">
                    <div className="scene-copy">
                        <Fade className="scene-kicker"><span className="scene-n">{s.n}</span><span className="mono">{s.kicker}</span></Fade>
                        <Fade delay={80}><h3 className="scene-title">{s.title}</h3></Fade>
                        <Fade delay={160}><p className="scene-promise">{s.promise}</p></Fade>
                        <Fade delay={240} as="ul" className="scene-gets">{s.gets.map(g => <li key={g}><Icon n="arrow" size={14} />{g}</li>)}</Fade>
                        <Fade delay={320} as="ul" className="scene-tools">{s.tools.map(([l, n]) => <li key={n} className="tool neu-sm"><Logo n={l} size={16} /><span>{n}</span></li>)}</Fade>
                        <Fade delay={400} className="scene-proof"><span className="mono">Proven in</span>{s.proof.map(([t, id]) => <button key={t} className="proof" onClick={() => scrollToId(id)}>{t}</button>)}</Fade>
                    </div>
                </article>
            ))}
        </section>
    );
}
