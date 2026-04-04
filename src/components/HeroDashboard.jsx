import { useEffect, useState } from "react";

const sf = { fontFamily: "'Sora', sans-serif" };
const fm = { fontFamily: "'Inter', sans-serif" };

export default function HeroDashboard({ T }) {
    
    return (
        <div className="hero-dash-container" style={{ width: "100%", display: "grid", gap: 16 }}>
            
            {/* Widget 1: Cost Reduction */}
            <div className="dash-widget" style={{ borderColor: `${T.border}` }}>
                <div className="widget-bg" style={{ background: "linear-gradient(to bottom right, rgba(10,102,194,0.1), transparent)" }} />
                
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div className="widget-head">
                        <div className="dot" style={{ background: "#0a66c2", boxShadow: "0 0 8px #0a66c2" }} />
                        <span style={{ color: T.m, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>RAG Pipeline</span>
                    </div>
                    
                    <div style={{ ...sf, fontSize: 36, fontWeight: 800, color: "white", marginTop: 8 }}>11× Drop</div>
                    <div style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Inference Cost Reduction</div>
                </div>

                {/* Autonomous Animation: Falling Bars */}
                <div className="auto-vis" style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60, marginTop: 24, paddingBottom: 10 }}>
                    {[100, 80, 60, 40, 20, 9].map((h, i) => (
                        <div key={i} style={{ flex: 1, backgroundColor: i === 5 ? "#0a66c2" : T.border, borderRadius: 2, height: `${h}%`, animation: `barDrop 2s infinite alternate ${i * 0.1}s` }} />
                    ))}
                </div>
            </div>

            {/* Widget 2: Latency */}
            <div className="dash-widget" style={{ borderColor: `${T.border}` }}>
                <div className="widget-bg" style={{ background: "linear-gradient(to bottom right, rgba(234,67,53,0.1), transparent)" }} />
                
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div className="widget-head">
                        <div className="dot" style={{ background: "#ea4335", boxShadow: "0 0 8px #ea4335" }} />
                        <span style={{ color: T.m, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>Model Inference</span>
                    </div>
                    
                    <div style={{ ...sf, fontSize: 36, fontWeight: 800, color: "white", marginTop: 8 }}>4× Faster</div>
                    <div style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Production Optimization</div>
                </div>

                {/* Autonomous Animation: Blazing Sine Wave */}
                <div className="auto-vis" style={{ height: 60, marginTop: 24, position: "relative", overflow: "hidden" }}>
                    <svg width="200%" height="100%" viewBox="0 0 400 40" preserveAspectRatio="none" style={{ position: "absolute", bottom: 10 }}>
                        <path d="M0 20 Q 25 5, 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20" fill="transparent" stroke={T.border} strokeWidth="2" />
                        <path className="sine-wave" d="M0 20 Q 25 5, 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20" fill="transparent" stroke="#ea4335" strokeWidth="3" />
                    </svg>
                </div>
            </div>

            {/* Widget 3: Uptime */}
            <div className="dash-widget" style={{ borderColor: `${T.border}` }}>
                <div className="widget-bg" style={{ background: "linear-gradient(to bottom right, rgba(0,166,126,0.1), transparent)" }} />
                
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div className="widget-head">
                        <div className="dot" style={{ background: "#00A67E", boxShadow: "0 0 8px #00A67E" }} />
                        <span style={{ color: T.m, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>K8s & Docker</span>
                    </div>
                    
                    <div style={{ ...sf, fontSize: 36, fontWeight: 800, color: "white", marginTop: 8 }}>100% Up</div>
                    <div style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Real-time Data Streaming</div>
                </div>

                {/* Autonomous Animation: Heartbeat flatline pulse */}
                <div className="auto-vis" style={{ height: 60, marginTop: 24, display: "flex", alignItems: "center" }}>
                    <div style={{ width: "100%", height: 3, background: T.border, position: "relative" }}>
                        <div className="heartbeat-pulse" style={{ width: 40, height: 3, background: "#00A67E", position: "absolute", top: 0, left: 0, boxShadow: "0 0 10px #00A67E" }} />
                    </div>
                </div>
            </div>

            {/* Widget 4: Accuracy */}
            <div className="dash-widget" style={{ borderColor: `${T.border}` }}>
                <div className="widget-bg" style={{ background: "linear-gradient(to bottom right, rgba(88,166,255,0.1), transparent)" }} />
                
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div className="widget-head">
                        <div className="dot" style={{ background: "#58a6ff", boxShadow: "0 0 8px #58a6ff" }} />
                        <span style={{ color: T.m, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>Deep Learning</span>
                    </div>
                    
                    <div style={{ ...sf, fontSize: 36, fontWeight: 800, color: "white", marginTop: 8 }}>97.5%</div>
                    <div style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>CNN Architecture Accuracy</div>
                </div>

                {/* Autonomous Animation: Target Scanner */}
                <div className="auto-vis" style={{ height: 60, marginTop: 24, position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 10 }}>
                    <div className="radar-circle" style={{ width: 40, height: 40, border: `2px solid ${T.border}`, borderRadius: "50%", position: "relative" }}>
                        <div className="radar-sweep" style={{ width: "50%", height: 2, background: "#58a6ff", position: "absolute", top: "50%", left: "50%", transformOrigin: "0 50%" }} />
                        <div style={{ position: "absolute", top: -4, left: 24, width: 6, height: 6, background: "#58a6ff", borderRadius: "50%", boxShadow: "0 0 6px #58a6ff", animation: "flicker 1.5s infinite" }} />
                    </div>
                    <div style={{ height: 2, width: 60, background: `linear-gradient(90deg, #58a6ff, transparent)`, marginLeft: 16 }} />
                </div>
            </div>

            <style>{`
                .hero-dash-container {
                    grid-template-columns: repeat(1, 1fr);
                }
                @media (min-width: 600px) {
                    .hero-dash-container { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1024px) {
                    .hero-dash-container { grid-template-columns: repeat(4, 1fr); }
                }

                .dash-widget {
                    position: relative;
                    background: ${T.card};
                    border: 1px solid ${T.border};
                    border-radius: 20px;
                    padding: 24px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 220px;
                }
                .widget-bg {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;
                }
                .widget-head {
                    display: flex; align-items: center; gap: 8px; font-family: ${fm.fontFamily};
                }
                .dot { width: 8px; height: 8px; border-radius: 50%; }

                /* Autonomous Animations */
                @keyframes barDrop {
                    0% { transform: scaleY(0.2); opacity: 0.5; }
                    100% { transform: scaleY(1); opacity: 1; }
                }
                .auto-vis .sine-wave {
                    stroke-dasharray: 400;
                    animation: slideSine 3s linear infinite;
                }
                @keyframes slideSine {
                    from { stroke-dashoffset: 400; }
                    to { stroke-dashoffset: 0; }
                }
                .heartbeat-pulse {
                    animation: pulseLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                @keyframes pulseLine {
                    0% { transform: translateX(-100%); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateX(300px); opacity: 0; }
                }
                .radar-sweep {
                    animation: radarSpin 2s linear infinite;
                }
                @keyframes radarSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes flicker {
                    0%, 100% { opacity: 1; filter: brightness(1.2); }
                    50% { opacity: 0.4; filter: brightness(0.8); }
                }
            `}</style>
        </div>
    );
}
