import { useMemo, useState, useEffect, useRef } from "react";
import { SKILLS } from "../data/constants";

const CORES = [
    { id: "AI & MLOps", title: "AI Forge", icon: "🧠", color: "#89b4fa" },
    { id: "Data Engineering", title: "Data Pipelines", icon: "⚡", color: "#a6e3a1" },
    { id: "Cloud & DevOps", title: "Infrastructure", icon: "☁️", color: "#f9e2af" },
    { id: "Languages & DBs", title: "Core & DBs", icon: "💎", color: "#cba6f7" }
];

// 4 distinct orbital planes for our atomic system
const RINGS = [
    { pitch: 0.3,  yaw: 0,          roll: 0.1 },
    { pitch: -0.2, yaw: Math.PI/2,  roll: -0.2 }, 
    { pitch: 0.5,  yaw: Math.PI/4,  roll: 0.3 },   
    { pitch: -0.4, yaw: -Math.PI/4, roll: -0.3 }  
];

// Utility geometric rotation
function rotate(x, y, z, pitch, yaw, roll) {
    let nx, ny, nz;
    if (roll) { const c=Math.cos(roll), s=Math.sin(roll); nx=x*c-y*s; ny=x*s+y*c; x=nx; y=ny; }
    if (pitch) { const c=Math.cos(pitch), s=Math.sin(pitch); ny=y*c-z*s; nz=y*s+z*c; y=ny; z=nz; }
    if (yaw) { const c=Math.cos(yaw), s=Math.sin(yaw); nx=x*c+z*s; nz=-x*s+z*c; x=nx; z=nz; }
    return { x, y, z };
}

