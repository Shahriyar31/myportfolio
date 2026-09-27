import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Lines } from "./Motion";
import Logo from "./Logo";
import { useInView, reducedMotion } from "./hooks";

/* [name, logo, where it was actually used] */
const ROWS = [
    ["Governance", [
        ["EU AI Act", "eu", "Argus AI · work"], ["GDPR", "gdpr", "Argus AI · work"], ["Data lineage", "lineage", "work"], ["Risk classification", "risk", "Argus AI"],
        ["Audit trails", "ledger", "Argus AI · this site"], ["Human-in-the-loop", "human", "Argus AI"], ["OWASP LLM Top 10", "owasp", "Argus AI"], ["NIST AI RMF", "shield", "Argus AI"],
    ]],
    ["Data platform", [
        ["Azure Databricks", "databricks", "work"], ["Apache Spark", "spark", "Databricks work"], ["SQL", "sql", "everywhere"], ["ETL pipelines", "etl", "StockFlow · work"],
        ["Apache Kafka", "kafka", "Radiation Tracker · StockFlow"], ["Apache Flink", "flink", "Radiation Tracker"], ["PostgreSQL", "postgres", "Argus AI"], ["MongoDB", "mongodb", "projects"], ["Pandas", "pandas", "Book Analysis · research"],
    ]],
    ["Agentic AI & ML", [
        ["LangGraph", "langchain", "Argus AI"], ["RAG", "rag", "Argus AI"], ["pgvector", "vector", "Argus AI"], ["Tool calling", "tool", "Argus AI · this site"],
        ["LLM evals", "eval", "Argus AI (RAGAS)"], ["FastAPI", "fastapi", "Argus AI"], ["TensorFlow", "tensorflow", "Poultry Shield"], ["Scikit-learn", "sklearn", "Digital Twin"], ["MLflow", "mlflow", "MLOps projects"],
    ]],
    ["Ship it", [
        ["Python", "python", "everything"], ["Docker", "docker", "every project"], ["Kubernetes", "kubernetes", "Argus AI"], ["Terraform", "terraform", "Argus AI"], ["Azure", "azure", "work · Argus AI"],
        ["AWS", "aws", "Poultry Shield · StockFlow"], ["GCP", "gcp", "Radiation Tracker"], ["GitHub Actions", "ghactions", "Digital Twin · Argus AI"], ["Azure DevOps", "azuredevops", "work"], ["Flask", "flask", "Poultry Shield"], ["Bash", "bash", "daily"],
    ]],
];

/* Real stacks, wired in the order data flows through them */
const STACKS = [
    { id: "agent", name: "Governed AI agent", from: "Argus AI", keys: ["Python", "LangGraph", "RAG", "pgvector", "FastAPI", "Risk classification", "EU AI Act", "Human-in-the-loop", "Audit trails", "Docker", "Terraform", "Azure"] },
    { id: "lake", name: "Lakehouse pipeline", from: "data platform work", keys: ["Python", "Apache Spark", "Azure Databricks", "SQL", "ETL pipelines", "Data lineage", "Azure DevOps"] },
    { id: "stream", name: "Real-time streaming", from: "Radiation Tracker", keys: ["Apache Kafka", "Apache Flink", "Python", "Docker", "GCP"] },
    { id: "ml", name: "Model to production", from: "Poultry Shield", keys: ["Python", "TensorFlow", "Flask", "Docker", "AWS"] },
];

