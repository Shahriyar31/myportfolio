import { useEffect, useRef } from "react";
import { getDeviceTier, CANVAS_CONFIG } from "../utils/perf";

export default function NeuralCanvas({ T }) {
    const ref = useRef(null);

    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d");

        const tier = getDeviceTier();
        const cfg = CANVAS_CONFIG[tier];
        const msPerFrame = 1000 / cfg.targetFPS;
        let lastFrame = 0;
        let W, H, raf;
        const dark = T.bg === "#1a1a22";
        const CA = dark ? "126,184,190" : "45,50,80";
        const mouse = { x: -999, y: -999, px: -1, py: -1 };

        const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
        resize();

        // Ripples
        const ripples = [];
        const addRipple = (x, y) => {
            if (!cfg.enableRipples) return;
            if (ripples.length > cfg.maxRipples) ripples.shift();
            ripples.push({ x, y, r: 0, alpha: .32, speed: 1.2 + Math.random() * .8 });
        };

        // Neural nodes
        let nodes = [];
        const initNodes = () => {
            nodes = Array.from({ length: cfg.nodes }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
                r: Math.random() * 1.3 + .4,
            }));
        };
        initNodes();

        // Globe
        const globe = cfg.enableGlobe ? {
            cx: 0, cy: 0, r: 0, rot: 0,
            points: Array.from({ length: cfg.globePoints }, () => ({
                lat: (Math.random() - .5) * Math.PI,
                lon: Math.random() * Math.PI * 2,
                city: Math.random() < 0.08,
            })),
            arcs: [],
        } : null;
        if (globe) {
            const cities = globe.points.filter(p => p.city);
            for (let i = 0; i < cities.length; i++)
                for (let j = i + 1; j < cities.length; j++)
                    if (Math.random() < 0.35)
                        globe.arcs.push({ a: cities[i], b: cities[j], prog: Math.random(), speed: .003 + Math.random() * .004 });
        }

        // Particles
        const particles = [];
        if (cfg.enableParticles) {
            const ofc = document.createElement("canvas");
            ofc.width = 500; ofc.height = 120;
            const octx = ofc.getContext("2d");
            octx.fillStyle = "#fff";
            octx.font = "bold 96px 'Sora', sans-serif";
            octx.textAlign = "center";
            octx.fillText("FARHAN", 250, 96);
            const imgData = octx.getImageData(0, 0, 500, 120);
            const textPts = [];
            for (let py = 0; py < 120; py += 4)
                for (let px = 0; px < 500; px += 4)
                    if (imgData.data[(py * 500 + px) * 4 + 3] > 128)
                        textPts.push({ tx: px, ty: py });
            textPts.sort(() => Math.random() - .5).slice(0, cfg.particles).forEach(({ tx, ty }) => {
                const scaleX = W * 0.55 / 500;
                particles.push({
                    x: Math.random() * W, y: Math.random() * H,
                    tx: tx * scaleX + W * 0.05, ty: ty * (H * 0.18 / 120) + H * 0.38,
                    vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2,
                    alpha: 0, r: Math.random() * 1.8 + .6, phase: "assemble", age: 0,
                });
            });
        }

        const HOLD_UNTIL = 180, DISPERSE_AT = 270;
        let frame = 0;
        let paused = false;
        const onVis = () => { paused = document.hidden; };
        document.addEventListener("visibilitychange", onVis);
        let inView = true;
        const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0 });
        io.observe(c);

        const tick = (now) => {
            raf = requestAnimationFrame(tick);
            if (now - lastFrame < msPerFrame) return;
            lastFrame = now;
            if (paused || !inView) return;
            ctx.clearRect(0, 0, W, H);
            frame++;

            // Globe
            if (globe) {
                globe.cx = W * 0.82; globe.cy = H * 0.5;
                globe.r = Math.min(W, H) * 0.28; globe.rot += 0.003;
                const gr = globe.r;
                const grd = ctx.createRadialGradient(globe.cx, globe.cy, gr * .7, globe.cx, globe.cy, gr * 1.1);
                grd.addColorStop(0, `rgba(${CA},.05)`); grd.addColorStop(1, `rgba(${CA},0)`);
                ctx.beginPath(); ctx.arc(globe.cx, globe.cy, gr * 1.1, 0, Math.PI * 2);
                ctx.fillStyle = grd; ctx.fill();
                ctx.beginPath(); ctx.arc(globe.cx, globe.cy, gr, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${CA},.1)`; ctx.lineWidth = 1; ctx.stroke();
                for (let lat = -60; lat <= 60; lat += 30) {
                    const lr = lat * Math.PI / 180;
                    const ry = globe.cy + Math.sin(lr) * gr;
                    const rx = Math.cos(lr) * gr;
                    if (rx > 0) { ctx.beginPath(); ctx.ellipse(globe.cx, ry, rx, rx * .15, 0, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${CA},.06)`; ctx.lineWidth = .5; ctx.stroke(); }
                }
                globe.points.forEach(p => {
                    const lon2 = p.lon + globe.rot;
                    const z = Math.cos(p.lat) * Math.sin(lon2);
                    if (z < 0) return;
                    const px2 = globe.cx + Math.cos(p.lat) * Math.cos(lon2) * gr;
                    const py2 = globe.cy + Math.sin(p.lat) * gr;
                    ctx.beginPath(); ctx.arc(px2, py2, p.city ? 2.2 : 1, 0, Math.PI * 2);
                    ctx.fillStyle = p.city ? `rgba(${CA},.75)` : `rgba(${CA},.28)`; ctx.fill();
                    if (p.city) { ctx.beginPath(); ctx.arc(px2, py2, 5, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${CA},.25)`; ctx.lineWidth = 1; ctx.stroke(); }
                });
                globe.arcs.forEach(arc => {
                    arc.prog = (arc.prog + arc.speed) % 1;
                    const zA = Math.cos(arc.a.lat) * Math.sin(arc.a.lon + globe.rot);
                    const zB = Math.cos(arc.b.lat) * Math.sin(arc.b.lon + globe.rot);
                    if (zA < 0 || zB < 0) return;
                    const x1 = globe.cx + Math.cos(arc.a.lat) * Math.cos(arc.a.lon + globe.rot) * gr;
                    const y1 = globe.cy + Math.sin(arc.a.lat) * gr;
                    const x2 = globe.cx + Math.cos(arc.b.lat) * Math.cos(arc.b.lon + globe.rot) * gr;
                    const y2 = globe.cy + Math.sin(arc.b.lat) * gr;
                    ctx.beginPath();
                    for (let s = 0; s <= Math.floor(arc.prog * 24); s++) {
                        const t = s / 24;
                        const ix = x1 + (x2 - x1) * t, iy = y1 + (y2 - y1) * t - Math.sin(t * Math.PI) * 26;
                        s === 0 ? ctx.moveTo(ix, iy) : ctx.lineTo(ix, iy);
                    }
                    ctx.strokeStyle = `rgba(${CA},.5)`; ctx.lineWidth = 1; ctx.stroke();
                    const dt = arc.prog;
                    ctx.beginPath(); ctx.arc(x1 + (x2 - x1) * dt, y1 + (y2 - y1) * dt - Math.sin(dt * Math.PI) * 26, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${CA},1)`; ctx.fill();
                });
            }

            // Neural nodes
            const maxX = globe ? W * 0.68 : W;
            nodes.forEach(n => {
                if (n.x > maxX) { n.x = Math.random() * maxX * .85; return; }
                const dx = mouse.x - n.x, dy = mouse.y - n.y, dist = Math.hypot(dx, dy);
                if (dist < 160) { n.vx += (dx / dist) * .018; n.vy += (dy / dist) * .018; }
                n.vx *= .984; n.vy *= .984; n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > maxX) n.vx *= -1;
                if (n.y < 0 || n.y > H) n.vy *= -1;
            });
            for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
                const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                if (d < 120) { ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.strokeStyle = `rgba(${CA},${(1 - d / 120) * .22})`; ctx.lineWidth = .5; ctx.stroke(); }
            }
            nodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${CA},.42)`; ctx.fill(); });

            // Ripples
            for (let i = ripples.length - 1; i >= 0; i--) {
                const rp = ripples[i]; rp.r += rp.speed; rp.alpha -= .007;
                if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
                ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${CA},${rp.alpha})`; ctx.lineWidth = 1; ctx.stroke();
            }

            // Particles
            if (cfg.enableParticles) particles.forEach(p => {
                p.age++;
                if (p.phase === "assemble") {
                    const dx = p.tx - p.x, dy = p.ty - p.y;
                    p.x += dx * .06; p.y += dy * .06;
                    p.alpha = Math.min(p.alpha + .02, .8);
                    if (frame > HOLD_UNTIL - 20 && Math.abs(dx) < 2 && Math.abs(dy) < 2) p.phase = "hold";
                } else if (p.phase === "hold") {
                    p.x += (Math.random() - .5) * .4; p.y += (Math.random() - .5) * .4;
                    if (frame > DISPERSE_AT) p.phase = "disperse";
                } else if (p.phase === "disperse") {
                    p.vx += (Math.random() - .5) * .15; p.vy += (Math.random() - .5) * .15 - .02;
                    p.x += p.vx; p.y += p.vy; p.alpha -= .005;
                    if (p.alpha < 0) { p.alpha = 0; p.x = Math.random() * maxX; p.y = Math.random() * H; p.vx = (Math.random() - .5) * .3; p.vy = (Math.random() - .5) * .3; p.phase = "float"; }
                } else {
                    p.x += p.vx; p.y += p.vy;
                    p.alpha = Math.min(p.alpha + .003, .22);
                    if (p.x < 0 || p.x > maxX) p.vx *= -1;
                    if (p.y < 0 || p.y > H) p.vy *= -1;
                }
                if (p.alpha <= 0) return;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${CA},${p.alpha})`; ctx.fill();
            });
        };

        const onMouseMove = (e) => {
            if (mouse.px >= 0) { const spd = Math.hypot(e.clientX - mouse.px, e.clientY - mouse.py); if (spd > 8) { const rect = c.getBoundingClientRect(); addRipple(e.clientX, e.clientY - rect.top); } }
            mouse.px = e.clientX; mouse.py = e.clientY; mouse.x = e.clientX; mouse.y = e.clientY;
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("resize", () => { resize(); initNodes(); });
        raf = requestAnimationFrame(tick);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMouseMove); document.removeEventListener("visibilitychange", onVis); io.disconnect(); };
    }, [T]);

    return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: T.bg === "#1a1a22" ? 0.88 : 0.42 }} />;
}
