import { useRef, useEffect, useState } from "react";
import Mag from "./Mag";
import TypingRole from "./TypingRole";
import HeroProfile from "./HeroProfile";
import HeroChat from "./HeroChat";

const sf = { fontFamily: "'Space Grotesk', 'Sora', sans-serif" };
const fm = { fontFamily: "'Inter', sans-serif" };

const SOCIAL = [
    { label: "GitHub", href: "https://github.com/Shahriyar31" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/farhanshahriyar" },
    { label: "Email", href: "mailto:shahriyarfarhan3101@gmail.com" },
];

/* ── Mobile / Tablet Layout ──────────────────────────────────────── */
function MobileHero({ T, dark, onOpenResume }) {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const sceneRef = useRef(null);

    useEffect(() => {
        const onScroll = () => {
            if (!sceneRef.current) return;
            const rect = sceneRef.current.getBoundingClientRect();
            const scrolled = (window.innerHeight - rect.top) / (window.innerHeight * 1.5);
            setTilt({ x: (scrolled - 0.5) * 15, y: (scrolled - 0.5) * 10 });
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <section id="home" className="section hero-section" style={{
            minHeight: "100vh", position: "relative", overflow: "hidden",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", background: T.bg,
            padding: "80px 20px 40px", textAlign: "center",
            perspective: "1200px"
        }}>
            {/* Ambient theme glow */}
            <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: "120vw", height: "60vw", borderRadius: "50%", background: `radial-gradient(ellipse, ${T.a}15 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

            <div ref={sceneRef} style={{ 
                width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                transform: `rotateX(${-tilt.x}deg) rotateY(${tilt.y}deg)`,
                transformStyle: "preserve-3d", transition: "transform 0.15s ease-out"
            }}>
                {/* 3D Stacked Elements */}
                
                {/* 1. Profile Core */}
                <div style={{ width: 110, height: 110, marginBottom: 20, transform: "translateZ(100px)", position: "relative" }}>
                    <HeroProfile T={T} dark={dark} size="100%" />
                    <Ring T={T} size={160} z={0} speed={20} />
                    <Ring T={T} size={200} z={-40} speed={30} reverse />
                </div>

                {/* 2. Identity Block */}
                <div style={{ transform: "translateZ(60px)", marginBottom: 30 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: `${T.a}18`, border: `1px solid ${T.a}50`,
                        padding: "6px 16px", borderRadius: 30, marginBottom: 12,
                        ...fm, fontSize: 10, fontWeight: 700, color: T.a,
                        letterSpacing: 2, textTransform: "uppercase",
                        backdropFilter: "blur(12px)",
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.a, animation: "pulse 2s infinite" }} />
                        Available · Hamburg 🇩🇪
                    </div>
                    <h1 style={{ ...sf, fontSize: "clamp(38px, 12vw, 70px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em", color: T.t, margin: "0 0 12px 0", textTransform: "uppercase" }}>
                        FARHAN<br />SHAHRIYAR
                    </h1>
                    <div style={{ ...fm, fontSize: 14, color: T.m }}>
                        <TypingRole T={T} />
                    </div>
                </div>

                {/* 2.5 Hero Chat Module (Mobile Scale) */}
                <div style={{ transform: "translateZ(30px)", width: "100%", maxWidth: 360, marginBottom: 30 }}>
                    <HeroChat T={T} dark={dark} isMobile={true} />
                </div>

                {/* 3. Action Hub */}
                <div style={{ 
                    display: "flex", flexDirection: "column", gap: 12, alignItems: "center", 
                    width: "100%", maxWidth: 300, transform: "translateZ(10px)" 
                }}>
                    <button onClick={onOpenResume} style={{
                        background: T.a, color: "#fff", padding: "14px 0", borderRadius: 30,
                        border: "none", cursor: "pointer", ...sf, fontSize: 13, fontWeight: 800,
                        textTransform: "uppercase", letterSpacing: 2, width: "100%",
                        boxShadow: `0 12px 32px ${T.a}40`,
                    }}>
                        Deep Access Resume
                    </button>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                        {SOCIAL.map(s => (
                            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{
                                padding: "8px 16px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                                border: `1px solid ${T.border}`, borderRadius: 20, color: T.m, textDecoration: "none",
                                ...fm, fontSize: 12, fontWeight: 600,
                            }}>
                                {s.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* 4. Stats Matrix (Mobile 3D Version) */}
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
                    width: "100%", maxWidth: 340, marginTop: 40,
                    transform: "translateZ(10px)"
                }}>
                    {[
                        { num: "11×", label: "Cost saved" },
                        { num: "97.5%", label: "Accuracy" },
                        { num: "1,690", label: "Docs" },
                        { num: "29", label: "Evals" },
                    ].map(({ num, label }) => (
                        <div key={label} style={{
                            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                            border: `1px solid ${T.border}`,
                            borderRadius: 16, padding: "12px",
                        }}>
                            <div style={{ ...sf, fontSize: 22, fontWeight: 900, color: T.t }}>{num}</div>
                            <div style={{ ...fm, fontSize: 9, color: T.m, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── 3D Orbital Ring ─────────────────────────────────────────────── */
function Ring({ T, size, z, speed, reverse }) {
    return (
        <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: size, height: size,
            marginLeft: -size / 2, marginTop: -size / 2,
            border: `1px solid ${T.a}25`,
            borderRadius: "50%",
            transform: `translateZ(${z}px) rotateX(70deg)`,
            "--hz": `${z}px`,
            animation: `heroSpin ${speed}s linear infinite ${reverse ? "reverse" : "normal"}`,
            pointerEvents: "none",
        }}>
            <div style={{ width: 8, height: 8, background: T.a, borderRadius: "50%", position: "absolute", top: -4, left: "50%", boxShadow: `0 0 16px ${T.a}` }} />
            <div style={{ width: 5, height: 5, background: T.a2, borderRadius: "50%", position: "absolute", bottom: -3, left: "25%", boxShadow: `0 0 10px ${T.a2}` }} />
        </div>
    );
}

/* ── Desktop 3D Layout ───────────────────────────────────────────── */
function DesktopHero({ T, dark, onOpenResume }) {
    const sceneRef = useRef(null);
    const rafRef = useRef(null);
    const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

    useEffect(() => {
        const onMove = (e) => {
            mouse.current.tx = (e.clientX / window.innerWidth - 0.5);
            mouse.current.ty = (e.clientY / window.innerHeight - 0.5);
        };
        window.addEventListener("mousemove", onMove);
        const tick = () => {
            mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.06;
            mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.06;
            if (sceneRef.current) {
                const ry = mouse.current.x * 18;
                const rx = -mouse.current.y * 18;
                sceneRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafRef.current); };
    }, []);

    /* Skill bar helper */
    const Bar = ({ pct, color }) => (
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: color, boxShadow: `0 0 6px ${color}` }} />
        </div>
    );

    return (
        <section id="home" className="section hero-section" style={{ minHeight: "100vh", position: "relative", background: T.bg }}>

            {/* ── Ambient glows + rings clipped separately so they don't interfere with 3D cards ── */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${T.a}10 0%, transparent 65%)` }} />
                <div style={{ position: "absolute", top: "10%", right: "5%", width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(ellipse, ${T.a2}12 0%, transparent 70%)`, filter: "blur(70px)" }} />
                <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(ellipse, ${T.a}10 0%, transparent 70%)`, filter: "blur(60px)" }} />
                {/* Rings inside clip layer */}
                <div style={{ position: "absolute", top: "50%", left: "50%", perspective: "1400px" }}>
                    <Ring T={T} size={1200} z={-600} speed={40} />
                    <Ring T={T} size={900}  z={-400} speed={25} reverse />
                    <Ring T={T} size={600}  z={-200} speed={15} />
                </div>
            </div>

            {/* ── 3D Perspective scene — no overflow:hidden so translateZ cards aren't clipped ── */}
            <div style={{ position: "absolute", inset: 0, perspective: "1400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div ref={sceneRef} style={{ position: "relative", width: "100%", height: "100vh", transformStyle: "preserve-3d", willChange: "transform" }}>

                    {/* Deep watermark */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%,-50%) translateZ(-300px)",
                        ...sf, fontSize: "clamp(80px,14vw,220px)", fontWeight: 900,
                        color: "transparent", WebkitTextStroke: `2px ${T.a}08`,
                        pointerEvents: "none", whiteSpace: "nowrap", userSelect: "none",
                    }}>ENGINEER</div>

                    {/* ── Main Identity ── */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%) translateZ(0px)",
                        display: "flex", flexDirection: "column", alignItems: "center",
                        textAlign: "center", pointerEvents: "auto",
                    }}>
                        <div style={{ position: "absolute", top: -110, left: "50%", transform: "translateX(-50%) translateZ(40px)", width: 130, height: 130 }}>
                            <HeroProfile T={T} dark={dark} size="100%" />
                        </div>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 10,
                            background: `${T.a}18`, border: `1px solid ${T.a}50`,
                            padding: "7px 22px", borderRadius: 30, marginBottom: 18,
                            ...fm, fontSize: 11, fontWeight: 700, color: T.a,
                            letterSpacing: 2, textTransform: "uppercase", backdropFilter: "blur(10px)",
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.a, animation: "pulse 2s infinite" }} />
                            Available for Impact
                        </div>
                        <h1 style={{
                            ...sf, fontSize: "clamp(52px, 8vw, 116px)", fontWeight: 900, lineHeight: 0.88,
                            letterSpacing: "-0.04em", color: T.t, margin: "0 0 14px 0",
                            textTransform: "uppercase",
                            textShadow: dark ? `0 0 80px ${T.a}20, 0 20px 40px rgba(0,0,0,0.3)` : "none",
                        }}>FARHAN<br />SHAHRIYAR</h1>
                        <div style={{ ...fm, fontSize: "clamp(14px, 1.6vw, 20px)", color: T.m, marginBottom: 32 }}>
                            <TypingRole T={T} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
                            <Mag as="button" onClick={onOpenResume} style={{
                                background: T.a, color: "#fff", padding: "16px 44px", borderRadius: 30,
                                border: "none", cursor: "pointer", ...sf, fontSize: 13, fontWeight: 800,
                                textTransform: "uppercase", letterSpacing: 2, boxShadow: `0 12px 32px ${T.a}55`,
                            }}>Access Resume</Mag>
                            <div style={{ display: "flex", gap: 10 }}>
                                {SOCIAL.map(s => (
                                    <Mag key={s.label} as="a" href={s.href} target="_blank" rel="noreferrer"
                                        className="hero-social-pill" style={{
                                            padding: "8px 20px",
                                            background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                            border: `1px solid ${T.border}`, borderRadius: 20,
                                            color: T.m, textDecoration: "none",
                                            ...fm, fontSize: 12, fontWeight: 600, transition: "all 0.25s",
                                        }}>{s.label}</Mag>
                                ))}
                            </div>
                        </div>
                        {/* Insight strip */}
                        <div style={{ display: "flex", gap: 22, marginTop: 24, alignItems: "center", ...fm, fontSize: 11, color: T.m }}>
                            {[["11×","Cost Saved"],["1,690+","Docs RAG"],["29","LLM Evals"],["4.8/5","Judge Score"]].map(([v,l]) => (
                                <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                    <span style={{ ...sf, fontSize: 14, fontWeight: 800, color: T.a }}>{v}</span>
                                    <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", opacity: 0.6 }}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Card 1: Cost Reduction (Top-Left) ── */}
                    <div className="hfw" style={{ position: "absolute", top: "14%", left: "4%", animation: "hf1 4.2s ease-in-out infinite", transformStyle: "preserve-3d" }}>
                        <div className="h-card" style={{
                            transform: "translateZ(220px) rotateY(12deg)",
                            background: dark ? "rgba(10,102,194,0.13)" : "rgba(10,102,194,0.07)",
                            border: "1px solid #0a66c270", borderRadius: 20, padding: "20px",
                            backdropFilter: "blur(16px)", width: 210,
                            boxShadow: "0 20px 50px rgba(0,0,0,0.3), 0 0 30px #0a66c218 inset",
                        }}>
                            <div style={{ ...fm, fontSize: 8, color: "#58a6ff", letterSpacing: 2, textTransform: "uppercase", fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#58a6ff", animation: "pulse 2s infinite" }} />
                                Cost Optimisation
                            </div>
                            <div style={{ ...sf, fontSize: 52, fontWeight: 900, color: T.t, lineHeight: 0.85, letterSpacing: "-2px", marginBottom: 8 }}>
                                11<span style={{ color: "#58a6ff", fontSize: 36 }}>×</span>
                            </div>
                            <div style={{ ...sf, fontSize: 13, color: T.t, fontWeight: 700, marginBottom: 4 }}>Cost Reduced</div>
                            <div style={{ ...fm, fontSize: 10, color: T.m, lineHeight: 1.5, marginBottom: 12 }}>
                                GPT-4o vs GPT-5 · 4× faster inference
                            </div>
                            <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
                                {[["1,690+","Docs"],["29","Evals"],["4.8/5","Score"]].map(([n,l]) => (
                                    <div key={l} style={{ textAlign: "center", flex: 1 }}>
                                        <div style={{ ...sf, fontSize: 12, fontWeight: 800, color: "#58a6ff" }}>{n}</div>
                                        <div style={{ ...fm, fontSize: 8, color: T.m, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Card 2: CNN Accuracy (Top-Right) ── */}
                    <div className="hfw" style={{ position: "absolute", top: "10%", right: "4%", animation: "hf2 3.8s ease-in-out infinite", transformStyle: "preserve-3d" }}>
                        <div className="h-card" style={{
                            transform: "translateZ(260px) rotateY(-12deg)",
                            background: dark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.07)",
                            border: "1px solid #10b98170", borderRadius: 20, padding: "20px",
                            backdropFilter: "blur(16px)", width: 200,
                            boxShadow: "0 20px 50px rgba(0,0,0,0.3), 0 0 30px #10b98118 inset",
                        }}>
                            <div style={{ ...fm, fontSize: 8, color: "#10b981", letterSpacing: 2, textTransform: "uppercase", fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", animation: "pulse 2.4s infinite" }} />
                                Network Precision
                            </div>
                            <div style={{ ...sf, fontSize: 48, fontWeight: 900, color: T.t, lineHeight: 0.85, letterSpacing: "-2px", marginBottom: 8 }}>
                                97.5<span style={{ color: "#10b981", fontSize: 32 }}>%</span>
                            </div>
                            <div style={{ ...sf, fontSize: 13, color: T.t, fontWeight: 700, marginBottom: 4 }}>CNN Accuracy</div>
                            <div style={{ ...fm, fontSize: 10, color: T.m, lineHeight: 1.5 }}>
                                Poultry Shield · TensorFlow<br />Flask on AWS EC2
                            </div>
                        </div>
                    </div>

                    {/* ── Card 3: Pass / Hire (Mid-Right) ── */}
                    <div className="hfw" style={{ position: "absolute", top: "44%", right: "3%", animation: "hf3 5s ease-in-out infinite", transformStyle: "preserve-3d" }}>
                        <div className="h-card" style={{
                            transform: "translateZ(200px) rotateY(-10deg)",
                            background: dark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.85)",
                            border: `1px solid ${T.a}60`, borderRadius: 20, padding: "18px 20px",
                            backdropFilter: "blur(20px)", width: 220,
                            boxShadow: `0 20px 50px rgba(0,0,0,0.3), 0 0 40px ${T.a}18 inset`,
                        }}>
                            <div style={{ ...fm, fontSize: 8, color: T.a, letterSpacing: 2, textTransform: "uppercase", fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.a, animation: "pulse 1.8s infinite" }} />
                                Talent.AI · Verdict
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: `${T.a}15`, border: `1px solid ${T.a}40` }}>
                                <span style={{ ...sf, fontSize: 22, fontWeight: 900, color: T.a }}>HIRE</span>
                                <span style={{ ...sf, fontSize: 20, color: "#10b981" }}>✓</span>
                                <div style={{ marginLeft: "auto", ...fm, fontSize: 11, color: T.m, textAlign: "right" }}>
                                    <div style={{ ...sf, fontSize: 18, fontWeight: 900, color: T.t }}>9.4</div>
                                    <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 1 }}>/10</div>
                                </div>
                            </div>
                            {[
                                ["ML Engineering", 94, "#58a6ff"],
                                ["RAG / LLM Systems", 91, T.a],
                                ["Cloud & DevOps", 78, T.a2],
                                ["Research Depth", 89, "#10b981"],
                            ].map(([lbl, pct, col]) => (
                                <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <div style={{ ...fm, fontSize: 9, color: T.m, width: 90, flexShrink: 0 }}>{lbl}</div>
                                    <Bar pct={pct} color={col} />
                                    <div style={{ ...fm, fontSize: 9, color: col, fontWeight: 700, width: 28, textAlign: "right" }}>{pct}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Card 4: AI Chat Terminal (Bottom-Right) ── */}
                    <div className="hfw" style={{ position: "absolute", bottom: "5%", right: "4%", animation: "hf4 4.6s ease-in-out infinite", transformStyle: "preserve-3d" }}>
                        <div className="h-card" style={{
                            transform: "translateZ(140px) rotateY(-8deg)",
                            background: dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.8)",
                            border: `1px solid ${T.border}`, borderRadius: 20, padding: 0,
                            overflow: "hidden", backdropFilter: "blur(24px)", width: 320,
                            pointerEvents: "auto",
                            boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${T.a}15 inset`,
                        }}>
                            <div style={{ padding: "9px 16px", display: "flex", alignItems: "center", gap: 7, background: dark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)", borderBottom: `1px solid ${T.border}` }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
                                </div>
                                <div style={{ ...fm, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: T.m, textTransform: "uppercase", flex: 1, textAlign: "center" }}>Farhan.AI — Live</div>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.a, boxShadow: `0 0 7px ${T.a}` }} />
                            </div>
                            <div style={{ height: 250, position: "relative" }}>
                                <HeroChat T={T} />
                            </div>
                        </div>
                    </div>

                    {/* ── Card 5: Tech Stack (Bottom-Left) ── */}
                    <div className="hfw" style={{ position: "absolute", bottom: "16%", left: "4%", animation: "hf5 3.6s ease-in-out infinite", transformStyle: "preserve-3d" }}>
                        <div className="h-card" style={{
                            transform: "translateZ(140px) rotateY(8deg)",
                            background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
                            border: `1px solid ${T.border}`, borderRadius: 20, padding: "18px",
                            backdropFilter: "blur(12px)", width: 220,
                            boxShadow: "0 14px 36px rgba(0,0,0,0.2)",
                        }}>
                            <div style={{ ...fm, fontSize: 8, color: T.a, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.a }} />
                                Core Architecture
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                                {["PyTorch","Kafka","Docker","Azure AI","RAG","GPT-4o","FastAPI","LangChain"].map(tech => (
                                    <span key={tech} style={{
                                        background: dark ? "rgba(255,255,255,0.08)" : `${T.a}10`,
                                        border: `1px solid ${T.border}`, padding: "4px 9px", borderRadius: 8,
                                        ...fm, fontSize: 10, color: T.t, fontWeight: 600,
                                    }}>{tech}</span>
                                ))}
                            </div>
                            <div style={{ ...fm, fontSize: 9, color: T.m, lineHeight: 1.5, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                                MSc Data Science · TUHH Hamburg
                            </div>
                        </div>
                    </div>

                    {/* ── Werkstudent badge (top-center) ── */}
                    <div style={{
                        position: "absolute", top: "6%", left: "50%",
                        transform: "translateX(-50%) translateZ(60px)",
                        background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.88)",
                        border: `1px solid ${T.border}`, borderRadius: 30, padding: "7px 18px",
                        backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 7,
                        ...fm, fontSize: 10, color: T.m, fontWeight: 600, pointerEvents: "none",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse 2s infinite" }} />
                        Werkstudent · Nordex SE · Hamburg
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes heroSpin { 
                    from { transform: translateZ(var(--hz)) rotateX(70deg) rotateZ(0deg); }
                    to { transform: translateZ(var(--hz)) rotateX(70deg) rotateZ(360deg); }
                }
                @keyframes hf1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-11px)} }
                @keyframes hf2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                @keyframes hf3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-13px)} }
                @keyframes hf4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
                @keyframes hf5 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
                .hfw { animation-delay: 0s; }
                .hfw:nth-child(2) { animation-delay: -1s; }
                .hfw:nth-child(3) { animation-delay: -2.4s; }
                .hfw:nth-child(4) { animation-delay: -0.7s; }
                .hfw:nth-child(5) { animation-delay: -1.8s; }
                .h-card { cursor: default; transition: border-color 0.3s, box-shadow 0.3s; }
                .h-card:hover {
                    border-color: ${T.a}80 !important;
                    box-shadow: 0 28px 70px rgba(0,0,0,0.4), 0 0 40px ${T.a}28 inset !important;
                }
                .hero-social-pill:hover {
                    background: ${T.a}20 !important;
                    border-color: ${T.a}80 !important;
                    color: ${T.a} !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </section>
    );
}

/* ── Main Export ─────────────────────────────────────────────────── */
export default function HeroBentoMaster({ T, dark, onOpenResume }) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <>
            {isMobile ? (
                <MobileHero T={T} dark={dark} onOpenResume={onOpenResume} />
            ) : (
                <DesktopHero T={T} dark={dark} onOpenResume={onOpenResume} />
            )}
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
                @keyframes heroSpin {
                    from { transform: translateZ(var(--hz, 0px)) rotateX(70deg) rotateZ(0deg); }
                    to { transform: translateZ(var(--hz, 0px)) rotateX(70deg) rotateZ(360deg); }
                }
                @keyframes orbit-float {
                    0% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                    100% { transform: translateY(0) rotate(0); }
                }
                .section { transition: opacity 0.8s, transform 0.8s; }
            `}</style>
        </>
    );
}
