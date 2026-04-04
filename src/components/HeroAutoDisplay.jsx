import { useState, useEffect } from "react";

const sf = { fontFamily: "'Sora', sans-serif" };
const fm = { fontFamily: "'Inter', sans-serif" };

const AUTO_DATA = [
    { 
        phase: "DATA PIPELINE", 
        stat: "11× Cost Drop", 
        desc: "Built a custom semantic RAG router across 1.6k+ documents at Nordex SE.", 
        color: "#0a66c2",
        nodes: ["> index_docs", "> build_router", "> optimize_inference"]
    },
    { 
        phase: "SYSTEM ARCHITECTURE", 
        stat: "Zero Downtime", 
        desc: "Orchestrated massive real-time streaming architectures using Apache Kafka & Docker.", 
        color: "#ea4335",
        nodes: ["> init_kafka", "> deploy_kubernetes", "> stream_data"]
    },
    { 
        phase: "MODEL DEPLOYMENT", 
        stat: "97.5% Accuracy", 
        desc: "Engineered and deployed resilient Computer Vision networks for Poultry Shield.", 
        color: "#58a6ff",
        nodes: ["> train_cnn", "> tune_hyperparams", "> deploy_model"]
    },
    { 
        phase: "PERFORMANCE", 
        stat: "4× Speed Up", 
        desc: "Drastically reduced model inference latency for pure production environments.", 
        color: "#00A67E",
        nodes: ["> profile_latency", "> optimize_weights", "> serve_endpoint"]
    }
];

export default function HeroAutoDisplay({ T }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Runs an infinite progress bar. Every 5 seconds, swaps the slide.
        let startTime = Date.now();
        const duration = 6000; // 6 seconds per slide

        const interval = setInterval(() => {
            const passed = Date.now() - startTime;
            if (passed >= duration) {
                startTime = Date.now();
                setCurrentIndex(prev => (prev + 1) % AUTO_DATA.length);
                setProgress(0);
            } else {
                setProgress((passed / duration) * 100);
            }
        }, 16);

        return () => clearInterval(interval);
    }, []);

    const slide = AUTO_DATA[currentIndex];

    return (
        <div className="auto-display-container">
            
            {/* Top Progress Bar */}
            <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.05)", position: "absolute", top: 0, left: 0 }}>
                <div style={{ width: `${progress}%`, height: "100%", background: slide.color, boxShadow: `0 0 10px ${slide.color}`, transition: "width 0.1s linear" }} />
            </div>

            {/* Glowing ambient background tied to the active color */}
            <div style={{ position: "absolute", top: "-50%", right: "-10%", width: 300, height: 300, background: slide.color, filter: "blur(100px)", opacity: 0.15, transition: "background 1s ease, opacity 0.5s ease", pointerEvents: "none" }} />

            <div className="auto-display-content" style={{ display: "flex", flex: 1, padding: 32, gap: 40, alignItems: "center" }}>
                
                {/* Left: Auto-typing terminal execution block */}
                <div className="auto-display-term" style={{ height: "100%", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
                    <div style={{ ...fm, fontSize: 10, color: T.m, textTransform: "uppercase", letterSpacing: 2 }}>{slide.phase}</div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                        {slide.nodes.map((node, i) => (
                            <div key={`${currentIndex}-${i}`} style={{ ...fm, fontSize: 12, color: T.a2, animation: `fadeUp 0.3s ${i * 0.8}s both` }}>
                                {node} <span style={{ color: slide.color, animation: `pulse 1s ${i*0.8 + 0.3}s infinite` }}>_</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Massive Cinematic Stat Overlay */}
                <div key={currentIndex} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: "blurIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both" }}>
                    <h2 style={{ ...sf, fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.03em", textShadow: `0 0 40px ${slide.color}50` }}>
                        {slide.stat}
                    </h2>
                    <div style={{ width: 60, height: 4, background: slide.color, marginTop: 16, marginBottom: 20, borderRadius: 2 }} />
                    <p style={{ ...fm, fontSize: "clamp(13px, 1.5vw, 18px)", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 600 }}>
                        {slide.desc}
                    </p>
                </div>
            </div>

            <style>{`
                .auto-display-container {
                    width: 100%; min-height: 260px; position: relative; border-radius: 24px;
                    background: linear-gradient(145deg, rgba(20,20,30,0.4), rgba(10,10,15,0.8));
                    border: 1px solid ${T.border}; overflow: hidden; display: flex; flex-direction: column;
                }
                .auto-display-term {
                    flex: 0 0 250px; padding-right: 20px;
                }
                @keyframes blurIn {
                    0% { filter: blur(10px); opacity: 0; transform: translateX(20px); }
                    100% { filter: blur(0px); opacity: 1; transform: translateX(0); }
                }
                @media (max-width: 768px) {
                    .auto-display-content {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 20px !important;
                    }
                    .auto-display-term {
                        flex: auto; border-right: none !important; border-bottom: 1px solid ${T.border};
                        padding-right: 0; padding-bottom: 20px; width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
