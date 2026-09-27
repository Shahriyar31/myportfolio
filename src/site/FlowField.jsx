import { useEffect, useRef } from "react";
import { reducedMotion } from "./hooks";

/* Compact 2D simplex noise (after Stefan Gustavson), seeded. */
function makeNoise(seed = 7) {
    const perm = Array.from({ length: 256 }, (_, i) => i);
    let s = seed;
    for (let i = 255; i > 0; i--) {
        s = (s * 16807) % 2147483647;
        const j = s % (i + 1);
        [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    const p = new Uint8Array(512);
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
    const G = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
    const corner = (x, y, gi) => {
        let t = 0.5 - x * x - y * y;
        if (t < 0) return 0;
        t *= t;
        const g = G[gi & 7];
        return t * t * (g[0] * x + g[1] * y);
    };
    return (xin, yin) => {
        const sk = (xin + yin) * F2;
        const i = Math.floor(xin + sk), j = Math.floor(yin + sk);
        const t = (i + j) * G2;
        const x0 = xin - (i - t), y0 = yin - (j - t);
        const i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
        const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        const ii = i & 255, jj = j & 255;
        return 70 * (corner(x0, y0, p[ii + p[jj]]) + corner(x1, y1, p[ii + i1 + p[jj + j1]]) + corner(x2, y2, p[ii + 1 + p[jj + 1]]));
    };
}

/**
 * Wind streamlines: particles drift left→right along a slowly evolving noise
 * field and leave fading trails. The pointer acts as a gust that pushes them.
 * Pauses when off-screen or the tab is hidden; draws a still frame for
 * reduced-motion users.
 */
export default function FlowField({ className }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const noise = makeNoise(11);
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        let W = 0, H = 0, parts = [], raf = 0, running = false, t = Math.random() * 100;
        const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999 };
        let colors = { fg: "236,235,230", accent: "255,90,31" };

        const readColors = () => {
            const cs = getComputedStyle(document.documentElement);
            const toRgb = v => {
                const probe = document.createElement("i");
                probe.style.color = v.trim();
                document.body.appendChild(probe);
                const c = getComputedStyle(probe).color.match(/\d+/g).slice(0, 3).join(",");
                probe.remove();
                return c;
            };
            colors = { fg: toRgb(cs.getPropertyValue("--fg")), accent: toRgb(cs.getPropertyValue("--accent")) };
        };

        const spawn = (p, anywhere) => {
            p.x = anywhere || Math.random() < 0.35 ? Math.random() * W : -10;
            p.y = Math.random() * H;
            p.life = 90 + Math.random() * 220;
            p.age = 0;
            p.hot = Math.random() < 0.04;
            p.sp = 0.7 + Math.random() * 0.9;
            return p;
        };

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            W = r.width; H = r.height;
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = Math.min(W < 700 ? 260 : 850, Math.round((W * H) / 1500));
            parts = Array.from({ length: n }, () => spawn({}, true));
        };

        const step = () => {
            t += 0.0022;
            // Fade existing trails to transparent — theme independent.
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "rgba(0,0,0,0.045)";
            ctx.fillRect(0, 0, W, H);
            ctx.globalCompositeOperation = "source-over";

            ptr.vx *= 0.9; ptr.vy *= 0.9;
            const R = Math.min(260, W * 0.22), R2 = R * R;
            const cold = new Path2D(), hot = new Path2D();

            for (const p of parts) {
                // Low-frequency field + strong eastward drift = laminar, wind-like streams
                const a = noise(p.x * 0.0009, p.y * 0.0011 + t) * 0.9 + noise(p.x * 0.0004 + t * 0.4, p.y * 0.0004) * 0.5;
                let vx = Math.cos(a) * p.sp + 0.9, vy = Math.sin(a) * p.sp * 0.8;
                const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
                if (d2 < R2) {
                    const d = Math.sqrt(d2) || 1, f = 1 - d / R;
                    vx += (ptr.vx * 0.12 + (dx / d) * 1.6) * f;
                    vy += (ptr.vy * 0.12 + (dy / d) * 1.6) * f;
                }
                const nx = p.x + vx, ny = p.y + vy;
                const path = p.hot ? hot : cold;
                path.moveTo(p.x, p.y);
                path.lineTo(nx, ny);
                p.x = nx; p.y = ny; p.age++;
                if (p.age > p.life || p.x > W + 10 || p.y < -10 || p.y > H + 10 || p.x < -20) spawn(p, false);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(${colors.fg},0.2)`;
            ctx.stroke(cold);
            ctx.lineWidth = 1.3;
            ctx.strokeStyle = `rgba(${colors.accent},0.85)`;
            ctx.stroke(hot);
        };

        const loop = () => { step(); raf = requestAnimationFrame(loop); };
        const start = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
        const stop = () => { running = false; cancelAnimationFrame(raf); };

        readColors();
        resize();

        if (reducedMotion()) {
            for (let i = 0; i < 160; i++) step();
            return () => {};
        }

        const onMove = e => {
            const r = canvas.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            if (ptr.px > -9000) { ptr.vx += (x - ptr.px) * 0.5; ptr.vy += (y - ptr.py) * 0.5; }
            ptr.x = ptr.px = x; ptr.y = ptr.py = y;
        };
        const onLeave = () => { ptr.x = ptr.y = ptr.px = ptr.py = -9999; };
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
        const onVis = () => (document.hidden ? stop() : start());
        const mo = new MutationObserver(readColors);
        let rt = 0;
        const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 150); };

        io.observe(canvas);
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("resize", onResize);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

        return () => {
            stop(); io.disconnect(); mo.disconnect(); clearTimeout(rt);
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
