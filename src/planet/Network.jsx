import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { siLanggraph, siMlflow, siTensorflow, siScikitlearn, siDatabricks, siApachespark, siApachekafka, siApacheflink, siGooglecloud, siDocker, siKubernetes, siGithubactions, siTerraform, siPython, siGnubash, siPostgresql, siMongodb, siMysql } from "simple-icons";
import { World, useUI } from "./Planet";
import { ORBS } from "./world";
import { scrollToId } from "../site/hooks";

/*
 * My skills as a small neural network: skills (with their logos) are the inputs, four things
 * I do with them are the hidden layer, the roles you might hire for are the outputs.
 * Pick a role: the path through the network lights up and signals flow along it.
 */
const HID = [["build", "Build AI"], ["data", "Move data"], ["ship", "Ship & secure"], ["gov", "Govern"]];
// [name, logo (simple-icons) or short mark, colour, hidden nodes it feeds, where I've used it]
const S = [
    ["RAG Pipelines", "RAG", "#a58cff", ["build"], "Argus AI · Nordex prototypes"],
    ["LangGraph Agents", siLanggraph, null, ["build"], "Argus AI"],
    ["LLM Evaluation", "Eval", "#5fd0ff", ["build", "gov"], "Nordex · LLM and RAG prototypes"],
    ["MLflow", siMlflow, null, ["build", "ship"], ""],
    ["TensorFlow", siTensorflow, null, ["build"], "Poultry Shield"],
    ["Scikit-learn", siScikitlearn, null, ["build"], "TUHH research"],
    ["AI Governance", "⚖", "#f2c14e", ["gov"], "Nordex · Argus AI"],
    ["Azure Databricks", siDatabricks, null, ["data", "gov"], "Nordex"],
    ["Apache Spark", siApachespark, null, ["data"], "Nordex"],
    ["Apache Kafka", siApachekafka, null, ["data"], "StockFlow · Radiation Tracker"],
    ["Apache Flink", siApacheflink, null, ["data"], "Radiation Tracker"],
    ["ETL Pipelines", "ETL", "#ff7a45", ["data"], "Nordex · StockFlow"],
    ["Data Lineage", "⤳", "#3ee08f", ["data", "gov"], "Nordex"],
    ["Azure", "Az", "#1f8fff", ["ship", "data"], "Nordex · Argus AI"],
    ["AWS", "aws", "#ff9900", ["ship"], "StockFlow · Poultry Shield"],
    ["GCP", siGooglecloud, null, ["ship"], "Radiation Tracker"],
    ["Docker", siDocker, null, ["ship"], "TUHH research · Radiation Tracker"],
    ["Kubernetes", siKubernetes, null, ["ship"], ""],
    ["GitHub Actions", siGithubactions, null, ["ship"], "TUHH research"],
    ["Terraform", siTerraform, null, ["ship"], "Argus AI"],
    ["Python", siPython, null, ["build", "data"], "Nordex · TUHH · most projects"],
    ["SQL", "SQL", "#5fd0ff", ["data"], "Nordex"],
    ["Bash", siGnubash, null, ["ship"], ""],
    ["PostgreSQL", siPostgresql, null, ["data"], "Argus AI (pgvector)"],
    ["MongoDB", siMongodb, null, ["data"], ""],
    ["MySQL", siMysql, null, ["data"], ""],
];
const ROLES = [
    { id: "ai", name: "AI Engineer", color: "#5fd0ff", w: { build: 1, ship: 0.6, data: 0.4, gov: 0.4 }, skills: ["RAG Pipelines", "LangGraph Agents", "LLM Evaluation", "MLflow", "Python", "Azure", "Docker"],
        proof: [["Argus AI: RAG over the EU AI Act text, with a LangGraph agent", "projects"], ["Nordex: LLM and RAG prototypes, and how well they work", "experience"], ["TUHH: ML for anomaly detection and forecasting", "experience"]] },
    { id: "agent", name: "Agentic AI", color: "#a58cff", w: { build: 1, gov: 0.7, ship: 0.4, data: 0.3 }, skills: ["LangGraph Agents", "RAG Pipelines", "LLM Evaluation", "AI Governance", "Python", "PostgreSQL"],
        proof: [["Argus AI: an agent with a human approving each step", "projects"], ["This site: an AI you can attack, guarded by four layers", "break"], ["Demo: make an AI agent stop guessing", "what"]] },
    { id: "data", name: "Data Engineer", color: "#ff7a45", w: { data: 1, ship: 0.5, gov: 0.5, build: 0.3 }, skills: ["Azure Databricks", "Apache Spark", "Apache Kafka", "Apache Flink", "ETL Pipelines", "Data Lineage", "SQL", "Python"],
        proof: [["Nordex: data pipelines on Azure Databricks", "experience"], ["StockFlow and Radiation Tracker: real-time streaming", "projects"], ["TUHH: a live dashboard for a digital twin", "experience"]] },
    { id: "gov", name: "AI & Data Governance", color: "#f2c14e", w: { gov: 1, data: 0.6, build: 0.5, ship: 0.3 }, skills: ["AI Governance", "Data Lineage", "LLM Evaluation", "Azure Databricks", "Python", "SQL"],
        proof: [["Nordex: mapping AI use cases to the EU AI Act and GDPR", "experience"], ["Argus AI: compliance checks as code", "projects"], ["Break my AI: defences from the OWASP LLM Top 10", "break"]] },
    { id: "ops", name: "DevSecOps & Cloud", color: "#3ee08f", w: { ship: 1, data: 0.4, gov: 0.4, build: 0.2 }, skills: ["Azure", "Terraform", "Docker", "Kubernetes", "GitHub Actions", "AWS", "GCP", "Bash"],
        proof: [["Argus AI: on Azure Container Apps, built with Terraform", "projects"], ["TUHH: CI/CD with GitHub Actions and Docker", "experience"], ["Demo: catch 3 problems before go-live", "what"]] },
];
const lum = h => { const n = parseInt(h.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function Logo({ ic, color }) {
    if (typeof ic === "string") return <span className="pl-mark" style={{ color }}>{ic}</span>;
    const c = `#${ic.hex}`, fill = lum(c) < 0.28 ? "#e6edf5" : c;
    return <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d={ic.path} fill={fill} /></svg>;
}
const tint = ([, ic, color]) => (typeof ic === "string" ? color : `#${ic.hex}`);

const GROUPS = [["AI & MLOps", 0, 7], ["Data Engineering", 7, 13], ["Cloud & DevOps", 13, 20], ["Languages & DBs", 20, 26]];
export default function Network() {
    const ui = useUI(), [role, setRole] = useState(ROLES[0]), [hover, setHover] = useState(null), [hint, setHint] = useState(false);
    const box = useRef(null), nodes = useRef({}), groups = useRef([]), [lines, setLines] = useState({ w: 0, h: 0, e: [] });
    const lit = new Set(role.skills), hidOn = new Set(HID.filter(([id]) => role.w[id] >= 0.5).map(([id]) => id));
    // measure where things are, then draw: lit skills → what I do → the role (only the path that matters)
    useLayoutEffect(() => {
        const el = box.current; if (!el) return;
        const measure = () => {
            const b = el.getBoundingClientRect(), rc = n => n.getBoundingClientRect();
            const c = id => { const n = nodes.current[id]; if (!n) return null; const r = rc(n); return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2]; };
            const e = [];
            GROUPS.forEach(([, from, to], gi) => { const g = groups.current[gi]; if (!g) return; const gr = rc(g); S.slice(from, to).forEach(([name, , , hs]) => { const n = nodes.current[`s:${name}`]; if (!n) return; const r = rc(n); hs.forEach(h => { const t = c(`h:${h}`); if (t) e.push({ k: `${name}>${h}`, a: [gr.right - b.left, r.top - b.top + r.height / 2], b: t, from: name, to: h }); }); }); });
            HID.forEach(([h]) => ROLES.forEach(r => { const a = c(`h:${h}`), t = nodes.current[`r:${r.id}`]; if (!a || !t) return; const tr = rc(t); e.push({ k: `${h}>${r.id}`, a, b: [tr.left - b.left, tr.top - b.top + tr.height / 2], from: h, to: r.id }); }));
            setLines({ w: b.width, h: b.height, e });
        };
        measure(); const ro = new ResizeObserver(measure); ro.observe(el); document.fonts?.ready.then(measure);
        return () => ro.disconnect();
    }, []);
    useEffect(() => { const el = box.current; const io = new IntersectionObserver(([e]) => World.scene?.setRole(e.isIntersecting ? role.color : null), { threshold: 0.2 }); io.observe(el); return () => io.disconnect(); }, [role]);
    const pick = r => { setRole(r); World.scene?.setRole(r.color); World.scene?.once("emote-yes"); };
    const path = ({ a: [x1, y1], b: [x2, y2] }) => `M${x1} ${y1} C${x1 + (x2 - x1) * 0.5} ${y1}, ${x1 + (x2 - x1) * 0.5} ${y2}, ${x2} ${y2}`;
    const hs = hover && S.find(x => x[0] === hover);
    const where = { azure: "near the AI tower", databricks: "by the Nordex tower", rag: "at the end of the project park", euaiact: "on the TUHH campus", python: "near the photographer's tripod" };
    return (
        <div className="pl-netcard" style={{ "--rc": role.color }}>
            <div className="pl-net-head">
                <div><span className="pl-kick mono">07 · My toolkit · a neural network of skills</span><h2 className="pl-h is-in">What are you <span className="pl-w is-accent">{[..."hiring"].map((ch, i) => <span key={i} className="pl-l" style={{ "--i": i }}>{ch}</span>)}</span> for?</h2></div>
                <p className="pl-p">Pick a role. The skills it needs light up, and the signal flows through what I do with them, all the way to the job.</p>
            </div>
            <div className="pl-net" ref={box}>
                <svg className="pl-net-svg" width={lines.w} height={lines.h} aria-hidden="true">
                    {lines.e.map(x => { const on = (lit.has(x.from) && hidOn.has(x.to)) || (hidOn.has(x.from) && x.to === role.id), hov = hover === x.from; if (!on && !hov) return null; return <path key={x.k} d={path(x)} className={on ? "is-on" : "is-hov"} />; })}
                </svg>
                <div className="pl-net-in">
                    {GROUPS.map(([g, from, to], gi) => (
                        <div key={g} className="pl-cluster" ref={el => { groups.current[gi] = el; }}>
                            <span className="mono">{g}</span>
                            <div>{S.slice(from, to).map(sk => (
                                <button key={sk[0]} ref={el => { nodes.current[`s:${sk[0]}`] = el; }} className={`pl-skill ${lit.has(sk[0]) ? "is-on" : ""}`} style={{ "--c": tint(sk) }}
                                    onPointerEnter={() => setHover(sk[0])} onPointerLeave={() => setHover(null)} onFocus={() => setHover(sk[0])} onBlur={() => setHover(null)} onClick={() => setHover(sk[0])}>
                                    <span className="pl-skill-ic"><Logo ic={sk[1]} color={sk[2]} /></span>{sk[0]}
                                </button>))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pl-net-hid">{HID.map(([id, name]) => <div key={id} className={`pl-hidden ${hidOn.has(id) ? "is-on" : ""}`}><i ref={el => { nodes.current[`h:${id}`] = el; }} /><span>{name}</span></div>)}</div>
                <div className="pl-net-out">
                    <span className="mono">Hiring for…</span>
                    <div role="tablist" aria-label="Pick a role">{ROLES.map(r => <button key={r.id} role="tab" aria-selected={r.id === role.id} ref={el => { nodes.current[`r:${r.id}`] = el; }} className={`pl-role ${r.id === role.id ? "is-on" : ""}`} style={{ "--c": r.color }} onClick={() => pick(r)}>{r.name}</button>)}</div>
                    <div className="pl-focus" aria-live="polite">{hs ? <><b>{hs[0]}</b><span>{hs[4] ? `Used at: ${hs[4]}` : "In my toolkit"}</span></> : <><b>{role.name} · {role.skills.length} skills</b><span>Hover a skill to see where I used it.</span></>}</div>
                    <div className="pl-proofs" key={role.id}>{role.proof.map(([t, go], k) => <button key={t} style={{ "--d": `${0.1 + k * 0.08}s` }} onClick={() => scrollToId(go)}><i>✓</i>{t}<em>→</em></button>)}</div>
                </div>
            </div>
            <div className="pl-orbline">
                <div className="pl-orbrow">{ORBS.map(o => <span key={o.id} className={ui.orbs.includes(o.id) ? "is-got" : ""} style={{ "--c": o.color }} title={o.name}><i /></span>)}</div>
                <span className="pl-p">{ui.orbs.length === ORBS.length ? "All 5 skill orbs found ✦" : `${ui.orbs.length}/${ORBS.length} skill orbs found on my planet.`}</span>
                {ui.orbs.length < ORBS.length && <button className="pl-link" onClick={() => setHint(h => !h)}>{hint ? "Hide hints" : "Hints"}</button>}
                {hint && <span className="pl-p">{ORBS.filter(o => !ui.orbs.includes(o.id)).map(o => `${o.name} is ${where[o.id]}`).join(" · ")}</span>}
            </div>
        </div>
    );
}
