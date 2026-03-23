import { useState, useRef } from "react";

export default function PCard({ p, T, i }) {
    const ref = useRef(null); const [hov, setHov] = useState(false); const [mx, setMx] = useState(50); const [my, setMy] = useState(50);
    const dark = T.bg === "#1a1a22";
    const onMove = e => {
        const r = ref.current?.getBoundingClientRect(); if (!r) return;
        setMx((e.clientX - r.left) / r.width * 100); setMy((e.clientY - r.top) / r.height * 100);
        const rx = (e.clientX - r.left) / r.width - .5, ry = (e.clientY - r.top) / r.height - .5;
        ref.current.style.transform = `perspective(1000px) rotateY(${rx * 16}deg) rotateX(${-ry * 12}deg) translateZ(12px)`;
    };
    const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(1000px) rotateY(0) rotateX(0) translateZ(0)"; setHov(false); };
    return (
        <div ref={ref} className="pcard" onMouseMove={onMove} onMouseEnter={() => setHov(true)} onMouseLeave={onLeave}
            style={{
                position: "relative", overflow: "hidden", padding: 28, cursor: "none", willChange: "transform",
                transition: "transform .1s ease,box-shadow .3s ease,border-color .3s ease",
                borderRadius: 16,
                background: T.card,
                border: `1px solid ${hov ? T.a : T.border}`,
                boxShadow: "none"
            }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: hov ? 0.7 : 0, transition: "opacity .3s", background: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <span style={{ fontSize: 28, filter: "none", animation: "none" }}>{p.icon}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 20, border: `1px solid ${p.color}60`, color: p.color, background: `${p.color}12` }}>{p.badge}</span>
                </div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 4, color: T.t }}>{p.title}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.m, marginBottom: 12, letterSpacing: ".04em" }}>{p.sub}</div>
                <div style={{ fontSize: 13, color: T.m, lineHeight: 1.8, marginBottom: 16 }}>{p.desc}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                    {p.tags.map(t => <span key={t} style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: hov ? p.color : T.m, background: hov ? `${p.color}12` : dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)", border: `1px solid ${hov ? p.color + "44" : T.border}`, padding: "3px 8px", borderRadius: 6, transition: "all .2s" }}>{t}</span>)}
                </div>
                {p.link
                    ? <a href={p.link} target="_blank" rel="noreferrer" style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: p.color, textDecoration: "none", letterSpacing: ".1em", textTransform: "uppercase", cursor: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>View on GitHub →</a>
                    : <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.m }}>🔒 Private · Nordex internal</span>}
            </div>
        </div>
    );
}
