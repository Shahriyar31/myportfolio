import { useEffect, useRef, useState, useMemo } from "react";

const VoxelLimb = ({ w, h, x, y, animName, color }) => (
    <div style={{ position: 'absolute', left: -w/2, top: 0, width: w, height: h, transform: `translate3d(${x}px, ${y}px, 0)`, transformStyle: 'preserve-3d' }}>
        <div style={{ 
            position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transformOrigin: 'top center',
            animation: animName ? `${animName} 0.5s infinite alternate ease-in-out` : 'none'
        }}>
            <div style={{ position: 'absolute', inset: 0, background: color, boxShadow: `0 0 12px ${color}`, opacity: 0.95, backfaceVisibility: 'visible' }} />
            <div style={{ position: 'absolute', inset: 0, background: color, boxShadow: `0 0 12px ${color}`, transform: 'rotateY(90deg)', opacity: 0.95, backfaceVisibility: 'visible' }} />
        </div>
    </div>
);

const DataSpark = ({ color, i, count }) => {
    const theta = (i / count) * Math.PI * 2;
    const r = 26; 
    const x = Math.sin(theta) * r;
    const z = Math.cos(theta) * r;
    const y = Math.sin(theta * 3) * 5; 

    return (
        <div style={{ position: 'absolute', left: -2, top: -2, transform: `translate3d(${x}px, ${y}px, ${z}px)`, transformStyle: 'preserve-3d' }}>
            <div style={{ position: 'absolute', width: 4, height: 4, background: color, boxShadow: `0 0 10px ${color}` }} />
            <div style={{ position: 'absolute', width: 4, height: 4, background: color, transform: 'rotateY(90deg)' }} />
            <div style={{ position: 'absolute', width: 4, height: 4, background: color, transform: 'rotateX(90deg)' }} />
        </div>
    )
};

