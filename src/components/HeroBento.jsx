import { useState } from "react";

const fm = { fontFamily: "'Inter', sans-serif" };
const sf = { fontFamily: "'Sora', sans-serif" };

const ACCORDION_DATA = [
    {
        id: "bio",
        title: "The Journey",
        icon: "🌍",
        bg: "linear-gradient(135deg, #1c2331, #2d4a6b)",
        content: "relocated to Hamburg, Germany to pursue my M.Sc. in Data Science at TUHH. Blending theoretical depth with hands-on AI engineering.",
        stats: [["India 🇮🇳", "Origin"], ["Hamburg 🇩🇪", "Current"], ["TUHH", "M.Sc. Data Science"]]
    },
    {
        id: "work",
        title: "The Impact",
        icon: "⚡",
        bg: "linear-gradient(135deg, #0f2c2f, #097C87)",
        content: "At Nordex SE, I architected an end-to-end RAG pipeline across 1,600+ documents. My custom semantic router dropped inference costs by 11× while speeding up AI responses by 4×.",
        stats: [["11x", "Cost Reduction"], ["4x", "Speed Up"], ["1.6k+", "Docs Indexed"]]
    },
    {
        id: "stack",
        title: "The Arsenal",
        icon: "🧠",
        bg: "linear-gradient(135deg, #2b1f31, #5a4060)",
        content: "I don't just train models; I build highly scalable, production-ready AI pipelines spanning from data ingestion to cloud deployment.",
        stats: [["Azure AI", "MLOps"], ["Apache Kafka", "Streaming"], ["Docker/K8s", "Deployment"]]
    },
    {
        id: "future",
        title: "The Vision",
        icon: "🚀",
        bg: "linear-gradient(135deg, #3a2015, #873e09)",
        content: "Seeking opportunities to push the boundaries of Applied AI. I want to tackle massive data challenges and build intelligent systems that truly matter.",
        stats: [["Open to Work", "Status"], ["AI/Data Engineer", "Role"], ["Global", "Relocation"]]
    }
];

export default function HeroBento({ T, dark }) {
    const [active, setActive] = useState("work");

    return (
        <div style={{
            display: "flex", gap: 16, width: "100%", height: "100%", minHeight: 320,
            fontFamily: "'Inter', sans-serif", position: "relative", zIndex: 10
        }}>
            {/* The Accordion Panels */}
            {ACCORDION_DATA.map((item) => {
                const isActive = active === item.id;
                
                return (
                    <div 
                        key={item.id}
                        onMouseEnter={() => setActive(item.id)}
                        style={{
                            flex: isActive ? 5 : 1,
                            position: "relative",
                            background: item.bg,
                            borderRadius: 24,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "flex 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
                            border: `1px solid ${isActive ? T.a : T.border}`,
                            boxShadow: isActive ? `0 10px 40px rgba(0,0,0,0.4)` : "none"
                        }}
                    >
                        {/* Vertical Title (when collapsed) */}
                        <div style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            opacity: isActive ? 0 : 0.8,
                            transition: "opacity 0.4s", pointerEvents: "none"
                        }}>
                            <span style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</span>
                            <span style={{ 
                                ...sf, fontSize: 16, fontWeight: 700, color: "white", 
                                writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: 3 
                            }}>
                                {item.title}
                            </span>
                        </div>

                        {/* Expanded Content */}
                        <div style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            padding: "32px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between",
                            opacity: isActive ? 1 : 0, transition: "opacity 0.5s 0.2s", pointerEvents: isActive ? "auto" : "none"
                        }}>
                            <div>
                                <h3 style={{ ...sf, fontSize: 28, color: "white", fontWeight: 800, marginBottom: 16, display:"flex", alignItems:"center", gap:12 }}>
                                    <span>{item.icon}</span> {item.title}
                                </h3>
                                <div style={{width: 50, height: 4, background: T.a, marginBottom: 20, borderRadius: 2}} />
                                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, maxWidth: 450 }}>
                                    {item.content}
                                </p>
                            </div>
                            
                            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
                                {item.stats.map(([pfx, sfx], i) => (
                                    <div key={i} style={{ background: "rgba(0,0,0,0.35)", padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                                        <div style={{...sf, fontSize: 20, fontWeight: 800, color: "white"}}>{pfx}</div>
                                        <div style={{fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:1}}>{sfx}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
