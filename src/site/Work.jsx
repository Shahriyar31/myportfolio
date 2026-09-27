import { useEffect, useRef } from "react";
import { Lines } from "./Motion";

/* ── Animated diagrams (pure SVG + CSS; colours follow the theme) ── */

function Lineage() {
    const nodes = [["orders.raw", 30, 40], ["orders.clean", 190, 40], ["kpi.gold", 350, 40], ["Report", 350, 140], ["Model", 190, 140]];
    return (
        <svg viewBox="0 0 460 200" className="dia">
            {[[0, 1], [1, 2], [2, 3], [1, 4]].map(([a, b], i) => {
                const [, x1, y1] = nodes[a], [, x2, y2] = nodes[b];
                return <path key={i} className="dia-flow" d={`M${x1 + 70} ${y1 + 16} C ${x1 + 110} ${y1 + 16}, ${x2 - 40} ${y2 + 16}, ${x2} ${y2 + 16}`} style={{ animationDelay: `${i * 0.3}s` }} />;
            })}
            {nodes.map(([t, x, y], i) => (
                <g key={t} className="dia-node" style={{ animationDelay: `${i * 0.25}s` }}>
                    <rect x={x} y={y} width="96" height="32" rx="10" />
                    <text x={x + 48} y={y + 20}>{t}</text>
                </g>
            ))}
            {[["PII", 32, 86], ["Confidential", 192, 86], ["Owner ✓", 352, 86]].map(([t, x, y], i) => (
                <g key={t} className="dia-tag" style={{ animationDelay: `${1 + i * 0.6}s` }}>
                    <rect x={x} y={y} width={t.length * 7 + 18} height="20" rx="10" />
                    <text x={x + 9} y={y + 14}>{t}</text>
                </g>
            ))}
            <rect className="dia-scan" x="20" y="28" width="3" height="152" rx="2" />
        </svg>
    );
}

function Medallion() {
    const lanes = [["Bronze", 150, "#b4804f"], ["Silver", 95, "#bcc5cf"], ["Gold", 40, "#e0b84e"]];
    return (
        <svg viewBox="0 0 460 200" className="dia">
            {lanes.map(([t, y, c]) => (
                <g key={t}>
                    <rect className="dia-lane" x="84" y={y} width="340" height="30" rx="15" />
                    <text className="dia-lbl" x="18" y={y + 20}>{t}</text>
                    <circle cx="70" cy={y + 15} r="6" fill={c} />
                </g>
            ))}
            {Array.from({ length: 9 }, (_, i) => (
                <circle key={i} className="dia-particle" r="4" style={{ offsetPath: `path("M 90 ${165} L 200 ${165} C 240 165, 230 110, 270 110 L 320 110 C 360 110, 350 55, 390 55 L 420 55")`, animationDelay: `${i * 0.45}s` }} />
            ))}
            <g className="dia-badge"><rect x="300" y="4" width="126" height="24" rx="12" /><text x="363" y="20">job succeeded ✓</text></g>
        </svg>
    );
}

function Topology() {
    const boxes = [["Databricks", 60, 50], ["ADLS storage", 200, 50], ["Key Vault", 60, 110], ["Purview", 200, 110]];
    return (
        <svg viewBox="0 0 460 200" className="dia">
            <rect className="dia-group" x="40" y="24" width="300" height="130" rx="18" />
            <text className="dia-lbl" x="56" y="42">resource group</text>
            {boxes.map(([t, x, y], i) => (
                <g key={t} className="dia-node" style={{ animationDelay: `${i * 0.2}s` }}>
                    <rect x={x} y={y} width="118" height="38" rx="10" />
                    <text x={x + 59} y={y + 23}>{t}</text>
                </g>
            ))}
            <path className="dia-flow" d="M178 69 L200 69" /><path className="dia-flow" d="M119 88 L119 110" /><path className="dia-flow" d="M259 88 L259 110" />
            <g className="dia-cicd">
                {["build", "test", "deploy"].map((s, i) => (
                    <g key={s} style={{ animationDelay: `${i * 0.8}s` }}>
                        <rect x={360} y={40 + i * 40} width="80" height="28" rx="14" />
                        <text x={400} y={58 + i * 40}>{s}</text>
                    </g>
                ))}
            </g>
            <text className="dia-lbl" x="360" y="30">Azure DevOps</text>
        </svg>
    );
}

function RagLoop() {
    const steps = [["query", 30], ["retrieve", 130], ["generate", 230], ["evaluate", 330]];
    return (
        <svg viewBox="0 0 460 200" className="dia">
            <path className="dia-flow" d="M70 80 L150 80 M170 80 L250 80 M270 80 L350 80" />
            <path className="dia-flow back" d="M370 100 C 370 170, 70 170, 70 100" />
            {steps.map(([t, x], i) => (
                <g key={t} className="dia-node pulse" style={{ animationDelay: `${i * 0.6}s` }}>
                    <circle cx={x + 40} cy="80" r="26" />
                    <text x={x + 40} y="84">{t}</text>
                </g>
            ))}
            {[0, 1, 2, 3, 4].map(i => <rect key={i} className="dia-bar" x={150 + i * 34} y="150" width="24" height="18" rx="5" style={{ animationDelay: `${i * 0.25}s` }} />)}
            <text className="dia-lbl" x="18" y="163">eval</text>
        </svg>
    );
}

