import { useState, useEffect } from "react";
import { EDU_CHAPTERS } from "../data/constants";

export default function EduScrollBook({ T }) {
    const dark = T.bg === "#1a1a22";
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    
    // Default to the master's degree being active
    const [hoverIndex, setHoverIndex] = useState(1); 
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1000);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={{ width: "100%", padding: isMobile ? "20px 0" : "40px 20px 100px 20px" }}>
            <div style={{ textAlign: "center", marginBottom: "32px", ...fm, fontSize: 11, color: T.m, letterSpacing: ".06em" }}>
                ← {isMobile ? "Tap" : "Hover"} panels to shift timelines →
            </div>
            
            <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                width: "100%",
                maxWidth: "1400px",
                margin: "0 auto",
                height: isMobile ? "auto" : "750px",
                minHeight: isMobile ? "auto" : "750px",
                borderRadius: isMobile ? "20px" : "32px",
                overflow: "hidden",
                border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                boxShadow: dark ? "0 40px 100px rgba(0,0,0,0.5)" : "0 40px 100px rgba(0,0,0,0.08)",
                background: dark ? "rgba(10,10,16,0.5)" : "rgba(255,255,255,0.5)",
                backdropFilter: "blur(20px)"
            }}>
                {EDU_CHAPTERS.map((ch, i) => {
                    const isActive = hoverIndex === i;
                    const ac = T[ch.accent];
                    
                    return (
                        <div
                            key={i}
                            onMouseEnter={() => !isMobile && setHoverIndex(i)}
                            onClick={() => isMobile && setHoverIndex(i)}
                            style={{
                                flex: isActive ? "1 1 80%" : "1 1 20%",
                                minHeight: isMobile ? (isActive ? "520px" : "64px") : "auto",
                                position: "relative",
                                transition: "flex 0.8s cubic-bezier(0.16, 1, 0.3, 1), min-height 0.8s cubic-bezier(0.16, 1, 0.3, 1), background 0.8s",
                                background: isActive 
                                    ? (dark ? `linear-gradient(135deg, rgba(20,20,30,0.9), ${ac}15)` : `linear-gradient(135deg, rgba(255,255,255,0.95), ${ac}15)`)
                                    : (dark ? "rgba(0,0,0,0.2)" : "rgba(240,240,240,0.5)"),
                                borderRight: i === 0 && !isMobile ? `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` : "none",
                                borderBottom: i === 0 && isMobile ? `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` : "none",
                                overflow: "hidden",
                                cursor: isActive ? "default" : "pointer",
                            }}
                        >
                            {/* Giant Watermark Chapter Number */}
                            <div style={{
                                position: "absolute",
                                right: isActive ? "-2%" : "50%",
                                top: isActive ? "10%" : "50%",
                                transform: isActive ? "none" : "translate(50%, -50%)",
                                ...sf,
                                fontSize: isActive ? (isMobile ? "clamp(80px, 30vw, 160px)" : "clamp(200px, 20vw, 360px)") : (isMobile ? "60px" : "120px"),
                                fontWeight: 900,
                                color: ac,
                                opacity: isActive ? 0.04 : 0.08,
                                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                                pointerEvents: "none",
                                zIndex: 0
                            }}>
                                {ch.num}
                            </div>
                            
                            {/* Inactive State: Rotated spine view */}
                            <div style={{
                                position: "absolute",
                                opacity: isActive ? 0 : 1,
                                transform: isActive
                                    ? (isMobile ? "translateY(-30px)" : "translate(-100px, -50%) rotate(-90deg)")
                                    : (isMobile ? "translateY(-50%)" : "translate(-50%, -50%) rotate(-90deg)"),
                                left: isMobile ? "0" : "50%",
                                top: isMobile ? "50%" : "50%",
                                right: isMobile ? "0" : "auto",
                                padding: isMobile ? "0 20px" : "0",
                                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                                whiteSpace: isMobile ? "normal" : "nowrap",
                                pointerEvents: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                zIndex: 2
                            }}>
                                <span style={{ ...sf, fontSize: isMobile ? 18 : 32, fontWeight: 800, color: T.t, letterSpacing: "1px" }}>{ch.location.split(',')[0]}</span>
                                <span style={{ width: "30px", height: "1px", background: ac, opacity: 0.5, flexShrink: 0 }} />
                                <span style={{ ...fm, fontSize: 12, color: ac, letterSpacing: ".2em" }}>{ch.year}</span>
                            </div>

                            {/* Active State: Full expanded view */}
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                padding: "clamp(32px, 5vw, 64px)",
                                opacity: isActive ? 1 : 0,
                                transform: isActive ? "translateY(0)" : "translateY(40px)",
                                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
                                pointerEvents: isActive ? "auto" : "none",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                zIndex: 1
                            }}>
                                
                                {/* Top Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                                    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                                        <div style={{ 
                                            width: 64, height: 64, borderRadius: "50%", 
                                            background: `${ac}10`, border: `1px solid ${ac}30`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 28, boxShadow: `0 0 40px ${ac}20`,
                                            backdropFilter: "blur(10px)"
                                        }}>
                                            {ch.icon}
                                        </div>
                                        <div>
                                            <div style={{ ...fm, fontSize: 12, color: ac, letterSpacing: ".2em", textTransform: "uppercase" }}>{ch.tag}</div>
                                            <div style={{ ...fm, fontSize: 14, color: T.m, marginTop: "6px" }}>{ch.year}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                        <div style={{ ...fm, fontSize: 12, color: T.t, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", padding: "8px 16px", borderRadius: "20px" }}>
                                            📍 {ch.location}
                                        </div>
                                        {ch.live && (
                                            <span style={{ ...fm, fontSize: 11, color: T.a3, border: `1px solid ${T.a3}40`, padding: "8px 16px", borderRadius: "20px", background: `${T.a3}15`, display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.a3, animation: "blink 1.5s infinite" }} />LIVE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div style={{ margin: "auto 0" }}>
                                    <div style={{ display: "inline-block", ...sf, fontSize: "22px", fontStyle: "italic", color: T.t, marginBottom: "20px", borderLeft: `3px solid ${ac}`, paddingLeft: "20px", background: `${ac}0a`, padding: "10px 20px 10px 20px", borderRadius: "0 12px 12px 0" }}>
                                        "{ch.quote}"
                                    </div>
                                    
                                    <h3 style={{ ...sf, fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: T.t, lineHeight: 1.1, marginBottom: "16px", letterSpacing: "-1px" }}>
                                        {ch.degree}
                                    </h3>
                                    
                                    <div style={{ ...fm, fontSize: 18, color: T.t, marginBottom: "32px", opacity: 0.9 }}>
                                        {ch.school}
                                    </div>
                                    
                                    <p style={{ fontSize: "16px", color: T.m, lineHeight: 1.8, maxWidth: "600px", marginBottom: "48px" }}>
                                        {ch.body}
                                    </p>
                                    
                                    {/* Stats Highlights */}
                                    <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginBottom: "40px" }}>
                                        {ch.stats.map(([val, label], idx) => (
                                            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                <div style={{ ...sf, fontSize: "42px", fontWeight: 800, color: ac }}>{val}</div>
                                                <div style={{ ...fm, fontSize: "11px", color: T.m, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Subject Pills */}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                        {ch.pills.map(p => (
                                            <span key={p} style={{ 
                                                ...fm, fontSize: "11px", padding: "8px 16px", borderRadius: "20px",
                                                border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
                                                color: T.m,
                                                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"
                                            }}>
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
