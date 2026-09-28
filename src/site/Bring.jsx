import Stop, { Opener } from "./Stop";
import Logo from "./Logo";
import { Icon } from "./Chrome";
import { scrollToId } from "./hooks";

/* What I bring — the camera visits the matching place in the data valley */
const STOPS = [
    {
        station: "tower", n: "01", kicker: "AI engineering & agents", where: "The AI tower", title: "AI that does real work",
        promise: "I build AI assistants and agents that answer from your documents, use tools, and hand over to a person when it matters.",
        gets: ["From idea to a deployed product", "Measured with evaluations, not guesswork"],
        tools: [["python", "Python"], ["langchain", "LangGraph"], ["rag", "RAG"], ["fastapi", "FastAPI"], ["azure", "Azure"]],
        proof: [["Nordex AI assistant", "work"], ["Argus AI", "built"]],
    },
    {
        station: "gate", n: "02", kicker: "AI governance & compliance", where: "The governance gate", title: "Ready for regulation",
        promise: "Every flow passes a gate: I sort AI use cases by EU AI Act risk, map GDPR duties, and design the governance process around them.",
        gets: ["Compliance built in, not bolted on", "Documentation an auditor can follow"],
        tools: [["eu", "EU AI Act"], ["gdpr", "GDPR"], ["shield", "NIST AI RMF"], ["risk", "Risk classes"]],
        proof: [["Governance lifecycle", "work"], ["Argus AI", "built"]],
    },
    {
        station: "security", n: "03", kicker: "AI security", where: "Watch the red packets", title: "Hard to trick",
        promise: "Red packets are attacks from outside — prompt injection, data theft, jailbreaks. The gate stops them. That's what I build: guardrails, least privilege, and an audit log.",
        gets: ["Fewer surprises in production", "An audit trail for every decision"],
        tools: [["owasp", "OWASP LLM Top 10"], ["human", "Human-in-the-loop"], ["ledger", "Audit trails"]],
        proof: [["Play the game ↓", "game"], ["Argus AI", "built"]],
    },
    {
        station: "lake", n: "04", kicker: "Data engineering & governance", where: "The data lake", title: "Data you can trust",
        promise: "Raw data from turbines, solar fields and factories flows into a lake that refines it — bronze, silver, gold — on Databricks and Spark, with clear ownership and lineage.",
        gets: ["Analysis-ready data", "Know where every number came from"],
        tools: [["databricks", "Databricks"], ["spark", "Spark"], ["sql", "SQL"], ["kafka", "Kafka"]],
        proof: [["Nordex data platform", "work"], ["Streaming projects", "built"]],
    },
];

export default function Bring() {
    return (
        <section id="bring" aria-label="What I bring">
            <Opener station="overview" n="01" kicker="What I bring" title="Welcome to the valley where data becomes trustworthy AI"
                sub="Raw data flows in from the hills, is refined in the lake, checked at the gate, and powers the AI tower. Each stop is something I do." />
            {STOPS.map((s, i) => (
                <Stop key={s.n} station={s.station} side={i % 2 ? "right" : "left"}>
                    <div className="pane-kicker"><span className="scene-n">{s.n}</span><span className="mono">{s.kicker}</span><span className="pane-where mono">📍 {s.where}</span></div>
                    <h3 className="pane-title">{s.title}</h3>
                    <p className="pane-lede">{s.promise}</p>
                    <ul className="scene-gets">{s.gets.map(g => <li key={g}><Icon n="arrow" size={14} />{g}</li>)}</ul>
                    <ul className="scene-tools">{s.tools.map(([l, n]) => <li key={n} className="tool neu-sm"><Logo n={l} size={16} /><span>{n}</span></li>)}</ul>
                    <div className="scene-proof"><span className="mono">Proven in</span>{s.proof.map(([t, id]) => <button key={t} className="proof" onClick={() => scrollToId(id)}>{t}</button>)}</div>
                </Stop>
            ))}
        </section>
    );
}
