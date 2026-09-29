import { useEffect } from "react";
import { lockScroll, unlockScroll } from "./hooks";
import { NAME, TITLE, FOCUS, EMAIL, AUDIT } from "../data/profile";
import { EXPERIENCE, PROJECTS, SKILLS, EDU_CHAPTERS, PAPER, LANGUAGES } from "../data/constants";

/*
 * Quick read: the whole profile on one clean, printable page. For anyone who wants
 * the facts without the story. "Save as PDF" uses the browser's print dialog.
 */
const LINKS = [["LinkedIn", "https://www.linkedin.com/in/farhanshahriyar"], ["GitHub", "https://github.com/Shahriyar31"], ["Argus AI", "https://eu-ai-act-governance-platform.vercel.app"]];

export default function QuickRead({ open, onClose, onOpenCv }) {
    useEffect(() => {
        if (!open) return;
        const esc = e => e.key === "Escape" && onClose();
        window.addEventListener("keydown", esc);
        lockScroll(); document.body.classList.add("qr-open");
        return () => { window.removeEventListener("keydown", esc); unlockScroll(); document.body.classList.remove("qr-open"); };
    }, [open, onClose]);
    if (!open) return null;
    const main = PROJECTS.filter(p => [1, 2].includes(p.id)), earlier = PROJECTS.filter(p => ![1, 2].includes(p.id));

    return (
        <div className="qr" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Quick read" onClick={e => e.target === e.currentTarget && onClose()}>
            <article className="qr-page">
                <div className="qr-bar no-print">
                    <span className="mono">Quick read · 60 seconds</span>
                    <div><button onClick={() => window.print()}>Save as PDF</button><button onClick={() => { onClose(); onOpenCv(); }}>Résumé</button><button onClick={onClose} aria-label="Close">×</button></div>
                </div>
                <header className="qr-head">
                    <div><h2>{NAME}</h2><p className="qr-title">{TITLE}</p><p>{FOCUS}</p></div>
                    <p className="qr-contact"><a href={`mailto:${EMAIL}`}>{EMAIL}</a>{LINKS.map(([t, u]) => <a key={t} href={u} target="_blank" rel="noreferrer">{t}</a>)}</p>
                </header>
                <dl className="qr-facts">{AUDIT.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>

                <section><h3>Experience</h3>
                    {EXPERIENCE.map(e => <div key={e.id} className="qr-item"><p><b>{e.role}</b></p><p className="qr-meta">{e.company} · {e.location} · {e.date}</p><ul>{e.focus.map(f => <li key={f.k}><b>{f.k}{f.when ? ` (${f.when})` : ""}:</b> {f.d}</li>)}</ul></div>)}
                </section>
                <section><h3>Selected projects</h3>
                    {main.map(p => <div key={p.id} className="qr-item"><p><b>{p.title}</b>, {p.sub}</p><p>{p.desc}</p>{p.points && <ul>{p.points.map(t => <li key={t}>{t}</li>)}</ul>}<p className="qr-meta">{p.tags.join(" · ")}</p></div>)}
                    <p className="qr-meta">Earlier: {earlier.map(p => `${p.title} (${p.sub})`).join(" · ")}</p>
                </section>
                <section><h3>Publication</h3><div className="qr-item"><p><b>{PAPER.title}</b></p><p className="qr-meta">{PAPER.where} · {PAPER.when}</p></div></section>
                <section><h3>Education</h3>
                    {EDU_CHAPTERS.slice().reverse().map(c => <div key={c.num} className="qr-item"><p><b>{c.degree}</b></p><p className="qr-meta">{c.school} · {c.year}{c.num === "01" ? " · CGPA 8.73 / 10" : ""}</p></div>)}
                </section>
                <section><h3>Skills</h3>
                    <dl className="qr-facts">{Object.entries(SKILLS).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v.join(" · ")}</dd></div>)}</dl>
                    <p className="qr-meta">Languages: {LANGUAGES.map(([l, v]) => `${l} (${v})`).join(" · ")}</p>
                </section>
            </article>
        </div>
    );
}
