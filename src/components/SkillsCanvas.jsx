import { useEffect, useRef } from "react";

export default function SkillsCanvas({ T }) {
    const ref = useRef(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d");
        let W, H, raf;
        const dark = T.bg !== "#F5F7FA";
        const mouse = { x: -9999, y: -9999 };
        const catRGB = [[126,184,190],[136,144,170],[122,170,138],[245,158,11]];

        const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
        resize();

        /* Stars */
        const stars = Array.from({ length: 160 }, () => ({
            x: Math.random(), y: Math.random(),
            r: Math.random() * 1.4 + .3,
            phase: Math.random() * Math.PI * 2,
            speed: .01 + Math.random() * .025,
        }));

        /* Nebula nodes — category-colored particles */
        const nebulae = Array.from({ length: 90 }, () => {
            const cat = Math.floor(Math.random() * 4);
            const cx = [.18, .82, .18, .82][cat];
            const cy = [.22, .22, .72, .72][cat];
            return {
                x: cx + (Math.random() - .5) * .28,
                y: cy + (Math.random() - .5) * .22,
                ox: 0, oy: 0, vx: 0, vy: 0,
                cat, r: 1 + Math.random() * 2.5,
                phase: Math.random() * Math.PI * 2,
            };
        });
        nebulae.forEach(n => { n.ox = n.x; n.oy = n.y; });

        /* Shooting stars */
        const shooters = [];
        let shootTimer = 0;

        const tick = () => {
            ctx.clearRect(0, 0, W, H);
            shootTimer++;

            /* ── Twinkling stars ── */
            stars.forEach(s => {
                s.phase += s.speed;
                const a = .15 + Math.sin(s.phase) * .28;
                ctx.beginPath();
                ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
                ctx.fillStyle = dark ? `rgba(200,215,240,${a})` : `rgba(50,60,90,${a * .35})`;
                ctx.fill();
                /* Cross sparkle on bright stars */
                if (s.r > 1.2 && Math.sin(s.phase) > .6) {
                    const sx = s.x * W, sy = s.y * H;
                    ctx.strokeStyle = dark ? `rgba(220,230,255,${a * .4})` : `rgba(50,60,90,${a * .15})`;
                    ctx.lineWidth = .5;
                    ctx.beginPath(); ctx.moveTo(sx - 4, sy); ctx.lineTo(sx + 4, sy); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(sx, sy - 4); ctx.lineTo(sx, sy + 4); ctx.stroke();
                }
            });

            /* ── Shooting stars ── */
            if (shootTimer % 180 === 0 && shooters.length < 3) {
                shooters.push({
                    x: Math.random() * W * .6 + W * .1,
                    y: Math.random() * H * .3,
                    vx: 4 + Math.random() * 3,
                    vy: 2 + Math.random() * 2,
                    life: 1,
                    trail: [],
                });
            }
            shooters.forEach((sh, si) => {
                sh.x += sh.vx; sh.y += sh.vy; sh.life -= .015;
                sh.trail.push({ x: sh.x, y: sh.y });
                if (sh.trail.length > 20) sh.trail.shift();
                if (sh.life <= 0) { shooters.splice(si, 1); return; }
                ctx.beginPath();
                sh.trail.forEach((p, ti) => {
                    if (ti === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
                });
                ctx.strokeStyle = dark ? `rgba(200,220,255,${sh.life * .5})` : `rgba(80,90,130,${sh.life * .3})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.beginPath(); ctx.arc(sh.x, sh.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${sh.life})`;
                ctx.fill();
            });

            /* ── Nebula nodes ── */
            nebulae.forEach(n => {
                const px = n.x * W, py = n.y * H;

                n.vx += (n.ox - n.x) * .004;
                n.vy += (n.oy - n.y) * .004;

                const mx = mouse.x / W - n.x, my = mouse.y / H - n.y;
                const md = Math.hypot(mx, my);
                if (md < .14 && md > .008) {
                    n.vx += mx * .006;
                    n.vy += my * .006;
                }

                n.phase += .009;
                n.vx += Math.sin(n.phase) * .0004;
                n.vy += Math.cos(n.phase * .7) * .0004;
                n.vx *= .95; n.vy *= .95;
                n.x += n.vx; n.y += n.vy;

                const cc = catRGB[n.cat];
                const pulse = .5 + Math.sin(n.phase) * .25;

                /* Glow */
                const grd = ctx.createRadialGradient(px, py, 0, px, py, n.r * 7);
                grd.addColorStop(0, `rgba(${cc[0]},${cc[1]},${cc[2]},${pulse * .22})`);
                grd.addColorStop(1, `rgba(${cc[0]},${cc[1]},${cc[2]},0)`);
                ctx.beginPath(); ctx.arc(px, py, n.r * 7, 0, Math.PI * 2);
                ctx.fillStyle = grd; ctx.fill();

                /* Core */
                ctx.beginPath(); ctx.arc(px, py, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${pulse})`; ctx.fill();
            });

            /* ── Connections ── */
            for (let i = 0; i < nebulae.length; i++) for (let j = i + 1; j < nebulae.length; j++) {
                if (nebulae[i].cat !== nebulae[j].cat) continue;
                const dx = (nebulae[i].x - nebulae[j].x) * W;
                const dy = (nebulae[i].y - nebulae[j].y) * H;
                const d = Math.hypot(dx, dy);
                if (d < 100) {
                    const cc = catRGB[nebulae[i].cat];
                    ctx.beginPath();
                    ctx.moveTo(nebulae[i].x * W, nebulae[i].y * H);
                    ctx.lineTo(nebulae[j].x * W, nebulae[j].y * H);
                    ctx.strokeStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${(1 - d / 100) * .14})`;
                    ctx.lineWidth = .5; ctx.stroke();
                }
            }

            /* ── Category nebula clouds ── */
            [0,1,2,3].forEach(ci => {
                const ns = nebulae.filter(n => n.cat === ci);
                if (!ns.length) return;
                const ax = ns.reduce((s, n) => s + n.x, 0) / ns.length * W;
                const ay = ns.reduce((s, n) => s + n.y, 0) / ns.length * H;
                const cc = catRGB[ci];
                const grd = ctx.createRadialGradient(ax, ay, 0, ax, ay, W * .14);
                grd.addColorStop(0, `rgba(${cc[0]},${cc[1]},${cc[2]},${dark ? .04 : .02})`);
                grd.addColorStop(1, `rgba(${cc[0]},${cc[1]},${cc[2]},0)`);
                ctx.beginPath(); ctx.arc(ax, ay, W * .14, 0, Math.PI * 2);
                ctx.fillStyle = grd; ctx.fill();
            });

            raf = requestAnimationFrame(tick);
        };

        const onMM = e => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
        c.addEventListener("mousemove", onMM);
        window.addEventListener("resize", resize);
        tick();
        return () => { cancelAnimationFrame(raf); c.removeEventListener("mousemove", onMM); window.removeEventListener("resize", resize); };
    }, [T]);
    return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "auto", opacity: T.bg !== "#F5F7FA" ? .85 : .5 }} />;
}
