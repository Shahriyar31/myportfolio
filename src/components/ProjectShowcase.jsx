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
        const rotateY = idx % 2 === 0 ? -5 : 5;
        
        return (
            <div style={{
                width: "100%", padding: isMobile ? 24 : 40,
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 16,
                transform: `perspective(1000px) rotateY(${rotateY}deg) rotateX(5deg)`,
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                overflow: "hidden", position: "relative",
                margin: isMobile ? "10px 0" : 0
            }}>
            {/* Removed Top accent line */}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <span style={{ ...fm, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 20, border: `1px solid ${p.color}60`, color: p.color, background: `${p.color}15` }}>
                    {p.badge}
                </span>
                
                {p.link ? (
                    <a href={p.link} target="_blank" rel="noreferrer" style={{ ...fm, fontSize: 10, color: p.color, textDecoration: "none", letterSpacing: ".1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "6px 16px", borderRadius: 20, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", transition: "all 0.2s", zIndex: 10 }}
                        onMouseEnter={e => { e.currentTarget.style.background = p.color; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"; e.currentTarget.style.color = p.color; }}
                    >
                        Source Code ↗
                    </a>
                ) : (
                    <span style={{ ...fm, fontSize: 10, color: T.m, padding: "6px 16px", borderRadius: 20, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        🔒 Enterprise Private
                    </span>
                )}
            </div>

            <h3 style={{ ...sf, fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 800, color: T.t, marginBottom: 16, lineHeight: 1.1 }}>
                {p.title}
            </h3>
            
            <p style={{ fontSize: 15, color: T.m, lineHeight: 1.8, marginBottom: 32 }}>
                {p.desc}
            </p>

            <div style={{ ...fm, fontSize: 9, color: p.color, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 1, background: p.color, display: "inline-block" }} />
                Tech Stack
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {p.tags.map(t => (
                    <span key={t} style={{ 
                        ...fm, fontSize: 11, color: p.color, 
                        background: `${p.color}12`, 
                        border: `1px solid ${p.color}40`, 
                        padding: "6px 12px", borderRadius: 8, 
                        transition: "all .2s" 
                    }}>
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
                    const isPinned = activeIndex === i;
                    const isDisplaying = (hoverIndex !== null ? hoverIndex : activeIndex) === i;
                    
                    return (
                        <div 
                            key={p.id}
                            onClick={() => {
                                setIsAutoPlaying(false);
                                setActiveIndex(i);
                            }}
                            onMouseEnter={isMobile ? undefined : () => {
                                setIsAutoPlaying(false);
                                setHoverIndex(i);
                            }}
                            style={{
                                cursor: "pointer", padding: "16px 24px",
                                borderRadius: 16,
                                background: isPinned ? (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)") : 
                                          (isHovered ? (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") : "transparent"),
                                borderLeft: isPinned ? `3px solid ${p.color}` : 
                                          (isDisplaying ? `3px solid ${p.color}80` : 
                                          (isHovered ? `3px solid ${p.color}40` : "3px solid transparent")),
                                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                                transform: isDisplaying ? "translateX(10px)" : "none",
                                position: "relative"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <div style={{ ...sf, fontSize: isDisplaying ? "clamp(24px, 3vw, 36px)" : "clamp(18px, 2vw, 24px)", fontWeight: isDisplaying ? 800 : 500, color: isDisplaying ? T.t : T.m, transition: "all 0.4s" }}>
                                    {p.title}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    {isPinned && <span style={{ fontSize: 16, opacity: 0.9, filter: `drop-shadow(0 0 5px ${p.color})` }}>📌</span>}
                                    <span style={{ fontSize: isDisplaying ? 28 : 20, opacity: isDisplaying ? 1 : 0.4, transition: "all 0.4s", filter: isDisplaying ? `drop-shadow(0 0 10px ${p.color})` : "none" }}>{p.icon}</span>
                                </div>
                            </div>
                            
                            <div style={{ ...fm, fontSize: 11, color: isDisplaying ? p.color : T.dim, letterSpacing: ".1em", textTransform: "uppercase", transition: "all 0.4s" }}>
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
