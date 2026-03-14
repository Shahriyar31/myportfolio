import { useEffect, useRef } from "react";

/* Soft floating gradient orbs — elegant, never distracting */
export default function AboutCanvas({ T }) {
    const ref = useRef(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d");
        let W, H, raf;
        const dark = T.bg === "#1a1a22";

        const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
        resize();

        /* 6 slow-drifting orbs in accent colors */
        const orbs = [
            { x: .15, y: .2, r: .18, color: T.a, phase: 0, speed: .003 },
            { x: .8,  y: .3, r: .14, color: T.a2, phase: 1.5, speed: .004 },
            { x: .5,  y: .7, r: .16, color: T.a3, phase: 3, speed: .003 },
            { x: .25, y: .85, r: .1, color: T.a, phase: 4.5, speed: .005 },
            { x: .7,  y: .8, r: .12, color: T.a2, phase: 2, speed: .004 },
            { x: .9,  y: .15, r: .09, color: T.a3, phase: 5, speed: .003 },
        ];

        /* Subtle floating particles */
        const dots = Array.from({ length: 30 }, () => ({
            x: Math.random(), y: Math.random(),
            r: .5 + Math.random() * 1,
            phase: Math.random() * Math.PI * 2,
            speed: .005 + Math.random() * .008,
            opacity: .1 + Math.random() * .2,
        }));

        const tick = () => {
            ctx.clearRect(0, 0, W, H);

            /* Gradient orbs */
            orbs.forEach(o => {
                o.phase += o.speed;
                const cx = (o.x + Math.sin(o.phase) * .04) * W;
                const cy = (o.y + Math.cos(o.phase * .7) * .03) * H;
                const radius = o.r * Math.min(W, H);

                const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
                grd.addColorStop(0, (o.color || T.a) + (dark ? "12" : "09"));
                grd.addColorStop(.6, (o.color || T.a) + "06");
                grd.addColorStop(1, "transparent");

                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            });

            /* Floating dots */
            dots.forEach(d => {
                d.phase += d.speed;
                const px = (d.x + Math.sin(d.phase) * .015) * W;
                const py = (d.y + Math.cos(d.phase * .6) * .02) * H;
                const alpha = d.opacity * (.6 + Math.sin(d.phase * 2) * .4);

                ctx.beginPath();
                ctx.arc(px, py, d.r, 0, Math.PI * 2);
                ctx.fillStyle = dark
                    ? `rgba(200,215,230,${alpha})`
                    : `rgba(60,70,100,${alpha * .4})`;
                ctx.fill();
            });

            raf = requestAnimationFrame(tick);
        };

        window.addEventListener("resize", resize);
        tick();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, [T]);

    return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .7 }} />;
}
