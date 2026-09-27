import { useEffect, useRef } from "react";
import { reducedMotion } from "./hooks";
import { getPalette, onPalette } from "./theme";

/*
 * Hero background: "data wind".
 * Messy grey data blows in from the left, passes through a governance gate
 * (behind the portrait) and leaves as ordered, coloured lanes — raw data in,
 * trusted AI out. The pointer acts as a gust. Canvas 2D, paused off-screen.
 */
export default function DataWind({ className, gate = 0.66 }) {
    const ref = useRef(null);

    useEffect(() => {
        const cv = ref.current, ctx = cv.getContext("2d");
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        let W = 0, H = 0, ps = [], raf = 0, running = false, t = 0, gx = 0;
        const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999 };
        let col = { fg: "233,238,243", a: "115,212,255", b: "182,156,255" };
        const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(",");
        const read = p => { col = { fg: rgb(p.fg), a: rgb(p.accent), b: rgb(p.a2 || p.accent) }; };
        read(getPalette());
        const off = onPalette(read);

        const LANES = 9;
        const spawn = (p, any) => {
            p.x = any ? Math.random() * W : -10 - Math.random() * 60;
            p.y = Math.random() * H;
            p.v = 0.8 + Math.random() * 1.2;
            p.ph = Math.random() * 6.28;
            p.lane = Math.floor(Math.random() * LANES);
            p.hue = Math.random() < 0.5 ? "a" : "b";
            p.len = 6 + Math.random() * 14;
            return p;
        };
        const resize = () => {
            const r = cv.getBoundingClientRect();
            W = r.width; H = r.height; gx = W * gate;
            cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = Math.min(W < 700 ? 180 : 520, Math.round((W * H) / 2600));
            ps = Array.from({ length: n }, () => spawn({}, true));
        };

        const draw = () => {
            t += 0.016;
            ctx.clearRect(0, 0, W, H);
            // the gate: a soft vertical band of light
            const g = ctx.createLinearGradient(gx - 70, 0, gx + 70, 0);
            g.addColorStop(0, `rgba(${col.a},0)`); g.addColorStop(0.5, `rgba(${col.a},0.07)`); g.addColorStop(1, `rgba(${col.a},0)`);
            ctx.fillStyle = g; ctx.fillRect(gx - 70, 0, 140, H);

            ptr.vx *= 0.9; ptr.vy *= 0.9;
            const laneGap = H / (LANES + 1);
            ctx.lineCap = "round";
            for (const p of ps) {
                const past = p.x > gx;
                let vx = p.v * (past ? 2.1 : 1.3), vy;
                if (!past) {
                    // turbulent before the gate
                    vy = Math.sin(t * 1.3 + p.ph + p.x * 0.012) * 1.1 + Math.cos(t * 0.7 + p.ph * 2) * 0.6;
                } else {
                    // ordered after: ease into a lane
                    const target = laneGap * (p.lane + 1);
                    vy = (target - p.y) * 0.06;
                }
                const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
                if (d2 < 22000) { const f = 1 - d2 / 22000; vx += ptr.vx * 0.08 * f; vy += ptr.vy * 0.08 * f + (dy > 0 ? 1 : -1) * 1.4 * f; }
                const nx = p.x + vx, ny = p.y + vy;
                if (past) {
                    ctx.strokeStyle = `rgba(${col[p.hue]},0.75)`; ctx.lineWidth = 1.6;
                    ctx.beginPath(); ctx.moveTo(nx - p.len * 1.4, ny); ctx.lineTo(nx, ny); ctx.stroke();
                } else {
                    ctx.fillStyle = `rgba(${col.fg},0.28)`;
                    ctx.fillRect(nx, ny, 2, 2);
                }
                p.x = nx; p.y = ny;
                if (p.x > W + 20 || p.y < -30 || p.y > H + 30) spawn(p, false);
            }
        };

        const loop = () => { draw(); raf = requestAnimationFrame(loop); };
        const start = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
        const stop = () => { running = false; cancelAnimationFrame(raf); };
        resize();
        if (reducedMotion()) { for (let i = 0; i < 120; i++) draw(); return () => off(); }

        const move = e => {
            const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
            if (ptr.px > -9000) { ptr.vx += (x - ptr.px) * 0.6; ptr.vy += (y - ptr.py) * 0.6; }
            ptr.x = ptr.px = x; ptr.y = ptr.py = y;
        };
        const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()));
        const ro = new ResizeObserver(resize);
        io.observe(cv); ro.observe(cv);
        window.addEventListener("pointermove", move, { passive: true });
        return () => { stop(); off(); io.disconnect(); ro.disconnect(); window.removeEventListener("pointermove", move); };
    }, [gate]);

    return <canvas ref={ref} className={className} aria-hidden="true" />;
}
