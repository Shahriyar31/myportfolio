import { useMemo, useState, useEffect, useRef } from "react";
import { SKILLS } from "../data/constants";

const CORES = [
    { id: "AI & MLOps", title: "AI Forge", icon: "🧠", x: -280, y: -160, color: "#89b4fa" },
    { id: "Data Engineering", title: "Data Pipelines", icon: "⚡", x: 280, y: -160, color: "#a6e3a1" },
    { id: "Cloud & DevOps", title: "Infrastructure", icon: "☁️", x: -280, y: 160, color: "#f9e2af" },
    { id: "Languages & DBs", title: "Core & DBs", icon: "💎", x: 280, y: 160, color: "#cba6f7" }
];

export default function SkillsUniverse({ T }) {
    const [hovered, setHovered] = useState(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const sceneRef = useRef(null);
    const absTopRef = useRef(0);

    const dark = T.bg !== "#eff1f5";
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Space Grotesk', 'Sora', sans-serif" };

    useEffect(() => {
        const check = () => { setIsMobile(window.innerWidth < 1000); };
        check();
        window.addEventListener("resize", check);
        
        const onMove = e => {
            if (window.innerWidth < 1000) return;
            const tx = (e.clientX / window.innerWidth - 0.5) * 20;
            const ty = (e.clientY / window.innerHeight - 0.5) * -20;
            setMouse({ x: tx, y: ty });
        };

        const onScroll = () => {
            if (window.innerWidth >= 1000) return;
            if (!sceneRef.current) return;
            const rect = sceneRef.current.getBoundingClientRect();
            const scrolled = (window.innerHeight - rect.top) / (window.innerHeight * 1.5);
            const ty = (Math.max(0, Math.min(1, scrolled)) - 0.5) * 25;
            setMouse(prev => ({ ...prev, y: ty, x: ty * 0.2 }));
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("scroll", onScroll);
        return () => { 
            window.removeEventListener("resize", check); 
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    const satellites = useMemo(() => {
        let res = [];
        CORES.forEach((core) => {
            const list = SKILLS[core.id] || [];
            list.forEach((name, i) => {
                const angle = (i / list.length) * Math.PI * 2;
                const r = isMobile ? 120 : 160; 
                res.push({
                    name,
                    coreId: core.id,
                    x: (isMobile ? core.x * 0.5 : core.x) + Math.cos(angle) * r,
                    y: (isMobile ? core.y * 1.5 : core.y) + Math.sin(angle) * r,
                    z: Math.sin(angle * 2) * 40,
                    angle,
                    color: core.color
                });
            });
        });
        return res;
    }, [isMobile]);

    const getPos = (c) => ({
        x: isMobile ? 0 : c.x,
        y: isMobile ? c.y * 2.2 : c.y,
        z: hovered === c.id ? (isMobile ? 180 : 120) : (hovered ? -100 : 0)
    });

    return (
        <div style={{ width: "100%", height: isMobile ? 1200 : 850, perspective: "2000px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            
            {/* Background Atmosphere */}
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${T.a}08 0%, transparent 70%)`, pointerEvents: "none" }} />

            <div ref={sceneRef} style={{ 
                width: isMobile ? "100%" : 1200, height: isMobile ? "90%" : 700, position: "relative", 
                transformStyle: "preserve-3d", transform: `rotateX(${mouse.y}deg) rotateY(${mouse.x}deg)`, 
                transition: "transform 0.1s ease-out" 
            }}>
                
                {/* ── Cores ── */}
                {CORES.map(c => {
                    const isActive = hovered === c.id;
                    const dim = hovered && hovered !== c.id;
                    const pos = getPos(c);

                    return (
                        <div key={c.id} 
                            onClick={() => setHovered(isActive ? null : c.id)}
                            onMouseEnter={isMobile ? undefined : () => setHovered(c.id)}
                            onMouseLeave={isMobile ? undefined : () => setHovered(null)}
                            style={{ 
                                position: "absolute", left: "50%", top: "50%",
                                width: isMobile ? 160 : 200, height: isMobile ? 160 : 200, 
                                marginLeft: isMobile ? -80 : -100, marginTop: isMobile ? -80 : -100,
                                transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`,
                                transformStyle: "preserve-3d", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
                                cursor: "pointer", zIndex: isActive ? 50 : 10
                            }}>
                            
                            <div style={{ 
                                width: "100%", height: "100%", borderRadius: "50%",
                                background: isActive ? `radial-gradient(circle at 30% 30%, ${c.color}, ${c.color}80 70%, transparent)` : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),
                                border: `1px solid ${isActive ? c.color : (dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}`,
                                backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                opacity: dim ? 0.3 : 1, boxShadow: isActive ? `0 0 80px ${c.color}40, inset 0 0 30px ${c.color}50` : "none"
                            }}>
                                <div style={{ fontSize: 42, marginBottom: 8, filter: isActive ? `drop-shadow(0 0 15px ${c.color})` : "none" }}>{c.icon}</div>
                                <div style={{ ...sf, fontSize: 13, fontWeight: 900, color: isActive ? "#fff" : T.m, textTransform: "uppercase", letterSpacing: 2, textAlign: "center", maxWidth: 140 }}>{c.title}</div>
                            </div>
                        </div>
                    );
                })}

                {satellites.map((s, i) => {
                    const isParentActive = hovered === s.coreId;
                    const dim = hovered && !isParentActive;
                    
                    const tz = isParentActive ? 220 + s.z : s.z;
                    const tx = isParentActive ? s.x * 1.3 : s.x;
                    const ty = isParentActive ? s.y * 1.3 : s.y;

                    return (
                        <div key={i} style={{ 
                            position: "absolute", left: "50%", top: "50%",
                            padding: "9px 18px", borderRadius: 12,
                            background: isParentActive ? `${s.color}15` : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"),
                            border: `1px solid ${isParentActive ? s.color : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)")}`,
                            backdropFilter: "blur(12px)",
                            transform: `translate3d(${tx}px, ${ty}px, ${tz}px) scale(${isParentActive ? 1.05 : 0.8})`,
                            transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${isParentActive ? 0 : i*0.01}s`,
                            opacity: dim ? 0.05 : (isParentActive ? 1 : 0.5),
                            ...fm, fontSize: 12, fontWeight: isParentActive ? 700 : 500, color: isParentActive ? "#fff" : T.m,
                            pointerEvents: "none", zIndex: isParentActive ? 100 : 5, whiteSpace: "nowrap"
                        }}>
                             <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", display: isParentActive ? "block" : "none", boxShadow: `0 0 10px ${s.color}` }} />
                             {s.name}
                        </div>
                    );
                })}

                {/* Aesthetic Energy Beams */}
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                   {hovered && CORES.find(c=>c.id===hovered) && (
                       (() => {
                           const c = CORES.find(c=>c.id===hovered);
                           const list = satellites.filter(s=>s.coreId===hovered);
                           const p = getPos(c);
                           const cx = isMobile ? window.innerWidth / 2 : 600;
                           const cy = isMobile ? (1200 * 0.45) : 350;
                           return list.map((s, idx) => (
                               <line key={idx} 
                                 x1={cx + p.x/1.1} y1={cy + p.y/1.1} 
                                 x2={cx + s.x * 1.3} y2={cy + s.y * 1.3} 
                                 stroke={c.color} strokeWidth="0.5" strokeOpacity="0.2" 
                               />
                           ));
                       })()
                   )}
                </svg>

            </div>
        </div>
    );
}
