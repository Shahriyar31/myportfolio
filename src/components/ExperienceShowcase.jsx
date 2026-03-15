import { useState, useRef } from "react";

const EXP_DATA = [
    {
        id: "exp-1",
        date: "Aug 2025 → Present",
        type: "CURRENT",
        typeColor: "a3",
        company: "Nordex SE",
        role: "Werkstudent · AI & Data Engineering",
        bullets: [
            "Built an end-to-end internal AI assistant using Azure AI Foundry — RAG pipeline over 1,690 documents with GPT-4o / GPT-5 and text-embedding-3-large",
            "Engineered a custom tool router using rapidfuzz (3 algorithms, threshold 70/100) solving a core Azure AI Foundry autonomous tool-calling limitation",
            "Ran a 29-question LLM evaluation pipeline (GPT-4o as judge) — recommended GPT-4o at 11× lower cost, 4× faster inference with only 0.2 quality delta",
            "Delivered Streamlit chat UI, incremental vector store sync, 9 integrated tools, full technical docs & architecture diagrams"
        ],
        tech: ["Azure AI Foundry", "GPT-4o/GPT-5", "RAG", "Python 3.11", "Docker", "Streamlit", "Azure Databricks", "Azure DevOps"]
    },
    {
        id: "exp-2",
        date: "Feb 2026 → Mar 2026",
        type: "PROJECT MANAGEMENT",
        typeColor: "a2",
        company: "Nordex SE",
        role: "Werkstudent · Project Manager",
        bullets: [
            "Managed an enterprise AI project across 6 teams and external vendors",
            "Identified and resolved a multi-week infrastructure blockage by coordinating between cloud and network teams",
            "Kept all teams aligned through clear communication, ownership tracking, and regular status updates",
            "Delivered structured meeting notes and action trackers — project got back on track and hit its deadline"
        ],
        tech: ["Project Management", "Stakeholder Management", "Azure", "Cross-functional Leadership", "Vendor Coordination", "Agile Delivery"]
    },
    {
        id: "exp-3",
        date: "Aug 2025 → Jan 2026",
        type: "GOVERNANCE",
        typeColor: "a",
        company: "Nordex SE",
        role: "Werkstudent · AI Governance & Architecture",
        bullets: [
            "Designed end-to-end AI governance lifecycle covering use case definition, data governance, model development, validation, deployment, and post-deployment monitoring",
            "Created architecture diagrams translating Responsible AI principles into clear, buildable system designs for both technical and non-technical stakeholders",
            "Defined system boundaries, risk classifications, and transparency requirements for agentic AI systems aligned with EU AI Act compliance requirements",
            "Embedded GDPR and EU AI Act articles directly into governance documentation — ensuring lawful basis assessment, data protection, and regulatory traceability across the full AI lifecycle"
        ],
        tech: ["AI Governance", "Responsible AI", "Data Governance", "GDPR", "EU AI Act", "Architecture Design", "Risk Classification", "Technical Documentation", "Microsoft Visio"]
    }
];

