import { useState, useEffect, useRef } from "react";
import { EDU_CHAPTERS } from "../data/constants";

function EduCardContent({ ch, T, dark, isMobile }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const accent = T[ch.accent];

    return (
        <div style={{
            width: "100%", height: "100%",
            borderRadius: 32,
            background: dark ? "rgba(18, 20, 28, 0.9)" : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(24px)",
            border: `1px solid ${accent}60`,
            boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 60px ${accent}25, inset 0 1px 0 ${accent}20`,
            overflow: "hidden",
            position: "relative",
            display: "flex", flexDirection: "column",
        }}>
            {/* Holographic shimmer */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
                background: `radial-gradient(ellipse at 50% 0%, ${accent}15 0%, transparent 70%)`,
            }} />

            {/* Accent top bar */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${T.a2}, ${accent})` }} />

            <div style={{ padding: isMobile ? "24px 20px" : "36px 40px", position: "relative", zIndex: 1, flex: 1, overflowY: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: `${accent}15`, border: `1px solid ${accent}35`,
                        padding: "6px 14px", borderRadius: 20,
                        ...fm, fontSize: 10, color: accent, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase"
                    }}>
                        {ch.tag}
                    </div>
                    <div style={{
                        ...fm, fontSize: 11, color: T.m, fontWeight: 600,
                        background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                        padding: "6px 12px", borderRadius: 12,
                        border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`
                    }}>
                        {ch.year}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                    <div style={{
                        width: isMobile ? 52 : 64, height: isMobile ? 52 : 64,
                        borderRadius: 20, flexShrink: 0,
                        background: `${accent}18`,
                        border: `1px solid ${accent}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: isMobile ? 26 : 32,
                        boxShadow: `0 0 24px ${accent}30`
                    }}>
                        {ch.icon}
                    </div>
                    <div>
                        <h3 style={{ ...sf, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: T.t, margin: 0, lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                            {ch.degree}
                        </h3>
                        <div style={{ ...fm, fontSize: isMobile ? 12 : 13, color: T.m, marginTop: 6 }}>
                            {ch.school}
                        </div>
                        <div style={{ ...fm, fontSize: 10, color: T.m, marginTop: 4 }}>
                            📍 {ch.location}
                        </div>
                    </div>
                </div>

                <div style={{
                    ...sf, fontSize: isMobile ? 13 : 15, fontStyle: "italic",
                    color: accent, marginBottom: 16, lineHeight: 1.4,
                    borderLeft: `3px solid ${accent}`,
                    paddingLeft: 12, opacity: 0.9
                }}>
                    "{ch.quote}"
                </div>

                <p style={{ ...fm, fontSize: isMobile ? 12 : 13, color: T.m, lineHeight: 1.75, marginBottom: 24 }}>
                    {ch.body}
                </p>

                <div style={{ display: "flex", gap: isMobile ? 20 : 32, marginBottom: 24 }}>
                    {ch.stats.map(([v, l]) => (
                        <div key={l}>
                            <div style={{ ...sf, fontSize: isMobile ? 20 : 26, fontWeight: 900, color: accent }}>{v}</div>
                            <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ch.pills.map(p => (
                        <span key={p} style={{
                            ...fm, fontSize: 10, fontWeight: 600, padding: "5px 11px", borderRadius: 8,
                            background: `${accent}0e`, border: `1px solid ${accent}25`, color: accent
                        }}>{p}</span>
                    ))}
                </div>

                {ch.live && (
                    <div style={{
                        marginTop: 20, display: "inline-flex", alignItems: "center", gap: 6,
                        ...fm, fontSize: 10, fontWeight: 800, color: "#10b981"
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "blink 1.5s ease-in-out infinite", display: "inline-block" }} />
                        CURRENTLY ACTIVE
                    </div>
                )}
            </div>

            <div style={{
                position: "absolute", top: -20, right: 24,
                ...sf, fontSize: 80, fontWeight: 900,
                color: accent, opacity: 0.05,
                pointerEvents: "none", lineHeight: 1, userSelect: "none"
            }}>
                {ch.num}
            </div>
        </div>
    );
}

export default function EduScrollBook({ T }) {
    const dark = T.bg !== "#F5F7FA";
    const [isMobile, setIsMobile] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);

    const outerRef = useRef(null);
    const monolithRef = useRef(null);
    const cardsRef = useRef([]);
    const target = useRef(0);
    const current = useRef(0);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            if (!outerRef.current) return;
            const rect = outerRef.current.getBoundingClientRect();
            const vh = window.innerHeight;
            
            // MEASURE: Physical consumption of the scroll track
            const scrolledPixels = Math.max(0, -rect.top);
            const rotationTrack = 4000;

            let p = Math.max(0, Math.min(1, scrolledPixels / rotationTrack));
            target.current = p * (EDU_CHAPTERS.length - 1);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isMobile]);

    useEffect(() => {
        let frame;
        const render = () => {
             // Velocity-boost for mobile
             const speed = isMobile ? 0.15 : 0.08;
             current.current += (target.current - current.current) * speed;

            const currIdx = Math.round(current.current);
            setActiveIdx(prev => prev !== currIdx ? currIdx : prev);

            // Radius must safely exceed height/2 to prevent faces intersecting during rotation
            const zRadius = isMobile ? 320 : 420;

            if (monolithRef.current) {
                // The main 3D pivot translates back to remain centered behind screen glass,
                // then rotates locally around X axis!
                const angle = current.current * -90;
                monolithRef.current.style.transform = `translateZ(-${zRadius}px) rotateX(${angle}deg)`;
            }

            cardsRef.current.forEach((el, i) => {
                if (!el) return;
                const dl = current.current - i;
                const dist = Math.abs(dl);

                let op = 1;
                let bright = 1;

                if (dist > 0.8) {
                   op = Math.max(0, 1 - (dist - 0.8) * 4); // Fades completely as it curls around the back
                   bright = 0.6;
                } else {
                   bright = Math.max(0.7, 1 - (dist * 0.4));
                }

                const inner = el.firstChild;
                if (inner) {
                    inner.style.filter = `brightness(${bright})`;
                    inner.style.opacity = op;
                    inner.style.pointerEvents = dist < 0.2 ? "auto" : "none";
                }
            });

            frame = requestAnimationFrame(render);
        };
        frame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frame);
    }, [isMobile]);

    const totalHeight = "6000px";

    return (
        <div ref={outerRef} style={{ height: totalHeight, width: "100%", position: "relative", overflow: "visible" }}>
            <div style={{
                position: "sticky", top: 0, height: isMobile ? "100dvh" : "100vh", overflow: "visible", zIndex: 50,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                perspective: "2500px", padding: isMobile ? "0 10px" : "0", boxSizing: "border-box"
            }}>

                {/* Performance Bypass Indicators */}
                <div style={{ position: "absolute", top: "12vh", display: "flex", gap: 12, alignItems: "center", zIndex: 100 }}>
                     {EDU_CHAPTERS.map((_, i) => (
                         <div key={i} style={{
                             width: i === activeIdx ? 32 : 8,
                             height: 4, borderRadius: 4,
                             background: i === activeIdx ? T.a : T.border,
                             transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)"
                         }} />
                     ))}
                </div>

                {/* 3D Orbit Display Case */}
                <div ref={monolithRef} style={{
                    width: "100%", maxWidth: 560,
                    height: isMobile ? 500 : 700,
                    position: "relative",
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                    marginTop: 20
                }}>
                    {EDU_CHAPTERS.map((ch, i) => {
                        const zRadius = isMobile ? 320 : 420;
                        return (
                            <div key={i} ref={el => cardsRef.current[i] = el} style={{
                                position: "absolute", inset: 0,
                                transform: `rotateX(${i * 90}deg) translateZ(${zRadius}px)`,
                                transformOrigin: "50% 50%",
                                willChange: "filter, opacity"
                            }}>
                                <EduCardContent ch={ch} T={T} dark={dark} isMobile={isMobile} />
                            </div>
                        );
                    })}
                </div>

                {/* Subtitle */}
                <div style={{ position: "absolute", bottom: "8vh", fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.m, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    Scroll to revolve archive
                </div>
            </div>
        </div>
    );
}