export default function Toolkit() {
    const all = useMemo(() => ROWS.flatMap(([, keys]) => keys), []);
    const [stack, setStack] = useState(null);     // active stack id
    const [shown, setShown] = useState(0);        // how many of its keys are wired so far
    const [down, setDown] = useState(null);       // letter typed
    const [hover, setHover] = useState(null);
    const [auto, setAuto] = useState(true);       // auto-tour until the visitor takes over
    const [path, setPath] = useState("");
    const boardRef = useRef(null);
    const keyRefs = useRef({});
    const [sectionRef, inView] = useInView({ threshold: 0.3 });

    const active = STACKS.find(s => s.id === stack);
    const order = active ? active.keys : [];
    const matches = down ? all.filter(([k]) => k.toLowerCase().startsWith(down)) : [];
    const takeOver = () => setAuto(false);

    // Wire the active stack key by key
    useEffect(() => {
        if (!active) return;
        setShown(0);
        let i = 0;
        const id = setInterval(() => { i++; setShown(i); if (i >= active.keys.length) clearInterval(id); }, reducedMotion() ? 0 : 170);
        return () => clearInterval(id);
    }, [stack]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-tour through the stacks while nobody is interacting
    useEffect(() => {
        if (!inView || !auto) return;
        if (!stack) { setStack(STACKS[0].id); return; }
        const t = setTimeout(() => {
            const i = STACKS.findIndex(s => s.id === stack);
            setStack(STACKS[(i + 1) % STACKS.length].id);
        }, 6500);
        return () => clearTimeout(t);
    }, [inView, auto, stack]);

    // Build the wire through the centres of the wired keys
    const measure = useCallback(() => {
        const board = boardRef.current;
        if (!board || !active) { setPath(""); return; }
        const b = board.getBoundingClientRect();
        const pts = active.keys.slice(0, shown).map(k => {
            const r = keyRefs.current[k]?.getBoundingClientRect();
            return r ? [r.left - b.left + 24, r.top - b.top + r.height / 2] : null;
        }).filter(Boolean);
        if (pts.length < 2) { setPath(""); return; }
        let d = `M${pts[0][0]} ${pts[0][1]}`;
        for (let i = 1; i < pts.length; i++) {
            const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
            const lift = Math.abs(y1 - y0) < 4 ? -30 : 0; // arc over keys on the same row
            d += ` C ${x0 + (x1 - x0) * 0.35} ${y0 + lift}, ${x0 + (x1 - x0) * 0.65} ${y1 + lift}, ${x1} ${y1}`;
        }
        setPath(d);
    }, [active, shown]);
    useLayoutEffect(() => { measure(); }, [measure]);
    useEffect(() => { window.addEventListener("resize", measure); return () => window.removeEventListener("resize", measure); }, [measure]);

    // Typing presses every skill that starts with that letter
    useEffect(() => {
        let t;
        const onKey = e => {
            if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
            if (/^(input|textarea|select)$/i.test(document.activeElement?.tagName)) return;
            const k = e.key.toLowerCase();
            if (!/^[a-z]$/.test(k)) return;
            const sec = sectionRef.current?.getBoundingClientRect();
            if (!sec || sec.bottom < 0 || sec.top > innerHeight) return;
            setAuto(false); setStack(null); setDown(k);
            clearTimeout(t); t = setTimeout(() => setDown(null), 1200);
        };
        window.addEventListener("keydown", onKey);
        return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); };
    }, [sectionRef]);

    const screen = hover
        ? <><b>{hover[0]}</b> — used in {hover[2]}</>
        : down
            ? <><b>{down.toUpperCase()}</b> → {matches.length ? matches.map(m => m[0]).join(", ") : "nothing yet — try P, A or L"}</>
            : active
                ? <><b>{active.name}</b> — {active.keys.slice(0, shown).join(" → ")}</>
                : <>Pick a stack, or type any letter…</>;

    return (
        <section id="toolkit" className="act wrap" ref={sectionRef}>
            <header className="act-head">
                <span className="act-no neu mono">06</span>
                <div className="act-kicker"><span className="mono">Toolkit</span></div>
                <h2 className="act-title"><Lines lines={["Tools are easy to list.", <span className="accent" key="a">Here's how they connect.</span>]} /></h2>
                <p className="act-lede">Pick a stack I've actually shipped and watch it wire itself together — or type any letter on your keyboard. Hover a key to see where I used it.</p>
            </header>

            <div className="stacks" role="tablist" aria-label="Stacks I've shipped">
                {STACKS.map(s => (
                    <button key={s.id} role="tab" aria-selected={stack === s.id} className={`stack-btn neu-sm ${stack === s.id ? "is-on" : ""}`} onClick={() => { takeOver(); setDown(null); setStack(stack === s.id ? null : s.id); }}>
                        <b>{s.name}</b><span className="mono">{s.from} · {s.keys.length} tools</span>
                        {stack === s.id && auto && <i className="stack-timer" />}
                    </button>
                ))}
            </div>

            <div className={`kb neu-lg ${active || down ? "is-focused" : ""}`} ref={boardRef}>
                <div className="kb-top">
                    <span className="kb-led" aria-hidden="true" />
                    <span className="kb-screen neu-in-sm mono" aria-live="polite">{screen}</span>
                    <span className="mono">{all.length} keys</span>
                </div>
                <svg className="wire" aria-hidden="true">
                    {path && <><path d={path} className="wire-glow" /><path d={path} className="wire-line" /></>}
                </svg>
                {ROWS.map(([row, keys]) => (
                    <div key={row} className="kb-row">
                        <span className="kb-label mono">{row}</span>
                        <div className="kb-keys">
                            {keys.map(key => {
                                const [k, logo] = key;
                                const idx = order.indexOf(k);
                                const wired = idx >= 0 && idx < shown;
                                const typed = down && k.toLowerCase().startsWith(down);
                                const dim = (active && idx < 0) || (down && !typed);
                                return (
                                    <button
                                        key={k}
                                        ref={el => { keyRefs.current[k] = el; }}
                                        className={`cap ${wired ? "is-wired" : ""} ${typed ? "is-down" : ""} ${dim ? "is-dim" : ""}`}
                                        onPointerEnter={() => setHover(key)}
                                        onPointerLeave={() => setHover(null)}
                                        onFocus={() => setHover(key)}
                                        onBlur={() => setHover(null)}
                                        onClick={() => { takeOver(); setHover(key); }}
                                        aria-label={`${k}: used in ${key[2]}`}
                                    >
                                        <span className="cap-logo"><Logo n={logo} size={20} /></span>
                                        <span className="cap-name">{k}</span>
                                        <span className="cap-legend mono">{k[0]}</span>
                                        {wired && <span className="cap-order mono">{idx + 1}</span>}
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
