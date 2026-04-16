import { useRef, useEffect, useState } from "react";
import Mag from "./Mag";
import TypingRole from "./TypingRole";
import HeroProfile from "./HeroProfile";
import HeroChat from "./HeroChat";

const sf = { fontFamily: "'Space Grotesk', 'Sora', sans-serif" };
const fm = { fontFamily: "'Inter', sans-serif" };

const SOCIAL = [
    { label: "GitHub", href: "https://github.com/Shahriyar31", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/farhanshahriyar", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { label: "Email", href: "mailto:shahriyarfarhan3101@gmail.com", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg> },
];


/* ── Neural Network Background (full-hero ambient theme) ──────────── */
function NeuralNetBG({ T, dark }) {
    const nodes = [
        { x: 8, y: 15 }, { x: 18, y: 65 }, { x: 6, y: 85 },
        { x: 92, y: 20 }, { x: 88, y: 72 }, { x: 94, y: 50 },
        { x: 25, y: 40 }, { x: 75, y: 35 }, { x: 50, y: 10 },
        { x: 15, y: 50 }, { x: 85, y: 85 }, { x: 50, y: 90 },
        { x: 35, y: 20 }, { x: 65, y: 80 }, { x: 30, y: 75 }, { x: 70, y: 15 },
    ];
    const edges = [
        [0,6],[0,9],[1,6],[1,9],[2,9],[3,7],[3,5],[4,7],[4,5],[6,8],[7,8],
        [6,10],[7,10],[9,13],[5,11],[8,12],[13,11],[12,11],[10,11],
        [0,12],[3,8],[6,7],[2,13],[4,14],[1,14],[14,13],[15,8],[15,7],
    ];
    const color = dark ? T.a : T.a;
    const signals = [
        { edge: [0,6], dur: "3s", delay: "0s" },
        { edge: [3,7], dur: "2.5s", delay: "0.8s" },
        { edge: [6,8], dur: "4s", delay: "1.5s" },
        { edge: [7,8], dur: "3.5s", delay: "0.3s" },
        { edge: [8,12], dur: "2.8s", delay: "1.2s" },
        { edge: [9,13], dur: "3.2s", delay: "0.5s" },
        { edge: [4,5], dur: "2.2s", delay: "2s" },
        { edge: [1,6], dur: "3.8s", delay: "0.7s" },
    ];
    return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                {edges.map(([a, b], i) => (
                    <line key={i}
                        x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`}
                        x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
                        stroke={color} strokeWidth="0.08" opacity="0.18"
                    />
                ))}
                {nodes.map((n, i) => (
                    <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r="0.4" fill={color} opacity="0.4">
                        <animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${2 + (i * 0.3) % 2}s`} repeatCount="indefinite" begin={`${(i * 0.25) % 2}s`}/>
                        <animate attributeName="r" values="0.35;0.55;0.35" dur={`${2.5 + (i * 0.2) % 1.5}s`} repeatCount="indefinite" begin={`${(i * 0.15) % 1.5}s`}/>
                    </circle>
                ))}
                {signals.map(({ edge: [a, b], dur, delay }, i) => (
                    <circle key={`sig-${i}`} r="0.5" fill="white" opacity="0.7">
                        <animateMotion dur={dur} begin={delay} repeatCount="indefinite"
                            path={`M ${nodes[a].x} ${nodes[a].y} L ${nodes[b].x} ${nodes[b].y}`}
                        />
                        <animate attributeName="opacity" values="0;0.8;0" dur={dur} begin={delay} repeatCount="indefinite"/>
                    </circle>
                ))}
            </svg>
        </div>
    );
}

