import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Mag from "./Mag";

const fm = { fontFamily: "'Inter', sans-serif" };
const sf = { fontFamily: "'Sora', sans-serif" };
const NAV_LINKS = [
    ["about", "About"],
    ["experience", "Exp"],
    ["projects", "Projects"],
    ["skills", "Skills"],
    ["contact", "Contact"],
];
const MENU_LINKS = [
    ["about", "About"],
    ["experience", "Experience"],
    ["projects", "Projects"],
    ["skills", "Skills"],
    ["education", "Education"],
    ["contact", "Contact"],
];

export default function Nav({ active, scrollTo, onOpenResume }) {
    const { T, dark, setDark } = useTheme();
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "auto";
    }, [menuOpen]);

    return (
        <>
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: isMobile ? "16px 20px" : "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.nav, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ position: "relative", zIndex: 300 }}>
                    <span
                        onClick={e => { scrollTo("home", e); setMenuOpen(false); }}
                        style={{ ...fm, fontSize: 14, color: T.a, fontWeight: 700, letterSpacing: ".1em", cursor: "pointer" }}>
                        FS<span style={{ color: T.m }}>.</span>dev
                    </span>
                </div>

                {!isMobile ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {NAV_LINKS.map(([id, label]) => (
                            <a key={id} href={`#${id}`} onClick={e => scrollTo(id, e)}
                                className={`nav-link${active === id ? " active-link" : ""}`}
                                style={{ color: active === id ? "#fff" : T.m, "--ca": T.a, "--ca2": T.a2 }}>
                                {label}
                            </a>
                        ))}
                        <Mag as="button" onClick={onOpenResume}
                            style={{ ...fm, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: T.bg, background: T.a, padding: "9px 22px", borderRadius: 24, fontWeight: 700, transition: "opacity .2s", border: "none", cursor: "pointer" }}>
                            View CV
                        </Mag>
                        <Mag as="button" onClick={() => setDark(d => !d)}
                            style={{ width: 38, height: 38, borderRadius: "50%", background: dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all .2s" }}>
                            {dark ? "☀" : "🌙"}
                        </Mag>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 300 }}>
                        <button onClick={() => setDark(d => !d)}
                            style={{ width: 36, height: 36, borderRadius: "50%", background: dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)", border: `1px solid ${T.border}`, color: T.t, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all .2s" }}>
                            {dark ? "☀" : "🌙"}
                        </button>
                        <div
                            onClick={() => setMenuOpen(o => !o)}
                            style={{
                                width: 42, height: 42, position: "relative", cursor: "pointer", zIndex: 301,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                borderRadius: menuOpen ? "50%" : "30% 70% 70% 30% / 30% 30% 70% 70%",
                                background: menuOpen ? "transparent" : T.a + "15",
                                border: menuOpen ? "none" : `1px solid ${T.a}40`,
                                transform: menuOpen ? "rotate(0deg)" : "rotate(45deg)",
                                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                            }}>
                            {!menuOpen ? (
                                <div style={{ transform: "rotate(-45deg)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.a }} />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ position: "relative", width: 24, height: 24 }}>
                                    <span style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 2, background: T.t, borderRadius: 2, transform: "rotate(45deg)" }} />
                                    <span style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 2, background: T.t, borderRadius: 2, transform: "rotate(-45deg)" }} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Fullscreen Mobile Menu Overlay */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 199,
                background: dark ? "rgba(10,10,16,0.98)" : "rgba(250,250,250,0.98)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px",
                transform: menuOpen ? "translateY(0)" : "translateY(-100%)",
                opacity: menuOpen ? 1 : 0,
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                pointerEvents: menuOpen ? "auto" : "none",
            }}>
                {MENU_LINKS.map(([id, label], i) => (
                    <a key={id} href={`#${id}`} onClick={e => { scrollTo(id, e); setMenuOpen(false); }}
                        style={{
                            ...sf, fontSize: "40px", fontWeight: 800,
                            color: active === id ? T.a : T.t,
                            textDecoration: "none",
                            opacity: menuOpen ? 1 : 0,
                            transform: menuOpen ? "translateY(0)" : "translateY(-20px)",
                            transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${menuOpen ? 0.1 + i * 0.05 : 0}s`,
                        }}>
                        {label}
                    </a>
                ))}
                <button
                    onClick={() => { onOpenResume(); setMenuOpen(false); }}
                    style={{
                        marginTop: 20, ...fm, fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase",
                        color: T.bg, background: T.a, padding: "16px 40px", borderRadius: 30, fontWeight: 700, border: "none", cursor: "pointer",
                        opacity: menuOpen ? 1 : 0,
                        transform: menuOpen ? "translateY(0)" : "translateY(-20px)",
                        transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${menuOpen ? 0.4 : 0}s`,
                    }}>
                    View CV
                </button>
            </div>
        </>
    );
}