function Pillars() {
    const p = [["Governance", 80], ["Data platform", 230], ["Applied AI", 380]];
    return (
        <svg viewBox="0 0 460 200" className="dia">
            {p.map(([, x], i) => <path key={i} className="dia-flow" d={`M${x} 92 C ${x} 134, 230 114, 230 150`} style={{ animationDelay: `${i * 0.4}s` }} />)}
            {p.map(([t, x], i) => (
                <g key={t} className="dia-node pulse" style={{ animationDelay: `${i * 0.5}s` }}>
                    <text x={x} y="20">{t}</text><circle cx={x} cy="62" r="26" />
                </g>
            ))}
            <g className="dia-badge"><rect x="160" y="150" width="140" height="30" rx="15" /><text x="230" y="170">in production</text></g>
        </svg>
    );
}

function Series() {
    const pts = Array.from({ length: 40 }, (_, i) => [20 + i * 10.5, 110 + Math.sin(i * 0.55) * 26 + Math.cos(i * 1.7) * 8]);
    pts[27][1] = 36; pts[12][1] = 176;
    return (
        <svg viewBox="0 0 460 200" className="dia">
            <path className="dia-line" d={"M" + pts.map(p => p.join(" ")).join(" L")} />
            {[12, 27].map(i => <circle key={i} className="dia-anom" cx={pts[i][0]} cy={pts[i][1]} r="9" />)}
            <text className="dia-lbl" x="20" y="24">anomaly detection · forecasting</text>
        </svg>
    );
}

const CARDS = [
    {
        kicker: "Aug 2025 — now · Hamburg", co: "Nordex Group", role: "Working Student — Enterprise Data Management & AI Engineering",
        body: "Part of the enterprise data team, working where data governance, the Azure data platform and applied AI meet.",
        tags: ["Azure Databricks", "Microsoft Purview", "Azure DevOps", "Spark", "Python", "SQL", "EU AI Act", "GDPR"], dia: null, intro: true,
    },
    { n: "01", title: "AI & data governance", body: "Cataloguing and classifying data with Microsoft Purview, tracing lineage, and helping map AI use cases to their EU AI Act and GDPR obligations.", Dia: Lineage },
    { n: "02", title: "Databricks pipelines", body: "Building and maintaining data pipelines and analytics workflows on Azure Databricks — from raw ingestion to business-ready tables.", Dia: Medallion },
    { n: "03", title: "Azure platform & DevOps", body: "Working with the Azure services and DevOps practices the data and AI platform runs on — workspaces, storage, secrets and CI/CD.", Dia: Topology },
    { n: "04", title: "Applied AI", body: "Supporting AI model development and deployment with the data engineering team, including LLM and retrieval prototypes and how they're evaluated.", Dia: RagLoop },
    {
        kicker: "Mar 2025 — now · TUHH", co: "Research project", role: "Digital Twin Dashboard & MLOps",
        body: "A monitoring dashboard for a digital-twin simulation with anomaly detection and time-series forecasting, tested and shipped through GitHub Actions in Docker.",
        tags: ["Python", "Dash", "Plotly", "Scikit-learn", "Docker", "GitHub Actions"], Dia: Series, research: true,
    },
];

export default function Work() {
    const listRef = useRef(null);

    // As each card slides over the previous one, the one underneath recedes
    useEffect(() => {
        let raf = 0;
        const update = () => {
            const cards = [...listRef.current.children];
            cards.forEach((c, i) => {
                const next = cards[i + 1];
                if (!next) { c.style.setProperty("--k", 0); return; }
                const gap = next.getBoundingClientRect().top - c.getBoundingClientRect().top;
                const k = Math.min(1, Math.max(0, 1 - gap / (innerHeight * 0.75)));
                c.style.setProperty("--k", k.toFixed(3));
            });
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        update();
        window.addEventListener("scroll", on, { passive: true });
        window.addEventListener("resize", on);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
    }, []);

    return (
        <section id="work" className="act wrap">
            <header className="act-head">
                <span className="act-no neu mono">03</span>
                <div className="act-kicker"><span className="mono">Work</span><span className="bn">কাজ</span></div>
                <h2 className="act-title"><Lines lines={["Governance, data,", <span className="accent" key="a">and AI — in production.</span>]} /></h2>
                <p className="act-lede">What I work on, shown rather than listed. Every diagram is a simplified, public-safe sketch of the kind of system — never an employer's internals.</p>
            </header>
            <ol className="stack" ref={listRef}>
                {CARDS.map((c, i) => (
                    <li key={i} className={`stack-card neu-lg ${c.intro ? "is-intro" : ""}`} style={{ "--i": i }}>
                        <div className="stack-text">
                            {c.co ? (
                                <>
                                    <span className="mono">{c.kicker}</span>
                                    <h3 className="stack-co">{c.co}</h3>
                                    <p className="stack-role">{c.role}</p>
                                </>
                            ) : (
                                <>
                                    <span className="stack-n">{c.n}</span>
                                    <h3 className="stack-title">{c.title}</h3>
                                </>
                            )}
                            <p className="stack-body">{c.body}</p>
                            {c.tags && <ul className="stack-tags">{c.tags.map(t => <li key={t} className="neu-in-sm mono">{t}</li>)}</ul>}
                            {c.intro && <span className="mono stack-hint">Scroll — four focus areas follow ↓</span>}
                        </div>
                        <div className="stack-visual neu-in">
                            {c.Dia ? <c.Dia /> : <Pillars />}
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