/* ── AI Chat Bubble Card ─────────────────────────────────────────── */
function AIChatBubbleCard({ T, dark }) {
    const questions = [
        "What did you build at Nordex? 🤖",
        "Tell me about your RAG system",
        "MSc at TUHH — what's your thesis? 📚",
        "Best project you're proud of?",
        "How does your AI assistant work? ⚡",
        "Available for freelance work?",
    ];
    const [visibleIdx, setVisibleIdx] = useState(0);
    const [typedText, setTypedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let timeout;
        const question = questions[visibleIdx];
        let i = 0;
        setTypedText("");
        setIsTyping(true);
        const typeNext = () => {
            if (i <= question.length) {
                setTypedText(question.slice(0, i));
                i++;
                timeout = setTimeout(typeNext, 45);
            } else {
                setIsTyping(false);
                timeout = setTimeout(() => {
                    setVisibleIdx(p => (p + 1) % questions.length);
                }, 2200);
            }
        };
        typeNext();
        return () => clearTimeout(timeout);
    }, [visibleIdx]);

    return (
        <div style={{ padding: "14px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 10, justifyContent: "flex-end" }}>
            {/* Sample AI reply bubble */}
            <div style={{ alignSelf: "flex-start", maxWidth: "90%", padding: "8px 12px", borderRadius: "12px 12px 12px 2px", background: dark ? "rgba(89,180,250,0.12)" : `${T.a}15`, border: `1px solid ${T.a}30`, ...fm, fontSize: 11, color: T.t, lineHeight: 1.5 }}>
                Hi! I'm Farhan's AI. I built a RAG system at Nordex handling 1,690+ docs — 11× cheaper than GPT-5! ✨
            </div>
            {/* Typing question area */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 20, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${T.border}` }}>
                <span style={{ ...fm, fontSize: 11, color: T.m, flex: 1, height: 16, overflow: "hidden" }}>
                    {typedText}{isTyping ? <span style={{ animation: "blink 0.8s infinite", opacity: 1 }}>|</span> : null}
                </span>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.a, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                </div>
            </div>
        </div>
    );
}

function HeroGuideOverlay({ T, step }) {
    const text = [
        "I'm an AI & Data Engineer focused on driving real impact. 🚀",
        "Here is my tech stack orbiting around my core focus. 🛰️",
        "Ask my live AI assistant anything, or explore my work! 💬"
    ];
    return (
        <div style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%) translateZ(100px)", background: `${T.a}F0`, color: "white", padding: "16px 32px", borderRadius: 30, ...fm, fontSize: 15, fontWeight: 600, boxShadow: `0 20px 40px ${T.a}60`, backdropFilter: "blur(12px)", zIndex: 1000, pointerEvents: "none", transition: "opacity 0.3s", opacity: text[step] ? 1 : 0 }}>
            {text[step]}
        </div>
    );
}

/* ── Mobile / Tablet Layout ──────────────────────────────────────── */
function MobileHero({ T, dark, onOpenResume, guidedMode, guideStep, setGuidedMode }) {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const sceneRef = useRef(null);
    const [preview, setPreview] = useState(null);

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

    const getDimStyle = (targetStep) => ({
        transition: "opacity 0.6s ease, filter 0.6s ease",
        opacity: (guidedMode === "guided" && guideStep !== targetStep) ? 0.2 : 1,
        filter: (guidedMode === "guided" && guideStep !== targetStep) ? "grayscale(80%) blur(4px)" : "none",
        pointerEvents: guidedMode === "guided" ? "none" : "auto",
    });

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
                <div style={{ width: 110, height: 110, marginBottom: 20, transform: "translateZ(100px)", position: "relative", ...getDimStyle(0) }}>
                    <HeroProfile T={T} dark={dark} size="100%" />
                    <Ring T={T} size={160} z={0} speed={20} nodes={[
                        {name:"RAG", color:"#58a6ff", onClick:() => setPreview({name:"RAG", desc:"Built advanced RAG pipelines for 1,600+ enterprise docs."})},
                        {name:"Docker", color:T.a2, onClick:() => setPreview({name:"Docker", desc:"Containerized complex ML models for AWS/Azure deployment."})}
                    ]} />
                    <Ring T={T} size={200} z={-40} speed={30} reverse nodes={[
                        {name:"Azure AI", color:"#10b981", onClick:() => setPreview({name:"Azure AI", desc:"Deployed enterprise-scale LLMs and chatbots."})}
                    ]} />
                </div>

                {/* 2. Identity Block */}
                <div style={{ transform: "translateZ(60px)", marginBottom: 30, ...getDimStyle(0) }}>
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
                <div style={{ transform: "translateZ(30px)", width: "100%", maxWidth: 360, marginBottom: 30, ...getDimStyle(2) }}>
                    <HeroChat T={T} dark={dark} isMobile={true} />
                </div>

                {/* 3. Action Hub */}
                <div style={{ 
                    display: "flex", flexDirection: "column", gap: 12, alignItems: "center", 
                    width: "100%", maxWidth: 300, transform: "translateZ(10px)", ...getDimStyle(2)
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
                                padding: "8px 16px", background: T.bg,
                                border: "none", borderRadius: 20, color: T.m, textDecoration: "none",
                                ...fm, fontSize: 12, fontWeight: 600,
                                boxShadow: T.neuSm, transition: "box-shadow 0.25s, color 0.25s",
                                display: "flex", alignItems: "center", gap: 6,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = T.neuHover; e.currentTarget.style.color = T.a; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = T.neuSm; e.currentTarget.style.color = T.m; }}>
                                {s.icon}{s.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* 4. Stats Matrix (Mobile 3D Version) */}
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
                    width: "100%", maxWidth: 340, marginTop: 40,
                    transform: "translateZ(10px)", ...getDimStyle(2)
                }}>
                    {[
                        { num: "11×", label: "Cost saved" },
                        { num: "97.5%", label: "Accuracy" },
                        { num: "1,690", label: "Docs" },
                        { num: "29", label: "Evals" },
                    ].map(({ num, label }) => (
                        <div key={label} style={{
                            background: T.bg,
                            border: "none",
                            borderRadius: 16, padding: "12px",
                            boxShadow: T.neuSm, transition: "box-shadow 0.25s ease",
                        }}>
                            <div style={{ ...sf, fontSize: 22, fontWeight: 900, color: T.t }}>{num}</div>
                            <div style={{ ...fm, fontSize: 9, color: T.m, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>
            

            {preview && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 20
                }} onClick={() => setPreview(null)}>
                    <div style={{ background: T.bg, padding: 24, borderRadius: 16, border: `2px solid ${T.a}`, boxShadow: `0 20px 60px ${T.bg}80`, maxWidth: 300, textAlign: "center", animation: "fadeUp 0.3s ease" }} onClick={e => e.stopPropagation()}>
                        <div style={{ ...sf, fontSize: 20, fontWeight: 800, color: T.t, marginBottom: 10 }}>{preview.name}</div>
                        <div style={{ ...fm, fontSize: 12, color: T.m, lineHeight: 1.5, marginBottom: 16 }}>{preview.desc}</div>
                        <button onClick={() => setPreview(null)} style={{ background: T.a, color: "white", padding: "8px 20px", border: "none", borderRadius: 20, ...fm, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>Close</button>
                    </div>
                </div>
            )}

            {guidedMode === "guided" && <HeroGuideOverlay T={T} step={guideStep} />}
        </section>
    );
}

/* ── 3D Orbital Ring ─────────────────────────────────────────────── */
function Ring({ T, size, z, speed, reverse, nodes = [] }) {
    const [hover, setHover] = useState(null);
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
            pointerEvents: "none", transformStyle: "preserve-3d"
        }}>
            {nodes.length > 0 ? nodes.map((n, i) => {
                const angle = (i / nodes.length) * 360;
                return (
                    <div key={n.name + i} style={{
                        position: "absolute", top: "25%", left: "50%", // roughly mapping to orbit
                        transformOrigin: `0 ${size / 2}px`,
                        transform: `rotate(${angle}deg) translateY(-${size / 2}px) rotateX(-70deg) rotateY(0deg) rotateZ(0deg)`,
                        transformStyle: "preserve-3d", pointerEvents: "auto",
                        animation: `antiSpin ${speed}s linear infinite ${reverse ? "normal" : "reverse"}`
                    }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => n.onClick && n.onClick()}>
                        <div style={{
                            width: 14, height: 14, borderRadius: "50%", background: n.color || T.a,
                            boxShadow: `0 0 16px ${n.color || T.a}`, cursor: "pointer", transition: "transform 0.2s",
                            transform: hover === i ? "scale(1.5)" : "scale(1)"
                        }} />
                        {hover === i && (
                            <div style={{
                                position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)",
                                background: T.bg, padding: "4px 10px", borderRadius: 12, ...fm, fontSize: 10,
                                fontWeight: 700, color: T.t, border: `1px solid ${T.border}`, boxShadow: T.neu,
                                whiteSpace: "nowrap", pointerEvents: "none"
                            }}>
                                {n.name}
                            </div>
                        )}
                    </div>
                );
            }) : (
                <>
                    <div style={{ width: 8, height: 8, background: T.a, borderRadius: "50%", position: "absolute", top: -4, left: "50%", boxShadow: `0 0 16px ${T.a}` }} />
                    <div style={{ width: 5, height: 5, background: T.a2, borderRadius: "50%", position: "absolute", bottom: -3, left: "25%", boxShadow: `0 0 10px ${T.a2}` }} />
                </>
            )}
        </div>
    );
}

/* ── Desktop 3D Layout ───────────────────────────────────────────── */
function DesktopHero({ T, dark, onOpenResume, guidedMode, guideStep, setGuidedMode }) {
    const sceneRef = useRef(null);
    const rafRef = useRef(null);
    const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const [preview, setPreview] = useState(null);

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
    }, [guidedMode]);

    /* Skill bar helper */
    const Bar = ({ pct, color }) => (
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: color, boxShadow: `0 0 6px ${color}` }} />
        </div>
    );

    const getDimStyle = (targetStep) => ({
        transition: "opacity 0.6s ease, filter 0.6s ease",
        opacity: (guidedMode === "guided" && guideStep !== targetStep) ? 0.2 : 1,
        filter: (guidedMode === "guided" && guideStep !== targetStep) ? "grayscale(80%) blur(4px)" : "none",
        pointerEvents: guidedMode === "guided" ? "none" : "auto",
    });

    return (
        <section id="home" className="section hero-section" style={{ minHeight: "100vh", position: "relative", background: T.bg }}>
            {/* ── Neural Network Ambient Background Theme ── */}
            <NeuralNetBG T={T} dark={dark} />

            {/* ── Ambient glows + rings clipped separately so they don't interfere with 3D cards ── */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", ...getDimStyle(1) }}>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${T.a}10 0%, transparent 65%)` }} />
                <div style={{ position: "absolute", top: "10%", right: "5%", width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(ellipse, ${T.a2}12 0%, transparent 70%)`, filter: "blur(70px)" }} />
                <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(ellipse, ${T.a}10 0%, transparent 70%)`, filter: "blur(60px)" }} />
                {/* Rings inside clip layer */}
                <div style={{ position: "absolute", top: "50%", left: "50%", perspective: "1400px" }}>
                    <Ring T={T} size={1200} z={-600} speed={40} nodes={[{name:"RAG", color:"#58a6ff", onClick:()=>setPreview({name:"RAG",desc:"Built advanced RAG pipelines for 1,600+ enterprise docs."})}, {name:"Docker",color:T.a2, onClick:()=>setPreview({name:"Docker",desc:"Containerized complex ML models for robust deployment."})}, {name:"Azure AI",color:"#10b981", onClick:()=>setPreview({name:"Azure AI",desc:"Deployed enterprise-scale LLMs and chatbot endpoints."})}]} />
                    <Ring T={T} size={900}  z={-400} speed={25} reverse nodes={[{name:"Python", color:T.a, onClick:()=>setPreview({name:"Python",desc:"Core language for data pipelines, training, and backend."})}, {name:"Kafka",color:"#febc2e", onClick:()=>setPreview({name:"Kafka",desc:"Event streaming and real-time data ingestion for Digital Twins."})}]} />
                    <Ring T={T} size={600}  z={-200} speed={15} nodes={[{name:"LangChain", color:"#ff5f57", onClick:()=>setPreview({name:"LangChain",desc:"Orchestrating agentic workflows and complex LLM chains."})}]} />
                </div>
            </div>

            {/* ── 3D Perspective scene — no overflow:hidden so translateZ cards aren't clipped ── */}
            <div style={{ position: "absolute", inset: 0, perspective: "1400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div ref={sceneRef} style={{ position: "relative", width: "100%", maxWidth: "1440px", height: "100vh", transformStyle: "preserve-3d", willChange: "transform" }}>

                    {/* Deep watermark */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%,-50%) translateZ(-300px)",
                        ...sf, fontSize: "clamp(80px,14vw,220px)", fontWeight: 900,
                        color: "transparent", WebkitTextStroke: `2px ${T.a}08`,
                        pointerEvents: "none", whiteSpace: "nowrap", userSelect: "none",
                    }}>ENGINEER</div>

                    {/* ── Main Identity — LEFT column only in 3D scene ── */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-100%, -54%) translateZ(0px)",
                        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                        pointerEvents: "auto",
                        ...getDimStyle(0)
                    }}>
                        {/* Profile image */}
                        <div style={{ width: 120, height: 120, marginBottom: 16, transform: "translateZ(40px)" }}>
                            <HeroProfile T={T} dark={dark} size="100%" />
                        </div>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: `${T.a}18`, border: `1px solid ${T.a}50`,
                            padding: "6px 18px", borderRadius: 30, marginBottom: 12,
                            ...fm, fontSize: 10, fontWeight: 700, color: T.a,
                            letterSpacing: 2, textTransform: "uppercase", backdropFilter: "blur(10px)",
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.a, animation: "pulse 2s infinite" }} />
                            Available for Impact
                        </div>
                        <h1 style={{
                            ...sf, fontSize: "clamp(38px, 5.5vw, 82px)", fontWeight: 900, lineHeight: 0.88,
                            letterSpacing: "-0.04em", color: T.t, margin: "0 0 12px 0",
                            textTransform: "uppercase",
                            textShadow: dark ? `0 0 80px ${T.a}20, 0 20px 40px rgba(0,0,0,0.3)` : "none",
                        }}>FARHAN<br />SHAHRIYAR</h1>
                        <div style={{ ...fm, fontSize: "clamp(13px, 1.3vw, 17px)", color: T.m, marginBottom: 20 }}>
                            <TypingRole T={T} />
                        </div>
                        <Mag as="button" onClick={onOpenResume} style={{
                            background: T.a, color: "#fff", padding: "13px 36px", borderRadius: 30,
                            border: "none", cursor: "pointer", ...sf, fontSize: 12, fontWeight: 800,
                            textTransform: "uppercase", letterSpacing: 2, boxShadow: `0 12px 32px ${T.a}55`,
                            marginBottom: 10,
                        }}>Access Resume</Mag>
                        <div style={{ display: "flex", gap: 8 }}>
                            {SOCIAL.map(s => (
                                <Mag key={s.label} as="a" href={s.href} target="_blank" rel="noreferrer"
                                    className="hero-social-pill" style={{
                                        padding: "7px 14px", background: T.bg,
                                        border: "none", borderRadius: 20, color: T.m, textDecoration: "none",
                                        ...fm, fontSize: 11, fontWeight: 600, transition: "all 0.25s",
                                        boxShadow: T.neuSm, display: "flex", alignItems: "center", gap: 5,
                                    }}>{s.icon}{s.label}</Mag>
                            ))}
                        </div>
                    </div>

                    {/* ── Card 1: Cost Reduction (TOP-LEFT corner) ── */}
                    <div className="hfw" style={{ position: "absolute", top: "12%", left: "2%", animation: "hf1 4.2s ease-in-out infinite", transformStyle: "preserve-3d", ...getDimStyle(2) }}>
                        <div className="h-card" style={{
                            transform: "translateZ(180px) rotateY(8deg)",
                            background: T.bg,
                            border: "none", borderRadius: 20, padding: "20px",
                            width: 210,
                            boxShadow: T.neu,
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

                    {/* ── Card 2: CNN Accuracy (TOP-RIGHT corner) ── */}
                    <div className="hfw" style={{ position: "absolute", top: "12%", right: "2%", animation: "hf2 3.8s ease-in-out infinite", transformStyle: "preserve-3d", ...getDimStyle(2) }}>
                        <div className="h-card" style={{
                            transform: "translateZ(180px) rotateY(-8deg)",
                            background: T.bg,
                            border: "none", borderRadius: 20, padding: "20px",
                            width: 200,
                            boxShadow: T.neu,
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

                    {/* ── Card 3: Pass / Hire (BOTTOM-RIGHT corner) ── */}
                    <div className="hfw" style={{ position: "absolute", bottom: "8%", right: "2%", animation: "hf3 5s ease-in-out infinite", transformStyle: "preserve-3d", ...getDimStyle(2) }}>
                        <div className="h-card" style={{
                            transform: "translateZ(160px) rotateY(-8deg)",
                            background: T.bg,
                            border: "none", borderRadius: 20, padding: "18px 20px",
                            width: 220,
                            boxShadow: T.neu,
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


                    {/* ── Card 5: Tech Stack (BOTTOM-LEFT corner) ── */}
                    <div className="hfw" style={{ position: "absolute", bottom: "8%", left: "2%", animation: "hf5 3.6s ease-in-out infinite", transformStyle: "preserve-3d", ...getDimStyle(2) }}>
                        <div className="h-card" style={{
                            transform: "translateZ(140px) rotateY(8deg)",
                            background: T.bg,
                            border: "none", borderRadius: 20, padding: "18px",
                            width: 220,
                            boxShadow: T.neu,
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
                        position: "absolute", top: "11%", left: "50%",
                        transform: "translateX(-50%) translateZ(60px)",
                        background: T.bg,
                        border: "none", borderRadius: 30, padding: "7px 18px",
                        display: "flex", alignItems: "center", gap: 7,
                        ...fm, fontSize: 10, color: T.m, fontWeight: 600, pointerEvents: "none",
                        boxShadow: T.neuSm, ...getDimStyle(0)
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse 2s infinite" }} />
                        Werkstudent · Nordex SE · Hamburg
                    </div>

                </div>
            </div>

            {/* ── Stats + Chat panel — FLAT OVERLAY (outside 3D scene so pointer events work) ── */}
            <div style={{
                position: "absolute", top: "50%", left: "calc(50% + clamp(16px, 2vw, 32px))",
                transform: "translateY(-54%)",
                display: "flex", flexDirection: "column", gap: 14,
                width: "clamp(320px, 34vw, 460px)",
                zIndex: 10, pointerEvents: "auto",
                ...getDimStyle(0),
            }}>
                {/* Stats strip */}
                <div style={{ display: "flex", gap: 0, ...fm, fontSize: 10, color: T.m, background: T.bg, borderRadius: 16, boxShadow: T.neuSm, overflow: "hidden" }}>
                    {[["11×","Cost Saved"],["1,690+","Docs RAG"],["29","LLM Evals"],["4.8/5","Score"]].map(([v,l], i, arr) => (
                        <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 4px", borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
                            <span style={{ ...sf, fontSize: 15, fontWeight: 800, color: T.a }}>{v}</span>
                            <span style={{ fontSize: 8, letterSpacing: 1, textTransform: "uppercase", opacity: 0.6 }}>{l}</span>
                        </div>
                    ))}
                </div>
                {/* AI Chat — flat, no 3D transform, so inputs/buttons work perfectly */}
                <div style={{ background: T.bg, borderRadius: 20, overflow: "hidden", boxShadow: T.neu, border: "none" }}>
                    <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 7, background: dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.85)", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />)}
                        </div>
                        <div style={{ ...fm, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: T.m, textTransform: "uppercase", flex: 1, textAlign: "center" }}>Farhan.AI — Live</div>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.a, boxShadow: `0 0 6px ${T.a}` }} />
                    </div>
                    <HeroChat T={T} />
                </div>
            </div>


            {preview && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 20
                }} onClick={() => setPreview(null)}>
                    <div style={{ background: T.bg, padding: 32, borderRadius: 24, border: `2px solid ${T.a}`, boxShadow: `0 20px 60px ${T.bg}80`, maxWidth: 400, textAlign: "center", animation: "fadeUp 0.3s ease" }} onClick={e => e.stopPropagation()}>
                        <div style={{ ...sf, fontSize: 24, fontWeight: 800, color: T.t, marginBottom: 12 }}>{preview.name}</div>
                        <div style={{ ...fm, fontSize: 13, color: T.m, lineHeight: 1.6, marginBottom: 20 }}>{preview.desc}</div>
                        <button onClick={() => setPreview(null)} style={{ background: T.a, color: "white", padding: "10px 24px", border: "none", borderRadius: 20, ...fm, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>Close Preview</button>
                    </div>
                </div>
            )}

            {guidedMode === "guided" && <HeroGuideOverlay T={T} step={guideStep} />}

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
                    box-shadow: ${T.neuHover} !important;
                    color: ${T.a} !important;
                    transform: translateY(-2px);
                }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
            `}</style>
        </section>
    );
}

/* ── Main Export ─────────────────────────────────────────────────── */
export default function HeroBentoMaster({ T, dark, onOpenResume }) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
    const [guidedMode, setGuidedMode] = useState(null); // "guided", null
    const [guideStep, setGuideStep] = useState(0);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener("resize", check);

        const startTour = () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setGuideStep(0);
            setGuidedMode("guided");
        };
        window.addEventListener("start-guided-tour", startTour);

        return () => {
            window.removeEventListener("resize", check);
            window.removeEventListener("start-guided-tour", startTour);
        };
    }, []);

    // After 8 seconds of guided mode, end it automatically
    useEffect(() => {
        if (guidedMode === "guided") {
            const t1 = setTimeout(() => setGuideStep(1), 3000); // Focus Skills
            const t2 = setTimeout(() => setGuideStep(2), 6000); // Focus Chat/Projects
            const t3 = setTimeout(() => setGuidedMode(null), 9000); // End
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }
    }, [guidedMode]);

    return (
        <>
            {isMobile ? (
                <MobileHero T={T} dark={dark} onOpenResume={onOpenResume} guidedMode={guidedMode} guideStep={guideStep} setGuidedMode={setGuidedMode} />
            ) : (
                <DesktopHero T={T} dark={dark} onOpenResume={onOpenResume} guidedMode={guidedMode} guideStep={guideStep} setGuidedMode={setGuidedMode} />
            )}
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
                @keyframes heroSpin {
                    from { transform: translateZ(var(--hz, 0px)) rotateX(70deg) rotateZ(0deg); }
                    to { transform: translateZ(var(--hz, 0px)) rotateX(70deg) rotateZ(360deg); }
                }
                @keyframes antiSpin {
                    from { transform: rotateZ(360deg); }
                    to { transform: rotateZ(0deg); }
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
