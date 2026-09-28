import { useEffect, useRef, useState } from "react";
import FrontDoor from "./FrontDoor";
import Logo from "./Logo";
import { scrollToId } from "./hooks";
import { openChat, ask } from "./chat";
import { J, STAGES, frame, settleAt } from "./journey";

/*
 * The opening of the site: you are a data packet. One tall runway; the 3D world
 * (World.jsx) flies the camera along with your packet, and this component shows
 * one chapter per stop plus the packet's own record, which changes as it goes.
 */

const CH = [
    null, // hero
    {
        n: "01", role: "AI Platforms · Azure & Databricks", verb: "Ingest", title: "Every AI starts with data.",
        lede: "Turbines and systems send raw data all day. I build the pipelines on Azure Databricks that take it in, so the AI has something real to stand on.",
        tools: [["databricks", "Databricks"], ["spark", "Spark"], ["azure", "Azure"], ["python", "Python"], ["sql", "SQL"]],
        proof: [["Databricks pipelines at Nordex", "work"], ["Earlier: streaming projects", "built"]],
    },
    {
        n: "02", role: "Data Platforms & Data Governance", verb: "Refine", title: "Then I make it trustworthy.",
        lede: "Bronze → silver → gold on Azure Databricks. Every table has an owner, a catalogue entry and lineage, so any number can answer “where did you come from?”",
        tools: [["databricks", "Unity Catalog"], ["spark", "Spark"], ["sql", "SQL"], ["azure", "Azure"], ["terraform", "Terraform"]],
        proof: [["Data governance & cataloguing at Nordex", "work"]],
    },
    {
        n: "03", role: "AI Governance · DevSecOps", verb: "Govern", title: "Lawful, and hard to trick.",
        lede: "Before data reaches an AI, it passes my gate: EU AI Act risk tiers, GDPR duties, OWASP LLM Top 10 guardrails, secure pipelines and an audit trail. Built in, not bolted on.",
        tools: [["eu", "EU AI Act"], ["gdpr", "GDPR"], ["owasp", "OWASP LLM"], ["azuredevops", "Azure DevOps"], ["terraform", "Terraform"]],
        proof: [["Argus AI · live compliance agent", "built"], ["AI governance at Nordex", "work"]],
        cta: ["Try to break my AI", () => { window.__lenis ? window.__lenis.scrollTo(0, { duration: 2 }) : scrollTo({ top: 0, behavior: "smooth" }); }],
    },
    {
        n: "04", role: "AI & Agentic Engineering", verb: "Reason", title: "Now AI can reason on it.",
        lede: "RAG and LangGraph agents that use tools, cite their sources, get evaluated, and hand over to a human when it matters.",
        tools: [["langchain", "LangGraph"], ["rag", "RAG"], ["fastapi", "FastAPI"], ["mlflow", "Evals"], ["azure", "Azure"]],
        proof: [["Argus AI agent", "built"], ["RAG prototypes at Nordex", "work"]],
        cta: ["Ask my AI — it works the same way", () => { openChat(true); ask("What does Farhan do?"); }],
    },
];

// the packet's own record — watch it change at every stop. [key, value, changed]
const REC = [
    [["source", '"turbine_07"'], ["status", '"waiting…"']],
    [["source", '"turbine_07"'], ["rpm", '"12.1 "', 1], ["temp_c", "NaN", 1], ["owner", "null", 1], ["ts", '"28/09 14:02"', 1]],
    [["source", '"turbine_07"'], ["rpm", "12.1", 1], ["temp_c", "41.2", 1], ["owner", '"asset-data"', 1], ["layer", '"gold"', 1], ["lineage", '"bronze→silver→gold"', 1], ["quality", "0.99", 1]],
    [["source", '"turbine_07"'], ["layer", '"gold"'], ["pii", '"masked"', 1], ["risk_tier", '"limited"', 1], ["injection", '"blocked"', 1], ["audit", '"sha256:9f3c…"', 1]],
    [["question", '"Is turbine 07 healthy?"', 1], ["answer", '"Yes — bearing temp normal"', 1], ["confidence", "0.98", 1], ["sources", "3 cited", 1], ["human", '"not needed"', 1]],
];
const STATE = ["UNTRUSTED", "RAW", "REFINED", "GOVERNED", "ANSWERED"];

