import { useEffect, useRef, useState } from "react";
import { SKILLS } from "../data/constants";

export default function SkillsUniverse({ T }) {
    const containerRef = useRef(null);
    const [activeNode, setActiveNode] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    }, []);

    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const dark = T.bg === "#1a1a22";

    // Flatten all skills with precalculated orbit positions
    const allSkills = [];
    const categories = Object.keys(SKILLS);
    const catColors = [dark ? "#7eb8be" : "#2d4a6b", dark ? "#8890aa" : "#3d5a3e", dark ? "#7aaa8a" : "#5a4060", "#f59e0b"];

    categories.forEach((cat, cIdx) => {
        const skillsCount = SKILLS[cat].length;
        SKILLS[cat].forEach((skill, sIdx) => {
            // Distribute items in rings based on category
            const radius = isMobile ? 100 + (cIdx * 60) : 180 + (cIdx * 90);
            // Evenly space them along the orbit
            const angle = (sIdx / skillsCount) * Math.PI * 2 + (cIdx * 0.5);
            
            allSkills.push({
                id: `${cat}-${skill}`,
                label: skill,
                category: cat,
                cIdx,
                radius,
                angle,
                color: catColors[cIdx]
            });
        });
    });

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%", height: isMobile ? "80vh" : "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", perspective: 1200 }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${T.a}10 0%, transparent 60%)`, pointerEvents: "none" }} />
            
            <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none", zIndex: 0 }}>
                <h1 style={{ ...sf, fontSize: "clamp(40px, 8vw, 100px)", fontWeight: 800, color: T.bg, textShadow: `0 0 20px ${T.a}40`, opacity: dark ? 0.3 : 0.1 }}>GALAXY</h1>
            </div>

            <div style={{ position: "relative", width: 1, height: 1, transformStyle: "preserve-3d", transform: "rotateX(-15deg)" }}>
                <div className="galaxy-container" style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", animation: "spinGalaxy 60s linear infinite" }}>
                    {allSkills.map(node => {
                        // Precalculate coordinates in 3D space
                        const x = Math.cos(node.angle) * node.radius;
                        const z = Math.sin(node.angle) * node.radius;
                        const y = Math.sin(node.angle * 2) * (isMobile ? 20 : 40); // Wavy orbit height
                        
                        const isHovered = activeNode === node.id;
                        const isActiveCat = activeNode && activeNode.startsWith(node.category);

                        return (
                            <div 
                                key={node.id} 
                                style={{
                                    position: "absolute",
                                    left: 0, top: 0,
                                    transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                                    transformStyle: "preserve-3d",
                                    zIndex: isHovered ? 10 : 1
                                }}
                            >
                                <div className="counter-spin" style={{ animation: "counterSpin 60s linear infinite", transformStyle: "preserve-3d" }}>
                                    <div 
                                        className="skill-node"
                                        onMouseEnter={() => setActiveNode(node.id)}
                                        onMouseLeave={() => setActiveNode(null)}
                                        style={{
                                            ...fm,
                                            fontSize: isMobile ? 10 : 12,
                                            color: isHovered ? "#fff" : node.color,
                                            background: isHovered ? node.color : (dark ? "rgba(20,20,30,0.8)" : "rgba(255,255,255,0.8)"),
                                            border: `1px solid ${node.color}50`,
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            transform: `translate(-50%, -50%) scale(${isHovered ? 1.2 : 1})`,
                                            transition: "all 0.3s ease",
                                            cursor: "none",
                                            whiteSpace: "nowrap",
                                            boxShadow: isHovered ? `0 0 20px ${node.color}` : "none",
                                            opacity: (!activeNode || isHovered || isActiveCat) ? 1 : 0.2,
                                            backdropFilter: "blur(4px)"
                                        }}
                                    >
                                        {node.label}
                                        {isHovered && <span style={{display: 'block', fontSize: 8, opacity: 0.7, marginTop: 4}}>{node.category}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Draw orbital rings */}
                    {[0, 1, 2, 3].map(cIdx => (
                        <div key={cIdx} style={{
                            position: "absolute",
                            left: "50%", top: "50%",
                            width: (isMobile ? 100 + (cIdx * 60) : 180 + (cIdx * 90)) * 2,
                            height: (isMobile ? 100 + (cIdx * 60) : 180 + (cIdx * 90)) * 2,
                            transform: "translate(-50%, -50%) rotateX(90deg)",
                            border: `1px solid ${catColors[cIdx]}${dark ? '20' : '40'}`,
                            borderRadius: "50%",
                            pointerEvents: "none"
                        }} />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes spinGalaxy {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(360deg); }
                }
                @keyframes counterSpin {
                    from { transform: rotateY(0deg) rotateX(15deg); }
                    to { transform: rotateY(-360deg) rotateX(15deg); }
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .galaxy-container, .counter-spin {
                        animation-duration: 240s !important;
                    }
                }
            `}</style>
        </div>
    );
}
