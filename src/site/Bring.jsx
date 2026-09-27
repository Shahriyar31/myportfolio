import SectionHead from "./SectionHead";
import { Fade } from "./Motion";
import Logo from "./Logo";
import { Icon } from "./Chrome";
import { scrollToId } from "./hooks";

/* What I bring, written for a hiring manager first and an engineer second */
const CARDS = [
    {
        icon: "agent", title: "AI engineering & agents",
        promise: "I build AI assistants and agents that do real work — answering from your documents, using tools, and handing over to a person when it matters.",
        gets: ["From idea to a working, deployed product", "Measured with evaluations, not guesswork"],
        tools: [["python", "Python"], ["langchain", "LangGraph"], ["rag", "RAG"], ["fastapi", "FastAPI"], ["vector", "pgvector"], ["azure", "Azure"]],
        proof: [["Nordex AI assistant", "work"], ["Argus AI", "built"]],
    },
    {
        icon: "eu", title: "AI governance & compliance",
        promise: "I make AI ready for regulation — sorting use cases by EU AI Act risk, mapping GDPR duties, and designing the governance process around them.",
        gets: ["Compliance built in, not bolted on", "Clear documentation auditors can follow"],
        tools: [["eu", "EU AI Act"], ["gdpr", "GDPR"], ["shield", "NIST AI RMF"], ["risk", "Risk classes"], ["lineage", "Traceability"]],
        proof: [["Governance lifecycle", "work"], ["Argus AI", "built"]],
    },
    {
        icon: "shield", title: "AI security",
        promise: "I test and harden AI systems against the known attacks — prompt injection, data leaks, unsafe tool use — and keep a tamper-proof log of what the AI did.",
        gets: ["Fewer surprises in production", "An audit trail for every decision"],
        tools: [["owasp", "OWASP LLM Top 10"], ["human", "Human-in-the-loop"], ["ledger", "Audit trails"], ["tool", "Guardrails"]],
        proof: [["Argus AI checks", "built"], ["This site's AI", "agent"]],
    },
    {
        icon: "databricks", title: "Data engineering & governance",
        promise: "I turn messy data into data you can trust — pipelines on Databricks and Spark, live streams with Kafka, and clear ownership and lineage.",
        gets: ["Reliable, analysis-ready data", "Know where every number came from"],
        tools: [["databricks", "Databricks"], ["spark", "Spark"], ["sql", "SQL"], ["kafka", "Kafka"], ["postgres", "PostgreSQL"], ["catalog", "Data catalogue"]],
        proof: [["Nordex data platform", "work"], ["Streaming projects", "built"]],
    },
];

const DELIVERY = [["docker", "Docker"], ["kubernetes", "Kubernetes"], ["terraform", "Terraform"], ["ghactions", "GitHub Actions"], ["azuredevops", "Azure DevOps"], ["aws", "AWS"], ["gcp", "Google Cloud"]];

export default function Bring() {
    return (
        <section id="bring" className="act wrap">
            <SectionHead n="01" kicker="What I bring" title="Four ways I can help your team" sub="From building AI agents to making sure they are compliant, secure and running on data you can trust." />
            <div className="bring">
                {CARDS.map((c, i) => (
                    <Fade key={c.title} delay={i * 90} className="bring-card neu-lg">
                        <div className="bring-top">
                            <span className="bring-ico neu-in"><Logo n={c.icon} size={26} /></span>
                            <h3>{c.title}</h3>
                        </div>
                        <p className="bring-promise">{c.promise}</p>
                        <ul className="bring-gets">{c.gets.map(g => <li key={g}><Icon n="arrow" size={13} />{g}</li>)}</ul>
                        <ul className="bring-tools" aria-label="Tools">
                            {c.tools.map(([logo, name]) => <li key={name} className="tool neu-sm"><Logo n={logo} size={16} /><span>{name}</span></li>)}
                        </ul>
                        <div className="bring-proof">
                            <span className="mono">Proven in</span>
                            {c.proof.map(([label, id]) => <button key={label} className="proof" onClick={() => scrollToId(id)}>{label} ↗</button>)}
                        </div>
                    </Fade>
                ))}
            </div>
            <Fade className="delivery neu">
                <span className="mono">And I ship it with</span>
                <ul>{DELIVERY.map(([logo, name]) => <li key={name} className="tool neu-sm"><Logo n={logo} size={16} /><span>{name}</span></li>)}</ul>
            </Fade>
        </section>
    );
}
