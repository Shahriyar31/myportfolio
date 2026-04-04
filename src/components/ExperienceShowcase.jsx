import { useState, useRef, useEffect } from "react";

const EXP_DATA = [
    {
        id: "exp-1",
        date: "Aug 2025 → Present",
        type: "CURRENT",
        typeColor: "a",
        company: "Nordex SE",
        shortCompany: "NORDEX",
        role: "Werkstudent",
        subRole: "AI & Data Engineering",
        location: "Hamburg, DE",
        stats: [
            { val: 1690, max: 1690, suffix: "+", label: "Documents Indexed", ring: 1 },
            { val: 11, max: 15, suffix: "×", label: "Cost Reduction vs GPT-5", ring: 0.73 },
            { val: 29, max: 30, suffix: "", label: "Eval Questions Run", ring: 0.97 },
        ],
        bullets: [
            "Built end-to-end internal AI assistant — RAG pipeline over 1,690 docs with GPT-4o / GPT-5 and text-embedding-3-large",
            "Custom tool router via rapidfuzz (3 algorithms, threshold 70/100) solving a core Azure AI Foundry limitation",
            "29-question LLM evaluation (GPT-4o as judge) — recommended GPT-4o at 11× lower cost, 4× faster inference",
            "Streamlit chat UI, incremental vector store sync, 9 integrated tools, full architecture diagrams"
        ],
        tech: ["Azure AI Foundry", "GPT-4o / GPT-5", "RAG", "Python 3.11", "Docker", "Streamlit", "Azure Databricks", "Azure DevOps"]
    },
    {
        id: "exp-2",
        date: "Feb 2026 → Mar 2026",
        type: "PROJECT MGMT",
        typeColor: "a2",
        company: "Nordex SE",
        shortCompany: "NORDEX",
        role: "Werkstudent",
        subRole: "Project Manager",
        location: "Hamburg, DE",
        stats: [
            { val: 6, max: 6, suffix: "", label: "Teams Coordinated", ring: 1 },
            { val: 1, max: 1, suffix: "", label: "Critical Blockage Resolved", ring: 1 },
        ],
        bullets: [
            "Managed enterprise AI project across 6 teams and external vendors",
            "Identified and resolved a multi-week infrastructure blockage coordinating cloud & network teams",
            "Kept all teams aligned through ownership tracking and regular status updates",
            "Structured meeting notes and action trackers — project hit its deadline"
        ],
        tech: ["Project Management", "Stakeholder Communication", "Azure", "Cross-functional Leadership", "Vendor Coordination", "Agile Delivery"]
    },
    {
        id: "exp-3",
        date: "Aug 2025 → Jan 2026",
        type: "GOVERNANCE",
        typeColor: "a",
        company: "Nordex SE",
        shortCompany: "NORDEX",
        role: "Werkstudent",
        subRole: "AI Governance & Architecture",
        location: "Hamburg, DE",
        stats: [
            { val: 6, max: 6, suffix: "", label: "Governance Stages Designed", ring: 1 },
            { val: 2, max: 2, suffix: "", label: "Regulations Integrated", ring: 1 },
        ],
        bullets: [
            "Designed end-to-end AI governance lifecycle covering use case definition, data governance, model development, validation, deployment & monitoring",
            "Architecture diagrams translating Responsible AI principles into buildable system designs",
            "System boundaries, risk classifications, and transparency requirements aligned with EU AI Act",
            "Embedded GDPR and EU AI Act articles directly into governance docs — ensuring regulatory traceability"
        ],
        tech: ["AI Governance", "Responsible AI", "GDPR", "EU AI Act", "Data Governance", "Architecture Design", "Risk Classification", "Microsoft Visio"]
    }
];

