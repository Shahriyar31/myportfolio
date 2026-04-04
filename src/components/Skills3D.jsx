import { useEffect, useRef, useState, useMemo } from "react";
import { SKILLS } from "../data/constants";



/* ─── Canvas: Circuit-board ambient background ──────────────── */
function CircuitCanvas({ T, dark }) {
    const ref = useRef(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d");
        let w, h, raf;
        const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
        resize();

        // Subtle floating particles
        const dots = Array.from({ length: 45 }, () => ({
            x: Math.random() * 1, y: Math.random() * 1,
            r: Math.random() * 1.2 + 0.3,
            vx: (Math.random() - 0.5) * 0.0002,
            vy: (Math.random() - 0.5) * 0.0002,
            pulse: Math.random() * Math.PI * 2,
            ps: 0.02 + Math.random() * 0.02,
            color: [T.a, T.a2, T.a3, "#f59e0b"][Math.floor(Math.random() * 4)]
        }));

        const tick = () => {
            ctx.clearRect(0, 0, w, h);
            dots.forEach(d => {
                d.x = (d.x + d.vx + 1) % 1;
                d.y = (d.y + d.vy + 1) % 1;
                d.pulse += d.ps;
                const a = 0.1 + Math.sin(d.pulse) * 0.12;
                ctx.beginPath();
                ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
                ctx.fillStyle = `${d.color}${Math.floor(a * 255).toString(16).padStart(2, "0")}`;
                ctx.fill();
            });

            // Subtle horizontal divider glow lines between each lane
            [0.25, 0.5, 0.75].forEach(y => {
                const grad = ctx.createLinearGradient(0, y * h, w, y * h);
                grad.addColorStop(0, `${T.a}00`);
                grad.addColorStop(0.3, `${T.a}08`);
                grad.addColorStop(0.7, `${T.a2}08`);
                grad.addColorStop(1, `${T.a2}00`);
                ctx.beginPath();
                ctx.moveTo(0, y * h); ctx.lineTo(w, y * h);
                ctx.strokeStyle = grad; ctx.lineWidth = 1; ctx.stroke();
            });

            raf = requestAnimationFrame(tick);
        };
        tick();
        window.addEventListener("resize", resize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, [T, dark]);
    return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ─── Single Marquee Lane ────────────────────────────────────── */
function MarqueeLane({ skills, color, icon, catName, skillCount, direction, speed, dark, T }) {
    const [paused, setPaused] = useState(false);
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };

    // DOUBLE the array — animation goes from 0 to -50% (exactly one copy)
    const repeated = [...skills, ...skills];
    const animName = direction === "left" ? "marqueeLeft" : "marqueeRight";

    return (
        <div style={{ width: "100%", paddingBottom: 8 }}>
            {/* ── Category Header ── */}
            <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "0 20px 10px"
            }}>
                {/* Glowing icon badge */}
                <div style={{
                    width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                    background: `${color}18`, border: `1px solid ${color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                    boxShadow: `0 0 14px ${color}35`,
                }}>
                    {icon}
                </div>

                {/* Category name */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        ...sf, fontSize: 14, fontWeight: 800,
                        color: T.t, letterSpacing: "-0.2px"
                    }}>
                        {catName}
                    </div>
                    <div style={{
                        ...fm, fontSize: 10, color, fontWeight: 600,
                        letterSpacing: ".04em"
                    }}>
                        {skillCount} skills · {direction === "left" ? "←" : "→"} live
                    </div>
                </div>

                {/* Directional indicator */}
                <div style={{
                    ...fm, fontSize: 9, color: T.m,
                    letterSpacing: ".1em", textTransform: "uppercase",
                    background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                    border: `1px solid ${color}25`,
                    padding: "3px 10px", borderRadius: 10,
                    opacity: 0.7
                }}>
                    {paused ? "paused" : "scrolling"}
                </div>
            </div>

            {/* ── Accent ruler ── */}
            <div style={{
                height: 1, marginBottom: 12,
                background: `linear-gradient(90deg, transparent, ${color}50, ${color}80, ${color}50, transparent)`,
            }} />

            {/* ── Scrolling track ── */}
            {/* Outer: clips overflow, NEVER lets content bleed horizontally */}
            <div
                onTouchStart={() => setPaused(true)}
                onTouchEnd={() => setTimeout(() => setPaused(false), 2500)}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                style={{
                    position: "relative",
                    width: "100%",
                    overflow: "hidden",         /* hard clip */
                    contain: "paint",           /* isolate compositing layer */
                    maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)"
                }}
            >
                <div style={{
                    display: "flex", gap: 10,
                    width: "max-content",
                    animation: `${animName} ${speed}s linear infinite`,
                    animationPlayState: paused ? "paused" : "running",
                    padding: "4px 0 12px",
                    willChange: "transform",
                }}>
                    {repeated.map((skill, i) => (
                        <div key={`${skill}-${i}`} style={{
                            flexShrink: 0,
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 18px",
                            borderRadius: 50,
                            background: dark ? "rgba(14,16,22,0.85)" : "rgba(255,255,255,0.92)",
                            border: `1px solid ${color}45`,
                            boxShadow: `0 4px 18px ${color}20`,
                            whiteSpace: "nowrap",
                        }}>
                            {/* Glow dot */}
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: color,
                                boxShadow: `0 0 8px ${color}, 0 0 16px ${color}60`,
                                flexShrink: 0
                            }} />
                            <span style={{
                                ...sf,
                                fontSize: 14,
                                fontWeight: 700,
                                color: dark ? "rgba(255,255,255,0.9)" : "#0f172a",
                                letterSpacing: "-0.1px"
                            }}>
                                {skill}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Mobile: Infinite Lanes ────────────────────────────────── */
function MobileMarquee({ T, dark }) {

    const catColors  = [T.a, T.a2, T.a3, "#f59e0b"];
    const catIcons   = ["🧠", "⚡", "☁️", "💎"];
    const categories = Object.keys(SKILLS);
    const speeds     = [32, 28, 34, 26];
    const directions = ["right", "left", "right", "left"];
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };

    return (
        <div style={{ width: "100%", position: "relative" }}>
            {/* Canvas background */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                <CircuitCanvas T={T} dark={dark} />
            </div>

            {/* Ambient top glow */}
            <div style={{
                position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
                width: "70%", height: 180, borderRadius: "50%",
                background: `radial-gradient(ellipse, ${T.a}18 0%, transparent 70%)`,
                filter: "blur(40px)", pointerEvents: "none", zIndex: 0
            }} />

            {/* ── 4 Domain Lanes ── */}
            <div style={{ position: "relative", zIndex: 1, paddingTop: 8 }}>
                {categories.map((cat, i) => (
                    <div
                        key={cat}
                        style={{
                            position: "relative",
                            paddingTop: 20,
                            paddingBottom: 4,
                            background: i % 2 === 0
                                ? (dark ? `${catColors[i]}05` : `${catColors[i]}04`)
                                : "transparent",
                        }}
                    >
                        <MarqueeLane
                            skills={SKILLS[cat]}
                            color={catColors[i]}
                            icon={catIcons[i]}
                            catName={cat}
                            skillCount={SKILLS[cat].length}
                            direction={directions[i]}
                            speed={speeds[i]}
                            dark={dark}
                            T={T}
                        />
                    </div>
                ))}
            </div>

            {/* ── Touch hint ── */}
            <div style={{
                textAlign: "center", padding: "12px 0 4px",
                ...fm, fontSize: 10, color: T.m,
                letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.5,
                position: "relative", zIndex: 1
            }}>
                Touch any lane to pause · release to resume
            </div>

            {/* ── Stats Row ── */}
            <div style={{
                display: "flex", justifyContent: "space-around",
                margin: "16px 20px 32px",
                padding: "18px 12px", borderRadius: 24,
                background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
                position: "relative", zIndex: 1
            }}>
                {[["26", "Skills"], ["4", "Domains"], ["83%", "Avg Prof."], ["2+", "Yrs"]].map(([n, l]) => (
                    <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ ...sf, fontSize: 22, fontWeight: 900, color: T.t }}>{n}</div>
                        <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 3 }}>{l}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Desktop: Full 3D Holographic Globe ───────────────────── */
function DesktopGlobe({ T, dark, skillsList }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [hoveredSkill, setHoveredSkill] = useState(null);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        let w = canvas.width = container.clientWidth;
        let h = canvas.height = container.clientHeight;
        let cx = w / 2, cy = h / 2;
        const R = 250;
        const totalSkills = skillsList.length;
        const skillPoints = skillsList.map((skill, i) => {
            const phi = Math.acos(1 - 2 * (i + 0.5) / totalSkills);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
            return { ...skill, ox: R * Math.sin(phi) * Math.cos(theta), oy: R * Math.sin(phi) * Math.sin(theta), oz: R * Math.cos(phi), x: 0, y: 0, z: 0, scale: 1, alpha: 1 };
        });
        const particleCount = 350, innerR = R * 0.7;
        const particles = Array.from({ length: particleCount }).map((_, i) => {
            const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
            const nr = innerR * (0.8 + Math.random() * 0.4);
            return { ox: nr * Math.sin(phi) * Math.cos(theta), oy: nr * Math.sin(phi) * Math.sin(theta), oz: nr * Math.cos(phi), color: [T.a, T.a2, T.a3, "#f59e0b"][Math.floor(Math.random() * 4)], r: Math.random() * 1.5 + 0.5 };
        });
        let angleX = 0, angleY = 0, vX = 0.002, vY = 0.003, targetVX = 0.002, targetVY = 0.003;
        let isDragging = false, lastMX = 0, lastMY = 0;
        const onDown = (e) => { isDragging = true; lastMX = e.clientX; lastMY = e.clientY; targetVX = 0; targetVY = 0; container.style.cursor = "grabbing"; };
        const onMove = (e) => { if (!isDragging) { const rect = container.getBoundingClientRect(); targetVY = ((e.clientX - rect.left - cx) / cx) * 0.008; targetVX = ((e.clientY - rect.top - cy) / cy) * 0.008; return; } vY = (e.clientX - lastMX) * 0.004; vX = (e.clientY - lastMY) * 0.004; lastMX = e.clientX; lastMY = e.clientY; };
        const onUp = () => { if (!isDragging) return; isDragging = false; container.style.cursor = "grab"; targetVX = vX; targetVY = vY; if (Math.abs(targetVX) < 0.001) targetVX = 0.001; if (Math.abs(targetVY) < 0.0015) targetVY = 0.0015; };
        container.addEventListener("mousedown", onDown); window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
        const rotate = (p, ax, ay) => { const cosY = Math.cos(ay), sinY = Math.sin(ay), cosX = Math.cos(ax), sinX = Math.sin(ax); const x1 = p.ox * cosY - p.oz * sinY, z1 = p.oz * cosY + p.ox * sinY, y1 = p.oy * cosX - z1 * sinX, z2 = z1 * cosX + p.oy * sinX; p.x = x1; p.y = y1; p.z = z2; };
        const FOCAL = 600; let raf = null, time = 0;
        const domNodes = container.querySelectorAll(".skill-node-3d");
        const tick = () => {
            time += 0.01; ctx.clearRect(0, 0, w, h);
            if (!isDragging) { vX += (targetVX - vX) * 0.05; vY += (targetVY - vY) * 0.05; }
            angleX += vX; angleY += vY;
            particles.forEach(p => { rotate(p, angleX, angleY); const scale = FOCAL / (FOCAL + p.z); const sx = cx + p.x * scale, sy = cy + p.y * scale; const a = Math.max(0.05, Math.min(1, scale * scale * 0.6)); const br = (p.r + Math.sin(time * 2 + p.x) * 0.5) * scale; ctx.beginPath(); ctx.arc(sx, sy, br, 0, Math.PI * 2); ctx.fillStyle = `${p.color}${Math.floor(a * 255).toString(16).padStart(2, "0")}`; ctx.fill(); });
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i += 12) { const p1 = particles[i]; const s1 = FOCAL / (FOCAL + p1.z); const a = Math.max(0, p1.z > 0 ? 0.2 - (p1.z / R) * 0.2 : 0.3); if (a <= 0) continue; const p2 = particles[(i + 1) % particles.length]; const s2 = FOCAL / (FOCAL + p2.z); ctx.strokeStyle = `${p1.color}${Math.floor(a * 255).toString(16).padStart(2, "0")}`; ctx.beginPath(); ctx.moveTo(cx + p1.x * s1, cy + p1.y * s1); ctx.lineTo(cx + p2.x * s2, cy + p2.y * s2); ctx.stroke(); }
            skillPoints.forEach(p => { rotate(p, angleX, angleY); p.scale = FOCAL / (FOCAL + p.z); p.alpha = Math.max(0.1, Math.min(1, p.scale * p.scale)); });
            skillPoints.forEach(p => { if (p.z > -50) { const a = Math.max(0, 0.5 - (p.z / R) * 0.5); if (a > 0) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + p.x * p.scale, cy + p.y * p.scale); ctx.strokeStyle = `${p.color}${Math.floor(a * 255).toString(16).padStart(2, "0")}`; ctx.lineWidth = 1 * p.scale; ctx.stroke(); const prog = ((time * 0.5 + p.ox) % 1 + 1) % 1; ctx.beginPath(); ctx.arc(cx + p.x * p.scale * prog, cy + p.y * p.scale * prog, 1.5 * p.scale, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); } } });
            skillPoints.forEach((p, i) => { const node = domNodes[i]; if (node) { node.style.transform = `translate(-50%,-50%) translate3d(${cx + p.x * p.scale}px,${cy + p.y * p.scale}px,0) scale(${p.scale})`; node.style.opacity = p.alpha; node.style.zIndex = Math.round((1 - p.z / R) * 1000); node.style.filter = p.z > 40 ? `blur(${Math.min(5, p.z / 40)}px)` : "none"; node.style.pointerEvents = p.z > 0 ? "none" : "auto"; } });
            raf = requestAnimationFrame(tick);
        };
        tick();
        const onResize = () => { w = canvas.width = container.clientWidth; h = canvas.height = container.clientHeight; cx = w / 2; cy = h / 2; };
        window.addEventListener("resize", onResize);
        return () => { cancelAnimationFrame(raf); container.removeEventListener("mousedown", onDown); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("resize", onResize); };
    }, [T, skillsList]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: 800, position: "relative", overflow: "hidden", cursor: "grab" }}>
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 450, height: 450, transform: "translate(-50%,-50%)", background: `radial-gradient(circle,${T.a}15 0%,transparent 60%)`, filter: "blur(60px)", pointerEvents: "none" }} />
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {skillsList.map((skill) => {
                    const isH = hoveredSkill === skill.id;
                    return (
                        <div key={skill.id} className="skill-node-3d" onMouseEnter={() => setHoveredSkill(skill.id)} onMouseLeave={() => setHoveredSkill(null)}
                            style={{ position: "absolute", left: 0, top: 0, transformOrigin: "center center", pointerEvents: "auto", background: isH ? `${skill.color}35` : (dark ? "rgba(16,18,24,0.75)" : "rgba(255,255,255,0.85)"), backdropFilter: "blur(12px)", border: `1px solid ${isH ? skill.color : (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)")}`, padding: "12px 20px", borderRadius: 24, display: "flex", alignItems: "center", gap: 10, color: isH ? "#fff" : (dark ? "rgba(255,255,255,0.85)" : "#0f172a"), fontFamily: "'Inter',sans-serif", fontSize: isH ? 15 : 13, fontWeight: isH ? 800 : 600, cursor: "pointer", transition: "all 0.3s", boxShadow: isH ? `0 20px 40px ${skill.color}60,0 0 25px ${skill.color}50` : "0 8px 24px rgba(0,0,0,0.15)", whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: 16, opacity: isH ? 1 : 0.7 }}>{["🧠", "⚡", "☁️", "💎"][skill.catIdx]}</span>
                            {skill.name}
                        </div>
                    );
                })}
            </div>
            <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 28, fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", pointerEvents: "none", flexWrap: "wrap", justifyContent: "center" }}>
                {Object.entries(SKILLS).map(([cat], i) => (<div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, color: T.m }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: [T.a, T.a2, T.a3, "#f59e0b"][i], boxShadow: `0 0 8px ${[T.a, T.a2, T.a3, "#f59e0b"][i]}` }} />{cat}</div>))}
            </div>
            <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", fontFamily: "'Inter',sans-serif", fontSize: 10, color: T.m, letterSpacing: ".12em", textTransform: "uppercase", background: dark ? "rgba(18,20,28,0.6)" : "rgba(255,255,255,0.8)", padding: "8px 20px", borderRadius: 24, backdropFilter: "blur(8px)", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`, pointerEvents: "none" }}>
                👆 Grab & spin · hover to highlight
            </div>
        </div>
    );
}

/* ─── Main Export ──────────────────────────────────────────── */
export default function Skills3D({ T, dark }) {
    const [isMobile, setIsMobile] = useState(false);
    const skillsList = useMemo(() => {
        const all = [];
        const colors = [T.a, T.a2, T.a3, "#f59e0b"];
        Object.keys(SKILLS).forEach((cat, catIdx) => {
            SKILLS[cat].forEach((skill, skillIdx) => {
                all.push({ name: skill, category: cat, color: colors[catIdx], id: `${cat}-${skillIdx}`, catIdx });
            });
        });
        return all;
    }, [T]);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 850);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    if (isMobile) return <MobileMarquee T={T} dark={dark} />;
    return <DesktopGlobe T={T} dark={dark} skillsList={skillsList} />;
}
