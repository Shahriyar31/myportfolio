import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { scrollToId, reducedMotion } from "./hooks";

/* ── Icons (24px, 1.6 stroke) ── */
const I = {
    home: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="2.6" /></>,
    agent: <><rect x="4" y="7" width="16" height="12" rx="3.5" /><path d="M12 7V4M9 12h.01M15 12h.01M9.5 15.5h5" /><circle cx="12" cy="3.5" r=".8" /></>,
    route: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></>,
    work: <><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" /></>,
    built: <><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z" /><path d="M12 12 20 7.5M12 12 4 7.5M12 12v9" /></>,
    keys: <><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10" /></>,
    lens: <><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" /><circle cx="12" cy="12.5" r="3.5" /></>,
    hello: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>,
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
    doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    shield: <><path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6z" /><path d="m9 12 2 2 4-4" /></>,
    bring: <path d="M12 3l2.2 5.6L20 9.4l-4.5 3.9 1.4 5.9L12 16.1l-4.9 3.1 1.4-5.9L4 9.4l5.8-.8z" />,
    layers: <><path d="M12 3 3 8l9 5 9-5z" /><path d="m3 13 9 5 9-5" /></>,
    grad: <><path d="M2 9.5 12 5l10 4.5-10 4.5z" /><path d="M6 11.5v4.5c3.5 2.7 8.5 2.7 12 0v-4.5M22 9.5v5" /></>,
};
export const Icon = ({ n, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[n]}</svg>
);

export const SECTIONS = [
    ["home", "Home", "home"],
    ["bring", "What I do", "bring"],
    ["game", "Play: stop the attack", "shield"],
    ["work", "Experience · Nordex HQ", "work"],
    ["built", "Projects", "built"],
    ["story", "Education", "grad"],
    ["skills", "Skills", "keys"],
    ["agent", "Ask my AI", "agent"],
    ["lens", "Photography", "lens"],
    ["hello", "Contact", "hello"],
];

/* ── Preloader: the FS monogram, once per session ── */
export function Preloader({ onReveal }) {
    const skip = useRef((() => {
        try { return sessionStorage.getItem("fs-seen") === "1" || reducedMotion(); } catch { return reducedMotion(); }
    })()).current;
    const [phase, setPhase] = useState(skip ? "gone" : "load");
    useEffect(() => {
        let alive = true;
        const min = new Promise(r => setTimeout(r, skip ? 0 : 1100));
        const cap = new Promise(r => setTimeout(r, 2500));
        Promise.race([Promise.all([document.fonts?.ready, min]), cap]).then(() => {
            if (!alive) return;
            if (skip) { onReveal(); return; }
            try { sessionStorage.setItem("fs-seen", "1"); } catch { /* private mode */ }
            setPhase("exit");
            setTimeout(onReveal, 250);
            setTimeout(() => alive && setPhase("gone"), 1100);
        });
        return () => { alive = false; };
    }, [skip, onReveal]);
    if (phase === "gone") return null;
    return (
        <div className={`pre ${phase === "exit" ? "is-exit" : ""}`} aria-hidden="true">
            <div className="pre-dial neu-lg"><span className="pre-mark">FS</span></div>
            <span className="mono">Farhan Shahriyar · AI &amp; Data Engineer</span>
        </div>
    );
}

/* ── Top bar ── */
export function TopBar({ onOpenCv, onMenu, menu }) {
    const { dark, setDark } = useTheme();
    const [hidden, setHidden] = useState(false);
    const [solid, setSolid] = useState(false);
    useEffect(() => {
        let last = 0;
        const on = () => { const y = window.scrollY; setHidden(y > last && y > 300); setSolid(y > 120); last = y; };
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);
    return (
        <header className={`top ${hidden && !menu ? "is-hidden" : ""} ${solid ? "is-solid" : ""}`}>
            <a href="#home" className="brand" onClick={e => { e.preventDefault(); scrollToId("home"); }} aria-label="Farhan Shahriyar — back to top">
                <span className="brand-mark neu-sm" aria-hidden="true">FS</span>
                <span className="brand-name">Farhan Shahriyar<small className="mono">AI &amp; Data Engineer</small></span>
            </a>
            <div className="top-right">
                <button className={`toggle ${dark ? "" : "is-on"}`} onClick={() => setDark(!dark)} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} role="switch" aria-checked={!dark}>
                    <span className="toggle-knob"><Icon n={dark ? "moon" : "sun"} size={14} /></span>
                </button>
                <button className="key key-sm top-cv" onClick={onOpenCv}><Icon n="doc" size={16} />Résumé</button>
                <button className="key key-sm top-menu" onClick={onMenu} aria-expanded={menu}>{menu ? "Close" : "Menu"}</button>
            </div>
        </header>
    );
}