/* ── SVG Circular Progress Ring ─────────────────────────────────── */
function MetricRing({ val, ring, suffix, label, color, active, size = 110, stroke = 7 }) {
    const sf = { fontFamily: "'Sora', sans-serif" };
    const fm = { fontFamily: "'Inter', sans-serif" };
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const [count, setCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const hasRun = useRef(false);

    useEffect(() => {
        if (!active || hasRun.current) return;
        hasRun.current = true;

        const dur = 1400;
        const start = performance.now();
        const tick = ts => {
            const p = Math.min((ts - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            setCount(Math.floor(ease * val));
            setProgress(ease * ring);
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        // Intentionally no cleanup so scrolling fast doesn't abort it midway and leave it at 0
    }, [active, val, ring]);

    const dash = circ * progress;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        style={{ transition: "stroke-dasharray 0.05s linear" }}
                    />
                </svg>
                <div style={{ ...sf, fontSize: size * 0.2, fontWeight: 900, color: "#fff", zIndex: 1, letterSpacing: "-0.02em" }}>
                    {count}{suffix}
                </div>
            </div>
            <div style={{
                ...fm, fontSize: 11, color: "rgba(255,255,255,0.45)",
                textAlign: "center", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", maxWidth: 90, lineHeight: 1.4
            }}>
                {label}
            </div>
        </div>
    );
}

function HighlightText({ text, accent }) {
    const keywords = ["Azure AI Foundry", "GPT-4o", "GPT-5", "RAG", "Python 3.11", "LLM", "GDPR", "EU AI Act", "Responsible AI", "Project Management", "Agile", "Streamlit", "Docker", "Databricks"];
    let parts = [text];
    keywords.forEach(kw => {
        let newParts = [];
        parts.forEach(p => {
            if (typeof p !== "string") { newParts.push(p); return; }
            const regex = new RegExp(`(${kw})`, "gi");
            const split = p.split(regex);
            split.forEach(s => {
                if (s.toLowerCase() === kw.toLowerCase()) {
                    newParts.push(<strong key={Math.random()} style={{ color: accent, fontWeight: 700, filter: "brightness(1.2)" }}>{s}</strong>);
                } else {
                    newParts.push(s);
                }
            });
        });
        parts = newParts;
    });
    return <>{parts}</>;
}

function TypeText({ text, active, delay = 0, style }) {
    const [n, setN] = useState(0);
    const hasRun = useRef(false);
    useEffect(() => {
        if (!active || hasRun.current) return;
        hasRun.current = true;
        setTimeout(() => {
            let i = 0;
            const go = () => { if (i <= text.length) { setN(i++); setTimeout(go, 35); } };
            go();
        }, delay);
        // Intentionally no cleanup so it always finishes typing even if the user scrolls away quickly
    }, [active, delay, text]);
    return <span style={style}>{text.slice(0, n)}{n < text.length && active && <span style={{ opacity: 0.3, animation: "blink .6s step-end infinite" }}>|</span>}</span>;
}

function TechPill({ label, T, dark, accent, visible, delay = 0 }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    return (
        <div style={{
            position: "relative",
            padding: "6px 14px",
            borderRadius: 8,
            overflow: "hidden",
            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            border: `1px solid ${T.border}`,
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1) translateY(0)" : "scale(0.9) translateY(10px)",
            transition: `all 0.6s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
            display: "flex",
            alignItems: "center",
            gap: 6,
            backdropFilter: "blur(4px)",
        }}>
            <span style={{
                ...fm, fontSize: 11, fontWeight: 600, color: T.m,
                position: "relative", zIndex: 1, letterSpacing: "0.02em"
            }}>
                {label}
            </span>
        </div>
    );
}

function CardContent({ item, T, dark, active }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const accent = T[item.typeColor];
    const rightRef = useRef(null);
    const [mouse, setMouse] = useState({ x: -999, y: -999 });
    const onMove = e => {
        const r = rightRef.current?.getBoundingClientRect();
        if (r) setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
    };

    return (
        <div style={{ display: "flex", height: "100%", borderRadius: 28, overflow: "hidden", boxShadow: dark ? "0 40px 80px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.18)" }}>

            {/* LEFT PANEL */}
            <div style={{
                background: dark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.2)",
                backdropFilter: "blur(40px)",
                display: "flex", flexDirection: "column",
                justifyContent: "space-between",
                padding: "40px 32px",
                position: "relative",
                overflow: "hidden",
                borderRight: `1px solid rgba(150,150,150,0.15)`,
            }}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}>
                    <defs>
                        <pattern id={`grid-${item.id}`} width="28" height="28" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill={accent} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#grid-${item.id})`} />
                </svg>
                <div style={{
                    position: "absolute", bottom: -20, left: -10,
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "clamp(60px,10vw,140px)", fontWeight: 900,
                    color: "rgba(255,255,255,0.05)", lineHeight: 1,
                    userSelect: "none", pointerEvents: "none",
                    letterSpacing: "-.06em",
                }}>
                    {item.shortCompany}
                </div>
                <div>
                    <span style={{
                        ...fm, fontSize: 10, fontWeight: 700, letterSpacing: ".2em",
                        color: accent, background: `${accent}20`,
                        border: `1px solid ${accent}35`, padding: "5px 12px", borderRadius: 20,
                        display: "inline-flex", alignItems: "center", gap: 6
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, display: "inline-block", animation: item.type === "CURRENT" ? "pulse 1.8s ease-in-out infinite" : "none" }} />
                        {item.type}
                    </span>
                    <div style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 14, letterSpacing: ".05em", lineHeight: 1.5 }}>{item.date}</div>
                    <div style={{ ...fm, fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {item.location}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "center", flex: 1, justifyContent: "center", padding: "32px 0" }}>
                    {item.stats.map((s, i) => (
                        <MetricRing key={i} {...s} color={accent} active={active} size={110} />
                    ))}
                </div>
                <div style={{ ...sf, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: ".2em", textTransform: "uppercase" }}>
                    {item.company}
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div
                ref={rightRef}
                onMouseMove={onMove}
                onMouseLeave={() => setMouse({ x: -999, y: -999 })}
                style={{
                    flex: 1,
                    background: dark ? "rgba(10,10,15,0.3)" : "rgba(240,240,250,0.5)",
                    backdropFilter: "blur(40px)",
                    display: "flex", flexDirection: "column",
                    padding: "44px 52px",
                    overflowY: "auto",
                    position: "relative",
                }}
            >
                <div style={{
                    position: "absolute", pointerEvents: "none", zIndex: 0,
                    width: 400, height: 400, borderRadius: "50%",
                    background: `radial-gradient(circle, ${accent}09 0%, transparent 70%)`,
                    transform: `translate(${mouse.x - 200}px, ${mouse.y - 200}px)`,
                    transition: "transform 0.06s linear",
                }} />
                <div style={{ marginBottom: 10, position: "relative", zIndex: 1 }}>
                    <div style={{ ...fm, fontSize: 13, color: T.m, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 32, height: 1.5, background: accent, display: "inline-block" }} />
                        {item.role}
                    </div>
                    <h3 style={{ ...sf, fontSize: "clamp(30px,4.5vw,58px)", fontWeight: 900, color: T.t, margin: 0, letterSpacing: "-.04em", lineHeight: 0.92 }}>
                        <TypeText text={item.subRole} active={active} delay={200} />
                    </h3>
                </div>
                <div style={{
                    height: 1.5, background: `linear-gradient(90deg, ${accent}, transparent)`,
                    margin: "28px 0",
                    opacity: active ? 1 : 0,
                    transform: active ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.9s 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.4s 0.3s",
                    position: "relative", zIndex: 1,
                }} />
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 18, flex: 1, position: "relative", zIndex: 1 }}>
                    {item.bullets.map((b, i) => (
                        <li key={i} style={{
                            display: "flex", gap: 16, alignItems: "flex-start",
                            opacity: active ? 1 : 0,
                            transform: active ? "translateX(0)" : "translateX(-24px)",
                            transition: `opacity 0.6s ${300 + i * 120}ms cubic-bezier(0.16,1,0.3,1), transform 0.6s ${300 + i * 120}ms cubic-bezier(0.16,1,0.3,1)`,
                        }}>
                            <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: "50%", background: accent, marginTop: 10, boxShadow: `0 0 12px ${accent}60`, border: `2px solid #fff` }} />
                            <span style={{ ...fm, fontSize: "clamp(14px,1.5vw,17.5px)", lineHeight: 1.85, color: dark ? "rgba(225,232,255,0.92)" : "rgba(45,55,75,0.95)", fontWeight: 450, letterSpacing: "-0.01em" }}>
                                <HighlightText text={b} accent={accent} />
                            </span>
                        </li>
                    ))}
                </ul>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32, position: "relative", zIndex: 1 }}>
                    {item.tech.map((t, i) => (
                        <TechPill key={t} label={t} T={T} dark={dark} accent={accent} visible={active} delay={600 + i * 50} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN — Spatial Z-Axis Divethrough (Direct DOM Mutation Engine)
══════════════════════════════════════════════════════════════════ */
export default function ExperienceShowcase({ T, dark, SectionHeading }) {
    const outerRef = useRef(null);
    const monolithRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0); // Trigger heavy components only on index change

    // Engine State
    const cardsRef = useRef([]);
    const progressRef = useRef(null);
    const counterRef = useRef(null);
    const ticksRef = useRef([]);

    const target = useRef(0);
    const current = useRef(0);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 900);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            if (!outerRef.current) return;
            const rect = outerRef.current.getBoundingClientRect();
            const vh = window.innerHeight;
            
            // MEASURE: How many pixels have we scrolled PAST the start of the section?
            const scrolledPixels = Math.max(0, -rect.top);
            
            // THE TRACK: 6000px total height, which means 6000 - 100vh of actual scrollable territory
            const scrollableRange = 6000 - vh;
            const rotationTrack = 4000; // Finish all 3 cards in the first 4000px of scroll

            let p = Math.max(0, Math.min(1, scrolledPixels / rotationTrack));
            target.current = p * (EXP_DATA.length - 1);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isMobile]);

    // High-Performance Interstitial Render Loop
    useEffect(() => {
        let frame;
        const render = () => {
            // Snappier follow-speed on mobile
            const lerp = isMobile ? 0.15 : 0.08;
            current.current += (target.current - current.current) * lerp;

            const currIdx = Math.round(current.current);
            setActiveIdx(prev => prev !== currIdx ? currIdx : prev);

            // Tightened Radius for faster engagement
            const R = isMobile ? 550 : 1400;
            const spacingAngle = isMobile ? 65 : 38; 
            const centerIdx = target.current;

            // Apply a slight tilt to the whole scene for a "stadium" feel
            if (monolithRef.current) {
               monolithRef.current.style.transform = `rotateX(-3deg) translateY(-20px)`;
            }

            cardsRef.current.forEach((el, i) => {
                if (!el) return;

                // Continuous floating progress representing the angle displacement
                const offset = current.current - i;
                const dist = Math.abs(offset);

                // Mathematical Tangent Angle for this specific card
                const angleDeg = -offset * spacingAngle;
                const angleRad = angleDeg * (Math.PI / 180);

                // X offsets based on Sine of the arc, Z depths based on Cosine of the arc
                const tx = Math.sin(angleRad) * R;
                // Side cards go BACK (away from viewer). At angle=0: tz=0. At angle=35°: tz=R*(1-cos35°)=+118px behind.
                const tz = R - (Math.cos(angleRad) * R);

                // The card physically rotating its face to remain perfectly tangent to the circumference
                const ry = angleDeg;

                // Add an elegant parabolic dip (bowl) effect so side cards sink slightly
                const ty = Math.pow(dist, 1.8) * 45;

                // Viscosity fading: cards far away on the drum disappear seamlessly
                let op = 1;
                let bright = 1;
                let blur = 0;

                if (dist > 1.5) {
                   op = Math.max(0, 1 - (dist - 1.5) * 3);
                   bright = 0.5;
                   blur = Math.min(12, (dist - 1.5) * 10);
                } else if (dist > 0.2) {
                   bright = Math.max(0.55, 1 - (dist * 0.35));
                   blur = dist * 2;
                }

                // Dynamic realistic box shadow based on proximity to center
                const shadowAlpha = Math.max(0, 0.8 - (dist * 0.6));

                el.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${ry}deg)`;
                el.style.opacity = Math.max(0, op);
                el.style.pointerEvents = dist < 0.35 ? "auto" : "none";
                el.style.zIndex = Math.round(100 - dist * 10); // Dynamic Z priority

                const inner = el.firstChild;
                if (inner) {
                    inner.style.filter = `brightness(${bright}) blur(${blur}px)`;
                    inner.style.boxShadow = `0 40px 100px rgba(0,0,0,${shadowAlpha})`;
                }
            });

            if (progressRef.current) {
                progressRef.current.style.width = `${(current.current / (EXP_DATA.length - 1)) * 100}%`;
            }
            if (counterRef.current) {
                counterRef.current.innerText = `${String(currIdx + 1).padStart(2, "0")} / ${String(EXP_DATA.length).padStart(2, "0")}`;
            }
            ticksRef.current.forEach((tk, i) => {
                if (!tk) return;
                tk.style.width = i === currIdx ? "24px" : "6px";
                tk.style.background = i === currIdx ? T.a : T.border;
            });

            frame = requestAnimationFrame(render);
        };
        frame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frame);
    }, [T, isMobile]);

    // Massive 6000px runway for total stability
    const totalHeight = "6000px";
    const hPad = "clamp(20px,6vw,120px)";

    return (
        <div ref={outerRef} style={{ height: totalHeight, width: "100%", position: "relative", overflow: "visible" }}>
            <div style={{
                position: "sticky", top: 0, height: isMobile ? "100dvh" : "100vh", overflow: "visible", zIndex: 50,
                display: "flex", flexDirection: "column", padding: isMobile ? "60px 20px 20px" : `80px ${hPad} 40px`, boxSizing: "border-box",
            }}>
                {SectionHeading && (
                    <div style={{ marginBottom: 12 }}>{SectionHeading}</div>
                )}

                {/* Performance Bypass Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 24 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: T.m, letterSpacing: ".2em", textTransform: "uppercase" }}>
                        Experience
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {EXP_DATA.map((_, i) => (
                            <div key={i} ref={el => ticksRef.current[i] = el} style={{
                                height: 2, borderRadius: 2, width: 6, background: T.border, transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                            }} />
                        ))}
                        <span ref={counterRef} style={{ fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700, color: T.m, marginLeft: 8 }}>
                            01 / 03
                        </span>
                    </div>
                </div>

                {/* Spatial Y-Axis Perspective Engine (The Carousel) */}
                 <div
                    ref={monolithRef}
                    style={{
                        position: "relative", flex: 1, overflow: "visible", marginBottom: isMobile ? 32 : 0,
                        perspective: isMobile ? "1200px" : "2500px", transformStyle: "preserve-3d",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: isMobile ? 0 : 20 // Offset for the section headers
                    }}
                 >
                    {EXP_DATA.map((item, i) => (
                        <div key={item.id} ref={el => cardsRef.current[i] = el} style={{
                            position: "absolute", width: "100%", height: "100%", maxWidth: 1000,
                            transformOrigin: "50% 50%", willChange: "transform, opacity, filter"
                        }}>
                            <div style={{ width: "100%", height: "100%", borderRadius: 28, willChange: "filter, box-shadow" }}>
                                {isMobile ? (
                                    <MobileCardContent item={item} T={T} dark={dark} active={activeIdx === i} />
                                ) : (
                                    <CardContent item={item} T={T} dark={dark} active={activeIdx === i} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ height: 2, borderRadius: 2, background: T.border, position: "relative", overflow: "hidden", marginBottom: 8 }}>
                    <div ref={progressRef} style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: "0%",
                        background: T.a, borderRadius: 2, transition: "none",
                    }} />
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: T.m, letterSpacing: ".15em", textTransform: "uppercase", textAlign: "left" }}>
                    Dive into Timeline · {EXP_DATA.length} positions
                </div>
            </div>
        </div>
    );
}

/* ── Mobile card stat counter ─────────────────────────────────── */
function MobileCount({ to, suffix, label, color, active }) {
    const sf = { fontFamily: "'Sora', sans-serif" };
    const fm = { fontFamily: "'Inter', sans-serif" };
    const [val, setVal] = useState(0);
    const ran = useRef(false);
    useEffect(() => {
        if (!active || ran.current) return;
        ran.current = true;
        const dur = 1000;
        const start = performance.now();
        const tick = ts => {
            const p = Math.min((ts - start) / dur, 1);
            setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
            if (p < 1) requestAnimationFrame(tick); else setVal(to);
        };
        requestAnimationFrame(tick);
    }, [active, to]);
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ ...sf, fontSize: "clamp(20px,5vw,28px)", fontWeight: 900, color, lineHeight: 1 }}>{val}{suffix}</div>
            <div style={{ ...fm, fontSize: 9, color: "inherit", opacity: 0.55, letterSpacing: ".1em", textTransform: "uppercase", marginTop: 3, lineHeight: 1.4 }}>{label}</div>
        </div>
    );
}

function MobileCardContent({ item, T, dark, active }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const accent = T[item.typeColor];

    return (
        <div style={{
            width: "100%", height: "100%",
            borderRadius: 24,
            background: dark ? "rgba(18,20,30,0.6)" : "rgba(250,250,255,0.7)",
            backdropFilter: "blur(40px)",
            border: `1px solid ${T.border}`,
            overflow: "hidden",
            display: "flex", flexDirection: "column",
        }}>
            <div style={{
                height: 3, background: `linear-gradient(90deg, ${accent}, ${T.a2})`,
                transformOrigin: "left",
                transform: active ? "scaleX(1)" : "scaleX(0)",
                transition: `transform 0.8s 0.2s cubic-bezier(0.16,1,0.3,1)`,
            }} />
            <div style={{ padding: "32px 24px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                    <span style={{
                        ...fm, fontSize: 9, fontWeight: 700, letterSpacing: ".18em",
                        color: accent, background: `${accent}14`,
                        border: `1px solid ${accent}30`, padding: "4px 10px", borderRadius: 20,
                        display: "inline-flex", alignItems: "center", gap: 6
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, display: "inline-block", animation: item.type === "CURRENT" ? "pulse 1.8s ease-in-out infinite" : "none" }} />
                        {item.type}
                    </span>
                    <span style={{ ...fm, fontSize: 11, color: T.m }}>{item.date}</span>
                </div>
                <h3 style={{ ...sf, fontSize: "clamp(24px,7vw,36px)", fontWeight: 900, color: T.t, margin: "0 0 10px", letterSpacing: "-.04em", lineHeight: 0.95 }}>
                    <TypeText text={item.subRole} active={active} delay={200} />
                </h3>
                <div style={{ ...fm, fontSize: 12, color: T.a, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 28, height: 2, background: accent, display: "inline-block" }} />
                    <strong style={{ whiteSpace: "nowrap" }}>{item.role}</strong> <span style={{ opacity: 0.5 }}>· {item.company}</span>
                </div>
                <div style={{ display: "flex", gap: 0, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "20px 0", marginBottom: 26, color: T.m }}>
                    {item.stats.map((s, i) => (
                        <div key={i} style={{ flex: 1, borderRight: i < item.stats.length - 1 ? `1px solid ${T.border}` : "none" }}>
                            <MobileCount to={s.val} suffix={s.suffix} label={s.label} color={accent} active={active} />
                        </div>
                    ))}
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                    {item.bullets.map((b, i) => (
                        <li key={i} style={{
                            display: "flex", gap: 12, alignItems: "flex-start",
                            opacity: active ? 1 : 0,
                            transform: active ? "scale(1) translateY(0)" : "scale(0.95) translateY(12px)",
                            transition: `opacity 0.6s ${100 + i * 100}ms cubic-bezier(0.16,1,0.3,1), transform 0.6s ${100 + i * 100}ms cubic-bezier(0.16,1,0.3,1)`,
                        }}>
                            <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: accent, marginTop: 8, boxShadow: `0 0 10px ${accent}40` }} />
                            <span style={{ ...fm, fontSize: 13, lineHeight: 1.8, color: dark ? "rgba(225,232,255,0.9)" : "rgba(45,55,75,0.95)", fontWeight: 450 }}>
                                <HighlightText text={b} accent={accent} />
                            </span>
                        </li>
                    ))}
                </ul>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {item.tech.map((t, i) => (
                        <TechPill key={t} label={t} T={T} dark={dark} accent={accent} visible={active} delay={400 + i * 40} />
                    ))}
                </div>
            </div>
        </div>
    );
}
