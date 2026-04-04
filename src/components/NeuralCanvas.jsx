import { useEffect, useRef } from "react";

export default function NeuralCanvas({ T }) {
    const ref = useRef(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d");
        let W, H, raf;
        const dark = T.bg !== "#F5F7FA";
        const CA = dark ? "9,124,135" : "73,77,95";
        const mouse = { x: W / 2, y: H / 2, px: -1, py: -1 };

        const isLowPower = window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
        resize();

        /* ── LAYER 1: Ink ripples ── */
        const ripples = [];
        const addRipple = (x, y) => {
            if (ripples.length > 12) ripples.shift();
            ripples.push({ x, y, r: 0, maxR: 80 + Math.random() * 60, alpha: .35, speed: 1.2 + Math.random() });
        };

        /* ── LAYER 2: Neural nodes ── */
        let nodes = [];
        const initNodes = () => {
            nodes = Array.from({ length: isLowPower ? 15 : 55 }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
                r: Math.random() * 1.3 + .4,
            }));
        };
        initNodes();

        /* ── LAYER 3: Globe ── */
        const globe = {
            cx: 0, cy: 0, r: 0, rot: 0,
            points: Array.from({ length: isLowPower ? 60 : 180 }, () => {
                const lat = (Math.random() - 0.5) * Math.PI;
                const lon = Math.random() * Math.PI * 2;
                return { lat, lon, city: Math.random() < 0.08 };
            }),
            arcs: [],
        };
        const cities = globe.points.filter(p => p.city);
        for (let i = 0; i < cities.length; i++) {
            for (let j = i + 1; j < cities.length; j++) {
                if (Math.random() < 0.4) {
                    globe.arcs.push({ a: cities[i], b: cities[j], prog: Math.random(), speed: .003 + Math.random() * .004 });
                }
            }
        }

        /* ── LAYER 4: FARHAN particles ── */
        const ofc = document.createElement("canvas");
        ofc.width = 500; ofc.height = 120;
        const octx = ofc.getContext("2d");
        octx.fillStyle = "#fff";
        octx.font = "bold 96px 'Sora', sans-serif";
        octx.textAlign = "center";
        octx.fillText("FARHAN", 250, 96);
        const imgData = octx.getImageData(0, 0, 500, 120);
        const textPts = [];
        for (let py = 0; py < 120; py += 4) {
            for (let px = 0; px < 500; px += 4) {
                if (imgData.data[(py * 500 + px) * 4 + 3] > 128) textPts.push({ tx: px, ty: py });
            }
        }

        const NPARTICLES = Math.min(textPts.length, isLowPower ? 80 : 300);
        const sampled = textPts.sort(() => Math.random() - .5).slice(0, NPARTICLES);

        const particles = sampled.map(({ tx, ty }) => {
            const scaleX = W * 0.55 / 500;
            const offsetX = W * 0.05;
            return {
                x: Math.random() * W, y: Math.random() * H,
                tx: tx * scaleX + offsetX,
                ty: ty * (H * 0.18 / 120) + H * 0.38,
                vx: (Math.random() - .5) * 2,
                vy: (Math.random() - .5) * 2,
                alpha: 0, r: Math.random() * 1.8 + .6,
                phase: "assemble", age: 0,
            };
        });

        const HOLD_UNTIL = 180;
        const DISPERSE_AT = HOLD_UNTIL + 90;
        let frame = 0;

        const tick = () => {
            ctx.clearRect(0, 0, W, H);
            frame++;

            globe.cx = W * 0.82;
            globe.cy = H * 0.5;
            globe.r = Math.min(W, H) * 0.28;
            globe.rot += 0.003;

            /* ── Draw globe ── */
            const gr = globe.r;
            const grd = ctx.createRadialGradient(globe.cx, globe.cy, gr * 0.7, globe.cx, globe.cy, gr * 1.1);
            grd.addColorStop(0, `rgba(${CA},.06)`);
            grd.addColorStop(1, `rgba(${CA},0)`);
            ctx.beginPath(); ctx.arc(globe.cx, globe.cy, gr * 1.1, 0, Math.PI * 2);
            ctx.fillStyle = grd; ctx.fill();

            ctx.beginPath(); ctx.arc(globe.cx, globe.cy, gr, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${CA},.12)`; ctx.lineWidth = 1; ctx.stroke();

            for (let lat = -75; lat <= 75; lat += 30) {
                const lr = lat * Math.PI / 180;
                const y = globe.cy + Math.sin(lr) * gr;
                const rx = Math.cos(lr) * gr;
                if (rx > 0) {
                    ctx.beginPath(); ctx.ellipse(globe.cx, y, rx, rx * 0.15, 0, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(${CA},.08)`; ctx.lineWidth = .5; ctx.stroke();
                }
            }
            for (let lon = 0; lon < 180; lon += 30) {
                const lr = (lon + globe.rot * 180 / Math.PI) * Math.PI / 180;
                ctx.beginPath();
                for (let i = 0; i <= 60; i++) {
                    const t = (i / 60) * Math.PI * 2 - Math.PI;
                    const coslat = Math.cos(t), sinlat = Math.sin(t);
                    const coslon = Math.cos(lr), sinlon = Math.sin(lr);
                    const x3d = coslat * coslon;
                    const z3d = coslat * sinlon;
                    if (z3d >= 0) {
                        const px = globe.cx + x3d * gr;
                        const py = globe.cy + sinlat * gr;
                        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                    }
                }
                ctx.strokeStyle = `rgba(${CA},.07)`; ctx.lineWidth = .5; ctx.stroke();
            }

            globe.points.forEach(p => {
                const lon2 = p.lon + globe.rot;
                const cosLat = Math.cos(p.lat), sinLat = Math.sin(p.lat);
                const cosLon = Math.cos(lon2), sinLon = Math.sin(lon2);
                const z = cosLat * sinLon;
                if (z < 0) return;
                const px = globe.cx + cosLat * cosLon * gr;
                const py = globe.cy + sinLat * gr;
                ctx.beginPath(); ctx.arc(px, py, p.city ? 2.5 : 1, 0, Math.PI * 2);
                ctx.fillStyle = p.city ? `rgba(${CA},.8)` : `rgba(${CA},.3)`;
                ctx.fill();
                if (p.city) {
                    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(${CA},.3)`; ctx.lineWidth = 1; ctx.stroke();
                }
            });

            globe.arcs.forEach(arc => {
                arc.prog = (arc.prog + arc.speed) % 1;
                const tA = arc.a, tB = arc.b;
                const lonA = tA.lon + globe.rot, lonB = tB.lon + globe.rot;
                const zA = Math.cos(tA.lat) * Math.sin(lonA);
                const zB = Math.cos(tB.lat) * Math.sin(lonB);
                if (zA < 0 || zB < 0) return;
                const x1 = globe.cx + Math.cos(tA.lat) * Math.cos(lonA) * gr;
                const y1 = globe.cy + Math.sin(tA.lat) * gr;
                const x2 = globe.cx + Math.cos(tB.lat) * Math.cos(lonB) * gr;
                const y2 = globe.cy + Math.sin(tB.lat) * gr;
                const steps = 30;
                ctx.beginPath();
                for (let s = 0; s <= Math.floor(arc.prog * steps); s++) {
                    const t = s / steps;
                    const ix = x1 + (x2 - x1) * t;
                    const iy = y1 + (y2 - y1) * t - Math.sin(t * Math.PI) * 30;
                    s === 0 ? ctx.moveTo(ix, iy) : ctx.lineTo(ix, iy);
                }
                ctx.strokeStyle = `rgba(${CA},.55)`; ctx.lineWidth = 1; ctx.stroke();
                const dt = arc.prog;
                const dotX = x1 + (x2 - x1) * dt;
                const dotY = y1 + (y2 - y1) * dt - Math.sin(dt * Math.PI) * 30;
                ctx.beginPath(); ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${CA},1)`; ctx.fill();
            });

            /* ── Draw neural nodes ── */
            nodes.forEach(n => {
                if (n.x > W * 0.65) { n.x = Math.random() * W * 0.6; return; }
                const dx = mouse.x - n.x, dy = mouse.y - n.y, dist = Math.hypot(dx, dy);
                if (dist < 160) { n.vx += (dx / dist) * .018; n.vy += (dy / dist) * .018; }
                n.vx *= .984; n.vy *= .984; n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > W * 0.7) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1;
            });
            for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
                const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                if (d < 120) {
                    ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(${CA},${(1 - d / 120) * .25})`; ctx.lineWidth = .5; ctx.stroke();
                }
            }
            nodes.forEach(n => {
                ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${CA},.45)`; ctx.fill();
            });

            /* ── Draw ink ripples ── */
            ripples.forEach((rp, i) => {
                rp.r += rp.speed;
                rp.alpha -= .008;
                if (rp.alpha <= 0) { ripples.splice(i, 1); return; }
                const g = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, rp.r);
                g.addColorStop(0, `rgba(${CA},0)`);
                g.addColorStop(.7, `rgba(${CA},${rp.alpha * .4})`);
                g.addColorStop(1, `rgba(${CA},0)`);
                ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${CA},${rp.alpha})`; ctx.lineWidth = 1; ctx.stroke();
            });

            /* ── Draw FARHAN particles ── */
            particles.forEach(p => {
                p.age++;
                if (p.phase === "assemble") {
                    const dx = p.tx - p.x, dy = p.ty - p.y;
                    p.x += dx * .06; p.y += dy * .06;
                    p.alpha = Math.min(p.alpha + .02, .85);
                    if (frame > HOLD_UNTIL - 20 && Math.abs(dx) < 2 && Math.abs(dy) < 2) p.phase = "hold";
                } else if (p.phase === "hold") {
                    p.x += (Math.random() - .5) * .4; p.y += (Math.random() - .5) * .4;
                    if (frame > DISPERSE_AT) p.phase = "disperse";
                } else {
                    p.vx += (Math.random() - .5) * .15;
                    p.vy += (Math.random() - .5) * .15 - .02;
                    p.x += p.vx; p.y += p.vy;
                    p.alpha -= .005;
                    if (p.alpha < 0) {
                        p.alpha = 0; p.x = Math.random() * W * 0.6; p.y = Math.random() * H;
                        p.vx = (Math.random() - .5) * .3; p.vy = (Math.random() - .5) * .3;
                        p.phase = "float";
                    }
                }
                if (p.phase === "float") {
                    p.x += p.vx; p.y += p.vy;
                    p.alpha = Math.min(p.alpha + .003, .25);
                    if (p.x < 0 || p.x > W * 0.7) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
                }
                if (p.alpha <= 0) return;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${CA},${p.alpha})`; ctx.fill();
            });

            raf = requestAnimationFrame(tick);
        };

        const onMouseMove = (e) => {
            if (mouse.px >= 0) {
                const dx = e.clientX - mouse.px, dy = e.clientY - mouse.py;
                const spd = Math.hypot(dx, dy);
                if (spd > 8) addRipple(e.clientX, e.clientY - c.getBoundingClientRect().top);
            }
            mouse.px = e.clientX; mouse.py = e.clientY;
            mouse.x = e.clientX; mouse.y = e.clientY - c.getBoundingClientRect().top;
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("resize", () => { resize(); initNodes(); });
        tick();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMouseMove); };
    }, [T]);
    return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: T.bg !== "#F5F7FA" ? 0.9 : 0.45 }} />;
}
