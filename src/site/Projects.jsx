import { useState } from "react";
import { Head } from "./Hero";
import { Fade } from "./Motion";
import Preview from "./Previews";
import { PROJECTS } from "../data/constants";

/* 04 · Selected work — the flagship first, then research, then where I started. */

function Early({ p }) {
    const [open, setOpen] = useState(false);
    return (
        <li className={`v-early ${open ? "is-open" : ""}`}>
            <span className="mono">{p.badge}</span><b>{p.title}</b><small>{p.sub}</small>
            <span className="v-early-act"><button onClick={() => setOpen(o => !o)} aria-expanded={open}>{open ? "Hide" : "Try it ▸"}</button>{p.link && <a href={p.link} target="_blank" rel="noreferrer">Code ↗</a>}</span>
            {open && <Preview id={p.id} />}
        </li>
    );
}

export default function Projects() {
    const argus = PROJECTS.find(p => p.id === 1), twin = PROJECTS.find(p => p.id === 2), earlier = PROJECTS.filter(p => ![1, 2].includes(p.id));
    return (
        <section id="work" className="v-sec">
            <div className="v-wrap">
                <Head n="04" kicker="Selected work" title="Proof, not promises." />
                <Fade className="v-feature">
                    <div>
                        <span className="v-chip mono"><i className="dot-live" />Live · free beta</span>
                        <h3>Argus AI</h3>
                        <p className="v-feature-sub">EU AI Act compliance, as an AI agent.</p>
                        <p>{argus.desc}</p>
                        <p className="v-job-tech mono">{argus.tags.join(" · ")}</p>
                        <div className="v-ctas"><a className="v-btn is-main" href={argus.link} target="_blank" rel="noreferrer">Open Argus AI ↗</a></div>
                    </div>
                    <ul className="v-feature-facts">
                        <li><b>4</b>EU AI Act risk tiers, with article-level reasons</li>
                        <li><b>10</b>OWASP LLM risks checked</li>
                        <li><b>1</b>human in the loop for high-risk cases</li>
                        <li><b>SHA-256</b>hash-chained audit trail</li>
                    </ul>
                </Fade>
                <div className="v-pair">
                    <Fade className="v-proj">
                        <span className="mono">{twin.badge} · TUHH</span>
                        <h3>{twin.title}</h3>
                        <p>{twin.desc}</p>
                        <p className="v-job-tech mono">{twin.tags.join(" · ")}</p>
                        <Preview id={twin.id} />
                        {twin.link && <a className="v-link" href={twin.link} target="_blank" rel="noreferrer">View code ↗</a>}
                    </Fade>
                    <Fade delay={120} className="v-proj">
                        <span className="mono">Earlier work</span>
                        <h3>Where I learned the basics</h3>
                        <p>Streaming data, computer vision and NLP, before I focused on AI engineering. Each one is a tiny demo.</p>
                        <ul className="v-earlies">{earlier.map(p => <Early key={p.id} p={p} />)}</ul>
                    </Fade>
                </div>
            </div>
        </section>
    );
}
