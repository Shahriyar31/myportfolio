import { useState, useEffect, useRef } from "react";

const CODE_SCRIPT = `import farhan.core as f_core
from ai.infrastructure import AutoScale, NeuralOptimizer

# [1] Initialize High-Performance Architecture
agent = f_core.DataEngineer(
    stack=["Kafka", "Docker", "PyTorch", "AzureAI"],
    mode="autonomous_scaling"
)

# [2] Deploy Semantic RAG Subsystem
agent.build_rag_router(docs=1600, throughput="Max")

# [3] Orchestrate Deep Learning Networks
vision_model = agent.train_vision_model(target="Poultry_CV")
NeuralOptimizer.compile(vision_model, target_acc=0.975)

# [4] Cloud Inference Optimization
agent.optimize_inference_graphs()`;

const TERMINAL_OUTPUT = [
    { text: "~/portfolio % python3 pipeline.py", delay: 800, type: "cmd" },
    { text: "> Deploying core infrastructure modules... [OK]", delay: 300 },
    { text: "> Initializing semantic memory (1,600+ documents)... [OK]", delay: 500 },
    { text: "> Training Vision CNN (target: Poultry Shield)...", delay: 600 },
    { text: "  ➔ Success: Resilient model compiled.", delay: 300, highlight: "blue" },
    { text: "  ➔ Validation Accuracy: 97.5% [Production Ready]", delay: 400, highlight: "green" },
    { text: "> Optimizing inference computation graphs...", delay: 700 },
    { text: "  ➔ Latency Metrics: Accelerated by 4x.", delay: 300, highlight: "gold" },
    { text: "  ➔ Compute Footprint: Costs Reduced by 11x.", delay: 300, highlight: "gold" },
    { text: "\n> SYNC: System Pipeline running globally with ZERO downtime.", delay: 500, highlight: "bold" }
];