export default function SkillsUniverse({ T }) {
    const [isMobile, setIsMobile] = useState(false);
    const elementsRef = useRef([]);
    const linesRef = useRef([]);

    const dark = T.bg !== "#F5F7FA" && T.bg !== "#eff1f5" && T.bg !== "#fff";
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Space Grotesk', 'Sora', sans-serif" };

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Generate the interconnected atomic coordinate mapping
    const nodes = useMemo(() => {
        let arr = [];
        CORES.forEach((core, cIdx) => {
            const ring = RINGS[cIdx];
            const list = SKILLS[core.id] || [];
            const total = list.length;
            
            const coreIdx = arr.length; // Save coordinate index for the lines
            
            arr.push({
                type: "CORE", title: core.title, icon: core.icon, color: core.color, 
                localTheta: 0, ring, orig: core
            });
            
            // Evenly spread satellites on the rest of the 3D ring bounds
            list.forEach((name, i) => {
                arr.push({
                    type: "SKILL", name, color: core.color,
                    localTheta: ((i + 1) / (total + 1)) * Math.PI * 2,
                    ring, parentIdx: coreIdx
                });
            });
        });
        return arr;
    }, []);

    useEffect(() => {
        let frame;
        const start = performance.now();
        const perspective = 2500;

        const tick = (time) => {
            const dt = time - start;
            
            // Continuous, effortless global revolution
            const masterYaw = dt * 0.0003;
            const masterPitch = Math.sin(dt * 0.0002) * 0.25;
            
            const R = isMobile ? 150 : 320; 

            // Pre-Calculate Space using JS so we can derive exact 2D projection laser beams
            const updated = nodes.map(node => {
                // Base Layout on Ring
                let lx = Math.cos(node.localTheta) * R;
                let ly = Math.sin(dt * 0.0015 + node.localTheta * 3) * (node.type === "CORE" ? 8 : 18); // Floating Z-Wave Distortion
                let lz = Math.sin(node.localTheta) * R;

                // Fold to 3D Plane Orientation
                let o = rotate(lx, ly, lz, node.ring.pitch, node.ring.yaw, node.ring.roll);
                
                // Fold to Global Scene Time
                let p = rotate(o.x, o.y, o.z, masterPitch, masterYaw, 0);

                const safeZ = Math.min(p.z, perspective - 100);
                
                // CSS perspective magnification math emulator
                const scale = perspective / (perspective - safeZ);
                
                return { 
                    ...node, x: p.x, y: p.y, z: safeZ, 
                    sx: p.x * scale, sy: p.y * scale 
                };
            });

            // Fast DOM mutation loops (Bypassing React state entirely for 120 FPS performance)
            updated.forEach((n, idx) => {
                // Render the 3D Nodes
                const el = elementsRef.current[idx];
                if (el) {
                    const zNorm = n.z / R; // normalized depth
                    const opacity = Math.max(0.1, Math.min(1, 0.4 + (zNorm + 1) * 0.4));
                    const blur = Math.max(0, -zNorm * 3);
                    const baseScale = n.type === "CORE" ? (isMobile ? 0.9 : 1.25) : (isMobile ? 0.8 : 0.95);
                    
                    el.style.transform = `translate3d(calc(-50% + ${n.x}px), calc(-50% + ${n.y}px), ${n.z}px) scale(${baseScale})`;
                    el.style.opacity = opacity;
                    el.style.filter = `blur(${blur}px)`;
                    el.style.zIndex = Math.round(n.z + 1000);
                }

                // Render the interlocking 2D Laser Lines
                if (n.type === "SKILL") {
                    const line = linesRef.current[idx];
                    if (line) {
                        const parent = updated[n.parentIdx];
                        const dx = n.sx - parent.sx;
                        const dy = n.sy - parent.sy;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                        
                        const avgZ = (n.z + parent.z) / 2;
                        const zNormL = avgZ / R;
                        const lineOp = Math.max(0.015, Math.min(0.4, 0.15 + zNormL * 0.25));
                        
                        line.style.transform = `translate3d(${parent.sx}px, ${parent.sy}px, 0) rotate(${angle}deg)`;
                        line.style.width = `${dist}px`;
                        line.style.opacity = lineOp;
                    }
                }
            });

            frame = requestAnimationFrame(tick);
        };
        
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [isMobile, nodes]);

    return (
        <div style={{ width: "100%", height: isMobile ? 650 : 900, perspective: "2500px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" }}>
            
            {/* Immersive Deep Field Atmosphere */}
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${T.a}08 0%, transparent 60%)`, pointerEvents: "none" }} />

            {/* 2D Tracker Overlay Plane (Beams) */}
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, zIndex: 0, pointerEvents: "none" }}>
                {nodes.map((n, i) => n.type === "SKILL" && (
                    <div key={`line-${i}`} ref={el => linesRef.current[i] = el}
                        style={{
                            position: "absolute", top: 0, left: 0, height: 1.5,
                            background: `linear-gradient(90deg, ${n.color}00 0%, ${n.color}50 50%, ${n.color}00 100%)`,
                            transformOrigin: "left center",
                            willChange: "transform, width, opacity"
                        }}
                    />
                ))}
            </div>

            {/* 3D Object Projection Plane */}
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 10 }}>
                {nodes.map((n, i) => (
                    <div key={`node-${i}`} ref={el => elementsRef.current[i] = el} style={{ 
                        position: "absolute", willChange: "transform, opacity, filter, z-index",
                        pointerEvents: "none" // Prevents capturing scroll/touch dragging within the orb wrapper
                    }}>
                        {n.type === "CORE" ? (
                            <div style={{
                                padding: isMobile ? "8px 16px" : "10px 20px", borderRadius: 30,
                                background: T.bg,
                                border: "none",
                                boxShadow: T.neu,
                                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            }}>
                                <span style={{ fontSize: isMobile ? 24 : 28, filter: `drop-shadow(0 0 12px ${n.color}80)` }}>{n.icon}</span>
                                <span style={{ ...sf, fontSize: isMobile ? 10 : 12, fontWeight: 900, color: dark ? "#fff" : T.t, letterSpacing: 1.5, textTransform: "uppercase" }}>
                                    {n.title}
                                </span>
                            </div>
                        ) : (
                            <div style={{
                                padding: isMobile ? "6px 12px" : "8px 16px", borderRadius: 24,
                                background: T.bg,
                                border: "none",
                                boxShadow: T.neuSm,
                                display: "flex", alignItems: "center", gap: 8,
                                ...fm, fontSize: isMobile ? 11 : 13, fontWeight: 700, color: T.t,
                                whiteSpace: "nowrap"
                            }}>
                                 <span style={{ width: 6, height: 6, borderRadius: "50%", background: n.color, boxShadow: `0 0 8px ${n.color}` }} />
                                 {n.name}
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}
