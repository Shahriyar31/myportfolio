import { useRef, useEffect, useState } from "react";
import HeroProfile from "./HeroProfile";

const sf = { fontFamily: "'Space Grotesk', 'Sora', sans-serif" };
const fm = { fontFamily: "'Inter', sans-serif" };

const SOCIAL = [
    { label: "GitHub", href: "https://github.com/Shahriyar31", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/farhanshahriyar", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { label: "Email", href: "mailto:shahriyarfarhan3101@gmail.com", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg> },
];

export default function HeroMindblowing({ T, dark, onOpenResume }) {
    const [isMobile, setIsMobile] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1000);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Highly optimized custom 3D particle engine rendered on Canvas2D
    useEffect(() => {
        const C = canvasRef.current;
        if (!C) return;
        const ctx = C.getContext("2d", { alpha: false });
        let w, h, centerX, centerY;
        
        const setSize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            C.width = w;
            C.height = h;
            centerX = w / 2;
            centerY = h / 2;
        };
        setSize();
        window.addEventListener("resize", setSize);

        // Configuration
        const PCOUNT = isMobile ? 800 : 2500;
        let particles = [];
        let mouse = { x: w / 2, y: h / 2, tx: w / 2, ty: h / 2, active: false };
        let glob = { rX: 0, rY: 0, rZ: 0 };
        
        let shapeMode = 0; // 0=Sphere, 1=Torus Knot, 2=Galaxy
        let modeLerp = 0;

        // Base theme colors converted to RGB arrays for fast lerping
        const parseColor = (hex) => {
            const temp = document.createElement("div");
            temp.style.color = hex;
            document.body.appendChild(temp);
            const style = getComputedStyle(temp).color;
            document.body.removeChild(temp);
            const m = style.match(/\d+/g);
            return m ? [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])] : [255,255,255];
        };
        
        const rgbA = parseColor(T.a);
        const rgbB = parseColor(T.a2 || "#8839ef");
        const rgbBg = parseColor(T.bg); // dynamically parse background

        // Initialization
        for (let i = 0; i < PCOUNT; i++) {
            // 1. SPHERE FORMATION
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const rBase = isMobile ? 180 : 320;
            const rSphere = rBase + (Math.random() * 40 - 20) + (Math.random() < 0.1 ? 80 : 0);
            const sx = rSphere * Math.sin(phi) * Math.cos(theta);
            const sy = rSphere * Math.sin(phi) * Math.sin(theta);
            const sz = rSphere * Math.cos(phi);

            // 2. TORUS KNOT FORMATION
            const tkT = i * (Math.PI * 2 * 3.5 / PCOUNT); 
            const p = 3, q = 5; 
            const rTorusBase = isMobile ? 80 : 160;
            const rTorus = rTorusBase * (1.5 + Math.sin(q * tkT));
            const randOffset = () => (Math.random() - 0.5) * 60;
            const tx = rTorus * Math.cos(p * tkT) + randOffset();
            const ty = rTorus * Math.sin(p * tkT) + randOffset();
            const tz = (isMobile ? 120 : 200) * Math.cos(q * tkT) + randOffset();

            // 3. GALAXY SPIRAL FORMATION
            const spiralA = i * 0.02 + Math.random();
            const spiralR = i * (isMobile ? 0.3 : 0.45);
            const galaxyRadius = spiralR * Math.cos(spiralA);
            const gx = spiralR * Math.cos(spiralA) * 1.5 + randOffset();
            const gy = (Math.random() - 0.5) * (Math.max(10, 80 - spiralR * 0.2)); 
            const gz = spiralR * Math.sin(spiralA) * 1.5 + randOffset();

            particles.push({
                sx, sy, sz,    // Mode 0: Sphere
                tx, ty, tz,    // Mode 1: Torus
                gx, gy, gz,    // Mode 2: Galaxy
                x: sx, y: sy, z: sz, // Current simulated position
                vx: 0, vy: 0, vz: 0, // Spring velocities
                colorOffset: Math.random(),
                sizeParams: Math.random()
            });
        }

        const handleMove = (e) => {
            mouse.tx = e.clientX;
            mouse.ty = e.clientY;
            mouse.active = true;
        };
        const handleLeave = () => {
            mouse.active = false;
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseleave", handleLeave);
        window.addEventListener("mouseout", handleLeave); // Sometimes fires instead

        // Interval to swap states
        const morphTimer = setInterval(() => {
            shapeMode = (shapeMode + 1) % 3;
            modeLerp = 0;
        }, 10000);

        let frameId;
        const render = () => {
            modeLerp += 0.01;
            if (modeLerp > 1) modeLerp = 1;

            // Background trailing effect precisely matching theme
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = `rgba(${rgbBg[0]}, ${rgbBg[1]}, ${rgbBg[2]}, ${dark ? 0.2 : 0.4})`;
            ctx.fillRect(0, 0, w, h);

            // Smooth mouse follow
            if (mouse.active) {
                mouse.x += (mouse.tx - mouse.x) * 0.08;
                mouse.y += (mouse.ty - mouse.y) * 0.08;
            } else {
                mouse.x += (centerX - mouse.x) * 0.02;
                mouse.y += (centerY - mouse.y) * 0.02;
            }

            // Global Scene Rotation
            glob.rY += 0.003;
            glob.rX = (mouse.y - centerY) * 0.0005 + 0.2;
            glob.rZ = (mouse.x - centerX) * 0.0005;

            const cosX = Math.cos(glob.rX), sinX = Math.sin(glob.rX);
            const cosY = Math.cos(glob.rY), sinY = Math.sin(glob.rY);
            const cosZ = Math.cos(glob.rZ), sinZ = Math.sin(glob.rZ);

            // Smoothstep curve for morphing
            const ease = modeLerp < 0.5 ? 2 * modeLerp * modeLerp : -1 + (4 - 2 * modeLerp) * modeLerp;

            ctx.globalCompositeOperation = dark ? "screen" : "multiply";

            for (let i = 0; i < PCOUNT; i++) {
                const p = particles[i];

                // Determine target anchor point based on current state
                let tgtX, tgtY, tgtZ;
                let prevX, prevY, prevZ;

                if (shapeMode === 0) {
                    tgtX = p.sx; tgtY = p.sy; tgtZ = p.sz;
                    prevX = p.gx; prevY = p.gy; prevZ = p.gz;
                } else if (shapeMode === 1) {
                    tgtX = p.tx; tgtY = p.ty; tgtZ = p.tz;
                    prevX = p.sx; prevY = p.sy; prevZ = p.sz;
                } else {
                    tgtX = p.gx; tgtY = p.gy; tgtZ = p.gz;
                    prevX = p.tx; prevY = p.ty; prevZ = p.tz;
                }

                // Interpolate target geometry
                const curTgtX = prevX + (tgtX - prevX) * ease;
                const curTgtY = prevY + (tgtY - prevY) * ease;
                const curTgtZ = prevZ + (tgtZ - prevZ) * ease;

                // Physics: Spring tension pulling to target geometry
                const spring = 0.02;
                const damp = 0.85;
                p.vx += (curTgtX - p.x) * spring;
                p.vy += (curTgtY - p.y) * spring;
                p.vz += (curTgtZ - p.z) * spring;

                // Apply velocities
                p.vx *= damp;
                p.vy *= damp;
                p.vz *= damp;
                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;

                // 3D Matrix Rotation Array
                // 1. Z rotation
                let rx = p.x * cosZ - p.y * sinZ;
                let ry = p.y * cosZ + p.x * sinZ;
                let rz = p.z;
                // 2. Y rotation
                let tempx = rx * cosY + rz * sinY;
                rz = rz * cosY - rx * sinY;
                rx = tempx;
                // 3. X rotation
                let tempy = ry * cosX - rz * sinX;
                rz = ry * sinX + rz * cosX;
                ry = tempy;

                // Explode away from mouse in 2D projection space
                const projScale = 850 / (850 + rz);
                let px = rx * projScale + centerX;
                let py = ry * projScale + centerY;

                // Mouse interaction distance
                const dx = px - mouse.x;
                const dy = py - mouse.y;
                const distSq = dx * dx + dy * dy;
                const interactionRadius = 20000; // Radius squared

                if (distSq < interactionRadius) {
                    const force = (interactionRadius - distSq) / interactionRadius;
                    // Apply raw 3D velocity explosion based on 2D proximity
                    p.vx += dx * force * 0.015;
                    p.vy += dy * force * 0.015;
                    p.vz -= force * 0.5; // Blast them backwards in Z
                }

                // Visibility and drawing
                if (rz < -800) continue; // Behind camera clipping
                
                // Color mapping (blend between Primary A and Secondary B based on depth and particle offset)
                const colorBlend = Math.max(0, Math.min(1, (rz + 400) / 800 + p.colorOffset * 0.3));
                const r = Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * colorBlend);
                const g = Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * colorBlend);
                const b = Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * colorBlend);
                
                const alpha = Math.min(1, Math.max(0.1, projScale * 1.5 - 0.5));
                const size = Math.max(0.2, (p.sizeParams > 0.9 ? 2.5 : 1) * projScale * 1.5);

                ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();

                // Draw connecting lines to close neighbors occasionally (Matrix effect)
                if (i % 25 === 0 && alpha > 0.4) {
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    const neighbor = particles[(i + 15) % PCOUNT];
                    const n_rx = neighbor.x * cosZ - neighbor.y * sinZ;
                    const n_ry = neighbor.y * cosZ + neighbor.x * sinZ;
                    const n_rz = neighbor.z;
                    const n_px = (n_rx * cosY + n_rz * sinY) * (850 / (850 + (n_rz * cosY - n_rx * sinY))) + centerX;
                    const n_py = (n_ry * cosX - (n_rz * cosY - n_rx * sinY) * sinX) * (850 / (850 + (n_ry * sinX + (n_rz * cosY - n_rx * sinY) * cosX))) + centerY;
                    ctx.lineTo(n_px, n_py);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.3})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            frameId = requestAnimationFrame(render);
        };
        frameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(frameId);
            clearInterval(morphTimer);
            window.removeEventListener("resize", setSize);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseleave", handleLeave);
            window.removeEventListener("mouseout", handleLeave);
        };
    }, [T, dark, isMobile]);

    // Holographic glass UI style for info panels
    const hudStyle = {
        background: dark ? "rgba(10,12,18,0.5)" : "rgba(255,255,255,0.4)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
        padding: "16px 20px",
        borderRadius: 20,
        boxShadow: dark ? `0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px ${T.a}10` : `0 10px 40px rgba(0,0,0,0.05), inset 0 0 20px ${T.a}10`,
        pointerEvents: "auto",
        transition: "transform 0.5s",
        flexShrink: 0
    };

    return (
        <section id="home" style={{
            position: "relative", width: "100%", height: "100vh",
            background: T.bg, // EXACT Match to theme
            overflow: "hidden", perspective: "1500px" // For 3D floating HUDs
        }}>
            {/* Native Dynamic CSS Float Animations */}
            <style>{`
                @keyframes hudFloat1 {
                    0%, 100% { transform: rotateY(-15deg) translateZ(40px) translateY(0); }
                    50% { transform: rotateY(-15deg) translateZ(40px) translateY(-15px); }
                }
                @keyframes hudFloat2 {
                    0%, 100% { transform: rotateY(15deg) translateZ(40px) translateY(0); }
                    50% { transform: rotateY(15deg) translateZ(40px) translateY(-10px); }
                }
                @keyframes hudFloat3 {
                    0%, 100% { transform: rotateY(-10deg) translateZ(80px) translateY(0); }
                    50% { transform: rotateY(-10deg) translateZ(80px) translateY(-20px); }
                }
                .mobile-hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            
            {/* The Quantum Engine Canvas */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                {/* A subtle absolute vignette shadow over the canvas */}
                <div style={{ position: "absolute", inset: 0, boxShadow: dark ? "inset 0 0 150px rgba(0,0,0,0.6)" : "inset 0 0 150px rgba(255,255,255,0.7)", pointerEvents: "none", zIndex: 1 }} />
                <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
            </div>

            {/* Cinematic Typography & UI Overlay Layer */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 10,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                pointerEvents: "none" // Pass clicks to canvas if needed, bind pointerEvents: auto on exact UI elements
            }}>
                <div style={{ position: "absolute", top: "10%", left: isMobile ? "5%" : "8%" }}>
                    <div style={{ ...fm, fontSize: 10, fontWeight: 700, color: T.a, letterSpacing: "0.2em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.a, animation: "pulse 2s infinite", boxShadow: `0 0 10px ${T.a}` }} />
                        STATUS: ONLINE & OPEN FOR IMPACT
                    </div>
                </div>

                {/* Massive Architectural Typography */}
                <div style={{ textAlign: "center", pointerEvents: "none", mixBlendMode: dark ? "lighten" : "darken", marginTop: isMobile ? -60 : 0 }}>
                    <h1 style={{
                        ...sf, fontSize: isMobile ? "clamp(55px, 15vw, 90px)" : "clamp(100px, 12vw, 200px)",
                        fontWeight: 900, lineHeight: 0.85, letterSpacing: "-0.06em",
                        margin: 0, color: dark ? "rgba(255,255,255,0.95)" : "rgba(10,12,20,0.9)",
                        textTransform: "uppercase", padding: "0 20px"
                    }}>
                        FARHAN<br/>SHAHRIYAR
                    </h1>
                </div>

                {/* Interactive Action Area */}
                <div style={{ position: "absolute", bottom: isMobile ? "24%" : "10%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, pointerEvents: "auto" }}>
                    
                    {/* Access Profile Button */}
                    <div 
                        onClick={onOpenResume}
                        style={{
                            ...fm, fontSize: 12, fontWeight: 700, color: dark ? "#fff" : "#000",
                            letterSpacing: "0.15em", textTransform: "uppercase",
                            padding: "16px 36px", border: `1px solid ${dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`,
                            borderRadius: 40, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                            backdropFilter: "blur(10px)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = dark ? "#fff" : "#000";
                            e.currentTarget.style.color = dark ? "#000" : "#fff";
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = `0 20px 40px ${T.a}40`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
                            e.currentTarget.style.color = dark ? "#fff" : "#000";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        Access Full Profile
                    </div>

                    {/* Social Connectors restored for all devices */}
                    <div style={{ display: "flex", gap: 16 }}>
                        {SOCIAL.map((s, i) => (
                            <a key={i} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                               style={{
                                   width: 40, height: 40, borderRadius: "50%",
                                   background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                                   display: "flex", alignItems: "center", justifyContent: "center",
                                   color: dark ? "#fff" : "#000", cursor: "pointer",
                                   transition: "all 0.2s"
                               }}
                               onMouseEnter={e => { e.currentTarget.style.background = T.a; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform="scale(1.1)"; }}
                               onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"; e.currentTarget.style.color = dark ? "#fff" : "#000"; e.currentTarget.style.transform="scale(1)"; }}
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>

                    {/* Scroll indicating line */}
                    {!isMobile && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5, marginTop: 10 }}>
                            <div style={{ width: 1, height: 60, background: `linear-gradient(to bottom, ${T.t}, transparent)` }} />
                        </div>
                    )}
                </div>

                {/* ── MASSIVE HUD INFO CARDS FOR IMMEDIATE RECRUITER IMPACT ── */}
                {/* Desktop layout: floating absolutely outside typography */}
                {!isMobile ? (
                    <>
                        {/* HUD 1: RAG Specialist */}
                        <div style={{ position: "absolute", right: "6%", top: "25%", width: 260, animation: "hudFloat1 6s ease-in-out infinite", ...hudStyle }}>
                            <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>RAG Pipeline Specialist</div>
                            <div style={{ ...sf, fontSize: 16, color: T.t, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>Led Enterprise AI at Nordex</div>
                            <div style={{ ...fm, fontSize: 12, color: T.m, lineHeight: 1.5 }}>Engineered custom RAG systems for 1,690+ complex documents, achieving an 11x cost reduction over native tools.</div>
                        </div>

                        {/* HUD 2: Data Architecture */}
                        <div style={{ position: "absolute", left: "6%", top: "45%", width: 260, animation: "hudFloat2 7s ease-in-out infinite 1s", ...hudStyle }}>
                            <div style={{ ...fm, fontSize: 10, color: T.a2, letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Data Architecture</div>
                            <div style={{ ...sf, fontSize: 16, color: T.t, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>Real-Time Event Streams</div>
                            <div style={{ ...fm, fontSize: 12, color: T.m, lineHeight: 1.5 }}>Expert in building fault-tolerant scalable digital twins utilizing Kafka, Flink, and the AWS/Azure ecosystems.</div>
                        </div>

                        {/* HUD 3: Academic Excellence */}
                        <div style={{ position: "absolute", right: "12%", bottom: "25%", width: 240, animation: "hudFloat3 8s ease-in-out infinite 2s", ...hudStyle }}>
                            <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Academic Foundation</div>
                            <div style={{ ...sf, fontSize: 16, color: T.t, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>MSc Data Science</div>
                            <div style={{ ...fm, fontSize: 12, color: T.m, lineHeight: 1.5 }}>Specialized in neural networks & massive datasets at TU Hamburg.</div>
                        </div>
                    </>
                ) : (
                    /* Mobile layout: horizontally swipeable transparent card tray at the very bottom */
                    <div className="mobile-hide-scrollbar" style={{ position: "absolute", bottom: "3%", left: 0, width: "100%", display: "flex", overflowX: "auto", gap: 16, padding: "10px 20px", pointerEvents: "auto", snapType: "x mandatory" }}>
                        <div style={{ width: 260, scrollSnapAlign: "center", ...hudStyle, transform: "none" }}>
                            <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>RAG Pipeline Specialist</div>
                            <div style={{ ...sf, fontSize: 16, color: T.t, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>Led Enterprise AI at Nordex</div>
                            <div style={{ ...fm, fontSize: 12, color: T.m, lineHeight: 1.5 }}>Engineered custom RAG systems for 1,690+ complex documents, achieving an 11x cost reduction.</div>
                        </div>

                        <div style={{ width: 260, scrollSnapAlign: "center", ...hudStyle, transform: "none" }}>
                            <div style={{ ...fm, fontSize: 10, color: T.a2, letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Data Architecture</div>
                            <div style={{ ...sf, fontSize: 16, color: T.t, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>Real-Time Event Streams</div>
                            <div style={{ ...fm, fontSize: 12, color: T.m, lineHeight: 1.5 }}>Expert in scalable digital twins utilizing Kafka, Flink, and the AWS/Azure ecosystems.</div>
                        </div>

                        <div style={{ width: 260, scrollSnapAlign: "center", ...hudStyle, transform: "none", marginRight: 20 }}>
                            <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Academic Foundation</div>
                            <div style={{ ...sf, fontSize: 16, color: T.t, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>MSc Data Science</div>
                            <div style={{ ...fm, fontSize: 12, color: T.m, lineHeight: 1.5 }}>Specialized in neural networks & massive datasets at TU Hamburg.</div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
