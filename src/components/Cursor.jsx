import { useEffect, useRef } from "react";

export default function Cursor() {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia("(hover: none)").matches) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        let W = window.innerWidth, H = window.innerHeight;
        canvas.width = W; canvas.height = H;

        const mouse = { x: W / 2, y: H / 2, px: W / 2, py: H / 2, vx: 0, vy: 0 };
        let isHovering = false;
        let hoverAngle = 0;
        let burstParticles = [];
        let frame = 0;

        const getAccent = () => {
            const c = getComputedStyle(document.documentElement).getPropertyValue("--ca").trim();
            return c || "#7eb8be";
        };

        const hexToRGB = hex => {
            const h = hex.replace("#", "");
            return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
        };

        const rgba = (color, alpha) => {
            if (color.startsWith("#")) {
                const [r, g, b] = hexToRGB(color);
                return `rgba(${r},${g},${b},${alpha})`;
            }
            return color;
        };

        // Draw a diamond (rotated square) centered at (0,0)
        const drawDiamond = (size) => {
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size, 0);
            ctx.closePath();
        };

        // Trail — 18 diamond particles
        const TRAIL = 18;
        const trail = Array.from({ length: TRAIL }, (_, i) => ({
            x: mouse.x, y: mouse.y,
            vx: 0, vy: 0,
            rot: 0, rotV: (Math.random() - 0.5) * 0.15,
            life: 0,
            size: 1.2 + (i / TRAIL) * 2.8,
        }));

        // Spawn diamond burst on hover enter
        const spawnBurst = (x, y, accent) => {
            const count = 16;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const speed = 2.5 + Math.random() * 5;
                burstParticles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    rot: Math.random() * Math.PI,
                    rotV: (Math.random() - 0.5) * 0.18,
                    life: 1,
                    size: 2 + Math.random() * 3,
                    accent,
                });
            }
        };

        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            frame++;
            ctx.clearRect(0, 0, W, H);

            const accent = getAccent();

            // Mouse velocity
            mouse.vx = mouse.x - mouse.px;
            mouse.vy = mouse.y - mouse.py;
            mouse.px = mouse.x;
            mouse.py = mouse.y;
            const speed = Math.hypot(mouse.vx, mouse.vy);

            // ── Trail diamonds ────────────────────────────────────
            for (let i = trail.length - 1; i >= 0; i--) {
                const p = trail[i];
                const target = i === 0 ? mouse : trail[i - 1];
                const lag = 0.10 + (i / trail.length) * 0.08;
                p.vx += (target.x - p.x) * lag;
                p.vy += (target.y - p.y) * lag;
                p.vx *= 0.70; p.vy *= 0.70;
                p.x += p.vx; p.y += p.vy;
                p.rot += p.rotV;

                const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                p.life = Math.max(0, 1 - (i / trail.length) * 1.05 - dist * 0.005);
                if (p.life <= 0) continue;

                const alpha = p.life * (isHovering ? 0.7 : 0.45);
                const sz = p.size * (0.3 + p.life * 0.7);

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);

                // Glow
                const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 5);
                grd.addColorStop(0, rgba(accent, alpha * 0.4));
                grd.addColorStop(1, rgba(accent, 0));
                ctx.beginPath(); ctx.arc(0, 0, sz * 5, 0, Math.PI * 2);
                ctx.fillStyle = grd; ctx.fill();

                // Diamond
                drawDiamond(sz);
                ctx.fillStyle = rgba(accent, alpha * 0.85);
                ctx.fill();

                ctx.restore();
            }

            // ── Burst particles ───────────────────────────────────
            for (let i = burstParticles.length - 1; i >= 0; i--) {
                const b = burstParticles[i];
                b.x += b.vx; b.y += b.vy;
                b.vx *= 0.91; b.vy *= 0.91;
                b.rot += b.rotV;
                b.life -= 0.032;
                if (b.life <= 0) { burstParticles.splice(i, 1); continue; }

                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(b.rot);
                drawDiamond(b.size * b.life);
                ctx.fillStyle = rgba(b.accent, b.life * 0.9);
                ctx.fill();
                ctx.restore();
            }

            // ── Core cursor diamond ───────────────────────────────
            const mx = mouse.x, my = mouse.y;
            ctx.save();
            ctx.translate(mx, my);

            if (isHovering) {
                // Spin + outer ring of diamonds
                hoverAngle += 0.045;
                const ringR = 20;
                const dotCount = 6;
                for (let i = 0; i < dotCount; i++) {
                    const a = hoverAngle + (i / dotCount) * Math.PI * 2;
                    const ox = Math.cos(a) * ringR;
                    const oy = Math.sin(a) * ringR;
                    ctx.save();
                    ctx.translate(ox, oy);
                    ctx.rotate(a + Math.PI / 4);
                    drawDiamond(2.5);
                    ctx.fillStyle = rgba(accent, 0.6 + Math.sin(frame * 0.1 + i) * 0.2);
                    ctx.fill();
                    ctx.restore();
                }

                // Center diamond — spinning
                ctx.rotate(hoverAngle * 2);
                const pulse = 5 + Math.sin(frame * 0.12) * 1.5;

                // Outer glow
                const hgrd = ctx.createRadialGradient(0, 0, 0, 0, 0, pulse * 4);
                hgrd.addColorStop(0, rgba(accent, 0.35));
                hgrd.addColorStop(1, rgba(accent, 0));
                ctx.beginPath(); ctx.arc(0, 0, pulse * 4, 0, Math.PI * 2);
                ctx.fillStyle = hgrd; ctx.fill();

                drawDiamond(pulse);
                ctx.fillStyle = rgba(accent, 1);
                ctx.fill();
                ctx.strokeStyle = rgba(accent, 0.3);
                ctx.lineWidth = 1;
                ctx.stroke();

            } else {
                // Normal: diamond stretched in move direction
                hoverAngle += 0.02;

                if (speed > 0.5) {
                    const angle = Math.atan2(mouse.vy, mouse.vx);
                    ctx.rotate(angle - Math.PI / 4);
                    const stretch = Math.min(speed * 0.5, 10);
                    ctx.scale(1 + stretch * 0.12, 1);
                } else {
                    // Slow idle rotation
                    ctx.rotate(hoverAngle);
                }

                const size = 5;

                // Glow
                const ngrd = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3.5);
                ngrd.addColorStop(0, rgba(accent, 0.35));
                ngrd.addColorStop(1, rgba(accent, 0));
                ctx.beginPath(); ctx.arc(0, 0, size * 3.5, 0, Math.PI * 2);
                ctx.fillStyle = ngrd; ctx.fill();

                // Diamond core
                drawDiamond(size);
                ctx.fillStyle = rgba(accent, 1);
                ctx.fill();

                // Inner highlight — top facet
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size, 0);
                ctx.lineTo(0, -size * 0.2);
                ctx.closePath();
                ctx.fillStyle = rgba("#ffffff", 0.25);
                ctx.fill();
            }

            ctx.restore();
        };

        const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
        document.addEventListener("mousemove", onMove);

        const onEnter = () => {
            if (!isHovering) {
                isHovering = true;
                spawnBurst(mouse.x, mouse.y, getAccent());
            }
        };
        const onLeave = () => { isHovering = false; };

        const attach = () => {
            document.querySelectorAll("a,button,.pcard,[data-cell]").forEach(el => {
                el.removeEventListener("mouseenter", onEnter);
                el.removeEventListener("mouseleave", onLeave);
                el.addEventListener("mouseenter", onEnter);
                el.addEventListener("mouseleave", onLeave);
            });
        };
        attach();
        const obs = new MutationObserver(attach);
        obs.observe(document.body, { childList: true, subtree: true });

        const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
        window.addEventListener("resize", onResize);

        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("mousemove", onMove);
            window.removeEventListener("resize", onResize);
            obs.disconnect();
        };
    }, []);

    return (
        <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 99999 }} />
    );
}