import { useState, useRef, useEffect } from "react";
import { PROJECTS } from "../data/constants";

export default function ProjectShowcase({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setActiveIndex(prev => prev === null ? 0 : (prev + 1) % PROJECTS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1000);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const activeProject = PROJECTS[hoverIndex !== null ? hoverIndex : (activeIndex !== null ? activeIndex : 0)];

    const renderDetailCard = (p, overrideIndex) => {
        const idx = overrideIndex !== undefined ? overrideIndex : activeIndex;
        const rotateY = idx % 2 === 0 ? -4 : 4;

        return (
            <div key={p.id} style={{
                width: "100%", padding: isMobile ? 24 : 40,
                background: T.card,
                border: `1px solid ${p.color}40`,
                borderRadius: 16,
                transform: isMobile ? "none" : `perspective(1000px) rotateY(${rotateY}deg) rotateX(4deg)`,
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                overflow: "hidden", position: "relative",
                margin: isMobile ? "10px 0" : 0,
                boxShadow: `0 20px 60px rgba(${p.glow},${dark ? 0.18 : 0.08}), inset 0 1px 0 rgba(${p.glow},0.1)`,
                animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
            }}>
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, ${p.color}40, transparent)`, borderRadius: "16px 16px 0 0" }} />

                {/* Ambient glow blob */}
                <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${p.color}18, transparent 70%)`, pointerEvents: "none" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                    <span style={{ ...fm, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 20, border: `1px solid ${p.color}60`, color: p.color, background: `${p.color}15` }}>
                        {p.badge}
                    </span>
                    {p.link ? (
                        <a href={p.link} target="_blank" rel="noreferrer"
                            style={{ ...fm, fontSize: 10, color: p.color, textDecoration: "none", letterSpacing: ".1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "6px 16px", borderRadius: 20, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", transition: "all 0.2s", zIndex: 10, border: `1px solid ${p.color}30` }}
                            onMouseEnter={e => { e.currentTarget.style.background = p.color; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = p.color; }}
                            onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"; e.currentTarget.style.color = p.color; e.currentTarget.style.borderColor = `${p.color}30`; }}>
                            Source Code ↗
                        </a>
                    ) : (
                        <span style={{ ...fm, fontSize: 10, color: T.m, padding: "6px 16px", borderRadius: 20, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                            🔒 Enterprise Private
                        </span>
                    )}
                </div>

                <div style={{ ...fm, fontSize: 20, marginBottom: 8 }}>{p.icon}</div>
                <h3 style={{ ...sf, fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 800, color: T.t, marginBottom: 6, lineHeight: 1.1, letterSpacing: "-.02em" }}>
                    {p.title}
                </h3>
                <div style={{ ...fm, fontSize: 11, color: p.color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 20, opacity: 0.85 }}>
                    {p.sub}
                </div>

                <p style={{ fontSize: 15, color: T.m, lineHeight: 1.8, marginBottom: 28 }}>
                    {p.desc}
                </p>

                <div style={{ ...fm, fontSize: 9, color: p.color, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 14, height: 1, background: p.color, display: "inline-block" }} />
                    Tech Stack
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {p.tags.map(t => (
                        <span key={t} style={{ ...fm, fontSize: 11, color: p.color, background: `${p.color}12`, border: `1px solid ${p.color}40`, padding: "6px 12px", borderRadius: 8, transition: "all .2s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${p.color}25`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = `${p.color}12`; e.currentTarget.style.transform = "translateY(0)"; }}>
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
                {PROJECTS.map((p, i) => {
                    const isActive = activeIndex === i;
                    return (
                        <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div 
                                onClick={() => {
                                    setIsAutoPlaying(false);
                                    setActiveIndex(isActive ? null : i);
                                }}
                                style={{
                                    cursor: "pointer", padding: "16px 20px",
                                    borderRadius: 16,
                                    background: isActive ? (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
                                    borderLeft: `4px solid ${isActive ? p.color : "transparent"}`,
                                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                                    boxShadow: isActive ? `0 10px 30px rgba(${p.glow}, ${dark ? 0.2 : 0.05})` : "none"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <div style={{ ...sf, fontSize: 18, fontWeight: isActive ? 800 : 600, color: isActive ? T.t : T.m }}>
                                        {p.title}
                                    </div>
                                    <span style={{ fontSize: 20, filter: isActive ? `drop-shadow(0 0 10px ${p.color})` : "none", transform: isActive ? "scale(1.1)" : "scale(1)", transition: "all 0.3s" }}>
                                        {p.icon}
                                    </span>
                                </div>
                                <div style={{ ...fm, fontSize: 10, color: isActive ? p.color : T.dim, letterSpacing: ".1em", textTransform: "uppercase" }}>
                                    {p.sub}
                                </div>
                            </div>
                            
                            {/* Accordion Detail Card */}
                            <div style={{ 
                                overflow: "hidden",
                                maxHeight: isActive ? "1000px" : "0px",
                                opacity: isActive ? 1 : 0,
                                transform: isActive ? "translateY(0)" : "translateY(-10px)",
                                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)"
                            }}>
                                {renderDetailCard(p, i)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{
            position: "relative", width: "100%", 
            minHeight: "70vh", display: "flex", flexWrap: "wrap",
            gap: 40, alignItems: "center", justifyContent: "space-between"
        }}>
            {/* Subtle background shift based on active project mapping to Monokai logic but removed neon glow */}
            {activeProject && (
                <div style={{
                    position: "absolute", top: "50%", left: "50%", width: "100vw", height: "100%",
                    transform: "translate(-50%, -50%)",
                    background: "none",
                    transition: "background 0.8s ease",
                    pointerEvents: "none", zIndex: 0
                }} />
            )}

            {/* Left Side: Kinetic Typography List */}
            <div style={{ flex: "1 1 400px", zIndex: 1, display: "flex", flexDirection: "column", gap: 16 }}
                 onMouseLeave={() => setHoverIndex(null)}>
                {PROJECTS.map((p, i) => {
                    const isHovered = hoverIndex === i;
                    const isDisplaying = (hoverIndex !== null ? hoverIndex : activeIndex) === i;
                    
                    return (
                        <div
                            key={p.id}
                            onClick={() => { setIsAutoPlaying(false); setActiveIndex(i); }}
                            onMouseEnter={isMobile ? undefined : () => { setIsAutoPlaying(false); setHoverIndex(i); }}
                            style={{
                                cursor: "pointer", padding: "16px 24px",
                                borderRadius: 16,
                                background: isDisplaying ? `${p.color}0e` : "transparent",
                                borderLeft: `3px solid ${isDisplaying ? p.color : isHovered ? `${p.color}50` : "transparent"}`,
                                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                                transform: isDisplaying ? "translateX(8px)" : "none",
                                boxShadow: isDisplaying ? `0 4px 24px rgba(${p.glow},${dark ? 0.12 : 0.06})` : "none",
                                position: "relative"
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <div style={{ ...sf, fontSize: isDisplaying ? "clamp(22px,3vw,34px)" : "clamp(16px,2vw,22px)", fontWeight: isDisplaying ? 800 : 500, color: isDisplaying ? T.t : T.m, transition: "all 0.35s", letterSpacing: isDisplaying ? "-.02em" : 0 }}>
                                    {p.title}
                                </div>
                                <span style={{ fontSize: isDisplaying ? 26 : 18, opacity: isDisplaying ? 1 : 0.35, transition: "all 0.35s", filter: isDisplaying ? `drop-shadow(0 0 8px ${p.color}90)` : "none" }}>{p.icon}</span>
                            </div>
                            <div style={{ ...fm, fontSize: 10, color: isDisplaying ? p.color : T.dim, letterSpacing: ".1em", textTransform: "uppercase", transition: "all 0.35s" }}>
                                {p.sub}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right Side: Detail Card */}
            <div style={{ flex: "1 1 500px", zIndex: 1, position: "relative", perspective: "1000px" }}>
                {activeProject && renderDetailCard(activeProject, hoverIndex !== null ? hoverIndex : activeIndex)}
            </div>
        </div>
    );
}