const CyberHuman = ({ color }) => (
    <div style={{ position: 'absolute', transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
        <div style={{ transformStyle: 'preserve-3d', animation: 'h-bob 0.5s infinite alternate ease-in-out' }}>
            
            {/* The 5 Orbting Memory Cubes representing Accumulated Experience */}
            <div style={{ position: 'absolute', top: -14, left: 0, transformStyle: 'preserve-3d', animation: 'aura-spin 3s linear infinite' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <DataSpark key={i} color={color} i={i} count={5} />
                ))}
            </div>

            {/* Head */}
            <div style={{ position: 'absolute', left: -7, top: -42, width: 14, height: 14, transformStyle: 'preserve-3d' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 15px ${color}` }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, transform: 'rotateY(90deg)' }} />
            </div>
            
            <VoxelLimb w={12} h={18} x={0} y={-26} color={color} animName="none" />
            <VoxelLimb w={5} h={16} x={-10} y={-26} color={color} animName="arm-swing" />
            <VoxelLimb w={5} h={16} x={10} y={-26} color={color} animName="arm-swing-rev" />
            <VoxelLimb w={5} h={20} x={-5} y={-8} color={color} animName="leg-swing" />
            <VoxelLimb w={5} h={20} x={5} y={-8} color={color} animName="leg-swing-rev" />
        </div>
        <style>{`
            @keyframes h-bob { 0% { transform: translateY(0); } 100% { transform: translateY(-7px); } }
            @keyframes arm-swing { 0% { transform: rotateX(-45deg); } 100% { transform: rotateX(45deg); } }
            @keyframes arm-swing-rev { 0% { transform: rotateX(45deg); } 100% { transform: rotateX(-45deg); } }
            @keyframes leg-swing { 0% { transform: rotateX(45deg); } 100% { transform: rotateX(-45deg); } }
            @keyframes leg-swing-rev { 0% { transform: rotateX(-45deg); } 100% { transform: rotateX(45deg); } }
            @keyframes aura-spin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
        `}</style>
    </div>
);

export default function JourneyTimeline({ T }) {
    const isDark = T.bg !== "#F5F7FA" && T.bg !== "#eff1f5" && T.bg !== "#fff";
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };

    const steps = useMemo(() => [
        { year: "2018", loc: "West Bengal, India 🇮🇳", title: "B.Tech Computer Science", desc: "My journey begins here. I started software engineering at Coochbehar GEC, diving deep into computer science fundamentals. Over four years, I built a strong foundation, learned to write clean algorithmic code, and graduated with honors (8.73/10 CGPA). This was the spark that ignited my passion for technology.", color: "#097C87", icon: "🎓" },
        { year: "2022", loc: "Preparation & Transition", title: "The Master Plan", desc: "A pivotal year of laser-focus. After graduation, I stepped back to architect my transition to Europe. I dedicated a full year to intensive language learning, polishing my technical portfolio, and rigorously preparing for international university applications.", color: "#4a8c7a", icon: "📚" },
        { year: "2023", loc: "Hamburg, Germany 🇩🇪", title: "A New Chapter", desc: "I packed my life into a suitcase and moved alone to Hamburg, Germany at 22. Enrolled in the MSc Data Science program at TUHH, I was directly thrown into a new country, a new language, and a rigorous academic environment.", color: "#5b6680", icon: "✈️" },
        { year: "2025", loc: "Nordex SE, Hamburg", title: "AI & Data Engineering", desc: "My breakthrough into European tech. I joined Nordex SE to build an internal AI assistant entirely from scratch—engineering an end-to-end RAG pipeline over 1,600+ complex documents, designing custom rapidfuzz tool routers, and deploying an LLM evaluator to production.", color: "#7a7040", icon: "⚡" },
        { year: "Now", loc: "Hamburg, Germany", title: "Ready for the Future", desc: "The journey continues to unfold. Equipped with real-world production experience in Enterprise AI and robust Data Engineering, I am actively seeking full-time and Werkstudent roles. I bring adaptability, deep technical capability, and the sheer drive to build mind-blowing software.", color: "#7aaa8a", icon: "🚀" },
    ], []);

    const [isMobile, setIsMobile] = useState(false);
    const [svgRect, setSvgRect] = useState({ w: 100, h: 100 });
    
    const containerRef = useRef(null);
    const cardsRef = useRef([]);
    const humanRef = useRef(null);
    const humanP = useRef(0);
    const lastAngle = useRef(0);
    
    // SVG Layers
    const pShadow = useRef(null);
    const pBase = useRef(null);
    const pRails = useRef(null);
    const pSurface = useRef(null);
    const pCenter = useRef(null);
    const pActiveTrail = useRef(null);
    const pathLenCache = useRef(0);

    useEffect(() => {
        const resize = () => {
            setIsMobile(window.innerWidth < 900);
            
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            setSvgRect({ w, h });

            let points = [];
            cardsRef.current.forEach(c => {
                if (!c) return;
                points.push({
                    x: c.offsetLeft + c.offsetWidth / 2,
                    y: c.offsetTop + c.offsetHeight / 2
                });
            });

            if (points.length === steps.length) {
                let d = `M ${points[0].x} ${points[0].y}`;
                // Sweep elegant Beziers joining monolith nodes via S-curves
                for (let i = 0; i < points.length - 1; i++) {
                    const p1 = points[i], p2 = points[i+1];
                    const cpY = (p1.y + p2.y) / 2;
                    d += ` C ${p1.x} ${cpY}, ${p2.x} ${cpY}, ${p2.x} ${p2.y}`;
                }

                [pShadow, pBase, pRails, pSurface, pCenter, pActiveTrail].forEach(ref => {
                    if (ref.current) ref.current.setAttribute("d", d);
                });

                if (pCenter.current) {
                    pathLenCache.current = pCenter.current.getTotalLength();
                }
            }
        };

        const t = setTimeout(resize, 100);
        window.addEventListener('resize', resize);
        return () => { clearTimeout(t); window.removeEventListener('resize', resize); };
    }, [steps.length]);

    useEffect(() => {
        let frame;
        const start = performance.now();

        const tick = (time) => {
            const dt = time - start;

            cardsRef.current.forEach((card, i) => {
                if (card) {
                    const rotX = Math.sin(dt * 0.001 + i) * 6; 
                    const rotY = Math.cos(dt * 0.0015 + i) * 4; 
                    const shiftY = Math.sin(dt * 0.002 + i) * 12; 
                    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${shiftY}px)`;
                }
            });

            if (pathLenCache.current > 0 && pCenter.current && pActiveTrail.current) {
                const len = pathLenCache.current;
                
                // Tracing out the glowing physical path directly behind the human step loop
                pActiveTrail.current.style.strokeDasharray = `${len} ${len}`;
                pActiveTrail.current.style.strokeDashoffset = len - (humanP.current * len) + 2; // +2 fixes initial cap rendering edge case

                humanP.current += 0.0006; 
                if (humanP.current > 1) {
                    humanP.current = 0;
                    // Ensure instant visual reset when looping, skipping normal interpolation briefly
                    pActiveTrail.current.style.strokeDashoffset = len;
                }

                const pt1 = pCenter.current.getPointAtLength(humanP.current * len);
                const nextDist = Math.min((humanP.current + 0.003) * len, len);
                const pt2 = pCenter.current.getPointAtLength(nextDist);
                
                const dx = pt2.x - pt1.x;
                const dy = pt2.y - pt1.y;
                
                const angle = (dx === 0 && dy === 0) ? lastAngle.current : Math.atan2(dx, dy);
                lastAngle.current = angle;

                if (humanRef.current) {
                    humanRef.current.style.transform = `translate3d(${pt1.x}px, ${pt1.y}px, 30px) rotateY(${angle}rad)`;
                }
            }

            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, []);

    const alignments = ['flex-start', 'flex-end', 'flex-start', 'flex-end', 'center'];

    return (
        <div ref={containerRef} style={{ 
            position: "relative", width: "100%", 
            padding: isMobile ? "80px 0" : "150px 0",
            display: "flex", flexDirection: "column", 
            gap: isMobile ? "140px" : "250px", 
            overflow: "hidden"
        }}>
            
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${T.a}08 0%, transparent 60%)`, pointerEvents: "none" }} />

            {/* Dimensional Protocol Timeline Construction */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", overflow: "visible" }}>
                <defs>
                    <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2={svgRect.h || 2000} gradientUnits="userSpaceOnUse">
                        {steps.map((s, i) => <stop key={i} offset={`${(i / (steps.length - 1)) * 100}%`} stopColor={s.color} />)}
                    </linearGradient>
                    <filter id="neonRailDrop">
                        <feGaussianBlur stdDeviation="10" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                <g className="core-structural-bridge-layers">
                    <path ref={pShadow} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={isMobile ? 80 : 150} transform="translate(0, 100)" filter="blur(30px)" strokeLinecap="round" />
                    <path ref={pBase} fill="none" stroke={isDark ? "#0d0d14" : "#e2e8f0"} strokeWidth={isMobile ? 56 : 140} transform="translate(0, 20)" strokeLinecap="round" />
                    <path ref={pRails} fill="none" stroke="url(#roadGrad)" strokeWidth={isMobile ? 56 : 140} filter="url(#neonRailDrop)" strokeLinecap="round" />
                    <path ref={pSurface} fill="none" stroke={isDark ? "rgba(20,20,30,0.95)" : "rgba(250,250,255,0.95)"} strokeWidth={isMobile ? 52 : 134} strokeLinecap="round" />
                    
                    {/* Dormant / Inactive Future Track */}
                    <path ref={pCenter} fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth={isMobile ? 4 : 8} strokeLinecap="round" />
                    
                    {/* The Active Glowing Timeline Trail mapped specifically to the Human Walker */}
                    <path ref={pActiveTrail} fill="none" stroke="url(#roadGrad)" strokeWidth={isMobile ? 4 : 8} filter="url(#neonRailDrop)" strokeLinecap="round" />
                </g>
            </svg>

            {/* Entity Layer Wrapper - Contains the Voxel System ensuring overlap consistency with the SVG mapping */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15, pointerEvents: 'none', transformStyle: 'preserve-3d' }}>
                <div ref={humanRef} style={{ position: 'absolute', top: 0, left: 0, transformStyle: 'preserve-3d' }}>
                    <CyberHuman color={T.a} />
                </div>
            </div>

            {/* Semantic Timeline HTML Anchors */}
            {steps.map((step, idx) => {
                const align = isMobile ? 'center' : alignments[idx % 5];
                return (
                    <div key={idx} style={{ 
                        width: "100%", display: "flex", justifyContent: align, 
                        padding: isMobile ? "0 5%" : `0 ${align === 'center' ? '0' : '15%'}` 
                    }}>
                        <div 
                            ref={el => cardsRef.current[idx] = el}
                            style={{
                                width: "clamp(300px, 90vw, 650px)",
                                background: T.bg,
                                border: "none",
                                borderTop: `5px solid ${step.color}`,
                                borderRadius: "20px",
                                padding: isMobile ? "30px 24px" : "45px",
                                boxShadow: T.neu,
                                position: "relative",
                                zIndex: 20,
                                willChange: "transform",
                            }}
                        >
                            <div style={{
                                ...sf, position: "absolute", 
                                top: isMobile ? "-20px" : "-35px", right: "20px", 
                                fontSize: isMobile ? "90px" : "150px", 
                                fontWeight: 900, color: step.color, 
                                opacity: isDark ? 0.06 : 0.04, zIndex: 0, pointerEvents: "none"
                            }}>
                                {step.year}
                            </div>

                            <div style={{ position: "relative", zIndex: 2 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
                                    <div style={{ 
                                        width: isMobile ? 55 : 70, height: isMobile ? 55 : 70, 
                                        borderRadius: "50%", background: `${step.color}15`, 
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 26 : 32,
                                        border: `1px solid ${step.color}50`,
                                        boxShadow: `0 0 25px ${step.color}30, inset 0 0 15px ${step.color}20`
                                    }}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <span style={{ ...fm, fontSize: 13, color: step.color, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 800 }}>
                                            {step.year} — {step.loc}
                                        </span>
                                        <h3 style={{ ...sf, fontSize: isMobile ? 26 : 36, fontWeight: 700, color: T.t, marginTop: 4 }}>
                                            {step.title}
                                        </h3>
                                    </div>
                                </div>
                                <p style={{ ...fm, fontSize: isMobile ? 15 : 18, color: T.m, lineHeight: 1.8, fontWeight: 400 }}>
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