/* ── Right-side rail: pressed-in button marks the current act ── */
export function Rail() {
    const [active, setActive] = useState("home");
    const fillRef = useRef(null);
    useEffect(() => {
        const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -54% 0px" });
        SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
        const on = () => {
            const max = document.documentElement.scrollHeight - innerHeight;
            if (fillRef.current) fillRef.current.style.transform = `scaleY(${max > 0 ? scrollY / max : 0})`;
        };
        on();
        window.addEventListener("scroll", on, { passive: true });
        return () => { io.disconnect(); window.removeEventListener("scroll", on); };
    }, []);
    return (
        <nav className="rail neu-lg" aria-label="Sections">
            {SECTIONS.map(([id, label, icon]) => (
                <button key={id} className={`rail-btn ${active === id ? "is-on" : ""}`} onClick={() => scrollToId(id)} aria-label={label} aria-current={active === id ? "true" : undefined}>
                    <Icon n={icon} />
                    <span className="rail-tip mono">{label}</span>
                </button>
            ))}
            <span className="rail-track neu-in-sm" aria-hidden="true"><i ref={fillRef} /></span>
        </nav>
    );
}

/* ── Mobile menu ── */
export function Menu({ open, onClose, onOpenCv }) {
    useEffect(() => {
        document.body.classList.toggle("is-locked", open);
        if (open) window.__lenis?.stop(); else window.__lenis?.start();
    }, [open]);
    return (
        <div className={`menu ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
            <nav className="menu-grid">
                {SECTIONS.map(([id, label, icon], i) => (
                    <button key={id} className="menu-item neu" style={{ transitionDelay: `${open ? 80 + i * 40 : 0}ms` }} onClick={() => { onClose(); setTimeout(() => scrollToId(id), 300); }}>
                        <Icon n={icon} size={22} /><span>{label}</span><span className="mono">0{i + 1}</span>
                    </button>
                ))}
            </nav>
            <button className="key key-accent" onClick={() => { onClose(); onOpenCv(); }}><Icon n="doc" size={16} />Résumé</button>
        </div>
    );
}

/* ── CV modal: shows the PDF if deployed, otherwise asks by email ── */
export const RESUME_URL = "/Farhan_Shahriyar_Resume.pdf";
export function CvModal({ open, onClose }) {
    const [ok, setOk] = useState(null);
    useEffect(() => {
        if (!open) return;
        fetch(RESUME_URL, { method: "HEAD" })
            .then(r => setOk(r.ok && (r.headers.get("content-type") || "").includes("pdf")))
            .catch(() => setOk(false));
        const esc = e => e.key === "Escape" && onClose();
        window.addEventListener("keydown", esc);
        window.__lenis?.stop();
        document.body.classList.add("is-locked");
        return () => { window.removeEventListener("keydown", esc); window.__lenis?.start(); document.body.classList.remove("is-locked"); };
    }, [open, onClose]);
    if (!open) return null;
    return (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Résumé" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-card neu-lg">
                <div className="modal-bar">
                    <span className="mono">Résumé — Farhan Shahriyar</span>
                    <div style={{ display: "flex", gap: 10 }}>
                        {ok && <a className="key key-sm" href={RESUME_URL} download>Download</a>}
                        <button className="key key-sm" onClick={onClose} autoFocus>Close</button>
                    </div>
                </div>
                {ok ? <iframe title="Résumé PDF" src={RESUME_URL} /> : (
                    <div className="modal-empty">
                        <span className="mono">{ok === null ? "Checking…" : "Available on request"}</span>
                        {ok === false && <>
                            <h3>Happy to send my CV.</h3>
                            <div className="row">
                                <a className="key key-accent" href="mailto:shahriyarfarhan3101@gmail.com?subject=CV%20request">Request by email</a>
                                <a className="key" href="https://www.linkedin.com/in/farhanshahriyar" target="_blank" rel="noreferrer">LinkedIn</a>
                            </div>
                        </>}
                    </div>
                )}
            </div>
        </div>
    );
}
