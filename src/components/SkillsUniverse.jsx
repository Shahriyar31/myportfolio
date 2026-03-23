import { useMemo, useState, useEffect } from "react";
import { SKILLS } from "../data/constants";

const COLUMNS = [
    { id: "AI & MLOps", title: "AI Models & MLOps", x: 150, color: "#3B82F6" },
    { id: "Data Engineering", title: "Data Pipelines", x: 450, color: "#10B981" },
    { id: "Cloud & DevOps", title: "Cloud & Infrastructure", x: 750, color: "#8B5CF6" },
    { id: "Languages & DBs", title: "Core & Databases", x: 1050, color: "#F59E0B" }
];

export default function SkillsUniverse({ T }) {
    const dark = T.bg === "#0F1115" || T.bg === "#1a1a22";
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const [activeNode, setActiveNode] = useState(null);
    const [activeCat, setActiveCat] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1000);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const catColors = COLUMNS.map(c => c.color);

    const nodes = useMemo(() => {
        let res = [];
        COLUMNS.forEach((col, cIdx) => {
            const skills = SKILLS[col.id] || [];
            const n = skills.length;
            const startY = 100;
            const endY = 650;
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

    const edges = useMemo(() => {
        let res = [];
        nodes.forEach(node => {
            if (node.col < COLUMNS.length - 1) {
                const nextNodes = nodes.filter(n => n.col === node.col + 1);
                if (nextNodes.length === 0) return;
                const ratio = node.row / Math.max(1, (nodes.filter(n => n.col === node.col).length - 1));
                const targetCenter = ratio * (nextNodes.length - 1);
                const nearest1 = Math.floor(targetCenter);
                const nearest2 = Math.ceil(targetCenter);
                
                const addE = (targetIdx) => {
                    if (nextNodes[targetIdx]) {
                        const toNode = nextNodes[targetIdx];
                        res.push({ id: `e-${node.id}-${toNode.id}`, from: node, to: toNode });
                    }
                };
                addE(nearest1);
                if (nearest1 !== nearest2) addE(nearest2);
                if (node.row % 2 === 0) addE((nearest1 + 2) % nextNodes.length);
            }
        });
        return res;
    }, [nodes]);

    const { activeN, activeE } = useMemo(() => {
        if (!activeNode) return { activeN: new Set(), activeE: new Set() };
        let aN = new Set();
        let aE = new Set();
        const fwd = (nId) => {
            aN.add(nId);
            edges.forEach(e => { if (e.from.id === nId && !aE.has(e.id)) { aE.add(e.id); fwd(e.to.id); } });
        };
        const bwd = (nId) => {
            aN.add(nId);
            edges.forEach(e => { if (e.to.id === nId && !aE.has(e.id)) { aE.add(e.id); bwd(e.from.id); } });
        };
        fwd(activeNode); bwd(activeNode);
        return { activeN: aN, activeE: aE };
    }, [activeNode, edges]);

    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const handleMouseMove = e => {
        if (isMobile) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 10;
        const y = (e.clientY / window.innerHeight - 0.5) * -10;
        setTilt({ x, y });
    };

    if (isMobile) {
        return (
            <div style={{ width: "100%", padding: "20px 22px 60px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {COLUMNS.map((col, i) => {
                        const isActive = activeCat === i;
                        return (
                            <div key={col.id} 
                                 onClick={() => setActiveCat(isActive ? -1 : i)}
                                 style={{
                                    width: "100%",
                                    overflow: "hidden",
                                    borderRadius: 32,
                                    background: dark ? `rgba(18,20,26,${isActive ? 0.95 : 0.6})` : "#fff",
                                    border: `1px solid ${isActive ? col.color : (dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)")}`,
                                    transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                                    boxShadow: isActive ? `0 20px 40px ${col.color}20` : "0 8px 20px rgba(0,0,0,0.1)",
                                    position: "relative"
                                 }}
                            >
                                {/* Category Header Module */}
                                <div style={{ 
                                    padding: "24px 28px", display: "flex", alignItems: "center", gap: 20,
                                    background: isActive ? `linear-gradient(135deg, ${col.color}20, transparent)` : "transparent",
                                    transition: "background 0.5s"
                                }}>
                                    <div style={{ 
                                        width: 52, height: 52, borderRadius: "50%", background: `${col.color}${isActive ? "30" : "15"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                                        boxShadow: isActive ? `0 0 20px ${col.color}60` : "none",
                                        animation: isActive ? "pulseCore 2s infinite" : "none"
                                    }}>
                                        {col.id === "AI & MLOps" ? "🧠" : col.id === "Data Engineering" ? "⚡" : col.id === "Cloud & DevOps" ? "☁️" : "💎"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ ...sf, fontSize: 15, fontWeight: 900, color: isActive ? col.color : T.t, letterSpacing: "-0.5px" }}>
                                            {col.title}
                                        </div>
                                        <div style={{ ...fm, fontSize: 11, color: T.m, marginTop: 4, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700 }}>
                                            {SKILLS[col.id].length} Specializations
                                        </div>
                                    </div>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive ? col.color : T.m} strokeWidth="3" 
                                         style={{ transform: isActive ? "rotate(90deg)" : "none", transition: "transform 0.5s" }}>
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </div>

                                {/* Expanded Skills Grid */}
                                <div style={{ 
                                    maxHeight: isActive ? "1000px" : "0px",
                                    opacity: isActive ? 1 : 0,
                                    transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                                    padding: isActive ? "0 20px 32px 20px" : "0 20px",
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 10
                                }}>
                                    {SKILLS[col.id].map((skill, sIdx) => (
                                        <div key={skill} style={{
                                            ...fm, fontSize: 13, fontWeight: 700, color: "#fff",
                                            background: dark ? "rgba(255,255,255,0.06)" : "#f5f5f7",
                                            border: `1px solid ${col.color}30`,
                                            padding: "16px", borderRadius: 16,
                                            display: "flex", alignItems: "center", gap: 10,
                                            animation: isActive ? `skillPop 0.5s ${sIdx * 0.04}s both cubic-bezier(0.16, 1, 0.3, 1)` : "none"
                                        }}>
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, boxShadow: `0 0 10px ${col.color}` }} />
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <style>{`
                    @keyframes skillPop {
                        from { opacity: 0; transform: scale(0.9) translateY(10px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @keyframes pulseCore {
                        0% { transform: scale(1); filter: brightness(1); }
                        50% { transform: scale(1.1); filter: brightness(1.5); }
                        100% { transform: scale(1); filter: brightness(1); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ width: "100%", perspective: "3000px", padding: "60px 0" }}>
            <div style={{ 
                width: 1200, height: 750, position: "relative", margin: "0 auto",
                transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`, transition: "transform 0.2s cubic-bezier(0.1, 0.5, 0.3, 1)", transformStyle: "preserve-3d"
            }}>
                <svg width="1200" height="750" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, transformStyle: "preserve-3d" }}>
                    <defs>
                        {COLUMNS.map((col, i) => i < COLUMNS.length - 1 && (
                            <linearGradient key={i} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={catColors[i]} />
                                <stop offset="100%" stopColor={catColors[i + 1]} />
                            </linearGradient>
                        ))}
                    </defs>
                    <style>{`
                        @keyframes flow { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
                        .edge { stroke-dasharray: 4 40; animation: flow 6s linear infinite; opacity: 0.12; }
                        .edge-active { stroke-dasharray: 12 18; animation: flow 0.5s linear infinite; opacity: 1; stroke-width: 2.5px; filter: drop-shadow(0 0 8px currentColor); }
                    `}</style>
                    {edges.map((e) => {
                        const x1 = e.from.x + 90; const x2 = e.to.x - 90;
                        const d = `M ${x1} ${e.from.y} C ${x1 + 100} ${e.from.y}, ${x2 - 100} ${e.to.y}, ${x2} ${e.to.y}`;
                        const isActive = activeE.has(e.id);
                        return (
                            <path key={e.id} d={d} fill="none" stroke={isActive ? `url(#grad-${e.from.col})` : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)")}
                                className={isActive ? "edge-active" : (activeNode ? "edge-dim" : "edge")}
                                style={{ stroke: isActive ? undefined : (activeNode ? "rgba(255,255,255,0.02)" : undefined), transition: "all 0.4s" }}
                            />
                        );
                    })}
                </svg>

                {COLUMNS.map((col, i) => (
                    <div key={col.id} style={{
                        position: "absolute", left: col.x, top: -40, transform: "translateX(-50%) translateZ(80px)",
                        ...sf, fontSize: 13, fontWeight: 900, color: activeNode && nodes.find(n => n.id === activeNode).col === i ? col.color : (dark ? "rgba(255,255,255,0.3)" : T.m),
                        letterSpacing: "0.25em", textTransform: "uppercase", transition: "all 0.5s", textShadow: activeNode && nodes.find(n => n.id === activeNode).col === i ? `0 0 25px ${col.color}` : "none"
                    }}> {col.title} </div>
                ))}

                {nodes.map(n => {
                    const isActive = activeN.has(n.id);
                    return (
                        <div key={n.id} onMouseEnter={() => setActiveNode(n.id)} onMouseLeave={() => setActiveNode(null)}
                            style={{
                                position: "absolute", left: n.x, top: n.y, width: 184, height: 54,
                                transform: `translate(-50%, -50%) translateZ(${isActive ? "100px" : "10px"}) scale(${isActive ? 1.05 : 1})`,
                                background: isActive ? `${n.color}25` : (dark ? "rgba(18,20,26,0.85)" : "rgba(255,255,255,0.9)"),
                                backdropFilter: "blur(20px)", border: `1px solid ${isActive ? n.color : (dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}`,
                                borderRadius: "18px", display: "flex", alignItems: "center", paddingLeft: "20px", color: isActive ? "#fff" : (dark ? "rgba(255,255,255,0.6)" : "#111"),
                                fontSize: 13, fontWeight: isActive ? 800 : 500, ...fm, boxShadow: isActive ? `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${n.color}30` : "0 8px 30px rgba(0,0,0,0.1)",
                                opacity: !activeNode || isActive ? 1 : 0.2, transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", cursor: "pointer", zIndex: isActive ? 30 : 2, transformStyle: "preserve-3d"
                            }}
                        >
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? n.color : (dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"), marginRight: "16px", boxShadow: isActive ? `0 0 15px ${n.color}` : "none" }} />
                            {n.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
