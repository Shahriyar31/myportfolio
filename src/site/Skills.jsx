import { useEffect, useMemo, useRef, useState } from "react";
import SectionHead from "./SectionHead";
import Logo from "./Logo";
import { reducedMotion, finePointer } from "./hooks";

/* [name, logo, where I used it] grouped by what they're for */
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
    const all = useMemo(() => GROUPS.flatMap(([g, , items]) => items.map(([name, logo, where]) => ({ name, logo, where, group: g }))), []);
    const [tab, setTab] = useState("All");
    const [focus, setFocus] = useState(null);
    const [letter, setLetter] = useState(null);
    const stageRef = useRef(null);
    const itemRefs = useRef([]);
    const rot = useRef({ x: -0.25, y: 0, vx: 0, vy: 0.0035, drag: null, hover: false });

    // Fibonacci sphere; each frame rotate and project (cheap: ~36 points)
    useEffect(() => {
        const pts = all.map((_, i) => {
            const y = 1 - (i / (all.length - 1)) * 2, r = Math.sqrt(1 - y * y), t = i * 2.39996;
            return [Math.cos(t) * r, y, Math.sin(t) * r];
        });
        let raf = 0, visible = false;
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
        io.observe(stageRef.current);
        const loop = () => {
            const s = rot.current, el = stageRef.current;
            if (visible && el) {
                if (!s.drag) { s.vy += ((s.hover ? 0 : reducedMotion() ? 0 : 0.0035) - s.vy) * 0.05; s.vx *= 0.95; }
                s.y += s.vy; s.x = Math.max(-1, Math.min(1, s.x + s.vx));
                const R = el.clientWidth * 0.38, cx = el.clientWidth / 2, cy = el.clientHeight / 2;
                const cyr = Math.cos(s.y), syr = Math.sin(s.y), cxr = Math.cos(s.x), sxr = Math.sin(s.x);
                pts.forEach(([x, y, z], i) => {
                    const node = itemRefs.current[i]; if (!node) return;
                    const x1 = x * cyr + z * syr, z1 = -x * syr + z * cyr;
                    const y2 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr;
                    const depth = (z2 + 1) / 2;
                    node.style.transform = `translate3d(${cx + x1 * R}px, ${cy + y2 * R}px, 0) translate(-50%, -50%) scale(${0.55 + depth * 0.6})`;
                    node.style.zIndex = String(Math.round(depth * 100));
                    node.style.setProperty("--depth", depth.toFixed(3));
                });
            }
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => { cancelAnimationFrame(raf); io.disconnect(); };
    }, [all]);

    // drag to spin
    useEffect(() => {
        const el = stageRef.current, s = rot.current;
        const down = e => { s.drag = { x: e.clientX, y: e.clientY }; };
        const move = e => {
            if (!s.drag) return;
            const dx = e.clientX - s.drag.x, dy = e.clientY - s.drag.y;
            s.drag = { x: e.clientX, y: e.clientY };
            s.vy = dx * 0.006; s.vx = -dy * 0.004;
        };
        const up = () => { s.drag = null; };
        el.addEventListener("pointerdown", down);
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("pointerup", up);
        return () => { el.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    }, []);

    // type a letter to find a tool
    useEffect(() => {
        let t;
        const on = e => {
            if (e.metaKey || e.ctrlKey || e.altKey || /^(input|textarea)$/i.test(document.activeElement?.tagName) || !/^[a-z]$/i.test(e.key)) return;
            const r = stageRef.current?.getBoundingClientRect();
            if (!r || r.bottom < 0 || r.top > innerHeight) return;
            setLetter(e.key.toLowerCase()); clearTimeout(t); t = setTimeout(() => setLetter(null), 1500);
        };
        window.addEventListener("keydown", on);
        return () => { window.removeEventListener("keydown", on); clearTimeout(t); };
    }, []);

    const active = i => {
        const s = all[i];
        if (letter) return s.name.toLowerCase().startsWith(letter);
        return tab === "All" || s.group === tab;
    };
    const detail = focus ?? (letter && all.find(s => s.name.toLowerCase().startsWith(letter)));

    return (
        <section id="skills" className="act wrap" data-station="sky">
            <SectionHead n="04" kicker="Skills" title="My toolkit" sub="Drag the sphere to spin it. Hover a logo to see where I used it — or type a letter to find a tool." />
            <div className="sph">
                <div className="sph-side">
                    <div className="sph-tabs" role="tablist">
                        {["All", ...GROUPS.map(g => g[0])].map(g => {
                            const icon = GROUPS.find(x => x[0] === g)?.[1];
                            const n = g === "All" ? all.length : all.filter(s => s.group === g).length;
                            return <button key={g} role="tab" aria-selected={tab === g} className={`key key-sm ${tab === g ? "is-down" : ""}`} onClick={() => setTab(g)}>{icon && <Logo n={icon} size={15} />}{g}<span className="mono">{n}</span></button>;
                        })}
                    </div>
                    <div className={`sph-detail neu ${detail ? "is-on" : ""}`} aria-live="polite">
                        {detail ? <>
                            <span className="sph-detail-ico neu-in"><Logo n={detail.logo} size={34} /></span>
                            <div><span className="mono">{detail.group}</span><b>{detail.name}</b><span>Used in: {detail.where}</span></div>
                        </> : <span className="sph-empty mono">Hover or tap a logo</span>}
                    </div>
                    <ul className="sph-list" aria-label="All skills">
                        {all.filter((_, i) => active(i)).map(s => <li key={s.name}><Logo n={s.logo} size={14} />{s.name}</li>)}
                    </ul>
                </div>
                <div className="sph-stage" ref={stageRef} onPointerEnter={() => { if (finePointer()) rot.current.hover = true; }} onPointerLeave={() => { rot.current.hover = false; setFocus(null); }}>
                    <div className="sph-glow" aria-hidden="true" />
                    {all.map((s, i) => (
                        <button
                            key={s.name}
                            ref={el => { itemRefs.current[i] = el; }}
                            className={`sph-item ${active(i) ? "" : "is-dim"} ${focus === s ? "is-focus" : ""}`}
                            onPointerEnter={() => setFocus(s)}
                            onFocus={() => setFocus(s)}
                            onClick={() => setFocus(s)}
                            aria-label={`${s.name}: used in ${s.where}`}
                        >
                            <Logo n={s.logo} size={26} />
                            <span className="sph-name">{s.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