export default function DataJourney({ ready, onOpenCv }) {
    const root = useRef(null), link = useRef(null), panels = useRef([]);
    const [stage, setStage] = useState(0), [shown, setShown] = useState(-1);

    useEffect(() => {
        let raf = 0, lastStage = -1, lastShown = -2;
        const loop = () => {
            const el = root.current, f = frame(J.p);
            el.style.setProperty("--sc", f.color);
            el.style.setProperty("--hero", String(f.i === 0 ? Math.max(0, 1 - Math.max(0, f.dwell - 0.55) / 0.35) : 0));
            // a chapter shows while its packet rests there, and lingers briefly as the packet leaves
            const on = f.i > 0 && f.e >= 1 && f.dwell > 0.02 ? f.i : f.i > 1 && f.e < 0.18 ? f.i - 1 : -1;
            if (on !== lastShown) { lastShown = on; setShown(on); }
            const st = f.i === 0 ? 0 : f.e > 0.5 ? f.i : f.i - 1;
            if (st !== lastStage) { lastStage = st; setStage(st); }
            // a thin line from the chapter to your packet in the world
            const pane = panels.current[on], sc = J.scene, lk = link.current;
            if (pane && sc && J.active) {
                const [x, y, front] = sc.project(...sc.packetPos.toArray()), r = pane.getBoundingClientRect();
                const right = x > r.right, sx = right ? r.right : r.left, sy = Math.min(Math.max(y, r.top + 40), r.bottom - 40);
                const ok = front && (x > r.right + 30 || x < r.left - 30) && r.width > 0;
                lk.classList.toggle("is-on", ok);
                if (ok) { const mx = (sx + x) / 2; lk.firstChild.setAttribute("d", `M${sx} ${sy} C${mx} ${sy} ${mx} ${y} ${x} ${y}`); lk.lastChild.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`); }
            } else lk.classList.remove("is-on");
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(raf);
    }, []);

    const jump = i => { const el = root.current, top = el.getBoundingClientRect().top + scrollY, y = top + settleAt(i) * (el.offsetHeight - innerHeight); (window.__lenis ? window.__lenis.scrollTo(y, { duration: 2.2 }) : scrollTo({ top: y, behavior: "smooth" })); };

    return (
        <section id="home" ref={root} className="dj" data-station="route" style={{ "--n": STAGES.reduce((s, x) => s + x.w, 0) }} aria-label="Farhan Shahriyar — what I do">
            <div className="dj-stick">
                <header className={`dj-hero ${ready ? "is-in" : ""}`}>
                    <FrontDoor ready={ready} onOpenCv={onOpenCv} onNext={() => jump(1)} />
                </header>

                {CH.map((c, i) => c && (
                    <article key={c.n} ref={el => { panels.current[i] = el; }} className={`dj-pane ${STAGES[i].side > 0 ? "is-left" : "is-right"} ${shown === i ? "is-on" : ""}`} aria-hidden={shown !== i}>
                        <div className="dj-kick mono"><span className="dj-n">{c.n}</span><span>{c.verb}</span><span className="dj-rolech">{c.role}</span></div>
                        <h2 className="dj-title">{c.title}</h2>
                        <p className="dj-lede">{c.lede}</p>
                        <ul className="dj-tools">{c.tools.map(([l, t]) => <li key={t}><Logo n={l} size={15} /><span>{t}</span></li>)}</ul>
                        <div className="dj-proof"><span className="mono">Proof</span>{c.proof.map(([t, id]) => <button key={t} onClick={() => scrollToId(id)} tabIndex={shown === i ? 0 : -1}>{t}</button>)}</div>
                        {c.cta && <button className="dj-cta" onClick={c.cta[1]} tabIndex={shown === i ? 0 : -1}>{c.cta[0]} <i aria-hidden="true">→</i></button>}
                    </article>
                ))}

                <aside className={`dj-rec ${stage > 0 ? "is-on" : ""}`} aria-label="Your data packet">
                    <div className="dj-rec-top mono"><span className="dj-dot" />packet · <b>{STATE[stage]}</b></div>
                    <pre key={stage} className="dj-rec-body">{"{\n"}{REC[stage].map(([k, v, ch], j) => <span key={k} className={ch ? "is-new" : ""} style={{ "--d": `${j * 90}ms` }}>{`  "${k}": `}<b>{v}</b>{j < REC[stage].length - 1 ? ",\n" : "\n"}</span>)}{"}"}</pre>
                </aside>

                <nav className="dj-steps" aria-label="Journey">
                    {CH.slice(1).map((c, k) => <button key={c.n} className={stage > k + 1 ? "is-done" : stage === k + 1 ? "is-cur" : ""} onClick={() => jump(k + 1)}><i /><span className="mono">{c.verb}</span></button>)}
                </nav>
            </div>
            <svg ref={link} className="dj-link" aria-hidden="true"><path /><g><circle className="ping" r="12" /><circle r="4" /></g></svg>
        </section>
    );
}