// Robust syntax highlighter
const highlightPython = (text) => {
    let hl = text;
    // Base keywords & Structure
    hl = hl.replace(/("[^"]*")/g, "<span style='color: #c3e88d;'>$1</span>"); // Strings (neon green)
    hl = hl.replace(/(#[^\n]*)/g, "<span style='color: #697098; font-style: italic;'>$1</span>"); // Comments 
    hl = hl.replace(/\b(import|from|as|agent|True|False)\b/g, "<span style='color: #c792ea; font-weight: 600;'>$1</span>"); // Purple
    hl = hl.replace(/\b([a-zA-Z_]+)(?=\()/g, "<span style='color: #82aaff;'>$1</span>"); // Functions (blue)
    // Variables & Attributes
    hl = hl.replace(/\b(stack|mode|docs|throughput|target|target_acc)\b/g, "<span style='color: #f07178;'>$1</span>"); // Orange-red
    // Numbers
    hl = hl.replace(/\b(1600|0\.975|4|11)\b/g, "<span style='color: #f78c6c;'>$1</span>"); // Orange
    // Objects
    hl = hl.replace(/\b(DataEngineer|NeuralOptimizer|AutoScale)\b/g, "<span style='color: #ffcb6b; font-weight: 600;'>$1</span>"); // Yellow Classes
    return hl;
};

export default function HeroStoryTerminal({ T }) {
    const [codeText, setCodeText] = useState("");
    const [terminalLines, setTerminalLines] = useState([]);
    const [phase, setPhase] = useState("coding"); 
    
    const terminalEndRef = useRef(null);

    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [terminalLines]);

    useEffect(() => {
        let isMounted = true;
        
        const runSimulation = async () => {
            // Typing Simulator
            for (let i = 0; i <= CODE_SCRIPT.length; i++) {
                if (!isMounted) return;
                setCodeText(CODE_SCRIPT.substring(0, i));
                
                const char = CODE_SCRIPT[i];
                let ms = Math.random() * 15 + 2; // Extremely fast typing to keep engagement
                if (char === "\n") ms = 100;
                await new Promise(r => setTimeout(r, ms));
            }
            
            await new Promise(r => setTimeout(r, 600));
            if (!isMounted) return;
            setPhase("executing");

            // Execution Output Simulator
            for (let i = 0; i < TERMINAL_OUTPUT.length; i++) {
                if (!isMounted) return;
                const line = TERMINAL_OUTPUT[i];
                setTerminalLines(prev => [...prev, line]);
                await new Promise(r => setTimeout(r, line.delay));
            }
            if (isMounted) setPhase("done");
        };

        const timer = setTimeout(runSimulation, 600);
        return () => { isMounted = false; clearTimeout(timer); };
    }, []);

    // Line Numbers generator
    const numLines = codeText.split('\n').length;
    const lineNumbers = Array.from({length: numLines}, (_, i) => i + 1);

    const renderTerminalLine = (lineProps, i) => {
        let color = "#a6accd";
        if (lineProps.type === "cmd") color = "#c792ea";
        if (lineProps.highlight === "blue") color = "#82aaff";
        if (lineProps.highlight === "green") color = "#c3e88d";
        if (lineProps.highlight === "gold") color = "#ffcb6b";
        
        let fw = lineProps.highlight === "bold" ? 700 : 400;
        let finalColor = lineProps.highlight === "bold" ? "white" : color;

        return (
            <div key={i} style={{ color: finalColor, fontWeight: fw, marginBottom: 6, whiteSpace: "pre-wrap", animation: "fadeUp 0.3s ease-out both" }}>
                {lineProps.text}
            </div>
        );
    };

    return (
        <div style={{ width: "100%", maxWidth: 880, margin: "0 auto", position: "relative", animation: "fadeUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) both" }}>
            
            {/* Massive Vercel-Style Glass Container */}
            <div style={{ 
                background: "linear-gradient(135deg, rgba(16, 16, 20, 0.95) 0%, rgba(10, 10, 14, 0.98) 100%)", 
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
                display: "flex",
                flexDirection: "column",
                height: 600
            }}>
                
                {/* Header Profile Bar */}
                <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f56", border: "1px solid rgba(0,0,0,0.2)" }} />
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ffbd2e", border: "1px solid rgba(0,0,0,0.2)" }} />
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#27c93f", border: "1px solid rgba(0,0,0,0.2)" }} />
                    </div>
                    <div style={{ flex: 1, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 1, display: "flex", justifyContent: "center", gap: 20 }}>
                        <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>pipeline.py </span>
                        <span>farhan@production-server</span>
                    </div>
                </div>

                {/* Editor Content Area */}
                <div style={{ flex: "0 0 58%", display: "flex", padding: "24px 0", overflowY: "auto", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.15)" }}>
                    
                    {/* Line Numbers Column */}
                    <div style={{ display: "flex", flexDirection: "column", padding: "0 20px", textAlign: "right", borderRight: "1px solid rgba(255,255,255,0.05)", userSelect: "none" }}>
                        {lineNumbers.map(num => (
                            <div key={num} style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.2)" }}>
                                {num}
                            </div>
                        ))}
                    </div>

                    {/* Actual Code Textarea Simulation */}
                    <div style={{ flex: 1, padding: "0 24px" }}>
                        <pre style={{ margin: 0, fontFamily: "'Fira Code', 'JetBrains Mono', monospace", fontSize: 14, lineHeight: 1.6, color: "#a6accd", whiteSpace: "pre-wrap", fontWeight: 500 }}>
                            <code dangerouslySetInnerHTML={{ __html: highlightPython(codeText) }} />
                            {phase === "coding" && <span className="blinking-cursor">_</span>}
                        </pre>
                    </div>
                </div>

                {/* Bottom Output Console Area */}
                <div style={{ flex: "1", padding: "20px 32px", overflowY: "auto", position: "relative", fontFamily: "'Fira Code', 'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6, background: "rgba(0,0,0,0.5)", boxShadow: "inset 0 10px 20px rgba(0,0,0,0.3)" }}>
                    {terminalLines.length === 0 && phase === "executing" && (
                        <div className="blinking-cursor" style={{ marginLeft: 0 }}>_</div>
                    )}
                    
                    {terminalLines.map(renderTerminalLine)}
                    
                    {phase === "executing" && terminalLines.length > 0 && (
                        <div className="blinking-cursor" style={{ marginLeft: 0, marginTop: 4 }}>_</div>
                    )}
                    <div ref={terminalEndRef} style={{ height: 10 }} />
                </div>
            </div>

            {/* Premium Glowing Ambient Backdrop */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "95%", height: "95%", background: `linear-gradient(90deg, ${T.a}, #82aaff)`, filter: "blur(140px)", opacity: 0.25, pointerEvents: "none", zIndex: -1, animation: "pulse 6s infinite alternate" }} />

            <style>{`
                .blinking-cursor {
                    display: inline-block;
                    width: 8px;
                    height: 18px;
                    background: ${T.a};
                    vertical-align: middle;
                    animation: blink 1s step-end infinite;
                    margin-left: 2px;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}
