import { useEffect, useRef, useState, useCallback } from "react";
import { SKILLS } from "../data/constants";

/* ── Category metadata ──────────────────────────────────────────────── */
const CAT = {
    "AI & MLOps":       { color: "#89b4fa", label: "AI",  qx: -1, qy: -1 },
    "Data Engineering": { color: "#a6e3a1", label: "DATA", qx:  1, qy: -1 },
    "Cloud & DevOps":   { color: "#fab387", label: "OPS",  qx:  1, qy:  1 },
    "Languages & DBs":  { color: "#cba6f7", label: "LANG", qx: -1, qy:  1 },
};

/* Node importance → visual radius */
const RADII = {
    "RAG Pipelines": 22, "Azure AI Foundry": 22, "GPT-4o / GPT-5": 20,
    "Python": 22, "Docker": 20, "Azure": 20, "Apache Kafka": 20,
    "LLM Evaluation": 19, "TensorFlow": 19, "Kubernetes": 19,
    "Azure Databricks": 19, "Apache Spark": 18, "AWS": 18,
};
const DEFAULT_RADIUS = 15;

/* Meaningful cross-category edges — shows real skill relationships */
const CROSS_EDGES = [
    ["Python",           "TensorFlow"],
    ["Python",           "Apache Spark"],
    ["Docker",           "Kubernetes"],
    ["Docker",           "GitHub Actions"],
    ["Azure",            "Azure AI Foundry"],
    ["Azure",            "Azure Databricks"],
    ["RAG Pipelines",    "LLM Evaluation"],
    ["GPT-4o / GPT-5",   "RAG Pipelines"],
    ["Apache Kafka",     "Apache Spark"],
    ["Apache Kafka",     "Apache Flink"],
    ["Python",           "PostgreSQL"],
];

