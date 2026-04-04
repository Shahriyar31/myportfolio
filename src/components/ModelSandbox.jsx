import { useState, useEffect, useRef } from "react";
import HeroChat from "./HeroChat";

const fm = { fontFamily: "'Inter', sans-serif" };
const sf = { fontFamily: "'Sora', sans-serif" };

const DATA_NODES = [
    { id: "exp", label: "Dataset_Experience", icon: "💼", result: "Nordex SE: Built End-to-end RAG pipeline outperforming limits. Cost reduced 11×, Inference speed 4×." },
    { id: "proj", label: "Dataset_Projects", icon: "🚀", result: "Poultry Shield: CNN scoring 97.5% acc on AWS. Digital Twin: Real-time anomaly dashboard." },
    { id: "skills", label: "Dataset_Skills", icon: "🧠", result: "Weights locked: Azure AI, PyTorch, Docker, Kafka, React. Pipeline is robust." }
];

export default function ModelSandbox({ T, dark, scrollTo }) {
    const [trained, setTrained] = useState([]);
    const [activeNode, setActiveNode] = useState(null);
    const [logs, setLogs] = useState([
        "[SYSTEM] AI Sandbox Initialized.",
        "> Wait: Model requires training data."
    ]);

    const logsEndRef = useRef(null);
    useEffect(() => {
        if(logsEndRef.current) logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }, [logs]);

    const handleFeed = (node) => {
        if (trained.includes(node.id) || activeNode) return;
        setActiveNode(node.id);
        
        setLogs(prev => [...prev, `> Ingesting ${node.label}...`]);
        
        setTimeout(() => {
            setLogs(prev => [...prev, `[Processing] Running backprop for ${node.id}...`]);
        }, 600);
        
        setTimeout(() => {
            setLogs(prev => [...prev, `[Output] ${node.result}`]);
            setTrained(prev => [...prev, node.id]);
            setActiveNode(null);
        }, 2200);
    };

    const isComplete = trained.length === DATA_NODES.length;

    return (
        <div style={{
            width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 16,
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24,
            boxShadow: `0 12px 40px ${T.bg}80`, backdropFilter: "blur(12px)", position:"relative", zIndex:10
        }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <h3 style={{...sf, fontSize: 16, color: T.t, fontWeight: 700, display:"flex", alignItems:"center", gap:8}}>
                    <span style={{
                        width:10, height:10, borderRadius:"50%", 
                        background: isComplete ? T.a : "#ea4335", 
                        animation: isComplete ? "none" : "pulse 2s infinite"
                    }} />
                    Model Training Sandbox
                </h3>
                <span style={{...fm, fontSize:11, color:T.m, fontWeight: 600}}>
                    Progress: {Math.round((trained.length/DATA_NODES.length)*100)}%
                </span>
            </div>

            {/* Neural Canvas Area */}
            <div style={{
                position:"relative", height: 200, border: `1px solid ${T.border}60`, borderRadius: 12,
                background: dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden"
            }}>
                {/* Visual Core Node */}
                <div style={{
                    position:"relative", zIndex: 2,
                    width: 64, height: 64, borderRadius: "50%",
                    background: activeNode ? T.a : T.border,
                    boxShadow: activeNode ? `0 0 40px ${T.a}` : "none",
                    transition: "all 0.3s ease",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    ...sf, fontSize: 12, color: dark ? "#000" : "#fff", fontWeight:800, letterSpacing:1
                }}>
                    CORE
                </div>
                
                {/* Floating "Data Nodes" */}
                {DATA_NODES.map((n, i) => {
                    const isTrained = trained.includes(n.id);
                    const isActive = activeNode === n.id;
                    const angle = (i / DATA_NODES.length) * Math.PI * 2 - Math.PI/2;
                    // Circle positions
                    const px = isActive ? "50%" : `calc(50% + ${Math.cos(angle)*110}px)`;
                    const py = isActive ? "50%" : `calc(50% + ${Math.sin(angle)*65}px)`;

                    return (
                        <div key={n.id} onClick={() => handleFeed(n)} style={{
                            position:"absolute", top: py, left: px, transform: "translate(-50%, -50%)",
                            padding: "8px 12px", background: isTrained ? T.a3 : T.card, 
                            border: `1px solid ${isTrained ? T.a3 : T.a}`,
                            color: isTrained ? "white" : T.t, borderRadius: 20, ...fm, fontSize: 11, fontWeight: 500,
                            cursor: (isTrained || activeNode) ? "default" : "pointer",
                            transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            opacity: (activeNode && !isActive) ? 0.2 : 1, zIndex: isActive ? 3 : 1,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display:"flex", alignItems:"center", gap:6,
                            whiteSpace:"nowrap"
                        }}>
                            <span style={{fontSize: 14}}>{n.icon}</span> {!isActive && (isTrained ? "Processed" : n.label)}
                        </div>
                    );
                })}

                {/* Processing Network Effects */}
                {activeNode && (
                    <svg style={{position:"absolute", top:0, left:0, width:"100%", height:"100%", zIndex:1}}>
                        <circle cx="50%" cy="50%" r="50" stroke={T.a} strokeWidth="2" fill="none" strokeDasharray="6 6" style={{animation: "spin 3s linear infinite"}} />
                        <circle cx="50%" cy="50%" r="80" stroke={T.a} strokeWidth="1" fill="none" opacity="0.4" style={{animation: "spin 6s linear infinite reverse"}} />
                        <line x1="10%" y1="90%" x2="50%" y2="50%" stroke={T.a} strokeWidth="1" opacity="0.3" />
                        <line x1="90%" y1="10%" x2="50%" y2="50%" stroke={T.a} strokeWidth="1" opacity="0.3" />
                    </svg>
                )}
                {!activeNode && !isComplete && (
                     <div style={{ position: "absolute", bottom: 10, ...fm, fontSize: 10, color: T.m, animation: "blink 2s infinite" }}>
                         Click missing datasets to train model
                     </div>
                )}
            </div>

            {/* Terminal Output */}
            <div ref={logsEndRef} style={{
                background: "#0c0c0e", color: "#4af626", ...fm, fontSize: 11, padding: 14, borderRadius: 10,
                height: 110, overflowY: "auto", display:"flex", flexDirection:"column", gap:6,
                boxShadow: "inset 0 0 15px rgba(0,0,0,0.8)", border: "1px solid #222"
            }}>
                {logs.map((L, idx) => (
                    <div key={idx} style={{ 
                        opacity: idx === logs.length - 1 ? 1 : 0.6,
                        color: L.startsWith("[Output]") ? "#fff" : (L.startsWith("[SYSTEM]") ? "#f5dc23" : "#4af626"),
                        fontWeight: L.startsWith("[Output]") ? 600 : 400
                    }}>{L}</div>
                ))}
                {activeNode && <div style={{animation: "blink 1s steps(2, start) infinite"}}>_</div>}
            </div>

            {/* Deploy Action */}
            {isComplete && (
                <button onClick={(e) => scrollTo("projects", e)} style={{
                    width: "100%", padding: "14px", background: T.a, color: "white", borderRadius: 10,
                    border: "none", ...fm, fontWeight: 700, fontSize: 12, cursor: "pointer",
                    animation: "fadeUp 0.6s ease", boxShadow: `0 4px 15px ${T.a}50`, textTransform: "uppercase",
                    letterSpacing: 1
                }}>
                    Model Deployed. View Experience →
                </button>
            )}

            <div style={{height: 1, background: T.border, margin: "2px 0"}} />
            
            <div style={{ transform: "scale(0.95)", transformOrigin: "top center", marginTop: -10 }}>
                <HeroChat T={T} />
            </div>
        </div>
    );
}
