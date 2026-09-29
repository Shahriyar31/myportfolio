import { useEffect, useRef, useState } from "react";
import { lockScroll, unlockScroll } from "./hooks";
import { NAME, TITLE, FOCUS, EMAIL } from "../data/profile";
import { EXPERIENCE, PROJECTS, SKILLS, EDU_CHAPTERS, PAPER, LANGUAGES } from "../data/constants";

/*
 * Quick read: built for a recruiter with one minute. The top half answers "who, what, why you" at a glance;
 * the details sit folded underneath; the actions stay pinned at the bottom. Printing opens every fold.
 */
const LINKS = [["LinkedIn", "https://www.linkedin.com/in/farhanshahriyar"], ["GitHub", "https://github.com/Shahriyar31"], ["Argus AI", "https://eu-ai-act-governance-platform.vercel.app"]];
const FIT = ["AI Engineer", "RAG & agents on Azure", "AI governance & security", "EU AI Act tooling"];

export default function QuickRead({ open, onClose, onOpenCv }) {
    const page = useRef(null), [p, setP] = useState(0), [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!open) return;
        const esc = e => e.key === "Escape" && onClose();
        const print = () => page.current?.querySelectorAll("details").forEach(d => { d.open = true; });
        window.addEventListener("keydown", esc); window.addEventListener("beforeprint", print);
        lockScroll(); document.body.classList.add("qr-open");
        return () => { window.removeEventListener("keydown", esc); window.removeEventListener("beforeprint", print); unlockScroll(); document.body.classList.remove("qr-open"); };
    }, [open, onClose]);
    if (!open) return null;
    const job = EXPERIENCE[0], [bt, ms] = EDU_CHAPTERS, argus = PROJECTS.find(x => x.id === 1), main = PROJECTS.filter(x => [1, 2].includes(x.id)), earlier = PROJECTS.filter(x => ![1, 2].includes(x.id));
    const copy = async () => { try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* blocked */ } };
    const onScroll = e => { const el = e.currentTarget; setP(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)); };
    const tldr = [
        <>Working student in <b>{job.role.split("—").pop().trim()}</b> at <b>{job.company}</b> since {job.date.split("—")[0].trim()}: {job.focus.map(f => f.k).join(", ")}.</>,
        <><b>{ms.degree}</b> at TUHH (since 2023); <b>{bt.degree}</b>, CGPA 8.73 / 10, top 10% of the class.</>,
        <>Built <b>{argus.title}</b>, a live {argus.sub}; preprint on the OWASP LLM Top 10 and the EU AI Act ({PAPER.when}).</>,
    ];
    const proof = [[String(job.focus.length), `AI workstreams at ${job.company}`], ["Live", `${argus.title}, ${argus.sub}`], ["Preprint", `${PAPER.when} · OWASP LLM × EU AI Act`], ["8.73", "B.Tech CGPA, top 10%"]];

    return (
        <div className="qr qr2" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Quick read" onClick={e => e.target === e.currentTarget && onClose()}>
            <article className="qr-page" ref={page} onScroll={onScroll}>
                <div className="qr2-progress no-print" aria-hidden="true"><i style={{ transform: `scaleX(${p})` }} /></div>
                <div className="qr-bar no-print">
                    <span className="mono">Quick read · 60 seconds</span>
                    <div><button onClick={() => window.print()}>Save as PDF</button><button onClick={onClose} aria-label="Close">×</button></div>
                </div>

                <header className="qr2-hero">
                    <img src="/images/profile-suit.jpg" alt={NAME} />
                    <div>
                        <h2>{NAME}</h2>
                        <p className="qr2-title">{TITLE} · {job.location}</p>
                        <p className="qr2-open"><i aria-hidden="true" />Open to AI engineering roles</p>
                    </div>
                </header>

                <section className="qr2-tldr">
                    <span className="qr2-hand">the 10-second version</span>
                    <ul>{tldr.map((t, k) => <li key={k}>{t}</li>)}</ul>
                </section>

                <div className="qr2-proof">{proof.map(([v, k]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}</div>

                <section className="qr2-fit"><span className="mono">Best fit for</span><div>{FIT.map(f => <em key={f}>{f}</em>)}</div></section>

                <section className="qr2-skills"><span className="mono">Top skills</span>
                    <dl>{Object.entries(SKILLS).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v.slice(0, 6).join(" · ")}</dd></div>)}</dl>
                </section>

                <details className="qr2-more"><summary>Experience in detail</summary>
                    {EXPERIENCE.map(e => <div key={e.id} className="qr-item"><p><b>{e.role}</b></p><p className="qr-meta">{e.company} · {e.location} · {e.date}</p><ul>{e.focus.map(f => <li key={f.k}><b>{f.k}{f.when ? ` (${f.when})` : ""}:</b> {f.d}</li>)}</ul></div>)}
                </details>
                <details className="qr2-more"><summary>Projects</summary>
                    {main.map(x => <div key={x.id} className="qr-item"><p><b>{x.title}</b>, {x.sub}</p><p>{x.desc}</p>{x.points && <ul>{x.points.map(t => <li key={t}>{t}</li>)}</ul>}<p className="qr-meta">{x.tags.join(" · ")}</p></div>)}
                    <p className="qr-meta">Earlier: {earlier.map(x => `${x.title} (${x.sub})`).join(" · ")}</p>
                </details>
                <details className="qr2-more"><summary>Publication, education and languages</summary>
                    <div className="qr-item"><p><b>{PAPER.title}</b></p><p className="qr-meta">{PAPER.where} · {PAPER.when}</p></div>
                    {EDU_CHAPTERS.slice().reverse().map(c => <div key={c.num} className="qr-item"><p><b>{c.degree}</b></p><p className="qr-meta">{c.school} · {c.year}{c.num === "01" ? " · CGPA 8.73 / 10" : ""}</p></div>)}
                    <p className="qr-meta">Languages: {LANGUAGES.map(([l, v]) => `${l} (${v})`).join(" · ")}</p>
                    <p className="qr-meta">{FOCUS}</p>
                </details>

                <footer className="qr2-actions no-print">
                    <a className="is-main" href={`mailto:${EMAIL}?subject=${encodeURIComponent("Hello from a recruiter")}`}>Email me</a>
                    <button onClick={copy}>{copied ? "Copied ✓" : "Copy email"}</button>
                    <a href={LINKS[0][1]} target="_blank" rel="noreferrer">LinkedIn</a>
                    <button onClick={() => { onClose(); onOpenCv(); }}>Résumé (PDF)</button>
                </footer>
                <p className="qr2-print-contact">{EMAIL} · {LINKS.map(([t, u]) => `${t}: ${u}`).join(" · ")}</p>
            </article>
        </div>
    );
}
