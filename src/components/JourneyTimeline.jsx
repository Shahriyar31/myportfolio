import { useEffect, useRef, useState } from "react";

// A unique, "mind-blowing" 3D interactive floating glass card layout for the timeline.
// It abandons traditional boring vertical lines and instead creates a scattered, 
// deep z-axis spatial field where your journey items float like futuristic data panels.

export default function JourneyTimeline({ T, dark }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const isDark = T.bg === "#1a1a22";

    const steps = [
        { year: "2018", loc: "West Bengal, India 🇮🇳", title: "B.Tech Computer Science", desc: "My journey begins here. I started software engineering at Coochbehar GEC, diving deep into computer science fundamentals. Over four years, I built a strong foundation, learned to write clean algorithmic code, and graduated with honors (8.73/10 CGPA). This was the spark that ignited my passion for technology.", color: "#097C87", icon: "🎓" },
        { year: "2022", loc: "Preparation & Transition", title: "The Master Plan", desc: "A pivotal year of laser-focus. After graduation, I stepped back to architect my transition to Europe. I dedicated a full year to intensive language learning, polishing my technical portfolio, and rigorously preparing for international university applications.", color: "#4a8c7a", icon: "📚" },
        { year: "2023", loc: "Hamburg, Germany 🇩🇪", title: "A New Chapter", desc: "I packed my life into a suitcase and moved alone to Hamburg, Germany at 22. Enrolled in the MSc Data Science program at TUHH, I was directly thrown into a new country, a new language, and a rigorous academic environment.", color: "#5b6680", icon: "✈️" },
        { year: "2025", loc: "Nordex SE, Hamburg", title: "AI & Data Engineering", desc: "My breakthrough into European tech. I joined Nordex SE to build an internal AI assistant entirely from scratch—engineering an end-to-end RAG pipeline over 1,600+ complex documents, designing custom rapidfuzz tool routers, and deploying an LLM evaluator to production.", color: "#7a7040", icon: "⚡" },
        { year: "Now", loc: "Hamburg, Germany", title: "Ready for the Future", desc: "The journey continues to unfold. Equipped with real-world production experience in Enterprise AI and robust Data Engineering, I am actively seeking full-time and Werkstudent roles. I bring adaptability, deep technical capability, and the sheer drive to build mind-blowing software.", color: "#7aaa8a", icon: "🚀" },
    ];

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [hoverIdx, setHoverIdx] = useState(null);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    // Neural Connective Tissue Background
    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext('2d');
        let width, height, rafId;
        
        const resize = () => {
            width = c.clientWidth;
            height = c.clientHeight;
            c.width = width * window.devicePixelRatio;
            c.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        // Particle system for the background that reacts to the mouse
        const particles = Array.from({ length: 40 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            color: steps[Math.floor(Math.random() * steps.length)].color
        }));

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Smooth mouse trailing
            mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
            mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

            particles.forEach((p, i) => {
                // Gentle drift
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Mouse interaction - repel slightly
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 200) {
                    p.x -= (dx / dist) * 1.5;
                    p.y -= (dy / dist) * 1.5;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + '80'; // 50% opacity
                ctx.fill();

                // Connect particles to each other
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (d2 < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        // Curve slightly towards mouse if close
                        if (dist < 300) {
                            ctx.quadraticCurveTo(mouseRef.current.x, mouseRef.current.y, p2.x, p2.y);
                        } else {
                            ctx.lineTo(p2.x, p2.y);
                        }
                        ctx.strokeStyle = `${p.color}${Math.floor((1 - d2/150) * 40).toString(16).padStart(2, '0')}`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });

            rafId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current.targetX = e.clientX - rect.left;
        mouseRef.current.targetY = e.clientY - rect.top;
    };

    return (
        <div 
            ref={containerRef} 
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouseRef.current.targetX = -1000; mouseRef.current.targetY = -1000; }}
            style={{ 
                position: "relative", 
                width: "100%", 
                minHeight: "1000px", 
                perspective: "2000px", 
                overflow: "hidden",
                cursor: "crosshair",
                padding: "100px 0"
            }}
        >
            {/* Interactive Background Canvas */}
            <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", filter: "blur(1px)" }} />

            {/* The Floating 3D Journey Nodes */}
            <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", gap: 80, alignItems: "center", transformStyle: "preserve-3d" }}>
                
                {steps.map((step, idx) => {
                    const isHovered = hoverIdx === idx;
                    const isOtherHovered = hoverIdx !== null && !isHovered;
                    
                    // Staggering alignment left/right/center
                    const alignments = ['flex-start', 'flex-end', 'center', 'flex-start', 'flex-end'];
                    const aligns = alignments[idx % 5];
                    
                    return (
                        <div 
                            key={idx}
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: aligns,
                                padding: "0 5%",
                                perspective: "1000px"
                            }}
                        >
                            <div 
                                onMouseEnter={() => setHoverIdx(idx)}
                                onMouseLeave={() => setHoverIdx(null)}
                                style={{
                                    position: "relative",
                                    width: "clamp(300px, 45vw, 600px)",
                                    background: isDark ? "rgba(20,20,30,0.4)" : "rgba(255,255,255,0.4)",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    border: `1px solid ${isHovered ? step.color : T.border}`,
                                    borderRadius: "24px",
                                    padding: "40px",
                                    transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                                    transformStyle: "preserve-3d",
                                    
                                    // The mind-blowing 3D shift:
                                    // When hovered, it pops OUT in Z-space and glows.
                                    // When NOT hovered, but something else IS, it pushes BACK and blurs (Depth of Field).
                                    transform: isHovered 
                                        ? "translateZ(80px) scale(1.05) translateY(-15px)" 
                                        : (isOtherHovered ? "translateZ(-150px) scale(0.9) translateY(10px)" : "translateZ(0) scale(1)"),
                                    
                                    opacity: isOtherHovered ? 0.3 : 1,
                                    filter: isOtherHovered ? "blur(8px) grayscale(50%)" : "blur(0px) grayscale(0%)",
                                    boxShadow: isHovered 
                                        ? `0 50px 100px -20px rgba(0,0,0,0.5), 0 0 50px -10px ${step.color}60, inset 0 0 20px ${step.color}20` 
                                        : `0 20px 40px rgba(0,0,0,0.1)`,
                                }}
                            >
                                {/* Floating Year Background Text */}
                                <div style={{
                                    ...sf,
                                    position: "absolute",
                                    top: "-30px",
                                    right: aligns === 'flex-start' ? "-20px" : "auto",
                                    left: aligns === 'flex-end' ? "-20px" : "auto",
                                    fontSize: "140px",
                                    fontWeight: 900,
                                    color: step.color,
                                    opacity: 0.08,
                                    pointerEvents: "none",
                                    zIndex: 0,
                                    transform: isHovered ? "translateZ(-40px) scale(1.2)" : "translateZ(0)",
                                    transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                                }}>
                                    {step.year}
                                </div>

                                {/* Content Layer - Pops OUT towards user */}
                                <div style={{ 
                                    position: "relative", 
                                    zIndex: 2,
                                    transform: isHovered ? "translateZ(40px)" : "translateZ(0)",
                                    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
                                        <div style={{ 
                                            width: 60, height: 60, borderRadius: "50%", background: `${step.color}15`, 
                                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                                            boxShadow: isHovered ? `0 0 30px ${step.color}40` : "none",
                                            border: `1px solid ${step.color}50`
                                        }}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <span style={{ ...fm, fontSize: 12, color: step.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{step.year} — {step.loc}</span>
                                            <h3 style={{ ...sf, fontSize: 32, fontWeight: 700, color: T.t, marginTop: 4 }}>{step.title}</h3>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 16, color: T.m, lineHeight: 1.8 }}>
                                        {step.desc}
                                    </p>
                                </div>

                                {/* High-tech sweeping scanner line on hover */}
                                {isHovered && (
                                    <div style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "24px",
                                        pointerEvents: "none",
                                        background: `linear-gradient(180deg, transparent 0%, ${step.color}10 50%, transparent 100%)`,
                                        backgroundSize: "100% 200%",
                                        animation: "scanline 2s linear infinite",
                                        mixBlendMode: "screen",
                                        zIndex: 3
                                    }} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <style>{`
                @keyframes scanline {
                    0% { background-position: 0% -100%; }
                    100% { background-position: 0% 200%; }
                }
            `}</style>
        </div>
    );
}
