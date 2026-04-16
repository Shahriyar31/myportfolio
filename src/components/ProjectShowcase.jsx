import { useState, useRef, useEffect, useCallback } from "react";
import { PROJECTS } from "../data/constants";

export default function ProjectShowcase({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    
    const [isMobile, setIsMobile] = useState(false);
    const [activeIdxState, setActiveIdxState] = useState(0);
    
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cardsRef = useRef([]);

    // Physics state
    const targetIdx = useRef(0);
    const currIdx = useRef(0);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const currMouseX = useRef(0);
    const currMouseY = useRef(0);

    const isAutoPlaying = useRef(true);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1000);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Scroll Tracking Physics
    const outerRef = useRef(null);
    useEffect(() => {
        const onScroll = () => {
            if (!outerRef.current) return;
            const rect = outerRef.current.getBoundingClientRect();
            // Pixel-perfect track measurement mapping screen progress to cards
            const scrolledPixels = Math.max(0, -rect.top);
            // 6 cards = we map over 3000px of scroll space
            const rotationTrack = 3000;
            const p = Math.max(0, Math.min(1, scrolledPixels / rotationTrack));
            targetIdx.current = p * (PROJECTS.length - 1);
            setActiveIdxState(Math.round(targetIdx.current));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        
        // Trigger once immediately
        onScroll();
        
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // 3D Physics Engine Loop
    useEffect(() => {
        let frame;
        const render = () => {
            // Adaptive lerp for fast anchor scroll jumps vs normal mousewheel
            const deltaIdx = targetIdx.current - currIdx.current;
            const lerpSpeed = Math.abs(deltaIdx) > 0.5 ? 0.35 : (isMobile ? 0.15 : 0.08);
            currIdx.current += deltaIdx * lerpSpeed;
            
            // Lerp mouse
            currMouseX.current += (mouseX.current - currMouseX.current) * 0.05;
            currMouseY.current += (mouseY.current - currMouseY.current) * 0.05;
            
            // Subtle scene parallax based on mouse
            if (sceneRef.current) {
                const tiltX = -currMouseY.current * (isMobile ? 5 : 12);
                const tiltY = currMouseX.current * (isMobile ? 5 : 15);
                sceneRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            }

            // Coverflow Math
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                const MathD = i - currIdx.current;
                const absDelta = Math.abs(MathD);
                const sign = Math.sign(MathD); // 1 if right, -1 if left

                // Dimensions
                const baseSpread = isMobile ? 220 : 380;
                const spreadGap = isMobile ? 80 : 160;
                const maxAngle = isMobile ? 35 : 55;
                const depthDrop = isMobile ? 200 : 300;

                // Continuous piecewise math
                const curve = Math.min(absDelta, 1);
                const remainder = Math.max(0, absDelta - 1);

                const tx = sign * curve * baseSpread + sign * remainder * spreadGap;
                const tz = -curve * depthDrop - remainder * (depthDrop * 0.3);
                const ry = -sign * curve * maxAngle;
                // Add a very subtle slide down for background elements
                const ty = curve * 20;

                const scale = 1 - curve * 0.1 - remainder * 0.05;

                // Visual depth cue
                const opacity = Math.max(0, 1 - absDelta * 0.3);
                const bright = Math.max(0.4, 1 - absDelta * 0.5);
                const blur = absDelta > 1 ? (absDelta - 1) * 3 : 0;
                
                card.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${ry}deg) scale(${scale})`;
                card.style.opacity = opacity;
                card.style.pointerEvents = absDelta < 0.2 ? "auto" : "none";
                card.style.zIndex = Math.round(100 - absDelta * 10);
                
                const inner = card.firstChild;
                if (inner && !isMobile) {
                    inner.style.filter = `brightness(${bright}) blur(${blur}px)`;
                } else if (inner) {
                    inner.style.filter = `brightness(${bright})`;
                }
            });

            // Update color glow background
            if (containerRef.current) {
                const activeProject = PROJECTS[Math.round(currIdx.current) % PROJECTS.length];
                if (activeProject) {
                    containerRef.current.style.background = `radial-gradient(ellipse at 50% 120%, ${activeProject.color}15 0%, transparent 60%)`;
                }
            }

            frame = requestAnimationFrame(render);
        };
        frame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frame);
    }, [isMobile]);

    // Tracking mouse over entire container
    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Normalized -1 to 1 coordinates
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        mouseX.current = x;
        mouseY.current = y;
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseX.current = 0;
        mouseY.current = 0;
    }, []);

    // Scroll helper for nav dots
    const scrollToIndex = (idx) => {
        if (!outerRef.current) return;
        const rect = outerRef.current.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        
        const trackLen = 3000;
        const p = idx / (PROJECTS.length - 1);
        window.scrollTo({ top: absoluteTop + Math.floor(p * trackLen), behavior: "smooth" });
    };

    const renderCardContent = (p) => (
        <div style={{
            width: isMobile ? "90vw" : 540,
            maxWidth: isMobile ? 360 : "none",
            height: isMobile ? 520 : 600,
            background: T.bg, border: "none",
            borderRadius: 24, padding: isMobile ? "24px 20px" : "40px",
            display: "flex", flexDirection: "column",
            boxShadow: T.neu, position: "relative",
            overflow: "hidden"
        }}>
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${p.color}, ${p.color}40, transparent)` }} />
            
            {/* Ambient glow blob */}
            <div style={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${p.color}25, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12 }}>
                <span style={{ ...fm, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 20, border: `1px solid ${p.color}60`, color: p.color, background: `${p.color}15` }}>
                    {p.badge}
                </span>
                {p.link ? (
                    <a href={p.link} target="_blank" rel="noreferrer"
                        style={{ ...fm, fontSize: 10, color: p.color, textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "6px 16px", borderRadius: 20, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", transition: "all 0.2s", zIndex: 10, border: `1px solid ${p.color}30` }}
                        onMouseEnter={e => { e.currentTarget.style.background = p.color; e.currentTarget.style.color = "white"; }}>
                        Source Code ↗
                    </a>
                ) : (
                    <span style={{ ...fm, fontSize: 10, color: T.m, padding: "6px 16px", borderRadius: 20, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        🔒 Private
                    </span>
                )}
            </div>

            <div style={{ ...fm, fontSize: 24, marginBottom: 12 }}>{p.icon}</div>
            
            <h3 style={{ ...sf, fontSize: isMobile ? 26 : 38, fontWeight: 800, color: T.t, marginBottom: 8, lineHeight: 1.1, letterSpacing: "-.02em" }}>
                {p.title}
            </h3>
            
            <div style={{ ...fm, fontSize: 12, color: p.color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 24, opacity: 0.85, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 1.5, background: p.color, display: "inline-block" }} />
                {p.sub}
            </div>

            <p style={{ ...fm, fontSize: isMobile ? 14 : 16, color: T.m, lineHeight: 1.7, marginBottom: "auto" }}>
                {p.desc}
            </p>

            <div style={{ marginTop: 24 }}>
                <div style={{ ...fm, fontSize: 9, color: p.color, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>
                    Tech Stack Architecture
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {p.tags.map(t => (
                        <span key={t} style={{ ...fm, fontSize: 11, color: p.color, background: `${p.color}15`, border: `1px solid ${p.color}40`, padding: "6px 12px", borderRadius: 8, transition: "background 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = `${p.color}25`}
                            onMouseLeave={e => e.currentTarget.style.background = `${p.color}15`}>
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div ref={outerRef} style={{ height: "calc(3000px + 100vh)", width: "100%", position: "relative" }}>
            <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: "sticky", top: 0, width: "100%", 
                    height: "100vh", 
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    transition: "background 1s ease",
                    paddingTop: 40,
                }}
            >
                {/* The 3D Perspective Stage */}
                <div style={{ 
                    perspective: isMobile ? "1000px" : "2500px", 
                    width: "100%", height: isMobile ? 550 : 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                    zIndex: 10
                }}>
                    <div ref={sceneRef} style={{ 
                        position: "relative", width: 0, height: 0, 
                        transformStyle: "preserve-3d", 
                        display: "flex", alignItems: "center", justifyContent: "center" 
                    }}>
                        {PROJECTS.map((p, i) => (
                            <div key={p.id} ref={el => cardsRef.current[i] = el}
                                onClick={() => scrollToIndex(i)}
                                style={{
                                    position: "absolute",
                                    // Center the origin precisely based on the card dimensions
                                    left: isMobile ? -180 : -270,
                                    top: isMobile ? -260 : -300,
                                    width: isMobile ? 360 : 540,
                                    height: isMobile ? 520 : 600,
                                    transformOrigin: "50% 50%",
                                    transformStyle: "preserve-3d",
                                    willChange: "transform, opacity, filter",
                                    cursor: activeIdxState === i ? "default" : "pointer",
                                    opacity: 0 // Physics engine handles real opacity
                                }}
                            >
                                <div style={{ willChange: "filter", position: "relative", zIndex: 2 }}>
                                    {renderCardContent(p)}
                                </div>
                                
                                {/* Glass Reflection Floor */}
                                {!isMobile && (
                                    <div style={{
                                        content: '""', position: "absolute", 
                                        top: "105%", left: 0, right: 0, height: "100%",
                                        transform: "scaleY(-1)",
                                        opacity: 0.15, pointerEvents: "none", zIndex: 1,
                                        maskImage: "linear-gradient(to bottom, transparent 30%, black 100%)",
                                        WebkitMaskImage: "linear-gradient(to bottom, transparent 30%, black 100%)",
                                        filter: "blur(4px)"
                                    }}>
                                        {renderCardContent(p)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nav Control Panel */}
                <div style={{ 
                    display: "flex", gap: isMobile ? 8 : 12, marginTop: isMobile ? 40 : 160, zIndex: 20,
                    padding: "12px 24px", background: dark ? "rgba(10,12,18,0.5)" : "rgba(255,255,255,0.5)",
                    borderRadius: 40, backdropFilter: "blur(12px)", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`
                }}>
                    {PROJECTS.map((p, i) => (
                        <div key={i} onClick={() => scrollToIndex(i)}
                            style={{
                                width: activeIdxState === i ? (isMobile ? 32 : 48) : isMobile ? 8 : 12,
                                height: isMobile ? 8 : 12,
                                borderRadius: 12,
                                background: activeIdxState === i ? p.color : (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"),
                                cursor: "pointer",
                                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                                boxShadow: activeIdxState === i ? `0 0 10px ${p.color}80` : "none"
                            }}
                        />
                    ))}
                </div>
                
                {/* Nav Hint */}
                <div style={{ ...fm, fontSize: 10, color: T.dim, marginTop: 16, letterSpacing: ".1em", textTransform: "uppercase" }}>
                    Select a project or scroll to revolve
                </div>
            </div>
        </div>
    );
}