function StickyCard({ item, T, dark, index, total }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const cColor = T[item.typeColor];

    const cardRef = useRef(null);
    const [ms, setMs] = useState({ x: 0, y: 0 });
    const [hov, setHov] = useState(false);

    const onMove = e => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMs({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div style={{
            position: "sticky",
            top: `calc(120px + ${index * 40}px)`,
            width: "100%",
            marginBottom: index === total - 1 ? 0 : "40px",
            zIndex: index + 1
        }}>
            <div 
                ref={cardRef}
                onMouseMove={onMove}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                className="exp-card-inner rv"
                style={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    gap: "64px",
                    padding: "64px",
                    borderRadius: "32px",
                    background: dark ? "rgba(10, 10, 16, 0.45)" : "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(32px)",
                    WebkitBackdropFilter: "blur(32px)",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                    borderTop: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,1)"}`,
                    boxShadow: dark ? "0 40px 100px rgba(0,0,0,0.8)" : "0 40px 100px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    cursor: "none",
                    transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                    transform: hov ? "translateY(-4px)" : "translateY(0)"
                }}
            >
                {/* Spotlight Cursor Glow */}
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: `radial-gradient(800px circle at ${ms.x}px ${ms.y}px, ${cColor}12, transparent 40%)`,
                    opacity: hov ? 1 : 0,
                    transition: "opacity 0.6s",
                    pointerEvents: "none",
                    zIndex: 0
                }} />
                
                {/* Subtle Top Glow Line */}
                <div style={{
                    position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
                    background: `linear-gradient(90deg, transparent, ${cColor}80, transparent)`,
                    opacity: hov ? 1 : 0, transition: "opacity 0.6s", zIndex: 0
                }} />

                {/* Left Column: Dates & Meta */}
                <div className="exp-date-col" style={{ flex: "0 0 240px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ ...fm, fontSize: 13, color: T.a, letterSpacing: ".1em", fontWeight: 600 }}>
                        {item.date}
                    </div>
                    <div>
                        <span style={{ 
                            ...fm, fontSize: 10, color: cColor, 
                            border: `1px solid ${cColor}40`, 
                            padding: "6px 16px", borderRadius: "100px", 
                            background: `${cColor}10`, fontWeight: 600,
                            letterSpacing: ".08em",
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            boxShadow: `0 0 20px ${cColor}15`
                        }}>
                            <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:cColor, animation: "blink 2.5s ease-in-out infinite", boxShadow: `0 0 8px ${cColor}` }} />
                            {item.type}
                        </span>
                    </div>
                </div>

                {/* Right Column: Roles & Bullets */}
                <div style={{ flex: "1 1 auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ ...sf, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, marginBottom: "16px", color: T.t, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                        {item.company}
                    </h3>
                    
                    <div style={{ ...fm, fontSize: 13, color: T.m, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "40px", display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ width: 48, height: 1, background: cColor }} />
                        <span style={{ color: T.a, fontWeight: 600 }}>{item.role.split('·')[0].trim()}</span>
                        <span style={{ color: T.dim }}>·</span>
                        <span style={{ color: T.m }}>{item.role.split('·')[1].trim()}</span>
                    </div>
                    
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "20px", marginBottom: "48px" }}>
                        {item.bullets.map((b, i) => (
                            <li key={i} style={{ 
                                fontSize: "16px", color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", lineHeight: 1.8, 
                                paddingLeft: "32px", position: "relative", fontFamily: "'Inter', sans-serif"
                            }}>
                                <svg style={{ position: "absolute", left: 0, top: "6px", color: cColor, opacity: 0.8 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                {b}
                            </li>
                        ))}
                    </ul>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "auto" }}>
                        {item.tech.map((t) => (
                            <span key={t} style={{ 
                                ...fm, fontSize: 11, color: T.m, 
                                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", 
                                border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, 
                                padding: "8px 18px", borderRadius: "12px",
                                transition: "all 0.3s", cursor: "none"
                            }}
                            onMouseEnter={(e) => { e.target.style.background = `${T.a}15`; e.target.style.color = T.a; e.target.style.borderColor = `${T.a}50`; }}
                            onMouseLeave={(e) => { e.target.style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"; e.target.style.color = T.m; e.target.style.borderColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"; }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Giant Ghost Number */}
                <div className="exp-ghost-num" style={{
                    position: "absolute",
                    right: "-20px", top: "-40px",
                    fontSize: "360px",
                    fontWeight: 800,
                    lineHeight: 1,
                    fontFamily: "'Playfair Display', serif",
                    color: dark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.02)",
                    pointerEvents: "none", zIndex: 0
                }}>
                    {index + 1}
                </div>
            </div>
        </div>
    );
}

export default function ExperienceShowcase({ T, dark }) {
    return (
        <div style={{ position: "relative", width: "100%", margin: "0 auto", marginTop: "40px" }}>
            <style>{`
                .exp-card-inner { flex-direction: row; }
                @media (max-width: 1024px) {
                    .exp-card-inner { flex-direction: column !important; padding: 48px 32px !important; gap: 32px !important; }
                    .exp-date-col { flex: 0 0 auto !important; margin-bottom: 0px; border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; padding-bottom: 32px; flex-direction: row !important; align-items: center; justify-content: space-between; }
                    .exp-ghost-num { font-size: 200px !important; top: -20px !important; right: 0px !important; }
                }
                @media (max-width: 600px) {
                    .exp-date-col { flex-direction: column !important; align-items: flex-start; gap: 12px !important; }
                }
            `}</style>
            
            <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingBottom: "120px" }}>
                {EXP_DATA.map((item, index) => (
                    <StickyCard key={item.id} item={item} T={T} dark={dark} index={index} total={EXP_DATA.length} />
                ))}
            </div>
        </div>
    );
}
