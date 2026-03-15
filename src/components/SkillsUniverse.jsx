import { useMemo, useState, useEffect } from "react";
import { SKILLS } from "../data/constants";

const COLUMNS = [
    { id: "Languages & DBs", title: "Data Sources & Core", x: 150 },
    { id: "Cloud & DevOps", title: "Infrastructure Platforms", x: 450 },
    { id: "Data Engineering", title: "Data Pipelines", x: 750 },
    { id: "AI & MLOps", title: "AI Models & MLOps", x: 1050 }
];

export default function SkillsUniverse({ T }) {
    const dark = T.bg === "#1a1a22";
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const [activeNode, setActiveNode] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1000);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Categories assigned colors
    const catColors = [dark ? "#7eb8be" : "#2d4a6b", dark ? "#8890aa" : "#3d5a3e", dark ? "#7aaa8a" : "#5a4060", "#f59e0b"];

    // Compute nodes (skills mapped to absolute coordinates within a 1200x700 SVG grid)
    const nodes = useMemo(() => {
        let res = [];
        COLUMNS.forEach((col, cIdx) => {
            const skills = SKILLS[col.id];
            if (!skills) return;
            const n = skills.length;
            const startY = 80;
            const endY = 620;
            const stepY = n > 1 ? (endY - startY) / (n - 1) : 0;
            
            skills.forEach((skill, sIdx) => {
                res.push({
                    id: `${cIdx}-${sIdx}`,
                    label: skill,
                    col: cIdx,
                    row: sIdx,
                    x: col.x,
                    y: startY + (sIdx * stepY),
                    color: catColors[cIdx]
                });
            });
        });
        return res;
    }, [catColors]);

    // Compute topological edges (cubic bezier S-curves) simulating data paths
    const edges = useMemo(() => {
        let res = [];
        nodes.forEach(node => {
            if (node.col < COLUMNS.length - 1) {
                const nextNodes = nodes.filter(n => n.col === node.col + 1);
                if (nextNodes.length === 0) return;
                
                // Deterministic mesh generation
                const ratio = node.row / Math.max(1, (nodes.filter(n => n.col === node.col).length - 1));
                const targetCenter = ratio * (nextNodes.length - 1);
                
                const nearest1 = Math.floor(targetCenter);
                const nearest2 = Math.ceil(targetCenter);
                
                const addEdge = (targetIdx) => {
                    if (nextNodes[targetIdx]) {
                        const toNode = nextNodes[targetIdx];
                        const id = `e-${node.id}-${toNode.id}`;
                        if (!res.find(e => e.id === id)) {
                            res.push({ id, from: node, to: toNode });
                        }
                    }
                };
                
                addEdge(nearest1);
                if (nearest1 !== nearest2) addEdge(nearest2);
                
                // Add an elegant straggler edge for matrix complexity
                if (node.row % 2 === 0) {
                     const straggler = (nearest1 + 2) % nextNodes.length;
                     addEdge(straggler);
                }
            }
        });
        return res;
    }, [nodes]);

    // Active network traversal algorithm mapping data flows both upstream & downstream
    const getActiveNetwork = (hoveredId) => {
        if (!hoveredId) return { activeN: new Set(), activeE: new Set() };
        let activeN = new Set();
        let activeE = new Set();
        
        const fwd = (nId) => {
            activeN.add(nId);
            edges.forEach(e => {
                if (e.from.id === nId && !activeE.has(e.id)) {
                    activeE.add(e.id);
                    fwd(e.to.id);
                }
            });
        };
        const bwd = (nId) => {
            activeN.add(nId);
            edges.forEach(e => {
                if (e.to.id === nId && !activeE.has(e.id)) {
                    activeE.add(e.id);
                    bwd(e.from.id);
                }
            });
        };
        
        fwd(hoveredId);
        bwd(hoveredId);
        return { activeN, activeE };
    };

    const { activeN, activeE } = getActiveNetwork(activeNode);

    if (isMobile) {
        return (
            <div style={{ width: "100%", padding: "20px 0 60px", overflow: "hidden" }}>
                <style>{`
                    @keyframes slideLeft {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes slideRight {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    .marquee-track {
                        display: flex; gap: 12px; width: max-content;
                    }
                `}</style>
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    {COLUMNS.map((col, cIdx) => {
                        // Duplicate skills to create seamless infinite loop effect
                        const skillsTwice = [...SKILLS[col.id], ...SKILLS[col.id], ...SKILLS[col.id]];
                        const isEven = cIdx % 2 === 0;
                        
                        return (
                            <div key={col.id} style={{ position: "relative", width: "100%", padding: "10px 0" }}>
                                {/* Category Label Floating Above */}
                                <div style={{ marginBottom: 16, paddingLeft: 24, display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ ...fm, fontSize: 10, color: catColors[cIdx], letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, background: `${catColors[cIdx]}15`, padding: "6px 14px", borderRadius: 20, border: `1px solid ${catColors[cIdx]}40` }}>
                                        {col.title}
                                    </div>
                                    <span style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${catColors[cIdx]}40, transparent)` }} />
                                </div>
                                
                                {/* Track Container with fading edges */}
                                <div style={{ 
                                    width: "100%", overflow: "hidden", position: "relative",
                                    maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
                                }}>
                                    <div className="marquee-track" style={{ 
                                        animation: isEven ? "slideLeft 25s linear infinite" : "slideRight 25s linear infinite"
                                    }}>
                                        {skillsTwice.map((skill, sIdx) => (
                                            <div key={`${skill}-${sIdx}`} style={{
                                                ...fm, fontSize: 13, color: T.t,
                                                background: dark ? "rgba(25,25,35,0.7)" : "rgba(255,255,255,0.8)",
                                                border: `1px solid ${catColors[cIdx]}40`,
                                                padding: "12px 20px", borderRadius: 16,
                                                display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
                                                boxShadow: `0 8px 24px ${catColors[cIdx]}10`,
                                                backdropFilter: "blur(8px)"
                                            }}>
                                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColors[cIdx], boxShadow: `0 0 10px ${catColors[cIdx]}` }} />
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: "16px", ...fm, fontSize: 11, color: T.m, letterSpacing: ".06em" }}>
                ← Scroll & Hover to trace Neural Data Flow →
            </div>

            <div style={{ width: "100%", overflowX: "auto", overflowY: "hidden", cursor: "grab", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                <div style={{ width: 1200, height: 700, position: "relative", margin: "0 auto", flexShrink: 0 }}>
                    
                    <style>{`
                        @keyframes flowPulse {
                            from { stroke-dashoffset: 40; }
                            to { stroke-dashoffset: 0; }
                        }
                        .edge-idle {
                            stroke-dasharray: 4 36;
                            animation: flowPulse 4s linear infinite;
                            opacity: 0.15;
                        }
                        .edge-dim {
                            stroke-dasharray: 4 36;
                            animation: flowPulse 8s linear infinite;
                            opacity: 0.03;
                        }
                        .edge-active {
                            stroke-dasharray: 12 28;
                            animation: flowPulse 0.8s linear infinite;
                            opacity: 1;
                            stroke-width: 2.5px;
                            filter: url(#glow);
                        }
                    `}</style>
                    
                    <svg width="1200" height="700" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                        <defs>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            
                            {/* Gradients bridging stage domains perfectly */}
                            {COLUMNS.map((col, i) => i < COLUMNS.length - 1 && (
                                <linearGradient key={i} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={catColors[i]} />
                                    <stop offset="100%" stopColor={catColors[i + 1]} />
                                </linearGradient>
                            ))}
                        </defs>

                        {edges.map((e) => {
                            const S = 100; // S-Curve inflection smoothness
                            const x1 = e.from.x + 85; 
                            const x2 = e.to.x - 85;
                            const d = `M ${x1} ${e.from.y} C ${x1 + S} ${e.from.y}, ${x2 - S} ${e.to.y}, ${x2} ${e.to.y}`;
                            
                            const isHovered = !!activeNode;
                            const isEdgeActive = activeE.has(e.id);
                            
                            const edgeClass = isHovered 
                                ? (isEdgeActive ? "edge-active" : "edge-dim")
                                : "edge-idle";

                            return (
                                <g key={e.id}>
                                    <path 
                                        d={d} 
                                        fill="none" 
                                        stroke={`url(#grad-${e.from.col})`} 
                                        strokeWidth={1.5}
                                        className={edgeClass}
                                        style={{ transition: "stroke-width 0.3s, opacity 0.3s" }}
                                    />
                                    {/* Subdued baseline connection to ensure continuity visually */}
                                    <path 
                                        d={d} 
                                        fill="none" 
                                        stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"} 
                                        strokeWidth={1}
                                        style={{ opacity: isHovered && !isEdgeActive ? 0 : 1, transition: "opacity 0.3s" }}
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {COLUMNS.map(col => (
                        <div key={col.id} style={{ 
                            position: "absolute", left: col.x, top: 20, 
                            transform: "translateX(-50%)", 
                            ...fm, fontSize: 13, fontWeight: 700, 
                            color: catColors[COLUMNS.indexOf(col)], 
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            textShadow: dark ? `0 0 16px ${catColors[COLUMNS.indexOf(col)]}50` : "none"
                        }}>
                            {col.title}
                        </div>
                    ))}

                    {nodes.map(n => {
                        const isHovered = !!activeNode;
                        const isNodeActive = activeN.has(n.id);
                        
                        return (
                            <div 
                                key={n.id}
                                onMouseEnter={() => setActiveNode(n.id)}
                                onMouseLeave={() => setActiveNode(null)}
                                onClick={() => setActiveNode(activeNode === n.id ? null : n.id)}
                                style={{
                                    position: "absolute",
                                    left: n.x, top: n.y,
                                    width: 170, height: 48,
                                    transform: `translate(-50%, -50%) scale(${isNodeActive ? 1.05 : 1})`,
                                    background: isNodeActive ? `${n.color}15` : (dark ? "rgba(20,20,28,0.85)" : "rgba(255,255,255,0.85)"),
                                    backdropFilter: "blur(12px)",
                                    border: `1px solid ${isNodeActive ? n.color : (dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}`,
                                    borderRadius: "12px",
                                    display: "flex", alignItems: "center", justifyContent: "flex-start",
                                    paddingLeft: "16px",
                                    color: isNodeActive ? (dark ? "#fff" : n.color) : T.t,
                                    fontSize: 12,
                                    fontWeight: isNodeActive ? 700 : 500,
                                    ...fm,
                                    boxShadow: isNodeActive ? `0 0 24px ${n.color}40, inset 0 0 12px ${n.color}20` : "0 4px 12px rgba(0,0,0,0.04)",
                                    opacity: isHovered ? (isNodeActive ? 1 : 0.2) : 1,
                                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                    cursor: "pointer",
                                    zIndex: isNodeActive ? 10 : 2
                                }}
                            >
                                <div style={{ 
                                    width: 6, height: 6, borderRadius: "50%", 
                                    background: isNodeActive ? n.color : (dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"),
                                    marginRight: "12px",
                                    boxShadow: isNodeActive ? `0 0 10px ${n.color}` : "none",
                                    transition: "all 0.3s"
                                }} />
                                {n.label}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
