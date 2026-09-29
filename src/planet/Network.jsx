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
/* four constellations; the name is what I do with those skills */
const SKY = [["Build AI", "AI & LLMs"], ["Govern", "Governance & security"], ["Move data", "Data"], ["Ship & secure", "Cloud & DevSecOps"]];
// a star's place inside its constellation: two loose columns, gently jittered so it reads like a star chart
const spotOne = (i, n) => ({ x: 6 + (i % 2) * 16 + Math.sin(i * 5.1) * 4, y: 2 + (i / Math.max(1, n - 1)) * 94 });
const spot = (i, n) => { const row = Math.floor(i / 2), rows = Math.ceil(n / 2), col = i % 2, j = Math.sin(i * 12.9898 + n * 3.1) * 0.5; return { x: 8 + col * 48 + j * 8, y: 4 + (row / Math.max(1, rows - 1)) * 86 + (col ? 5 : 0) + Math.cos(i * 7.3) * 2 }; };

export default function Network() {
    const ui = useUI(), [role, setRole] = useState(ROLES[0]), [hover, setHover] = useState(null), [hint, setHint] = useState(false), [drawn, setDrawn] = useState(0);
    const board = useRef(null), stars = useRef({}), [pts, setPts] = useState({ w: 0, h: 0, at: {} });
    const lit = new Set(role.skills), [one, setOne] = useState(false);
    useEffect(() => { const mq = matchMedia("(max-width: 860px), (max-width: 1180px) and (orientation: portrait)"), f = () => setOne(mq.matches); f(); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f); }, []);
    // measure where every star is, so the constellation lines join them exactly
    useLayoutEffect(() => {
        const el = board.current; if (!el) return;
        const measure = () => { const b = el.getBoundingClientRect(), at = {}; Object.entries(stars.current).forEach(([k, n]) => { if (!n) return; const r = n.querySelector(".pl-star-dot")?.getBoundingClientRect(); if (r) at[k] = [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2]; }); setPts({ w: b.width, h: b.height, at }); };
        measure(); const ro = new ResizeObserver(measure); ro.observe(el); document.fonts?.ready.then(measure); return () => ro.disconnect();
    }, [one]);
    useEffect(() => { const el = board.current; const io = new IntersectionObserver(([e]) => { World.scene?.setRole(e.isIntersecting ? role.color : null); if (e.isIntersecting) setDrawn(d => d + 1); }, { threshold: 0.3 }); io.observe(el); return () => io.disconnect(); }, [role]);
    const pick = r => { setRole(r); setDrawn(d => d + 1); World.scene?.setRole(r.color); World.scene?.once("emote-yes"); };
    const line = names => names.map(n => pts.at[n]).filter(Boolean).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const roleOrder = S.map(x => x[0]).filter(n => lit.has(n)); // the role's own constellation, drawn across the sky
    const hs = hover && S.find(x => x[0] === hover);
    const where = { azure: "near the AI tower", databricks: "by the Nordex tower", rag: "at the end of the project park", euaiact: "on the TUHH campus", python: "close to my desk" };
    return (
        <div className="pl-skyboard" style={{ "--rc": role.color }}>
            <div className="pl-net-head">
                <div><span className="pl-kick mono">07 · My toolkit · the skill constellations</span><h2 className="pl-h is-in">What are you <span className="pl-w is-accent">{[..."hiring"].map((ch, i) => <span key={i} className="pl-l" style={{ "--i": i }}>{ch}</span>)}</span> for?</h2></div>
                <p className="pl-p">Every skill is a star, grouped by what I do with it. Pick a role and I'll draw its constellation across the sky, with where I've really used each one.</p>
            </div>
            <div className="pl-sky" ref={board}>
                <svg className="pl-sky-lines" width={pts.w} height={pts.h} aria-hidden="true">
                    {GROUPS.map(([g, a, b]) => <path key={g} d={line(S.slice(a, b).map(x => x[0]))} className="pl-cline" />)}
                    <path key={role.id + drawn} d={line(roleOrder)} className="pl-rline" pathLength="1" />
                </svg>
                {GROUPS.map(([g, a, b], gi) => { const list = S.slice(a, b); return (
                    <div key={g} className="pl-const">
                        <div className="pl-const-name"><b>✦ {SKY[gi][0]}</b><span className="mono">{SKY[gi][1]}</span></div>
                        <div className="pl-const-field" style={{ "--n": list.length }}>
                            {list.map((sk, i) => { const { x, y } = (one ? spotOne : spot)(i, list.length), on = lit.has(sk[0]); return (
                                <button key={sk[0]} ref={el => { stars.current[sk[0]] = el; }} className={`pl-star ${on ? "is-on" : ""} ${hover === sk[0] ? "is-hover" : ""}`} style={{ left: `${x}%`, top: `${y}%`, "--c": tint(sk), "--tw": `${(i * 0.37 + gi * 0.9) % 3}s` }}
                                    onPointerEnter={() => setHover(sk[0])} onPointerLeave={() => setHover(null)} onFocus={() => setHover(sk[0])} onBlur={() => setHover(null)} onClick={() => setHover(sk[0])} aria-label={`${sk[0]}${sk[4] ? `: used at ${sk[4]}` : ""}`}>
                                    <span className="pl-star-dot"><Logo ic={sk[1]} color={sk[2]} /></span><span className="pl-star-name">{sk[0]}</span>
                                </button>); })}
                        </div>
                    </div>); })}
            </div>
            <div className="pl-sky-foot">
                <div className="pl-net-out"><span className="mono">Hiring for…</span><div role="tablist" aria-label="Pick a role">{ROLES.map(r => <button key={r.id} role="tab" aria-selected={r.id === role.id} className={`pl-role ${r.id === role.id ? "is-on" : ""}`} style={{ "--c": r.color }} onClick={() => pick(r)}>{r.name}</button>)}</div></div>
                <div className="pl-focus" aria-live="polite">{hs ? <><b>{hs[0]}</b><span>{hs[4] ? `Used at: ${hs[4]}` : "In my toolkit"}</span></> : <><b>{role.name} · {role.skills.length} stars</b><span>Hover a star to see where I used it.</span></>}</div>
                <div className="pl-proofs" key={role.id}>{role.proof.map(([t, go], k) => <button key={t} style={{ "--d": `${0.1 + k * 0.08}s` }} onClick={() => scrollToId(go)}><i>✓</i>{t}<em>→</em></button>)}</div>
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