/* ── Build graph data ───────────────────────────────────────────────── */
function buildGraph(W, H, scale) {
    const cx = W / 2, cy = H / 2;
    const clusterR = 145 * scale;         // radius of node ring around cluster center
    const clusterSpread = 235 * scale;    // how far each cluster center is from canvas center

    /* Nodes */
    const nodes = [];
    let id = 0;
    Object.entries(SKILLS).forEach(([cat, skills]) => {
        const meta = CAT[cat];
        const hx = meta.qx * clusterSpread;
        const hy = meta.qy * clusterSpread;
        const count = skills.length;

        skills.forEach((name, i) => {
            // Arrange in a circle around cluster home, start from top
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const r = clusterR + (i % 2 === 0 ? 0 : 20 * scale); // slight offset for alt nodes

            const homeX = hx + Math.cos(angle) * r;
            const homeY = hy + Math.sin(angle) * r;

            nodes.push({
                id: id++,
                name,
                cat,
                color: meta.color,
                r: (RADII[name] || DEFAULT_RADIUS) * scale,
                // Start near home with tiny random scatter to avoid cold-start clumping
                x: homeX + (Math.random() - 0.5) * 30,
                y: homeY + (Math.random() - 0.5) * 30,
                hx: homeX,  // home X (spring target)
                hy: homeY,  // home Y
                vx: 0, vy: 0,
                phase: Math.random() * Math.PI * 2, // breathing offset
                hovered: false,
            });
        });
    });

    /* Edges — same-category ring + cross edges */
    const edges = [];
    const byName = Object.fromEntries(nodes.map(n => [n.name, n]));

    // Within-category: chain neighbors in a ring
    Object.entries(SKILLS).forEach(([cat, skills]) => {
        for (let i = 0; i < skills.length; i++) {
            const a = byName[skills[i]];
            const b = byName[skills[(i + 1) % skills.length]];
            if (a && b) edges.push({ a, b, cross: false });
        }
    });

    // Cross-category meaningful edges
    CROSS_EDGES.forEach(([na, nb]) => {
        const a = byName[na], b = byName[nb];
        if (a && b) edges.push({ a, b, cross: true });
    });

    /* Particles — 2 per edge, flowing A→B and B→A */
    const particles = [];
    edges.forEach(e => {
        particles.push({ e, t: Math.random(), dir: 1, speed: 0.003 + Math.random() * 0.003 });
        particles.push({ e, t: Math.random(), dir: -1, speed: 0.002 + Math.random() * 0.003 });
    });

    return { nodes, edges, particles, cx, cy };
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function SkillsGraph({ T }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const rafRef = useRef(null);
    const graphRef = useRef(null);
    const mouseRef = useRef({ x: -9999, y: -9999, inside: false });
    const hoveredRef = useRef(null);
    const tickRef = useRef(0);
    const [dims, setDims] = useState({ w: 900, h: 700 });

    const dark = T.bg !== "#eff1f5";

    /* ── Measure container and rebuild graph on resize ── */
    const rebuild = useCallback(() => {
        const cont = containerRef.current;
        if (!cont) return;
        const w = cont.clientWidth || 900;
        const mobile = w < 700;
        const h = mobile ? 560 : 720;
        const scale = Math.min(w / 960, 1);
        setDims({ w, h });
        graphRef.current = buildGraph(w, h, scale);
    }, []);

    useEffect(() => {
        rebuild();
        const ro = new ResizeObserver(rebuild);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [rebuild]);

    /* ── Canvas DPR sizing ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = dims.w * dpr;
        canvas.height = dims.h * dpr;
        canvas.style.width = dims.w + "px";
        canvas.style.height = dims.h + "px";
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
    }, [dims]);

    /* ── Animation loop ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !graphRef.current) return;
        const ctx = canvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const render = () => {
            const { nodes, edges, particles, cx, cy } = graphRef.current;
            const { w, h } = dims;
            const tick = ++tickRef.current;

            /* ── Clear ── */
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            /* ── Background vignette ── */
            const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.65);
            vg.addColorStop(0, dark ? "rgba(17,17,27,0)" : "rgba(239,241,245,0)");
            vg.addColorStop(1, dark ? "rgba(17,17,27,0.55)" : "rgba(239,241,245,0.55)");
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, w, h);

            /* ── Faint cluster ghost labels ── */
            Object.entries(CAT).forEach(([cat, meta]) => {
                const scale = Math.min(w / 960, 1);
                const ghx = cx + meta.qx * 235 * scale;
                const ghy = cy + meta.qy * 235 * scale;
                ctx.save();
                ctx.font = `900 ${Math.round(70 * scale)}px 'Sora', sans-serif`;
                ctx.fillStyle = meta.color + (dark ? "09" : "07");
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(meta.label, ghx, ghy);
                ctx.restore();
            });

            /* ── Physics update ── */
            const mouse = mouseRef.current;
            const mx = mouse.x, my = mouse.y;

            nodes.forEach(n => {
                // Spring toward home
                n.vx += (n.hx - n.x) * 0.022;
                n.vy += (n.hy - n.y) * 0.022;

                // Mouse gravity well — attraction toward cursor, repulsion very close
                if (mouse.inside) {
                    const dx = mx - (cx + n.x), dy = my - (cy + n.y);
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const maxDist = 230;
                    if (dist < maxDist) {
                        const orbital = 90; // target orbit radius around cursor
                        const force = (dist - orbital) / dist * 0.28;
                        n.vx += dx / dist * force;
                        n.vy += dy / dist * force;
                    }
                }

                // Damping
                n.vx *= 0.80;
                n.vy *= 0.80;

                n.x += n.vx;
                n.y += n.vy;
            });

            /* ── Edges ── */
            edges.forEach(e => {
                const ax = cx + e.a.x, ay = cy + e.a.y;
                const bx = cx + e.b.x, by = cy + e.b.y;

                const alpha = e.cross ? "35" : "20";
                const color = e.cross
                    ? (dark ? "#ffffff" : "#000000")
                    : e.a.color;

                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.strokeStyle = color + alpha;
                ctx.lineWidth = e.cross ? 0.7 : 0.9;
                ctx.stroke();
            });

            /* ── Edge particles ── */
            particles.forEach(p => {
                p.t += p.speed * p.dir;
                if (p.t > 1) p.t = 0;
                if (p.t < 0) p.t = 1;

                const { a, b } = p.e;
                const px = cx + a.x + (b.x - a.x) * p.t;
                const py = cy + a.y + (b.y - a.y) * p.t;
                const col = a.color;

                // Glow corona
                const grd = ctx.createRadialGradient(px, py, 0, px, py, 7);
                grd.addColorStop(0, col + "bb");
                grd.addColorStop(1, col + "00");
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(px, py, 7, 0, Math.PI * 2);
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fillStyle = col + "ff";
                ctx.fill();
            });

            /* ── Nodes ── */
            nodes.forEach(n => {
                const nx = cx + n.x, ny = cy + n.y;

                // Breathing scale (subtle pulse)
                const breathe = 1 + Math.sin(tick * 0.012 + n.phase) * 0.055;
                const rr = n.r * breathe;

                // Check hover
                const isHovered = n === hoveredRef.current;

                // ① Outer glow corona
                const glowR = rr * (isHovered ? 4.5 : 3);
                const glow = ctx.createRadialGradient(nx, ny, rr * 0.2, nx, ny, glowR);
                glow.addColorStop(0, n.color + (isHovered ? "55" : "38"));
                glow.addColorStop(1, n.color + "00");
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(nx, ny, glowR, 0, Math.PI * 2);
                ctx.fill();

                // ② Node fill (translucent)
                ctx.beginPath();
                ctx.arc(nx, ny, rr, 0, Math.PI * 2);
                ctx.fillStyle = n.color + (dark ? "22" : "30");
                ctx.fill();

                // ③ Node stroke (bright ring)
                ctx.strokeStyle = n.color + (isHovered ? "ff" : "cc");
                ctx.lineWidth = isHovered ? 2 : 1.4;
                ctx.stroke();

                // ④ Inner shimmer dot
                ctx.beginPath();
                ctx.arc(nx - rr * 0.25, ny - rr * 0.25, rr * 0.18, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,255,255," + (dark ? "0.35" : "0.55") + ")";
                ctx.fill();

                // ⑤ Label below node
                const label = n.name.length > 14 ? n.name.slice(0, 13) + "…" : n.name;
                const fontSize = Math.max(8.5, Math.min(10.5, rr * 0.62));
                ctx.save();
                ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                // Text outline for legibility
                ctx.shadowColor = dark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)";
                ctx.shadowBlur = 5;
                ctx.fillStyle = isHovered
                    ? n.color
                    : (dark ? "rgba(205,214,244,0.82)" : "rgba(76,79,105,0.85)");
                ctx.fillText(label, nx, ny + rr + 5);
                ctx.shadowBlur = 0;
                ctx.restore();
            });

            /* ── Hover tooltip (category badge) ── */
            if (hoveredRef.current) {
                const n = hoveredRef.current;
                const nx = cx + n.x, ny = cy + n.y;
                const pad = 8, fontSize = 10;
                ctx.save();
                ctx.font = `700 ${fontSize}px 'Inter', sans-serif`;
                const tw = ctx.measureText(n.cat).width;
                const bx = nx - tw / 2 - pad, by = ny - n.r - 36;
                const bw = tw + pad * 2, bh = 24;
                // Badge bg
                ctx.fillStyle = n.color + "ee";
                ctx.beginPath();
                ctx.roundRect(bx, by, bw, bh, 6);
                ctx.fill();
                // Badge text
                ctx.fillStyle = dark ? "#11111b" : "#ffffff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(n.cat, nx, by + bh / 2);
                ctx.restore();
            }

            rafRef.current = requestAnimationFrame(render);
        };

        rafRef.current = requestAnimationFrame(render);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [dims, dark]);

    /* ── Mouse / Touch interaction ── */
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        mouseRef.current = { x: mx, y: my, inside: true };

        // Hover detection
        if (!graphRef.current) return;
        const { nodes, cx, cy } = graphRef.current;
        let found = null;
        for (const n of nodes) {
            const dx = mx - (cx + n.x), dy = my - (cy + n.y);
            if (dx * dx + dy * dy < (n.r + 8) ** 2) { found = n; break; }
        }
        hoveredRef.current = found;
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current.inside = false;
        hoveredRef.current = null;
    }, []);

    const handleTouch = useCallback((e) => {
        if (!e.touches[0]) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
            inside: true,
        };
    }, []);

    const handleTouchEnd = useCallback(() => {
        mouseRef.current.inside = false;
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", position: "relative", lineHeight: 0 }}
        >
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchMove={handleTouch}
                onTouchEnd={handleTouchEnd}
                style={{ display: "block", width: "100%", touchAction: "none" }}
            />

            {/* Legend — category colour chips */}
            <div style={{
                position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center",
                pointerEvents: "none",
            }}>
                {Object.entries(CAT).map(([cat, meta]) => (
                    <div key={cat} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontFamily: "'Inter', sans-serif", fontSize: 9.5,
                        fontWeight: 600, letterSpacing: ".08em",
                        color: dark ? "rgba(205,214,244,0.55)" : "rgba(76,79,105,0.55)",
                        textTransform: "uppercase",
                    }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: meta.color,
                            boxShadow: `0 0 6px ${meta.color}80`,
                            display: "inline-block", flexShrink: 0,
                        }} />
                        {cat}
                    </div>
                ))}
            </div>
        </div>
    );
}
