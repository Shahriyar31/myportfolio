import { useState, useEffect, useRef } from "react";

const STEPS = [
    { label: "Initialising canvas layers", pct: 18 },
    { label: "Loading neural network", pct: 36 },
    { label: "Assembling FARHAN particles", pct: 55 },
    { label: "Spinning up the globe", pct: 72 },
    { label: "Connecting RAG pipeline", pct: 88 },
    { label: "Ready", pct: 100 },
];

export default function LoadingScreen({ onDone, T }) {
    const [step, setStep] = useState(0);
    const [pct, setPct] = useState(0);
    const [dissolving, setDissolving] = useState(false);
    const [chars, setChars] = useState("FARHAN");
    const canvasRef = useRef(null);
    const dark = T?.bg === "#1a1a22";
    const bg = dark ? "#1a1a22" : "#f5f4f0";
    const accent = dark ? "#7eb8be" : "#2d4a6b";
    const muted = dark ? "#7070a0" : "#888090";
    const text = dark ? "#dcdae8" : "#1a1825";

    // Glitch name animation
    const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$";
    useEffect(() => {
        let iter = 0;
        const full = "FARHAN";
        const id = setInterval(() => {
            setChars(full.split("").map((c, i) =>
                i < iter ? full[i] : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            ).join(""));
            iter += 0.4;
            if (iter >= full.length) clearInterval(id);
        }, 40);
        return () => clearInterval(id);
    }, []);

    // Progress steps
    useEffect(() => {
        let current = 0;
        const run = () => {
            if (current >= STEPS.length) return;
            const target = STEPS[current].pct;
            const duration = 320 + Math.random() * 280;
            const start = performance.now();
            const fromPct = current === 0 ? 0 : STEPS[current - 1].pct;

            const tick = (now) => {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                setPct(Math.round(fromPct + (target - fromPct) * eased));
                if (t < 1) {
                    requestAnimationFrame(tick);
                } else {
                    setStep(current);
                    current++;
                    if (current < STEPS.length) {
                        setTimeout(run, 100 + Math.random() * 180);
                    } else {
                        setTimeout(() => {
                            setDissolving(true);
                            setTimeout(onDone, 700);
                        }, 300);
                    }
                }
            };
            requestAnimationFrame(tick);
        };
        setTimeout(run, 200);
    }, [onDone]);

    // Particle canvas
    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext("2d");
        let W, H, raf;
        const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
        resize();
        const pts = Array.from({ length: 60 }, () => ({
            x: Math.random() * 1, y: Math.random(),
            vx: (Math.random() - .5) * .0004,
            vy: (Math.random() - .5) * .0004,
            r: Math.random() * 1.5 + .4,
            alpha: Math.random() * .4 + .1,
        }));
        const tick = () => {
            ctx.clearRect(0, 0, W, H);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > 1) p.vx *= -1;
                if (p.y < 0 || p.y > 1) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
                ctx.fillStyle = dark
                    ? `rgba(126,184,190,${p.alpha})`
                    : `rgba(45,74,107,${p.alpha})`;
                ctx.fill();
            });
            raf = requestAnimationFrame(tick);
        };
        tick();
        window.addEventListener("resize", resize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, [dark]);

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: bg,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            opacity: dissolving ? 0 : 1,
            transform: dissolving ? "scale(1.03)" : "scale(1)",
            transition: "opacity .65s cubic-bezier(.4,0,.2,1), transform .65s cubic-bezier(.4,0,.2,1)",
            pointerEvents: dissolving ? "none" : "auto",
            overflow: "hidden",
        }}>
            {/* Ambient particle canvas */}
            <canvas ref={canvasRef} style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                opacity: .5,
            }} />

            {/* Corner decorations */}
            {["top:24px,left:24px", "top:24px,right:24px", "bottom:24px,left:24px", "bottom:24px,right:24px"].map((pos, i) => {
                const [v, h] = pos.split(",").map(s => s.trim());
                const [vk, vv] = v.split(":");
                const [hk, hv] = h.split(":");
                return (
                    <div key={i} style={{
                        position: "absolute",
                        [vk]: vv, [hk]: hv,
                        width: 20, height: 20,
                        borderTop: i < 2 ? `1px solid ${accent}50` : "none",
                        borderBottom: i >= 2 ? `1px solid ${accent}50` : "none",
                        borderLeft: i % 2 === 0 ? `1px solid ${accent}50` : "none",
                        borderRight: i % 2 === 1 ? `1px solid ${accent}50` : "none",
                    }} />
                );
            })}

            {/* FS.dev logo */}
            <div style={{
                position: "absolute", top: 28, left: 36,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13, color: accent, fontWeight: 700,
                letterSpacing: ".1em",
            }}>FS<span style={{ color: muted }}>.</span>dev</div>

            {/* Main content */}
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                {/* Glitch name */}
                <div style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "clamp(52px,10vw,110px)",
                    fontWeight: 800,
                    color: accent,
                    letterSpacing: "-.02em",
                    lineHeight: 1,
                    marginBottom: 8,
                    opacity: .18,
                    userSelect: "none",
                }}>{chars}</div>

                {/* Spinner ring */}
                <div style={{
                    width: 48, height: 48,
                    margin: "0 auto 32px",
                    borderRadius: "50%",
                    border: `1px solid ${accent}25`,
                    borderTop: `2px solid ${accent}`,
                    animation: "spin 1s linear infinite",
                    position: "relative",
                }}>
                    <div style={{
                        position: "absolute", inset: 6,
                        borderRadius: "50%",
                        border: `1px solid ${accent}15`,
                        borderBottom: `1px solid ${accent}60`,
                        animation: "spin 1.8s linear infinite reverse",
                    }} />
                </div>

                {/* Current step label */}
                <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    color: muted,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    marginBottom: 28,
                    height: 16,
                    transition: "opacity .3s",
                }}>
                    {STEPS[step]?.label}
                </div>

                {/* Progress bar */}
                <div style={{
                    width: "clamp(240px,40vw,380px)",
                    height: 2,
                    background: dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.08)",
                    borderRadius: 2,
                    overflow: "hidden",
                    margin: "0 auto 12px",
                }}>
                    <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: `linear-gradient(90deg,${accent},${dark ? "#8890aa" : "#3d5a3e"})`,
                        borderRadius: 2,
                        transition: "width .12s ease",
                        boxShadow: `0 0 8px ${accent}60`,
                    }} />
                </div>

                {/* Percentage */}
                <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10, color: muted,
                    letterSpacing: ".1em",
                }}>{pct}%</div>
            </div>

            {/* Bottom tagline */}
            <div style={{
                position: "absolute", bottom: 32,
                fontFamily: "'Inter', sans-serif",
                fontSize: 9, color: muted,
                letterSpacing: ".16em", textTransform: "uppercase",
                opacity: .5,
            }}>
                AI & Data Engineer · Hamburg 🇩🇪
            </div>
        </div>
    );
}
