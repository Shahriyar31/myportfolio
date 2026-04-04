import { useState, useEffect } from "react";

const fm = { fontFamily: "'Inter', sans-serif" };
const sf = { fontFamily: "'Space Grotesk', 'Sora', sans-serif" };

const HACK_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*X";

const IMPACT_DATA = [
    { id: "1", title: "11× Cost Drop", desc: "Engineered semantic RAG routing scaling 1.6k+ docs", sub: "Nordex SE" },
    { id: "2", title: "4× Speed Up", desc: "Drastically reduced model inference latency in production", sub: "MLOps" },
    { id: "3", title: "Zero Downtime", desc: "Orchestrated flawless streaming pipelines via Kafka & Docker", sub: "Data Eng" },
    { id: "4", title: "97.5% Accuracy", desc: "Trained & deployed resilient Computer Vision networks", sub: "Deep Learning" },
    { id: "5", title: "Digital Twin", desc: "Architected real-time IoT observability dashboards", sub: "Full Stack" },
    { id: "6", title: "Sub-ms Search", desc: "Implemented massive Vector DBs (FAISS, Pinecone) for AI apps", sub: "Vector DB" }
];

function DecryptCard({ data, T }) {
    const [status, setStatus] = useState("locked"); // locked, hacking, unlocked
    const [displayTitle, setDisplayTitle] = useState("ENCRYPTED");

    const hack = () => {
        if (status !== "locked") return;
        setStatus("hacking");
        
        let iteration = 0;
        const total = 15;
        const interval = setInterval(() => {
            setDisplayTitle(data.title.split("").map((c, i) => {
                if (c === " ") return " ";
                if (i < (iteration / total) * data.title.length) return data.title[i];
                return HACK_CHARS[Math.floor(Math.random() * HACK_CHARS.length)];
            }).join(""));
            
            iteration++;
            if (iteration > total) {
                clearInterval(interval);
                setDisplayTitle(data.title);
                setStatus("unlocked");
            }
        }, 40);
    };

    return (
        <div 
            onClick={hack}
            style={{
                position: "relative",
                background: status === "unlocked" ? `linear-gradient(135deg, ${T.card}, #112a32)` : T.card,
                border: `1px solid ${status === "unlocked" ? T.a : T.border}`,
                borderRadius: 16,
                padding: "20px",
                cursor: status === "locked" ? "pointer" : "default",
                minHeight: 140,
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                textAlign: "center",
                transition: "all 0.3s ease",
                boxShadow: status === "unlocked" ? `0 0 20px ${T.a}40` : "none",
                transform: status === "hacking" ? "scale(0.96)" : "scale(1)",
                overflow: "hidden"
            }}
            onMouseEnter={(e) => {
                if(status === "locked") e.currentTarget.style.borderColor = T.a2;
            }}
            onMouseLeave={(e) => {
                if(status === "locked") e.currentTarget.style.borderColor = T.border;
            }}
        >
            <div style={{ ...sf, fontSize: status === "locked" ? 14 : 20, fontWeight: 800, color: status === "unlocked" ? T.t : T.m, letterSpacing: status === "locked" ? 2 : 0, transition: "font-size 0.3s", zIndex: 2 }}>
                {displayTitle}
            </div>
            
            <div style={{
                opacity: status === "unlocked" ? 1 : 0,
                transform: status === "unlocked" ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.4s 0.1s",
                display: "flex", flexDirection: "column", gap: 8, marginTop: 12, zIndex: 2
            }}>
                <div style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{data.desc}</div>
                <div style={{ fontSize: 10, color: T.a, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{data.sub}</div>
            </div>

            {/* Locked Background pattern */}
            {status === "locked" && (
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "10px 10px", opacity: 0.5, pointerEvents: "none" }} />
            )}
        </div>
    );
}

export default function HeroGame({ T, dark }) {
    return (
        <div style={{ width: "100%", padding: "20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, background: T.a, borderRadius: "50%", animation: "pulse 2s infinite" }} />
                <h3 style={{ ...sf, fontSize: 16, color: T.t, letterSpacing: 1, textTransform: "uppercase" }}>Gamified Decryption: <span style={{color: T.m}}>Tap nodes to unveil Core Impacts</span></h3>
            </div>
            
            <div className="hero-grid-game">
                {IMPACT_DATA.map(item => <DecryptCard key={item.id} data={item} T={T} />)}
            </div>

            <style>{`
                .hero-grid-game {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 16px;
                }
                @media (min-width: 600px) {
                    .hero-grid-game {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .hero-grid-game {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}</style>
        </div>
    );
}
