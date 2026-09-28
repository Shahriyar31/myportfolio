import { useEffect, useState } from "react";
import { Head } from "./Hero";
import { Fade } from "./Motion";
import Logo from "./Logo";
import BuildIt from "./BuildIt";
import KeepLegal from "./KeepLegal";
import ShipSafe from "./ShipSafe";
import { useProgress } from "./progress";
import { Glass } from "./GlassStage";

/*
 * 02 · What I do — three things, one sentence each. Each has an optional hands-on demo
 * that opens over the page, so the page itself stays short and readable.
 */

const CARDS = [
    { id: "build", layer: 2, n: "A", title: "Build AI that knows your business", plain: "Assistants and agents that answer from your own documents, with sources you can check.",
      tools: [["databricks", "Databricks"], ["azure", "Azure"], ["langchain", "LangGraph"], ["rag", "RAG"]], demo: "Make an AI agent stop guessing", Demo: BuildIt },
    { id: "legal", layer: 1, n: "B", title: "Keep it legal and trusted", plain: "I work out what the EU AI Act and GDPR require, then build it into the product.",
      tools: [["eu", "EU AI Act"], ["gdpr", "GDPR"], ["owasp", "OWASP LLM"], ["human", "Human review"]], demo: "Sort AI ideas by legal risk", Demo: KeepLegal },
    { id: "ship", layer: 0, n: "C", title: "Ship it safely", plain: "Secure pipelines: no leaked keys, no vulnerable parts, no data left open.",
      tools: [["azuredevops", "Azure DevOps"], ["terraform", "Terraform"], ["docker", "Docker"], ["ghactions", "GitHub Actions"]], demo: "Catch 3 problems before go-live", Demo: ShipSafe },
];

function DemoModal({ card, onClose }) {
    useEffect(() => {
        const esc = e => e.key === "Escape" && onClose();
        window.addEventListener("keydown", esc); window.addEventListener("demo-close", onClose);
        window.__lenis?.stop(); document.body.classList.add("is-locked");
        return () => { window.removeEventListener("keydown", esc); window.removeEventListener("demo-close", onClose); window.__lenis?.start(); document.body.classList.remove("is-locked"); };
    }, [onClose]);
    const { Demo } = card;
    return (
        <div className="v-modal" role="dialog" aria-modal="true" aria-label={card.demo} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="v-modal-box">
                <button className="v-modal-x" onClick={onClose} aria-label="Close demo">×</button>
                <Demo />
            </div>
        </div>
    );
}

export default function WhatIDo() {
    const [open, setOpen] = useState(null);
    const p = useProgress();
    return (
        <section id="what" className="v-sec">
            <div className="v-wrap">
                <div className="v-what-top">
                    <Head n="02" kicker="What I do" title="Three things, done properly." sub="Each one is a layer of the glass box. Hover a card to light it up, or open its 1-minute hands-on demo." />
                    <div className="v-glass-what" data-glass data-explode="1" aria-hidden="true" />
                </div>
                <div className="v-cards">
                    {CARDS.map((c, i) => (
                        <Fade key={c.id} delay={i * 110} className="v-card" onPointerEnter={() => Glass.box?.focus(c.layer)} onPointerLeave={() => Glass.box?.focus(-1)}>
                            <span className="v-card-n mono">{c.n}</span>
                            <h3>{c.title}</h3>
                            <p>{c.plain}</p>
                            <ul className="v-tools">{c.tools.map(([l, t]) => <li key={t}><Logo n={l} size={14} />{t}</li>)}</ul>
                            <button className="v-try" onClick={() => setOpen(c)}>
                                <span>{p[c.id]?.status === "solved" ? "✓ Solved · replay" : "Try it"}</span>{c.demo} →
                            </button>
                        </Fade>
                    ))}
                </div>
            </div>
            {open && <DemoModal card={open} onClose={() => setOpen(null)} />}
        </section>
    );
}
