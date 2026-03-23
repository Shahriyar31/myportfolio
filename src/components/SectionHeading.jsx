import { useState, useEffect, useRef } from "react";

export default function SH({ n, title, T }) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);

    useEffect(() => {
        // On mobile show immediately — skip animation
        if (window.innerWidth <= 768) { setVis(true); return; }
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) setVis(true);
        }, { threshold: 0, rootMargin: "-5% 0px -5% 0px" });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    const mobile = typeof window !== "undefined" && window.innerWidth <= 768;
    const sf = { fontFamily: "'Sora', sans-serif" };
    const fm = { fontFamily: "'Inter', sans-serif" };

    return (
        <div ref={ref} style={{ marginBottom: 64, display: "flex", alignItems: "center", gap: 20, overflow: "visible" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <span style={{ ...fm, fontSize: 11, letterSpacing: ".2em", color: T.a }}>{n}</span>
                <h2 style={{
                    ...sf,
                    fontSize: "clamp(32px,5vw,56px)",
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    lineHeight: 1,
                    // Safe fallback color always set
                    color: T.t,
                    // Gradient text only on desktop where background-clip is reliable
                    ...(vis && !mobile ? {
                        backgroundImage: `linear-gradient(135deg,${T.t} 0%,${T.t} 50%,${T.a} 100%)`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    } : {}),
                    opacity: vis ? 1 : 0,
                    transform: vis ? "translateY(0)" : "translateY(16px)",
                    transition: "opacity 0.6s ease, transform 0.6s ease",
                }}>
                    {title}
                </h2>
            </div>
            <div style={{
                flex: 1, height: 1, minWidth: 0,
                background: `linear-gradient(90deg,${T.a}60,${T.a2}40,transparent)`,
                transform: vis ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.8s 0.2s ease",
                opacity: 0.6,
            }} />
        </div>
    );
}