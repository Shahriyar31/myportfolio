import { useEffect, useMemo, useState } from "react";
import SectionHead from "./SectionHead";
import Logo from "./Logo";

/* [name, logo, where I used it] */
const GROUPS = [
    ["AI & agents", "agent", [
        ["LangGraph", "langchain", "Argus AI"], ["RAG", "rag", "Nordex · Argus AI"], ["pgvector", "vector", "Argus AI"], ["Tool calling", "tool", "Nordex · Argus AI"],
        ["LLM evaluation", "eval", "Nordex · Argus AI"], ["FastAPI", "fastapi", "Argus AI"], ["TensorFlow", "tensorflow", "Poultry Shield"], ["Scikit-learn", "sklearn", "Digital Twin"], ["MLflow", "mlflow", "MLOps projects"],
    ]],
    ["Governance & security", "shield", [
        ["EU AI Act", "eu", "Nordex · Argus AI"], ["GDPR", "gdpr", "Nordex · Argus AI"], ["Data governance", "lineage", "Nordex"], ["Risk classification", "risk", "Nordex · Argus AI"],
        ["Audit trails", "ledger", "Argus AI · this site"], ["Human-in-the-loop", "human", "Argus AI"], ["OWASP LLM Top 10", "owasp", "Argus AI"], ["NIST AI RMF", "shield", "Argus AI"],
    ]],
    ["Data engineering", "databricks", [
        ["Azure Databricks", "databricks", "Nordex"], ["Apache Spark", "spark", "Nordex"], ["SQL", "sql", "Everywhere"], ["ETL pipelines", "etl", "Nordex · StockFlow"],
        ["Apache Kafka", "kafka", "Radiation Tracker · StockFlow"], ["Apache Flink", "flink", "Radiation Tracker"], ["PostgreSQL", "postgres", "Argus AI"], ["MongoDB", "mongodb", "Projects"], ["Pandas", "pandas", "Research · projects"],
    ]],
    ["Cloud & delivery", "docker", [
        ["Python", "python", "Everything"], ["Docker", "docker", "Every project"], ["Kubernetes", "kubernetes", "Argus AI"], ["Terraform", "terraform", "Argus AI"], ["Microsoft Azure", "azure", "Nordex · Argus AI"],
        ["AWS", "aws", "Poultry Shield · StockFlow"], ["Google Cloud", "gcp", "Radiation Tracker"], ["GitHub Actions", "ghactions", "Digital Twin · Argus AI"], ["Azure DevOps", "azuredevops", "Nordex"], ["Flask", "flask", "Poultry Shield"],
    ]],
];

export default function Skills() {
    const [tab, setTab] = useState("All");
    const [letter, setLetter] = useState(null);
    const all = useMemo(() => GROUPS.flatMap(([g, , items]) => items.map(i => [...i, g])), []);
    const shown = tab === "All" ? all : all.filter(s => s[3] === tab);

    // Type a letter to find tools starting with it
    useEffect(() => {
        let t;
        const on = e => {
            if (e.metaKey || e.ctrlKey || e.altKey || /^(input|textarea)$/i.test(document.activeElement?.tagName)) return;
            if (!/^[a-z]$/i.test(e.key)) return;
            const r = document.getElementById("skills")?.getBoundingClientRect();
            if (!r || r.bottom < 0 || r.top > innerHeight) return;
            setLetter(e.key.toLowerCase());
            clearTimeout(t); t = setTimeout(() => setLetter(null), 1400);
        };
        window.addEventListener("keydown", on);
        return () => { window.removeEventListener("keydown", on); clearTimeout(t); };
    }, []);

    return (
        <section id="skills" className="act wrap">
            <SectionHead n="04" kicker="Skills" title="My toolkit" sub="Grouped by what they're for — each one shows where I've actually used it. Tip: type any letter to find a tool." />
            <div className="sk-tabs" role="tablist">
                {["All", ...GROUPS.map(g => g[0])].map(g => {
                    const icon = GROUPS.find(x => x[0] === g)?.[1];
                    const count = g === "All" ? all.length : all.filter(s => s[3] === g).length;
                    return (
                        <button key={g} role="tab" aria-selected={tab === g} className={`key key-sm ${tab === g ? "is-down" : ""}`} onClick={() => setTab(g)}>
                            {icon && <Logo n={icon} size={15} />}{g}<span className="mono">{count}</span>
                        </button>
                    );
                })}
            </div>
            <ul className="sk-grid" key={tab}>
                {shown.map(([name, logo, where], i) => {
                    const hit = letter && name.toLowerCase().startsWith(letter);
                    return (
                        <li key={name} className={`sk neu-sm ${hit ? "is-hit" : ""} ${letter && !hit ? "is-dim" : ""}`} style={{ "--k": i }}>
                            <span className="sk-ico neu-in-sm"><Logo n={logo} size={24} /></span>
                            <span className="sk-txt"><b>{name}</b><span>{where}</span></span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
