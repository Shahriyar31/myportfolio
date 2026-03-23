import { useState, useEffect, useRef } from "react";
import { EDU_CHAPTERS } from "../data/constants";

/* ── Holographic Perspective Card ────────────────────────────────── */
function PerspectiveCard({ ch, active, side, onClick, T, dark, isMobile }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const accent = T[ch.accent];
    const cardRef = useRef(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!active || isMobile) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMouse({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    // Calculate 3D transforms
    const transform = isMobile
        ? (active ? "translateY(0) scale(1)" : `translateY(${side === "next" ? "60px" : "-60px"}) scale(0.9) rotateX(${side === "next" ? "-10deg" : "10deg"})`)
        : (active 
            ? "translateX(0) scale(1) rotateY(0deg) translateZ(0)" 
            : `translateX(${side === "next" ? "35%" : "-35%"}) scale(0.85) rotateY(${side === "next" ? "-28deg" : "28deg"}) translateZ(-150px)`);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMouse({ x: 50, y: 50 })}
            onClick={onClick}
            className="edu-persp-card"
            style={{
                position: isMobile ? "relative" : "absolute",
                width: isMobile ? "100%" : "880px",
                height: isMobile ? "auto" : "560px",
                left: isMobile ? 0 : "50%",
                top: isMobile ? 0 : "50%",
                marginLeft: isMobile ? 0 : "-440px",
                marginTop: isMobile ? 0 : "-280px",
                zIndex: active ? 10 : 5,
                transform,
                opacity: active ? 1 : 0.35,
                filter: active ? "none" : "blur(3px)",
                transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: active ? "default" : "pointer",
                borderRadius: 36,
                padding: 0,
                background: dark ? "rgba(20, 22, 28, 0.85)" : "rgba(255, 255, 255, 0.9)",
                border: `1px solid ${active ? accent + "70" : "rgba(255,255,255,0.08)"}`,
                backdropFilter: "blur(24px)",
                overflow: "hidden",
                boxShadow: active 
                    ? `0 60px 120px rgba(0,0,0,0.6), 0 0 50px ${accent}25` 
                    : "0 15px 45px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
            }}
        >
            <style>{`
                .edu-persp-card:hover {
                    ${active && !isMobile ? "transform: translateX(0) scale(1.02) rotateY(0deg) translateZ(20px) !important;" : ""}
                    ${!active && !isMobile ? "opacity: 0.6 !important; filter: blur(1px) !important;" : ""}
                }
            `}</style>
            {/* Holographic Flash Effect */}
            {active && !isMobile && (
                <div style={{
                    position: "absolute", inset: 0,
                    background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, ${accent}15 0%, transparent 60%)`,
                    pointerEvents: "none", zIndex: 0
                }} />
            )}

            {/* Left: Decorative Number + Year */}
            <div style={{
                width: isMobile ? "100%" : "120px",
                background: active ? `${accent}10` : "transparent",
                borderRight: isMobile ? "none" : `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                display: "flex", flexDirection: isMobile ? "row" : "column",
                alignItems: "center", justifyContent: "space-between",
                padding: isMobile ? "20px" : "40px 0",
                position: "relative", zIndex: 1
            }}>
                <div style={{ ...sf, fontSize: 42, fontWeight: 900, color: accent, opacity: 0.5 }}>{ch.num}</div>
                <div style={{ 
                    ...fm, fontSize: 12, fontWeight: 700, color: T.m, 
                    transform: isMobile ? "none" : "rotate(-90deg)", 
                    whiteSpace: "nowrap", letterSpacing: "2px"
                }}>
                    {ch.year}
                </div>
            </div>

            {/* Right: Content Area */}
            <div style={{ flex: 1, padding: isMobile ? "30px 24px" : "48px 54px", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ 
                        background: `${accent}14`, border: `1px solid ${accent}30`, 
                        padding: "6px 16px", borderRadius: 100,
                        ...fm, fontSize: 10, color: accent, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase"
                    }}>
                        {ch.tag}
                    </div>
                    {ch.live && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                            <span style={{ ...fm, fontSize: 10, fontWeight: 800, color: "#10b981" }}>ACTIVE</span>
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 24 }}>
                    <div style={{ 
                        width: isMobile ? 50 : 70, height: isMobile ? 50 : 70, borderRadius: 20, 
                        background: dark ? "#111" : "#f0f0f0", border: `1px solid ${T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 24 : 32
                    }}>
                        {ch.icon}
                    </div>
                    <div>
                        <h2 style={{ ...sf, fontSize: isMobile ? 24 : 32, fontWeight: 800, color: T.t, margin: 0, lineHeight: 1.1, letterSpacing: "-0.5px" }}>
                            {ch.degree}
                        </h2>
                        <div style={{ ...fm, fontSize: isMobile ? 14 : 16, color: T.m, marginTop: 8 }}>
                            {ch.school}
                        </div>
                    </div>
                </div>

                <p style={{ ...fm, fontSize: isMobile ? 14 : 15, lineHeight: 1.8, color: T.m, marginBottom: 32, maxWidth: 500 }}>
                    {ch.body}
                </p>

                {/* Perspective Stats */}
                <div style={{ display: "flex", gap: isMobile ? 24 : 48, marginBottom: 32 }}>
                    {ch.stats.map(([v, l], i) => (
                        <div key={i}>
                            <div style={{ ...sf, fontSize: 28, fontWeight: 900, color: accent }}>{v}</div>
                            <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: "1px", textTransform: "uppercase" }}>{l}</div>
                        </div>
                    ))}
                </div>

                {/* Knowledge Dots */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ch.pills.map(p => (
                        <span key={p} style={{
                            ...fm, fontSize: 10, fontWeight: 600, color: T.m,
                            background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                            padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`
                        }}>
                            {p}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function EduScrollBook({ T }) {
    const dark = T.bg === "#0F1115" || T.bg === "#1a1a22";
    const [activeIndex, setActiveIndex] = useState(1); // Default to MSc
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <div style={{ 
            width: "100%", 
            height: isMobile ? "auto" : "750px", 
            position: "relative",
            perspective: "2000px",
            padding: isMobile ? "40px 0" : 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
        }}>
            
            {!isMobile && (
                <>
                {/* Background Constellation Decor */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1, pointerEvents: "none" }}>
                    <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" fill={activeIndex === 1 ? T.a : T.a2} />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dotPattern)" />
                    {/* Connection Line */}
                    <line x1="20%" y1="50%" x2="80%" y2="50%" stroke={activeIndex === 1 ? T.a : T.a2} strokeWidth="1" strokeDasharray="10,10" />
                </svg>

                {/* Floating Instructions */}
                <div style={{ 
                    position: "absolute", bottom: 40, width: "100%", textAlign: "center",
                    fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.m, letterSpacing: "2px",
                    textTransform: "uppercase", opacity: 0.6
                }}>
                    Click cards to dive into academic chapters
                </div>
                </>
            )}

            <div style={{ 
                position: isMobile ? "relative" : "absolute", 
                inset: 0,
                display: isMobile ? "flex" : "block",
                flexDirection: "column",
                gap: 24,
                width: isMobile ? "90%" : "100%",
                margin: isMobile ? "0 auto" : 0
            }}>
                {EDU_CHAPTERS.map((ch, i) => (
                    <PerspectiveCard
                        key={i}
                        ch={ch}
                        active={activeIndex === i}
                        side={i > activeIndex ? "next" : "prev"}
                        onClick={() => setActiveIndex(i)}
                        T={T}
                        dark={dark}
                        isMobile={isMobile}
                    />
                ))}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.4; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
