import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { siLanggraph, siModelcontextprotocol, siTensorflow, siScikitlearn, siOwasp, siPython, siPandas, siApachekafka, siApacheflink, siInfluxdb, siDatabricks, siPlotly, siDocker, siGit, siLinux, siTerraform, siFastapi, siPostgresql, siGithubactions, siTrivy, siPrometheus, siSentry } from "simple-icons";
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
    ["RAG", "RAG", "#b48ead", ["build"], "Nordex knowledge agent · Argus AI"],
    ["Azure AI Foundry", "AIF", "#81a1c1", ["build", "ship"], "Nordex knowledge agent"],
    ["Azure OpenAI", "AOI", "#88c0d0", ["build"], "Nordex model evaluation"],
    ["LLM-as-judge evals", "Eval", "#8fbcbb", ["build", "gov"], "Nordex model evaluation"],
    ["LangGraph", siLanggraph, null, ["build"], "Argus AI"],
    ["MCP", siModelcontextprotocol, null, ["build", "ship"], "Nordex security controls"],
    ["TensorFlow", siTensorflow, null, ["build"], "Poultry Shield"],
    ["Scikit-learn", siScikitlearn, null, ["build"], ""],
    ["FastAPI", siFastapi, null, ["build", "ship"], "Argus AI"],
    ["EU AI Act", "EU", "#81a1c1", ["gov"], "Nordex AI policy · Argus AI · my paper"],
    ["GDPR", "§", "#88c0d0", ["gov"], "Nordex AI policy · Argus AI"],
    ["NIST AI RMF", "NIST", "#8fbcbb", ["gov"], "Nordex AI policy"],
    ["ISO 42001", "ISO", "#b48ead", ["gov"], ""],
    ["OWASP LLM Top 10", siOwasp, null, ["gov", "ship"], "Nordex AI security · my paper · this site"],
    ["IEC 62443", "IEC", "#d08770", ["gov", "ship"], "Nordex AI security"],
    ["DPIA", "DPIA", "#a3be8c", ["gov"], "Argus AI"],
    ["NIS2", "NIS2", "#ebcb8b", ["gov"], ""],
    ["MITRE ATLAS", "ATL", "#bf616a", ["gov", "ship"], "Argus AI"],
    ["Threat modelling", "TM", "#d08770", ["gov", "ship"], "Argus AI (OWASP Threat Dragon)"],
    ["Python", siPython, null, ["build", "data"], "Nordex · TUHH · all my projects"],
    ["SQL", "SQL", "#88c0d0", ["data"], "StockFlow (Athena) · everyday querying"],
    ["Pandas", siPandas, null, ["data"], "TUHH digital twin"],
    ["Apache Kafka", siApachekafka, null, ["data"], "TUHH · StockFlow · Radiation Tracker"],
    ["Apache Flink", siApacheflink, null, ["data"], "TUHH · Radiation Tracker"],
    ["InfluxDB", siInfluxdb, null, ["data"], "TUHH digital twin"],
    ["Azure Databricks", siDatabricks, null, ["data"], ""],
    ["AWS Glue · Athena", "aws", "#d08770", ["data"], "StockFlow"],
    ["Plotly Dash", siPlotly, null, ["data"], "TUHH digital twin"],
    ["PostgreSQL · pgvector", siPostgresql, null, ["data", "build"], "Argus AI"],
    ["Azure APIM", "API", "#81a1c1", ["ship"], "Nordex integration work"],
    ["Azure DevOps", "ADO", "#5e81ac", ["ship"], "Nordex"],
    ["Docker", siDocker, null, ["ship", "data"], "TUHH · Radiation Tracker"],
    ["CI/CD", "CI", "#a3be8c", ["ship"], "Nordex security pipeline"],
    ["Git / GitHub", siGit, null, ["ship"], "All my projects"],
    ["Linux · Bash", siLinux, null, ["ship"], ""],
    ["IAM / RBAC", "IAM", "#b48ead", ["ship", "gov"], ""],
    ["Syft · Grype · Cosign", "SBOM", "#8fbcbb", ["ship"], "Nordex DevSecOps tooling"],
    ["Terraform", siTerraform, null, ["ship"], "Argus AI"],
    ["GitHub Actions", siGithubactions, null, ["ship"], "Argus AI"],
    ["Trivy · Semgrep · Bandit", siTrivy, null, ["ship", "gov"], "Argus AI security gates"],
    ["Prometheus · Grafana", siPrometheus, null, ["ship"], "Argus AI"],
    ["Sentry", siSentry, null, ["ship"], "Argus AI"],
];
const ROLES = [
    { id: "ai", name: "AI Engineer", color: "#88c0d0", w: { build: 1, ship: 0.6, data: 0.4, gov: 0.4 }, skills: ["RAG", "Azure AI Foundry", "Azure OpenAI", "LLM-as-judge evals", "LangGraph", "Python", "Docker"],
        proof: [["Nordex: a RAG knowledge agent on Azure AI Foundry, with an LLM-as-judge evaluation", "experience"], ["Argus AI: RAG over the EU AI Act text, with a LangGraph agent", "projects"], ["Poultry Shield: VGG16 fine-tuned to 97.51% validation accuracy", "projects"]] },
    { id: "agent", name: "Agentic AI", color: "#b48ead", w: { build: 1, gov: 0.7, ship: 0.5, data: 0.2 }, skills: ["LangGraph", "MCP", "RAG", "FastAPI", "OWASP LLM Top 10", "IAM / RBAC", "Python"],
        proof: [["Argus AI: an agent with a human approving each step", "projects"], ["Nordex: security controls for MCP tool access", "experience"], ["This site: an AI you can attack, guarded by four layers", "break"]] },
    { id: "data", name: "Data Engineer", color: "#d08770", w: { data: 1, ship: 0.5, build: 0.3, gov: 0.2 }, skills: ["Apache Kafka", "Apache Flink", "InfluxDB", "Pandas", "SQL", "Python", "AWS Glue · Athena", "Docker"],
        proof: [["TUHH: a real-time digital-twin dashboard on Kafka, Flink and InfluxDB", "experience"], ["StockFlow: Kafka → S3 → Glue → Athena, no warehouse", "projects"], ["Radiation Tracker: real-time streaming with Kafka and Flink", "projects"]] },
    { id: "gov", name: "AI Governance & Security", color: "#ebcb8b", w: { gov: 1, ship: 0.6, build: 0.4, data: 0.2 }, skills: ["EU AI Act", "GDPR", "NIST AI RMF", "ISO 42001", "OWASP LLM Top 10", "MITRE ATLAS", "IEC 62443", "DPIA", "Threat modelling"],
        proof: [["Nordex: authored the AI lifecycle framework of the AI governance policy", "experience"], ["My paper: OWASP LLM Top 10 mapped to the EU AI Act", "experience"], ["Argus AI: EU AI Act risk tiers and GDPR DPIAs as code", "projects"]] },
    { id: "ops", name: "DevSecOps & Cloud", color: "#a3be8c", w: { ship: 1, gov: 0.5, data: 0.3, build: 0.3 }, skills: ["Docker", "CI/CD", "GitHub Actions", "Trivy · Semgrep · Bandit", "Syft · Grype · Cosign", "Azure DevOps", "Terraform", "Prometheus · Grafana"],
        proof: [["Nordex: compared supply-chain security tools and delivered a CI/CD security pipeline", "experience"], ["TUHH: frontend image cut from ~900 MB to 150 MB", "experience"], ["Argus AI: on Azure Container Apps, built with Terraform", "projects"]] },
];
const lum = h => { const n = parseInt(h.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function Logo({ ic, color }) {
    if (typeof ic === "string") return <span className="pl-mark" style={{ color }}>{ic}</span>;
    const c = `#${ic.hex}`, fill = lum(c) < 0.28 ? "#e6edf5" : c;
    return <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d={ic.path} fill={fill} /></svg>;
}
const tint = ([, ic, color]) => (typeof ic === "string" ? color : `#${ic.hex}`);

const GROUPS = [["AI & LLMs", 0, 9], ["Governance & security", 9, 19], ["Data", 19, 29], ["Cloud & DevSecOps", 29, 42]];
/* what I do with each group of skills */
const SKY = [["Build AI", "AI & LLMs"], ["Govern", "Governance & security"], ["Move data", "Data"], ["Ship & secure", "Cloud & DevSecOps"]];
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const groupOf = name => { const i = S.findIndex(x => x[0] === name); return GROUPS.findIndex(([, a, b]) => i >= a && i < b); };

/*
 * The skill terminal: run `farhan install --role …` and my skills install one by one,
 * each with where I've really used it. The logos on the right light up as they install.
 * `farhan info <skill>` explains one skill. Type, or click.
 */
export default function Network() {
    const ui = useUI(), [role, setRole] = useState(null), [log, setLog] = useState([]), [busy, setBusy] = useState(false), [cmd, setCmd] = useState(""), [lit, setLit] = useState(new Set()), [hint, setHint] = useState(false);
    const box = useRef(null), screen = useRef(null), started = useRef(false), timers = useRef([]);
    const push = line => setLog(l => [...l.slice(-60), line]);
    const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    const later = (ms, fn) => timers.current.push(setTimeout(fn, ms));
    useEffect(() => () => clear(), []);
    useEffect(() => { const sc = screen.current; if (sc) sc.scrollTop = sc.scrollHeight; }, [log]);
    const install = r => {
        clear(); setBusy(true); setRole(r); setLit(new Set()); World.scene?.setRole(r.color); World.scene?.once("emote-yes");
        push({ k: "cmd", t: `farhan install --role ${slug(r.name)}` }); push({ k: "dim", t: `resolving ${r.name} · ${r.skills.length} skills` });
        const t0 = performance.now();
        r.skills.forEach((name, i) => later(260 + i * 230, () => {
            const sk = S.find(x => x[0] === name); setLit(s => new Set([...s, name]));
            push({ k: "ok", name, ic: sk, t: slug(name), where: sk?.[4] || "in my toolkit", n: i + 1, of: r.skills.length, c: r.color });
        }));
        later(260 + r.skills.length * 230 + 200, () => { push({ k: "done", t: `installed ${r.skills.length} skills in ${((performance.now() - t0) / 1000).toFixed(1)}s`, proof: r.proof, c: r.color }); setBusy(false); });
    };
    const info = name => {
        const sk = S.find(x => x[0] === name); if (!sk) return; clear(); setBusy(false);
        push({ k: "cmd", t: `farhan info ${slug(name)}` }); push({ k: "info", name, ic: sk, group: SKY[groupOf(name)]?.[0], where: sk[4] || "in my toolkit (no public project yet)" });
    };
    const run = e => {
        e.preventDefault(); const q = cmd.trim().toLowerCase(); if (!q) return; setCmd("");
        const words = q.replace(/^farhan\s+/, "").replace(/^(install|--role|info)\s*/g, "").replace(/^--role\s*/, "");
        const r = ROLES.find(x => slug(x.name).includes(slug(words)) || slug(words).includes(slug(x.name)) || x.id === words);
        if (r) return install(r);
        const sk = S.find(x => slug(x[0]).includes(slug(words)) || slug(words) === slug(x[0]));
        if (sk) return info(sk[0]);
        push({ k: "cmd", t: cmd.trim() }); push({ k: "err", t: `not found: try a role (${ROLES.map(x => slug(x.name)).join(", ")}) or a skill like "rag" or "kafka"` });
    };
    // start on its own the first time the chapter is on screen
    useEffect(() => { const el = box.current; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started.current) { started.current = true; push({ k: "dim", t: "welcome to my toolkit · pick a role, or type a skill" }); later(700, () => install(ROLES[0])); } if (!e.isIntersecting) World.scene?.setRole(null); else if (role) World.scene?.setRole(role.color); }, { threshold: 0.3 }); io.observe(el); return () => io.disconnect(); }, [role]);
    const where = { azure: "near the AI tower", databricks: "by the Nordex tower", rag: "at the end of the project park", euaiact: "on the TUHH campus", python: "close to my desk" };
    return (
        <div className="pl-skillterm" ref={box} style={{ "--rc": role?.color || "#88c0d0" }}>
            <div className="pl-net-head">
                <div><span className="pl-kick mono"><i aria-hidden="true" />My toolkit · the skill installer</span><h2 className="pl-h is-in">What are you <span className="pl-w is-accent">{[..."hiring"].map((ch, i) => <span key={i} className="pl-l" style={{ "--i": i }}>{ch}</span>)}<svg className="pl-swoosh" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path d="M4 13 C 48 7, 118 3, 196 9 M 30 17 C 80 13, 140 12, 176 14" pathLength="1" /></svg></span> for?</h2></div>
                <p className="pl-p">Pick the role you're hiring for and my skills install one by one, each with where I've really used it. Or type a skill, like <code>rag</code> or <code>kafka</code>.</p>
            </div>
            <div className="pl-st-grid">
                <div className="pl-st-term">
                    <div className="pl-st-bar"><i /><i /><i /><span className="mono">farhan@toolkit · zsh</span></div>
                    <div className="pl-st-chips">{ROLES.map(r => <button key={r.id} className={role?.id === r.id ? "is-on" : ""} style={{ "--c": r.color }} onClick={() => install(r)} disabled={busy && role?.id === r.id}><span className="mono">install</span>{r.name}</button>)}</div>
                    <div className="pl-st-screen" ref={screen} data-lenis-prevent aria-live="polite">
                        {log.map((l, i) => l.k === "cmd" ? <p key={i} className="pl-st-cmd"><span>❯</span> {l.t}</p>
                            : l.k === "ok" ? <p key={i} className="pl-st-ok" style={{ "--c": l.c }}><i>✓</i><span className="pl-st-ic"><Logo ic={l.ic[1]} color={l.ic[2]} /></span><b>{l.t}</b><em>{l.where}</em><small>{l.n}/{l.of}</small></p>
                            : l.k === "done" ? <div key={i} className="pl-st-done" style={{ "--c": l.c }}><p>● {l.t}</p><ul>{l.proof.map(([t, go]) => <li key={t}><button onClick={() => scrollToId(go)}>{t} →</button></li>)}</ul></div>
                            : l.k === "info" ? <div key={i} className="pl-st-info"><span className="pl-st-ic"><Logo ic={l.ic[1]} color={l.ic[2]} /></span><div><b>{l.name}</b><small>{l.group} · used at: {l.where}</small></div></div>
                            : <p key={i} className={`pl-st-${l.k}`}>{l.t}</p>)}
                        {busy && <p className="pl-st-dim"><span className="pl-st-spin" /> installing…</p>}
                    </div>
                    <form className="pl-st-input" onSubmit={run}><span>❯</span><input value={cmd} onChange={e => setCmd(e.target.value)} placeholder="farhan install --role data-engineer   ·   or a skill: rag" aria-label="Type a role or a skill" maxLength={60} /><button disabled={!cmd.trim()}>run</button></form>
                </div>
                <div className={`pl-st-pkgs ${lit.size ? "has-lit" : ""}`} aria-label="Installed skills">
                    {GROUPS.map(([g, a, b], gi) => (
                        <div key={g} className="pl-st-group"><span className="mono">{SKY[gi][0]} · {g}</span>
                            <div>{S.slice(a, b).map(sk => <button key={sk[0]} className={`pl-st-pkg ${lit.has(sk[0]) ? "is-on" : ""}`} style={{ "--c": tint(sk) }} onClick={() => info(sk[0])} title={sk[4] ? `Used at: ${sk[4]}` : "In my toolkit"}><span className="pl-st-ic"><Logo ic={sk[1]} color={sk[2]} /></span>{sk[0]}</button>)}</div>
                        </div>))}
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
