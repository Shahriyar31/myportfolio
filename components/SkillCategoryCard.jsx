import { useState, useEffect, useRef } from "react";
import SkillNode from "./SkillNode";

export default function SkillCategoryCard({ name, skills, color, icon, profMap, T, dark, index }) {
    const ref = useRef(null);
    const [hov, setHov] = useState(false);
    const [mx, setMx] = useState(50);
    const [my, setMy] = useState(50);
    const [vis, setVis] = useState(false);
    const [activeSkill, setActiveSkill] = useState(null);
    const canvasRef = useRef(null);
    const nodesRef = useRef([]);
    const rafRef = useRef(null);

    const fm = { fontFamily: "'Inter', sans-serif" };

    /* ── Scroll reveal ── */
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) setTimeout(() => setVis(true), index * 120);
        }, { threshold: .15 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [index]);

    /* ── 3D Tilt ── */
    const onMove = e => {
        const r = ref.current?.getBoundingClientRect(); if (!r) return;
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        setMx(x * 100); setMy(y * 100);
        const rx = (x - .5) * 14;
        const ry = -(y - .5) * 10;
        ref.current.style.transform = `perspective(800px) rotateY(${rx}deg) rotateX(${ry}deg) translateY(-6px) scale(1.02)`;
    };
    const onLeave = () => {
        if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0) rotateX(0) translateY(0) scale(1)";
        setHov(false);
        setActiveSkill(null);
    };

    /* ── Connecting particles canvas ── */
    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext("2d");
        let W, H;

        const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
        resize();

        /* Create floating particles for each skill */
        const pts = skills.map((_, i) => {
            const cols = Math.ceil(Math.sqrt(skills.length));
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
                x: (col + .5) / cols * W,
                y: (row + .5) / Math.ceil(skills.length / cols) * H,
                vx: (Math.random() - .5) * .3,
                vy: (Math.random() - .5) * .3,
                phase: Math.random() * Math.PI * 2,
                r: 2.5 + Math.random() * 1.5,
            };
        });
        nodesRef.current = pts;

        /* Parse color to RGB */
        const hex2rgb = h => {
            const m = h.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [126, 184, 190];
        };
        const rgb = hex2rgb(color);

        const tick = () => {
            ctx.clearRect(0, 0, W, H);

            pts.forEach(p => {
                p.phase += .012;
                p.x += Math.sin(p.phase) * .15 + p.vx;
                p.y += Math.cos(p.phase * .8) * .12 + p.vy;
                p.vx *= .99; p.vy *= .99;

                /* Bounce */
                if (p.x < 10 || p.x > W - 10) p.vx *= -1;
                if (p.y < 10 || p.y > H - 10) p.vy *= -1;
                p.x = Math.max(10, Math.min(W - 10, p.x));
                p.y = Math.max(10, Math.min(H - 10, p.y));
            });

            /* Connection lines */
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
                    const maxD = W * .45;
                    if (d < maxD) {
                        const alpha = (1 - d / maxD) * .12;
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
                        ctx.lineWidth = .6;
                        ctx.stroke();
                    }
                }
            }

            /* Draw particle nodes */
            pts.forEach(p => {
                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                glow.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.18)`);
                glow.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fillStyle = glow; ctx.fill();

                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.35)`;
                ctx.fill();
            });

            rafRef.current = requestAnimationFrame(tick);
        };

        tick();
        const ro = new ResizeObserver(resize);
        ro.observe(c);
        return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
    }, [skills, color, dark]);

    const avgProf = Math.round(skills.reduce((a, s) => a + (profMap[s] || .75), 0) / skills.length * 100);

    return (
        <div ref={ref}
            onMouseMove={onMove}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={onLeave}
            style={{
                position: "relative", overflow: "hidden",
                borderRadius: 20, willChange: "transform",
                border: `1px solid ${hov ? color + "60" : T.border}`,
                background: dark ? "rgba(255,255,255,.025)" : "rgba(255,255,255,.6)",
                backdropFilter: "blur(16px)",
                padding: 0,
                transition: "transform .15s ease, border-color .3s, box-shadow .4s",
                boxShadow: hov
                    ? `0 24px 60px ${color}20, 0 0 0 1px ${color}15, inset 0 0 80px ${color}06`
                    : "0 4px 20px rgba(0,0,0,.08)",
                opacity: vis ? 1 : 0,
                transform: vis ? "perspective(800px) rotateY(0) rotateX(0) translateY(0) scale(1)" : `perspective(800px) rotateY(${index % 2 === 0 ? -8 : 8}deg) rotateX(4deg) translateY(40px) scale(.95)`,
                cursor: "none",
            }}>
            {/* Mouse spotlight */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                opacity: hov ? .7 : 0, transition: "opacity .3s",
                background: `radial-gradient(circle 250px at ${mx}% ${my}%,${color}18,transparent 70%)`,
            }} />

            {/* Animated top border */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg,transparent,${color},transparent)`,
                opacity: hov ? .8 : .4,
                animation: `shimmer 3s ${index * .3}s ease-in-out infinite`,
                transition: "opacity .3s",
            }} />

            {/* Connecting particles canvas */}
            <canvas ref={canvasRef} style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                pointerEvents: "none", opacity: hov ? .8 : .3,
                transition: "opacity .4s",
            }} />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 1, padding: "28px 24px" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: `${color}12`, border: `1px solid ${color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 24,
                        animation: hov ? `float 2s ease-in-out infinite` : `float ${5 + index * .8}s ease-in-out infinite`,
                        transition: "border-color .3s",
                        borderColor: hov ? color : `${color}25`,
                    }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ ...fm, fontSize: 12, color: hov ? color : T.t, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700, transition: "color .3s" }}>{name}</div>
                        <div style={{ ...fm, fontSize: 9, color: T.m, marginTop: 3 }}>
                            {skills.length} skills · avg {avgProf}%
                        </div>
                    </div>
                    {/* Animated progress ring */}
                    <div style={{ width: 48, height: 48, position: "relative" }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="24" cy="24" r="19" fill="none"
                                stroke={dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"} strokeWidth="3" />
                            <circle cx="24" cy="24" r="19" fill="none"
                                stroke={color} strokeWidth="3" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 19}`}
                                strokeDashoffset={vis ? `${2 * Math.PI * 19 * (1 - avgProf / 100)}` : `${2 * Math.PI * 19}`}
                                style={{ transition: `stroke-dashoffset 1.5s ${index * .2 + .5}s cubic-bezier(.16,1,.3,1)` }}
                                opacity={hov ? 1 : .7} />
                        </svg>
                        <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            ...fm, fontSize: 10, color: hov ? color : T.m, fontWeight: 700,
                            transition: "color .3s",
                        }}>{avgProf}</div>
                    </div>
                </div>

                {/* Divider with animation */}
                <div style={{
                    height: 1, marginBottom: 20, position: "relative", overflow: "hidden",
                    background: `linear-gradient(90deg,${color}20,transparent)`,
                }}>
                    <div style={{
                        position: "absolute", top: 0, left: "-100%", width: "50%", height: "100%",
                        background: `linear-gradient(90deg,transparent,${color}80,transparent)`,
                        animation: hov ? `shimmer 1.5s ease-in-out infinite` : "none",
                    }} />
                </div>

                {/* Skill Nodes Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
                    gap: 4,
                }}>
                    {skills.map((s, si) => (
                        <SkillNode
                            key={s} label={s}
                            level={profMap[s] || .75}
                            color={color} T={T}
                            delay={vis ? si * 70 + index * 120 : 9999}
                            dark={dark}
                            isActive={activeSkill === s}
                            onActivate={() => setActiveSkill(activeSkill === s ? null : s)}
                            cardHovered={hov}
                        />
                    ))}
                </div>

                {/* Skills count badge */}
                <div style={{
                    marginTop: 16, display: "flex", alignItems: "center", gap: 8,
                    opacity: hov ? 1 : .5, transition: "opacity .3s",
                }}>
                    <div style={{
                        height: 1, flex: 1,
                        background: `linear-gradient(90deg,${color}30,transparent)`,
                    }} />
                    <span style={{ ...fm, fontSize: 8, color: T.m, letterSpacing: ".12em", textTransform: "uppercase" }}>
                        {skills.length} / {skills.length} mastered
                    </span>
                    <div style={{
                        height: 1, flex: 1,
                        background: `linear-gradient(90deg,transparent,${color}30)`,
                    }} />
                </div>
            </div>
        </div>
    );
}
