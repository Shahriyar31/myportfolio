import { useState, useEffect, useRef } from "react";

export default function SH({ n, title, T }) {
    const ref = useRef(null); const [vis, setVis] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: .2 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} style={{ marginBottom: 64, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="sec-num" style={{ "--ca": T.a }}>{n}</span>
                <h2 className={`sec-title${vis ? " vi" : ""}`}
                    style={{
                        fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,56px)",
                        "--ct": T.t, "--ca": T.a, "--ca2": T.a2,
                        backgroundImage: vis ? `linear-gradient(135deg,${T.t} 0%,${T.t} 50%,${T.a} 100%)` : "none",
                        color: vis ? "transparent" : T.t,
                        animation: vis ? "headingReveal .7s ease both" : "none",
                        animationDelay: ".1s"
                    }}>
                    {title}
                </h2>
            </div>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${T.a}60,${T.a2}40,transparent)`, transform: vis ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform .8s .3s ease", opacity: .6 }} />
        </div>
    );
}
