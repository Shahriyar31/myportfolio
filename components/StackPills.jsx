import { useState, useEffect, useRef } from "react";

const STACK = [
    { name: "Azure AI Foundry", cat: "ai",    used: "Nordex SE — RAG Pipeline" },
    { name: "Python 3.11",      cat: "lang",  used: "Primary language" },
    { name: "RAG",              cat: "ai",    used: "1,690 docs ingested" },
    { name: "Docker",           cat: "cloud", used: "All deployments" },
    { name: "Apache Kafka",     cat: "data",  used: "Real-time streaming" },
    { name: "Azure Databricks", cat: "data",  used: "Data processing" },
    { name: "Streamlit",        cat: "ai",    used: "AI Assistant UI" },
    { name: "GCP",              cat: "cloud", used: "Cloud infrastructure" },
    { name: "MLflow",           cat: "ai",    used: "Experiment tracking" },
];

export default function StackPills({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };

    const catColors = {
        ai: T.a,
        data: T.a2,
        cloud: T.a3,
        lang: "#f59e0b",
    };

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {STACK.map((s, i) => (
                <Pill key={s.name} s={s} i={i} T={T} dark={dark} fm={fm} color={catColors[s.cat]} />
            ))}
        </div>
    );
}

function Pill({ s, i, T, dark, fm, color }) {
    const [hov, setHov] = useState(false);
    const [vis, setVis] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) setTimeout(() => setVis(true), i * 50);
        }, { threshold: .1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [i]);

    return (
        <div ref={ref} style={{ position: "relative", display: "inline-flex" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <span style={{
                ...fm, fontSize: 10, padding: "6px 14px",
                border: `1px solid ${hov ? color : T.border}`,
                borderRadius: 20,
                color: hov ? color : T.m,
                background: hov ? `${color}0e` : T.card,
                cursor: "none", display: "inline-block",
                transition: "all .25s cubic-bezier(.16,1,.3,1)",
                transform: vis
                    ? (hov ? "translateY(-3px) scale(1.04)" : "translateY(0) scale(1)")
                    : "translateY(10px) scale(.9)",
                opacity: vis ? 1 : 0,
                boxShadow: hov ? `0 6px 16px ${color}20` : "none",
                backdropFilter: "blur(4px)",
            }}>
                <span style={{
                    display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                    background: color, marginRight: 6, verticalAlign: "middle",
                    opacity: hov ? 1 : .4, transition: "opacity .2s",
                    boxShadow: hov ? `0 0 6px ${color}` : "none",
                }} />
                {s.name}
            </span>

            {/* Tooltip */}
            {hov && (
                <div style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
                    transform: "translateX(-50%)",
                    ...fm, fontSize: 9, color: T.t,
                    background: dark ? "rgba(20,20,30,.9)" : "rgba(255,255,255,.95)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${color}30`,
                    padding: "5px 12px", borderRadius: 8,
                    whiteSpace: "nowrap",
                    boxShadow: `0 8px 24px rgba(0,0,0,.2)`,
                    animation: "fadeUp .15s ease",
                    zIndex: 10,
                }}>
                    <span style={{ color: T.m, marginRight: 4 }}>↳</span>
                    {s.used}
                    <div style={{
                        position: "absolute", bottom: -4, left: "50%",
                        transform: "translateX(-50%) rotate(45deg)",
                        width: 8, height: 8,
                        background: dark ? "rgba(20,20,30,.9)" : "rgba(255,255,255,.95)",
                        borderRight: `1px solid ${color}30`,
                        borderBottom: `1px solid ${color}30`,
                    }} />
                </div>
            )}
        </div>
    );
}
