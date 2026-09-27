import { useEffect, useMemo, useState } from "react";
import { Lines } from "./Motion";

/* Every key says where the skill was actually used. */
const ROWS = [
    ["Governance", [
        ["EU AI Act", "Argus AI · work"], ["GDPR", "Argus AI · work"], ["Microsoft Purview", "Nordex"], ["Data lineage", "Nordex"],
        ["Risk classification", "Argus AI"], ["Audit trails", "Argus AI · this site"], ["OWASP LLM Top 10", "Argus AI"], ["NIST AI RMF", "Argus AI"],
    ]],
    ["Data platform", [
        ["Azure Databricks", "Nordex"], ["Apache Spark", "Databricks work"], ["SQL", "everywhere"], ["Apache Kafka", "Radiation Tracker · StockFlow"],
        ["Apache Flink", "Radiation Tracker"], ["ETL pipelines", "StockFlow · Nordex"], ["PostgreSQL", "Argus AI"], ["MongoDB", "projects"],
    ]],
    ["Agentic AI", [
        ["LangGraph", "Argus AI"], ["RAG", "Argus AI"], ["pgvector", "Argus AI"], ["Tool calling", "Argus AI · this site"],
        ["Human-in-the-loop", "Argus AI"], ["LLM evals · RAGAS", "Argus AI"], ["FastAPI", "Argus AI"], ["TensorFlow", "Poultry Shield"], ["Scikit-learn", "Digital Twin"], ["MLflow", "MLOps projects"],
    ]],
    ["Ship it", [
        ["Python", "everything"], ["Docker", "every project"], ["Kubernetes", "Argus AI · k8s manifests"], ["Terraform", "Argus AI"],
        ["Azure", "Nordex · Argus AI"], ["AWS", "Poultry Shield · StockFlow"], ["GCP", "Radiation Tracker"], ["GitHub Actions", "Digital Twin · Argus AI"], ["Azure DevOps", "Nordex"], ["Bash", "daily"],
    ]],
];

export default function Toolkit() {
    const [down, setDown] = useState(null); // letter currently pressed
    const [hover, setHover] = useState(null);
    const all = useMemo(() => ROWS.flatMap(([, keys]) => keys), []);
    const matches = down ? all.filter(([k]) => k.toLowerCase().startsWith(down)) : [];

    useEffect(() => {
        let t;
        const onKey = e => {
            if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
            if (/^(input|textarea|select)$/i.test(document.activeElement?.tagName)) return;
            const k = e.key.toLowerCase();
            if (!/^[a-z]$/.test(k)) return;
            const sec = document.getElementById("toolkit")?.getBoundingClientRect();
            if (!sec || sec.bottom < 0 || sec.top > innerHeight) return; // only while the keyboard is on screen
            setDown(k);
            clearTimeout(t);
            t = setTimeout(() => setDown(null), 900);
        };
        window.addEventListener("keydown", onKey);
        return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); };
    }, []);

    const info = hover;

    return (
        <section id="toolkit" className="act wrap">
            <header className="act-head">
                <span className="act-no neu mono">05</span>
                <div className="act-kicker"><span className="mono">Toolkit</span><span className="bn">যন্ত্র</span></div>
                <h2 className="act-title"><Lines lines={["Type on your keyboard.", <span className="accent" key="a">Watch my stack respond.</span>]} /></h2>
                <p className="act-lede">Press any letter — every skill starting with it presses down. Hover a key to see where I've actually used it.</p>
            </header>

            <div className="kb neu-lg">
                <div className="kb-top">
                    <span className="kb-led" aria-hidden="true" />
                    <span className="kb-screen neu-in-sm mono" aria-live="polite">
                        {info ? <><b>{info[0]}</b> — used in {info[1]}</>
                            : down ? <><b>{down.toUpperCase()}</b> → {matches.length ? matches.map(m => m[0]).join(", ") : "nothing yet — try P, A or L"}</>
                                : <>Ready. Try <b>P</b>, <b>A</b> or <b>L</b>…</>}
                    </span>
                    <span className="mono">{all.length} keys</span>
                </div>
                {ROWS.map(([row, keys]) => (
                    <div key={row} className="kb-row">
                        <span className="kb-label mono">{row}</span>
                        <div className="kb-keys">
                            {keys.map(([k, where]) => {
                                const on = down && k.toLowerCase().startsWith(down);
                                return (
                                    <button
                                        key={k}
                                        className={`cap ${on ? "is-down" : ""}`}
                                        onPointerEnter={() => setHover([k, where])}
                                        onPointerLeave={() => setHover(null)}
                                        onFocus={() => setHover([k, where])}
                                        onClick={() => setHover([k, where])}
                                        onBlur={() => setHover(null)}
                                        aria-label={`${k}: used in ${where}`}
                                    >
                                        <span className="cap-legend mono">{k[0]}</span>
                                        {k}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
