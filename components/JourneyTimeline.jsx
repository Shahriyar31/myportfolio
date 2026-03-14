import { useState, useEffect, useRef } from "react";

export default function JourneyTimeline({ T }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const steps = [
        { year: "2018", loc: "West Bengal, India 🇮🇳", title: "B.Tech Computer Science", desc: "Started engineering at Coochbehar GEC. Graduated with 8.73/10 CGPA.", color: T.a2, icon: "🎓" },
        { year: "2022", loc: "India", title: "Graduated & Prepared", desc: "One year of focused preparation — language learning, applications, life planning.", color: T.a3, icon: "📚" },
        { year: "2023", loc: "Hamburg, Germany 🇩🇪", title: "Moved to Hamburg", desc: "Enrolled in MSc Data Science at TUHH. New country, new language, new chapter.", color: T.a, icon: "✈️" },
        { year: "2025", loc: "Nordex SE, Hamburg", title: "AI & Data Engineering", desc: "Built internal AI assistant from scratch — RAG over 1,690 docs, LLM eval, production deployment.", color: T.a2, icon: "⚡" },
        { year: "Now", loc: "Hamburg", title: "Open to Opportunities", desc: "Seeking full-time & Werkstudent roles in AI/ML Engineering and Data Engineering.", color: T.a3, icon: "🚀" },
    ];
    const [vis, setVis] = useState(false); const ref = useRef(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: .15 });
        if (ref.current) obs.observe(ref.current); return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} style={{ position: "relative", paddingLeft: 32 }}>
            <div style={{ position: "absolute", left: 10, top: 12, bottom: 12, width: 2, background: `linear-gradient(to bottom,${T.a},${T.a2},${T.a3})`, borderRadius: 2, opacity: .35, transform: vis ? "scaleY(1)" : "scaleY(0)", transformOrigin: "top", transition: "transform 1.2s cubic-bezier(.16,1,.3,1)" }} />
            {steps.map((s, i) => (
                <div key={i} style={{ position: "relative", marginBottom: i < steps.length - 1 ? 28 : 0, opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-20px)", transition: `opacity .6s ${i * .12}s ease,transform .6s ${i * .12}s ease` }}>
                    <div style={{ position: "absolute", left: -26, top: 4, width: 16, height: 16, borderRadius: "50%", background: s.color, border: `3px solid ${T.bg}`, boxShadow: `0 0 12px ${s.color}60`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }} />
                    <div style={{ padding: "16px 20px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, backdropFilter: "blur(8px)", transition: "all .25s", cursor: "none" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.boxShadow = `-3px 0 16px ${s.color}20`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 16 }}>{s.icon}</span>
                                <span style={{ ...sf, fontSize: 15, fontWeight: 700, color: T.t }}>{s.title}</span>
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                                <span style={{ ...fm, fontSize: 9, color: s.color, border: `1px solid ${s.color}40`, padding: "2px 8px", borderRadius: 8, background: `${s.color}0e`, fontWeight: 600 }}>{s.year}</span>
                            </div>
                        </div>
                        <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".06em", marginBottom: 6 }}>{s.loc}</div>
                        <div style={{ fontSize: 12, color: T.m, lineHeight: 1.75 }}>{s.desc}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
