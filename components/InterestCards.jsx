import { useState, useEffect, useRef } from "react";

const INTERESTS = [
    { icon: "📷", label: "Photographer", value: "Landscape & Street", accent: "#e879a0" },
    { icon: "🎵", label: "Music", value: "Lo-fi while coding", accent: "#a78bfa" },
    { icon: "🌍", label: "Languages", value: "Bengali · English · German A1", accent: "#34d399" },
    { icon: "☕", label: "Fuel", value: "Coffee & curiosity", accent: "#fbbf24" },
];

export default function InterestCards({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
            {/* Connecting vertical line */}
            <div style={{
                position: "absolute", left: 19, top: 12, bottom: 12,
                width: 1, background: `linear-gradient(to bottom,${T.a}30,${T.a2}30,${T.a3}30)`,
                zIndex: 0,
            }} />

            {INTERESTS.map((item, i) => (
                <InterestItem key={item.label} item={item} i={i} T={T} dark={dark} fm={fm} />
            ))}
        </div>
    );
}

function InterestItem({ item, i, T, dark, fm }) {
    const [hov, setHov] = useState(false);
    const [vis, setVis] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) setTimeout(() => setVis(true), i * 100);
        }, { threshold: .2 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [i]);

    return (
        <div ref={ref}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 14,
                border: `1px solid ${hov ? item.accent + "60" : T.border}`,
                background: hov
                    ? (dark ? `${item.accent}0a` : `${item.accent}08`)
                    : T.card,
                fontSize: 12, cursor: "none",
                transition: "all .35s cubic-bezier(.16,1,.3,1)",
                transform: vis
                    ? (hov ? "translateX(8px) scale(1.02)" : "translateX(0) scale(1)")
                    : "translateX(-20px) scale(.95)",
                opacity: vis ? 1 : 0,
                boxShadow: hov ? `0 8px 24px ${item.accent}18` : "none",
                position: "relative", zIndex: 1,
                backdropFilter: "blur(8px)",
            }}>
            {/* Icon with bounce */}
            <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: hov ? `${item.accent}18` : (dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, flexShrink: 0,
                transition: "all .3s",
                transform: hov ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0)",
                border: `1px solid ${hov ? item.accent + "30" : "transparent"}`,
            }}>
                {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...fm, fontSize: 8, color: hov ? item.accent : T.m, letterSpacing: ".1em", textTransform: "uppercase", transition: "color .3s", marginBottom: 2 }}>{item.label}</div>
                <div style={{ color: hov ? T.t : T.m, fontSize: 11, fontWeight: 500, transition: "color .3s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.value}</div>
            </div>
            {/* Arrow indicator */}
            <div style={{
                ...fm, fontSize: 12, color: item.accent,
                opacity: hov ? 1 : 0,
                transform: hov ? "translateX(0)" : "translateX(-8px)",
                transition: "all .3s",
            }}>→</div>
        </div>
    );
}
