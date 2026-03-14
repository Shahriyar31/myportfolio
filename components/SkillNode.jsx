import { useState, useEffect, useRef } from "react";

export default function SkillNode({ label, level, color, T, delay = 0, dark, isActive, onActivate, cardHovered }) {
    const [vis, setVis] = useState(false);
    const [hov, setHov] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (delay > 5000) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) setTimeout(() => setVis(true), delay);
        }, { threshold: .1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [delay]);

    const r = 20;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - (vis ? level : 0));
    const expanded = hov || isActive;
    const floatDur = 3 + (delay % 500) / 100; // Unique float duration per node

    return (
        <div ref={ref}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            onClick={onActivate}
            style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                opacity: vis ? 1 : 0,
                transform: vis
                    ? `translateY(0) scale(1)`
                    : `translateY(20px) scale(.85) rotate(${(delay % 2 === 0 ? 5 : -5)}deg)`,
                transition: `opacity .5s ${delay}ms ease, transform .6s ${delay}ms cubic-bezier(.16,1,.3,1)`,
                cursor: "none", padding: "8px 4px",
                animation: vis && cardHovered ? `skillFloat ${floatDur}s ease-in-out infinite` : "none",
                animationDelay: `${delay * .5}ms`,
            }}>
            {/* Progress ring */}
            <div style={{
                position: "relative", width: expanded ? 56 : 48, height: expanded ? 56 : 48,
                transition: "all .3s cubic-bezier(.16,1,.3,1)",
                filter: expanded ? `drop-shadow(0 0 16px ${color}90)` : "none",
            }}>
                <svg width="100%" height="100%" viewBox="0 0 48 48" style={{ transform: "rotate(-90deg)" }}>
                    {/* Track ring */}
                    <circle cx="24" cy="24" r={r} fill="none"
                        stroke={dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}
                        strokeWidth={expanded ? "3.5" : "2.5"} />
                    {/* Animated track pulse when hovered */}
                    {expanded && (
                        <circle cx="24" cy="24" r={r} fill="none"
                            stroke={color}
                            strokeWidth="1" opacity=".15"
                            strokeDasharray="4 4">
                            <animateTransform attributeName="transform"
                                type="rotate" from="0 24 24" to="360 24 24"
                                dur="8s" repeatCount="indefinite" />
                        </circle>
                    )}
                    {/* Progress arc */}
                    <circle cx="24" cy="24" r={r} fill="none"
                        stroke={color}
                        strokeWidth={expanded ? "3.5" : "2.5"}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: `stroke-dashoffset 1.2s ${delay + 200}ms cubic-bezier(.16,1,.3,1), stroke-width .2s` }}
                        opacity={expanded ? 1 : .65} />
                    {/* Glowing end dot */}
                    {vis && expanded && (
                        <circle
                            cx={24 + r * Math.cos(-Math.PI / 2 + level * Math.PI * 2)}
                            cy={24 + r * Math.sin(-Math.PI / 2 + level * Math.PI * 2)}
                            r="3" fill={color} opacity=".9">
                            <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                    )}
                </svg>
                {/* Percentage in center */}
                <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: expanded ? 11 : 9, fontWeight: 700,
                    color: expanded ? color : T.m,
                    transition: "all .25s",
                }}>
                    {vis ? Math.round(level * 100) : 0}
                </div>
                {/* Ripple on click */}
                {isActive && (
                    <div style={{
                        position: "absolute", inset: -8, borderRadius: "50%",
                        border: `2px solid ${color}`,
                        animation: "rippleOut 1s ease-out infinite",
                        pointerEvents: "none",
                    }} />
                )}
            </div>
            {/* Label */}
            <span style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: expanded ? 10 : 9, letterSpacing: ".04em",
                color: expanded ? color : T.m,
                textAlign: "center",
                maxWidth: expanded ? 100 : 80,
                transition: "all .25s",
                lineHeight: 1.3,
                fontWeight: expanded ? 600 : 400,
            }}>
                {label}
            </span>
            {/* Expanded tooltip */}
            {expanded && (
                <div style={{
                    ...{ fontFamily: "'JetBrains Mono',monospace" },
                    fontSize: 8, color: T.m,
                    background: dark ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.85)",
                    backdropFilter: "blur(8px)",
                    border: `1px solid ${color}30`,
                    padding: "3px 8px", borderRadius: 6,
                    animation: "fadeUp .2s ease",
                    whiteSpace: "nowrap",
                    letterSpacing: ".06em",
                }}>
                    {level >= .9 ? "★ Expert" : level >= .8 ? "◆ Advanced" : level >= .7 ? "● Proficient" : "○ Intermediate"}
                </div>
            )}
        </div>
    );
}
