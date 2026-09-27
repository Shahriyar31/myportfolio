import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Magnetic, Arrow } from "./Motion";
import { scrollToId, reducedMotion, finePointer } from "./hooks";

export const LINKS = [
    ["about", "About"],
    ["experience", "Experience"],
    ["work", "Work"],
    ["capabilities", "Capabilities"],
    ["contact", "Contact"],
];

export const SOCIALS = [
    ["GitHub", "https://github.com/Shahriyar31"],
    ["LinkedIn", "https://www.linkedin.com/in/farhanshahriyar"],
];

/* ── Preloader: counts to 100 once per session, then lifts like a curtain ── */
export function Preloader({ onReveal }) {
    const skip = useRef((() => {
        try { return sessionStorage.getItem("fs-seen") === "1" || reducedMotion(); } catch { return reducedMotion(); }
    })()).current;
    const [n, setN] = useState(0);
    const [phase, setPhase] = useState(skip ? "gone" : "count");

    useEffect(() => {
        if (skip) { onReveal(); return; }
        try { sessionStorage.setItem("fs-seen", "1"); } catch { /* private mode */ }
        let raf = 0, t0 = performance.now(), done = false;
        const D = 1500;
        const fonts = document.fonts?.ready ?? Promise.resolve();
        const tick = now => {
            const p = Math.min((now - t0) / D, 1);
            setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
            if (p < 1) raf = requestAnimationFrame(tick);
            else fonts.then(() => { if (!done) { done = true; setPhase("exit"); } });
        };
        raf = requestAnimationFrame(tick);
        return () => { done = true; cancelAnimationFrame(raf); };
    }, [skip, onReveal]);

    useEffect(() => {
        if (phase !== "exit") return;
        const a = setTimeout(onReveal, 350);
        const b = setTimeout(() => setPhase("gone"), 1100);
        return () => { clearTimeout(a); clearTimeout(b); };
    }, [phase, onReveal]);

    if (phase === "gone") return null;
    return (
        <div className={`pre ${phase === "exit" ? "is-exit" : ""}`} aria-hidden="true">
            <div className="pre-top"><span className="label">Farhan Shahriyar</span><span className="label">Portfolio ©{new Date().getFullYear()}</span></div>
            <div>
                <div className="pre-count">{String(n).padStart(3, "0")}</div>
                <div className="pre-bar"><i style={{ transform: `scaleX(${n / 100})` }} /></div>
            </div>
        </div>
    );
}

/* ── Nav ── */
export function Nav({ onOpenCv }) {
    const { dark, setDark } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [menu, setMenu] = useState(false);
    const [active, setActive] = useState("home");
    const progRef = useRef(null);

    useEffect(() => {
        let last = window.scrollY;
        const on = () => {
            const y = window.scrollY;
            setScrolled(y > 20);
            setHidden(y > last && y > 400);
            last = y;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (progRef.current) progRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        };
        on();
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);

    useEffect(() => {
        const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
        document.querySelectorAll("section[id]").forEach(s => io.observe(s));
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        document.body.classList.toggle("is-locked", menu);
        if (menu) window.__lenis?.stop(); else window.__lenis?.start();
        const esc = e => e.key === "Escape" && setMenu(false);
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [menu]);

    const go = (id, e) => { e?.preventDefault(); setMenu(false); setTimeout(() => scrollToId(id), menu ? 350 : 0); };

    return (
        <>
            <div className="progress" ref={progRef} />
            <header className={`nav wrap ${scrolled ? "is-scrolled" : ""} ${hidden && !menu ? "is-hidden" : ""}`}>
                <a href="#home" className="nav-logo" onClick={e => go("home", e)} aria-label="Farhan Shahriyar — home">
                    Farhan Shahriyar<sup>©{String(new Date().getFullYear()).slice(2)}</sup>
                </a>
                <nav className="nav-links" aria-label="Primary">
                    {LINKS.map(([id, label], i) => (
                        <a key={id} href={`#${id}`} className={active === id ? "on" : ""} onClick={e => go(id, e)}>
                            <sup>0{i + 1}</sup>{label}
                        </a>
                    ))}
                </nav>
                <div className="nav-right">
                    <button className="nav-theme" onClick={() => setDark(!dark)} aria-label={`Switch to ${dark ? "light" : "dark"} theme`}>
                        <i />{dark ? "Light" : "Dark"}
                    </button>
                    <Magnetic><a href="#contact" className="btn btn-solid btn-sm" onClick={e => go("contact", e)}>Let's talk</a></Magnetic>
                    <button className="nav-menu" onClick={() => setMenu(m => !m)} aria-expanded={menu} aria-controls="menu">{menu ? "Close" : "Menu"}</button>
                </div>
            </header>

            <div id="menu" className={`menu ${menu ? "is-open" : ""}`} aria-hidden={!menu}>
                <nav className="menu-links">
                    {LINKS.map(([id, label], i) => (
                        <a key={id} href={`#${id}`} onClick={e => go(id, e)} tabIndex={menu ? 0 : -1}><sup>0{i + 1}</sup>{label}</a>
                    ))}
                </nav>
                <div className="menu-foot">
                    <div style={{ display: "flex", gap: 20 }}>
                        {SOCIALS.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className="label" tabIndex={menu ? 0 : -1}>{l} ↗</a>)}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setMenu(false); onOpenCv(); }} tabIndex={menu ? 0 : -1}>Résumé <Arrow /></button>
                </div>
            </div>
        </>
    );
}

/* ── Cursor: accent dot that grows over links and shows a label on [data-cursor] ── */
export function Cursor() {
    const ref = useRef(null);
    const labelRef = useRef(null);
    useEffect(() => {
        if (!finePointer()) return;
        const el = ref.current;
        let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
        const move = e => {
            tx = e.clientX; ty = e.clientY;
            const t = e.target.closest?.("[data-cursor], a, button, [role=button]");
            const label = t?.getAttribute("data-cursor");
            el.classList.toggle("is-label", !!label);
            el.classList.toggle("is-link", !!t && !label);
            if (label) labelRef.current.textContent = label;
            el.classList.remove("is-hidden");
        };
        const hide = () => el.classList.add("is-hidden");
        const loop = () => {
            x += (tx - x) * 0.2; y += (ty - y) * 0.2;
            el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
            raf = requestAnimationFrame(loop);
        };
        loop();
        window.addEventListener("pointermove", move, { passive: true });
        document.documentElement.addEventListener("pointerleave", hide);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", move);
            document.documentElement.removeEventListener("pointerleave", hide);
        };
    }, []);
    if (typeof window !== "undefined" && !finePointer()) return null;
    return <div ref={ref} className="cursor is-hidden" aria-hidden="true"><span ref={labelRef} className="cursor-label" /></div>;
}
