import Stop, { Opener } from "./Stop";

/* ── Animated diagrams (pure SVG + CSS; colours follow the theme) ── */

function RagLoop() {
    const steps = [["ask", 20], ["search", 125], ["answer", 230], ["check", 335]];
    return (
        <svg viewBox="0 0 460 200" className="dia">
            <path className="dia-flow" d="M70 80 L150 80 M170 80 L250 80 M270 80 L350 80" />
            <path className="dia-flow back" d="M370 100 C 370 170, 70 170, 70 100" />
            {steps.map(([t, x], i) => (
                <g key={t} className="dia-node pulse" style={{ animationDelay: `${i * 0.6}s` }}>
                    <circle cx={x + 40} cy="80" r="36" />
                    <text x={x + 40} y="84">{t}</text>
                </g>
            ))}
            {[0, 1, 2, 3, 4].map(i => <rect key={i} className="dia-bar" x={150 + i * 34} y="150" width="24" height="18" rx="5" style={{ animationDelay: `${i * 0.25}s` }} />)}
            <text className="dia-lbl" x="18" y="163">eval</text>
        </svg>
    );
}

/* Project delivery: parallel workstreams, a blocker that gets cleared, deadline met */
function Timeline() {
    const lanes = [["Cloud", 20, 150], ["Network", 70, 130], ["Data", 40, 190], ["AI", 110, 170]];
    return (
        <svg viewBox="0 0 460 200" className="dia">
            {lanes.map(([t, x, w], i) => (
                <g key={t}>
                    <text className="dia-lbl" x="4" y={38 + i * 40}>{t}</text>
                    <rect className="dia-lane" x="84" y={24 + i * 40} width="330" height="22" rx="11" />
                    <rect className="dia-bar-h" x={84 + x} y={24 + i * 40} width={w} height="22" rx="11" style={{ animationDelay: `${i * 0.3}s` }} />
                </g>
            ))}
            <g className="dia-block"><circle cx="220" cy="75" r="11" /><text x="220" y="79">!</text></g>
            <path className="dia-flow" d="M424 16 L424 186" />
            <g className="dia-badge"><rect x="330" y="0" width="94" height="22" rx="11" /><text x="377" y="15">deadline ✓</text></g>
        </svg>
    );
}

/* AI governance lifecycle: six stages, one pulse travelling around */
function Lifecycle() {
    const stages = ["Use case", "Data", "Model", "Validate", "Deploy", "Monitor"];
    const cx = 230, cy = 100, r = 70;
    return (
        <svg viewBox="0 0 460 200" className="dia">
            <circle className="dia-ring" cx={cx} cy={cy} r={r} />
            <circle className="dia-orbit" cx={cx} cy={cy} r={r} />
            {stages.map((t, i) => {
                const a = (i / stages.length) * Math.PI * 2 - Math.PI / 2;
                const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
                const lx = cx + Math.cos(a) * (r + 44), ly = cy + Math.sin(a) * (r + 22) + 4;
                return (
                    <g key={t} className="dia-node pulse" style={{ animationDelay: `${i * 0.5}s` }}>
                        <circle cx={x} cy={y} r="12" />
                        <text x={x} y={y + 4} className="dia-num">{i + 1}</text>
                        <text x={lx} y={ly}>{t}</text>
                    </g>
                );
            })}
            <text x={cx} y={cy - 4} className="dia-center">EU AI Act</text>
            <text x={cx} y={cy + 12} className="dia-center sm">+ GDPR</text>
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
        station: "floor-1", floor: "Floor 1", type: "Current", when: "Aug 2025 — now", org: "Nordex Group · Hamburg", role: "AI & Data Engineering",
        bullets: [
            "Built an internal AI assistant end to end — it answers questions from company documents using retrieval-augmented generation (RAG).",
            "Designed a tool-routing layer so the assistant reliably picks the right tool for each request.",
            "Ran a structured evaluation of language models on quality, speed and cost, and recommended the best fit.",
            "Shipped the chat interface, automatic document syncing and full architecture documentation.",
        ],
        tags: ["Azure AI", "RAG", "LLM evaluation", "Python", "Docker", "Streamlit", "Azure Databricks", "Azure DevOps"], Dia: RagLoop,
    },
    {
        station: "floor-2", floor: "Floor 2", type: "Leadership", when: "Feb — Mar 2026", org: "Nordex Group · Hamburg", role: "Project Manager — enterprise AI project",
        bullets: [
            "Coordinated an enterprise AI project across several internal teams and external partners.",
            "Cleared an infrastructure blocker that had stalled the project for weeks by bringing the cloud and network teams together.",
            "Kept everyone aligned with clear ownership, action trackers and regular status updates.",
            "Delivered on the deadline.",
        ],
        tags: ["Project management", "Stakeholder communication", "Cross-functional leadership", "Vendor coordination", "Agile delivery"], Dia: Timeline,
    },
    {
        station: "floor-3", floor: "Floor 3", type: "Governance", when: "Aug 2025 — Jan 2026", org: "Nordex Group · Hamburg", role: "AI Governance & Architecture",
        bullets: [
            "Designed an end-to-end AI governance lifecycle — from use-case intake and data governance to validation, deployment and monitoring.",
            "Turned Responsible AI principles into buildable architecture designs.",
            "Mapped system boundaries, risk classes and transparency requirements to the EU AI Act.",
            "Linked GDPR and EU AI Act articles directly into governance documentation for full traceability.",
        ],
        tags: ["AI governance", "Responsible AI", "EU AI Act", "GDPR", "Data governance", "Risk classification", "Architecture design"], Dia: Lifecycle,
    },
    {
        station: "uni", floor: "TUHH", type: "Research", when: "Mar 2025 — now", org: "TUHH · Hamburg", role: "Digital Twin Dashboard & MLOps",
        bullets: [
            "Built a live monitoring dashboard for a digital-twin simulation.",
            "Added machine learning for anomaly detection and forecasting.",
            "Automated testing and deployment with GitHub Actions, fully containerised with Docker.",
        ],
        tags: ["Python", "Dash", "Plotly", "Scikit-learn", "Docker", "GitHub Actions"], Dia: Series,
    },
];

export default function Work() {
    return (
        <section id="work" aria-label="Experience">
            <Opener station="nordex" n="02" kicker="Experience" title="Nordex HQ — one floor per role"
                sub="Three roles at Nordex Group — engineering, project leadership and governance — plus research at TUHH. Scroll to climb the building." />
            {CARDS.map((c, i) => (
                <Stop key={c.role} station={c.station} side={i % 2 ? "left" : "right"} wide>
                    <div className="pane-kicker">
                        <span className={`chip mono ${c.type === "Current" ? "is-live" : ""}`}>{c.type === "Current" && <span className="dot-live" />}{c.type}</span>
                        <span className="mono">{c.when}</span><span className="pane-where mono">🏢 {c.floor}</span>
                    </div>
                    <h3 className="pane-title">{c.role}</h3>
                    <p className="stack-org">{c.org}</p>
                    <div className="pane-split">
                        <ul className="stack-bullets">{c.bullets.map(b => <li key={b}>{b}</li>)}</ul>
                        <div className="pane-dia neu-in"><c.Dia /></div>
                    </div>
                    <ul className="stack-tags">{c.tags.map(t => <li key={t} className="neu-in-sm mono">{t}</li>)}</ul>
                </Stop>
            ))}
        </section>
    );
}
