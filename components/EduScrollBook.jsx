import { useState, useEffect, useRef } from "react";
import { EDU_CHAPTERS } from "../data/constants";

export default function EduScrollBook({ T }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const dark = T.bg === "#1a1a22";
    const wrapRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const el = wrapRef.current; if (!el) return;
        const onScroll = () => {
            const rect = el.getBoundingClientRect();
            const total = el.offsetHeight - window.innerHeight;
            const scrolled = -rect.top;
            const p = Math.max(0, Math.min(1, scrolled / total));
            setProgress(p);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const ch2translateY = Math.max(0, Math.min(100, (1 - (Math.max(0, progress - 0.15) / 0.4)) * 100));
    const ch1opacity = Math.max(0, Math.min(1, 1 - (progress - 0.4) / 0.25));
    const ch1scale = 1 - Math.max(0, Math.min(0.04, (progress - 0.15) * 0.1));

    const renderPage = (ch) => {
        const ac = T[ch.accent];
        return (
            <div style={{ width: "100%", height: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", position: "relative" }}>
                {/* LEFT panel */}
                <div style={{ position: "relative", background: `linear-gradient(135deg,${ac}18,${ac}05)`, padding: "72px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", borderRight: `1px solid ${T.border}` }}>
                    <div style={{ position: "absolute", bottom: -32, left: -16, ...sf, fontSize: "clamp(140px,18vw,240px)", fontWeight: 800, color: ac, opacity: .06, lineHeight: 1, userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap" }}>{ch.year.split("–")[0]}</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <span style={{ fontSize: 40, animation: "float 8s ease-in-out infinite" }}>{ch.icon}</span>
                            <div>
                                <div style={{ ...fm, fontSize: 9, color: ac, letterSpacing: ".22em", textTransform: "uppercase" }}>{ch.label}</div>
                                <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".08em", marginTop: 2 }}>{ch.year}</div>
                            </div>
                            {ch.live && (
                                <span style={{ marginLeft: "auto", ...fm, fontSize: 8, color: T.a3, border: `1px solid ${T.a3}40`, padding: "3px 10px", borderRadius: 10, background: `${T.a3}0e`, display: "flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.a3, animation: "blink 1.5s ease-in-out infinite" }} />LIVE
                                </span>
                            )}
                        </div>
                        <div style={{ ...fm, fontSize: 10, color: ac, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>{ch.tag}</div>
                        <div style={{ ...sf, fontSize: "clamp(26px,3.5vw,46px)", fontWeight: 800, color: T.t, lineHeight: 1.05, marginBottom: 10 }}>{ch.degree}</div>
                        <div style={{ ...fm, fontSize: 11, color: T.m, marginBottom: 36 }}>{ch.school}</div>
                        <div style={{ ...fm, fontSize: 10, color: T.m, display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
                            <span>📍</span>{ch.location}
                        </div>
                        <div style={{ display: "flex", gap: 0, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}` }}>
                            {ch.stats.map(([n, l], i) => (
                                <div key={i} style={{ flex: 1, padding: "18px 16px", borderRight: i < ch.stats.length - 1 ? `1px solid ${T.border}` : "none", textAlign: "center", background: T.card }}>
                                    <div style={{ ...sf, fontSize: 28, fontWeight: 800, color: ac, lineHeight: 1 }}>{n}</div>
                                    <div style={{ ...fm, fontSize: 8, color: T.m, letterSpacing: ".07em", marginTop: 4 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 6, alignItems: "center" }}>
                        {EDU_CHAPTERS.map((_, i) => (
                            <div key={i} style={{ height: 3, borderRadius: 2, width: i === (ch === EDU_CHAPTERS[0] ? 0 : 1) ? 24 : 8, background: i === (ch === EDU_CHAPTERS[0] ? 0 : 1) ? ac : T.border, transition: "all .3s" }} />
                        ))}
                        <span style={{ ...fm, fontSize: 8, color: T.m, marginLeft: 8, letterSpacing: ".1em" }}>{ch.num} / 0{EDU_CHAPTERS.length}</span>
                    </div>
                </div>

                {/* RIGHT panel */}
                <div style={{ padding: "72px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", background: T.card }}>
                    <div>
                        <div style={{ borderLeft: `4px solid ${ac}`, paddingLeft: 22, marginBottom: 32 }}>
                            <div style={{ ...sf, fontSize: 22, fontStyle: "italic", fontWeight: 600, color: T.t, lineHeight: 1.4 }}>"{ch.quote}"</div>
                        </div>
                        <p style={{ fontSize: 14, color: T.m, lineHeight: 2, marginBottom: 32 }}>{ch.body}</p>
                        <div style={{ ...fm, fontSize: 8, color: T.m, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>Core subjects</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {ch.pills.map(s => (
                                <span key={s} style={{ ...fm, fontSize: 10, padding: "6px 14px", borderRadius: 20, border: `1px solid ${ac}35`, color: ac, background: `${ac}0a` }}>{s}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ ...fm, fontSize: 9, color: T.dim, letterSpacing: ".1em", display: "flex", alignItems: "center", gap: 8, opacity: .7 }}>
                        {ch === EDU_CHAPTERS[0]
                            ? <><span style={{ animation: "float 2s ease-in-out infinite", display: "inline-block" }}>↓</span> SCROLL TO TURN PAGE</>
                            : <><span style={{ color: T.a3 }}>●</span> CURRENTLY ENROLLED</>
                        }
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div ref={wrapRef} style={{ height: `${EDU_CHAPTERS.length * 180}vh`, position: "relative" }}>
            <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", boxShadow: dark ? "0 0 80px rgba(0,0,0,.6)" : "0 0 60px rgba(0,0,0,.08)" }}>
                <div style={{ position: "absolute", inset: 0, transform: `scale(${ch1scale})`, opacity: ch1opacity, transformOrigin: "center center", borderRadius: ch1scale < 1 ? 16 : 0, overflow: "hidden" }}>
                    {renderPage(EDU_CHAPTERS[0])}
                </div>
                <div style={{ position: "absolute", inset: 0, transform: `translateY(${ch2translateY}%)`, boxShadow: dark ? "0 -20px 60px rgba(0,0,0,.5)" : "0 -20px 60px rgba(0,0,0,.12)", borderRadius: ch2translateY > 0 ? "20px 20px 0 0" : 0, overflow: "hidden" }}>
                    {renderPage(EDU_CHAPTERS[1])}
                    {ch2translateY > 0 && (
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to bottom,rgba(0,0,0,.15),transparent)" }} />
                    )}
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "transparent", zIndex: 20 }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg,${T[EDU_CHAPTERS[0].accent]},${T[EDU_CHAPTERS[1].accent]})`, width: `${progress * 100}%` }} />
                </div>
            </div>
        </div>
    );
}
