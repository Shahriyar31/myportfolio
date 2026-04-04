import { useEffect, useRef, useState } from "react";

export default function HeroProfile({ T, dark, size }) {
    const canvasRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const hovRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let raf;

        const sizeVal = 420;
        canvas.width = sizeVal;
        canvas.height = sizeVal;
        const cx = sizeVal / 2, cy = sizeVal / 2;

        // Orbital particles
        const satellites = Array.from({ length: 6 }, (_, i) => ({
            angle: (i / 6) * Math.PI * 2,
            radius: 168 + (i % 2) * 18,
            speed: (i % 2 === 0 ? 1 : -1) * (0.004 + i * 0.0005),
            size: i % 3 === 0 ? 5 : 3,
            brightness: 0.7 + (i % 3) * 0.1,
        }));

        // Trailing arc particles (orbit dust)
        const dust = Array.from({ length: 40 }, (_, i) => ({
            angle: (i / 40) * Math.PI * 2,
            orbitR: 148 + Math.random() * 40,
            speed: (Math.random() > 0.5 ? 1 : -1) * (0.001 + Math.random() * 0.003),
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
        }));

        let t = 0;

        const draw = () => {
            ctx.clearRect(0, 0, sizeVal, sizeVal);
            t += 0.012;

            const isHov = hovRef.current;

            // ── Outer pulse rings (breathe in/out) ──────────────────────
            const pulse = Math.sin(t * 0.8) * 0.5 + 0.5;
            for (let i = 3; i >= 1; i--) {
                const r = 155 + i * 14 + pulse * (i * 3);
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                const alpha = (0.06 - i * 0.015) * (isHov ? 2 : 1);
                ctx.strokeStyle = i % 2 === 0
                    ? `rgba(59,130,246,${alpha})`
                    : `rgba(100,116,139,${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // ── Rotating arcs (2 rings, opposite directions) ─────────────
            const drawArc = (radius, startAngle, arcLen, color, width) => {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, startAngle, startAngle + arcLen);
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.lineCap = "round";
                ctx.stroke();
            };

            // Blue arc — primary ring, rotating CW
            drawArc(160, t * 0.6, Math.PI * 1.4, `rgba(59,130,246,${isHov ? 0.8 : 0.5})`, isHov ? 2.5 : 1.5);
            drawArc(160, t * 0.6 + Math.PI, Math.PI * 0.3, `rgba(59,130,246,0.2)`, 1);

            // Grey arc — secondary ring, rotating CCW
            drawArc(172, -t * 0.45, Math.PI * 0.9, `rgba(100,116,139,${isHov ? 0.6 : 0.35})`, isHov ? 2 : 1.2);
            drawArc(172, -t * 0.45 + Math.PI * 1.2, Math.PI * 0.4, `rgba(100,116,139,0.15)`, 1);

            // Inner dashed guide ring
            ctx.save();
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.arc(cx, cy, 148, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(59,130,246,0.12)`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // ── Orbit dust ──────────────────────────────────────────────
            dust.forEach(p => {
                p.angle += p.speed;
                const px = cx + Math.cos(p.angle) * p.orbitR;
                const py = cy + Math.sin(p.angle) * p.orbitR;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59,130,246,${p.opacity * (isHov ? 1.4 : 0.8)})`;
                ctx.fill();
            });

            // ── Satellite dots ───────────────────────────────────────────
            satellites.forEach((sat, idx) => {
                sat.angle += sat.speed * (isHov ? 1.5 : 1);
                const px = cx + Math.cos(sat.angle) * sat.radius;
                const py = cy + Math.sin(sat.angle) * sat.radius;

                // Halo behind each satellite
                const g = ctx.createRadialGradient(px, py, 0, px, py, sat.size * 4);
                g.addColorStop(0, idx % 2 === 0 ? `rgba(59,130,246,0.45)` : `rgba(100,116,139,0.35)`);
                g.addColorStop(1, `rgba(0,0,0,0)`);
                ctx.beginPath();
                ctx.arc(px, py, sat.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(px, py, sat.size, 0, Math.PI * 2);
                ctx.fillStyle = idx % 2 === 0
                    ? `rgba(59,130,246,${sat.brightness})`
                    : `rgba(148,163,184,${sat.brightness})`;
                ctx.fill();
            });

            // ── Tick marks on the outer ring ────────────────────────────
            for (let i = 0; i < 24; i++) {
                const angle = (i / 24) * Math.PI * 2 + t * 0.2;
                const inner = 176, outer = i % 6 === 0 ? 185 : 180;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
                ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
                ctx.strokeStyle = i % 6 === 0
                    ? `rgba(59,130,246,0.5)`
                    : `rgba(100,116,139,0.2)`;
                ctx.lineWidth = i % 6 === 0 ? 1.5 : 0.8;
                ctx.stroke();
            }

            raf = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(raf);
    }, [T, dark]);

    return (
        <div
            style={{
                position: "relative",
                width: size ? size : "clamp(260px, 32vw, 380px)",
                height: size ? size : "clamp(260px, 32vw, 380px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "fadeUp .8s .1s both",
                cursor: "none",
            }}
            onMouseEnter={() => { hovRef.current = true; setHovered(true); }}
            onMouseLeave={() => { hovRef.current = false; setHovered(false); }}
        >
            {/* Canvas — orbital rings & particles */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0, left: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            />

            {/* Profile image — floats & scales subtly */}
            <div style={{
                position: "absolute",
                width: "72%",
                height: "72%",
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${hovered ? T.a : T.border}`,
                zIndex: 2,
                animation: "float 5s ease-in-out infinite",
                transition: "border-color .4s ease",
                transform: hovered ? "scale(1.04)" : "scale(1)",
                boxShadow: "none",
            }}>
                <img
                    src="/images/profile-suit.jpg"
                    alt="Farhan Shahriyar"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        pointerEvents: "none",
                        transition: "transform .6s cubic-bezier(.16,1,.3,1)",
                        transform: hovered ? "scale(1.06)" : "scale(1)",
                        filter: hovered ? "brightness(1.06) contrast(1.04)" : "brightness(1) contrast(1)",
                    }}
                    onError={(e) => {
                        e.target.src = "https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/profile.jpg";
                        e.target.onerror = null;
                    }}
                />
            </div>
        </div>
    );
}
