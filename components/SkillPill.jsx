import { useState, useEffect, useRef } from "react";

export default function SPill({ s, T, ac, delay = 0 }) {
    const [hov, setHov] = useState(false); const [vis, setVis] = useState(false); const ref = useRef(null);
    useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => setVis(true), delay); }, { threshold: .1 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, [delay]);
    return (
        <span ref={ref} className="spill" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                color: hov ? T.t : T.m, border: `1px solid ${hov ? ac : T.border}`, background: hov ? `${ac}14` : "transparent",
                boxShadow: hov ? `0 4px 18px ${ac}30` : "none",
                opacity: vis ? 1 : 0, animation: vis ? `fadeUp .4s ease both` : "none",
                "--ca": T.a, "--cbr": T.border, "--cm": T.m,
            }}>
            {s}
        </span>
    );
}
