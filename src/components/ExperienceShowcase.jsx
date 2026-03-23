import { useState, useRef, useEffect, useCallback } from "react";

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
    const rafRef = useRef(null);
    const prevActive = useRef(false);

    useEffect(() => {
        if (!active) {
            prevActive.current = false;
            setCount(0);
            setProgress(0);
            return;
        }
        if (active && prevActive.current) return;
        prevActive.current = true;

        const dur = 1500;
        const start = performance.now();
        const tick = ts => {
            const p = Math.min((ts - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 4); // Quartic ease out
            setCount(Math.floor(ease * val));
            setProgress(ease * ring);
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
        };
        const t = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, 400);
        return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
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

/* ── Typewriter ──────────────────────────────────────────────────── */
/* ── Highlight keywords in bullet points ─────────────────────────── */
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
    const prevActive = useRef(false);
    useEffect(() => {
        if (!active) { prevActive.current = false; setN(0); return; }
        if (prevActive.current) return;
        prevActive.current = true;
        const t = setTimeout(() => {
            let i = 0;
            const go = () => { if (i <= text.length) { setN(i++); setTimeout(go, 40); } };
            go();
        }, delay);
        return () => clearTimeout(t);
    }, [active, delay, text]);
    return <span style={style}>{text.slice(0, n)}{n < text.length && active && <span style={{ opacity: 0.3, animation: "blink .6s step-end infinite" }}>|</span>}</span>;
}

/* ── Cool tech pill component ────────────────────────────────────── */
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
            {/* Subtle glow on hover */}
            <div className="pill-glow" style={{
                position: "absolute", inset: -1,
                background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
                opacity: 0, transition: "opacity 0.3s",
            }} />
            <span style={{ 
                ...fm, fontSize: 11, fontWeight: 600, color: T.m, 
                position: "relative", zIndex: 1, letterSpacing: "0.02em" 
            }}>
                {label}
            </span>
            <style>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .tech-pill:hover .pill-glow { opacity: 1; }
                .tech-pill:hover { border-color: ${accent}80 !important; transform: translateY(-2px) scale(1.05) !important; }
            `}</style>
            {visible && (
                <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)`,
                    animation: "shimmer 1.2s linear infinite",
                    pointerEvents: "none",
                }} />
            )}
        </div>
    );
}

/* ── Individual card content ─────────────────────────────────────── */
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

            {/* ── LEFT PANEL — dark, stats + company ── */}
            <div className="exp-left-panel" style={{
                background: dark ? "#0F1115" : "#1A1D24",
                display: "flex", flexDirection: "column",
                justifyContent: "space-between",
                padding: "40px 32px",
                position: "relative",
                overflow: "hidden",
                borderRight: `1px solid rgba(255,255,255,0.06)`,
            }}>
                {/* Animated grid dots background */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}>
                    <defs>
                        <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill={accent} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Giant ghost text */}
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

                {/* Top: badge + date */}
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

                {/* Middle: metric rings */}
                <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "center", flex: 1, justifyContent: "center", padding: "32px 0" }}>
                    {item.stats.map((s, i) => (
                        <MetricRing key={i} {...s} color={accent} active={active} size={110} />
                    ))}
                </div>

                {/* Bottom: company */}
                <div style={{ ...sf, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: ".2em", textTransform: "uppercase" }}>
                    {item.company}
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div
                ref={rightRef}
                onMouseMove={onMove}
                onMouseLeave={() => setMouse({ x: -999, y: -999 })}
                style={{
                    flex: 1, background: dark ? "#1A1D24" : "#FFFFFF",
                    display: "flex", flexDirection: "column",
                    padding: "44px 52px",
                    overflowY: "auto",
                    position: "relative",
                }}
            >
                {/* Mouse spotlight — subtle radial highlight */}
                <div style={{
                    position: "absolute", pointerEvents: "none", zIndex: 0,
                    width: 400, height: 400,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${accent}09 0%, transparent 70%)`,
                    transform: `translate(${mouse.x - 200}px, ${mouse.y - 200}px)`,
                    transition: "transform 0.06s linear",
                }} />

                {/* Role */}
                <div style={{ marginBottom: 10, position: "relative", zIndex: 1 }}>
                    <div style={{ ...fm, fontSize: 13, color: T.m, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 32, height: 1.5, background: accent, display: "inline-block" }} />
                        {item.role}
                    </div>
                    <h3 style={{ ...sf, fontSize: "clamp(30px,4.5vw,58px)", fontWeight: 900, color: T.t, margin: 0, letterSpacing: "-.04em", lineHeight: 0.92 }}>
                        <TypeText text={item.subRole} active={active} delay={200} />
                    </h3>
                </div>

                {/* Divider */}
                <div style={{
                    height: 1.5, background: `linear-gradient(90deg, ${accent}, transparent)`,
                    margin: "28px 0",
                    opacity: active ? 1 : 0,
                    transform: active ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.9s 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.4s 0.3s",
                    position: "relative", zIndex: 1,
                }} />

                {/* Bullets */}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 18, flex: 1, position: "relative", zIndex: 1 }}>
                    {item.bullets.map((b, i) => (
                        <li key={i} style={{
                            display: "flex", gap: 16, alignItems: "flex-start",
                            opacity: active ? 1 : 0,
                            transform: active ? "translateX(0)" : "translateX(-24px)",
                            transition: `opacity 0.6s ${300 + i * 120}ms cubic-bezier(0.16,1,0.3,1), transform 0.6s ${300 + i * 120}ms cubic-bezier(0.16,1,0.3,1)`,
                        }}>
                            <span style={{ 
                                flexShrink: 0, width: 8, height: 8, borderRadius: "50%", 
                                background: accent, marginTop: 10, 
                                boxShadow: `0 0 12px ${accent}60`,
                                border: `2px solid #fff`,
                            }} />
                            <span style={{ 
                                ...fm, fontSize: "clamp(14px,1.5vw,17.5px)", 
                                lineHeight: 1.85, 
                                color: dark ? "rgba(225,232,255,0.92)" : "rgba(45,55,75,0.95)",
                                fontWeight: 450,
                                letterSpacing: "-0.01em"
                            }}>
                                <HighlightText text={b} accent={accent} />
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Tech tags */}
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
   MAIN — Scroll-hijacked horizontal experience viewer
   Outer div: tall (n * 100vh), creates scroll range
   Inner: sticky 100vh, cards driven by scroll progress
══════════════════════════════════════════════════════════════════ */
export default function ExperienceShowcase({ T, dark }) {
    const outerRef = useRef(null);
    const [progress, setProgress] = useState(0);  // 0 → n-1 (float)
    const [isMobile, setIsMobile] = useState(false);
    const rafRef = useRef(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 900);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        if (isMobile) return;
        const onScroll = () => {
            if (!outerRef.current) return;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const rect = outerRef.current.getBoundingClientRect();
                const scrollable = outerRef.current.offsetHeight - window.innerHeight;
                const scrolled = Math.max(0, -rect.top);
                const p = Math.min(scrolled / scrollable, 1) * (EXP_DATA.length - 1);
                setProgress(p);
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => { window.removeEventListener("scroll", onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [isMobile]);

    // activeIdx: round so card becomes active at midpoint between cards
    const activeIdx = Math.round(Math.min(progress, EXP_DATA.length - 1));

    if (isMobile) {
        /* Mobile: normal vertical stacked cards */
        return (
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 24 }}>
                {EXP_DATA.map((item, i) => (
                    <MobileCard key={item.id} item={item} T={T} dark={dark} index={i} />
                ))}
            </div>
        );
    }

    return (
        /* Outer: height = cards * 120vh to create scroll range */
        <div ref={outerRef} style={{ height: `${EXP_DATA.length * 120}vh`, marginTop: 40, position: "relative" }}>

            {/* Sticky viewport */}
            <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", paddingTop: 80 }}>

                {/* Section label + counter */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: T.m, letterSpacing: ".2em", textTransform: "uppercase" }}>
                        Experience
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {EXP_DATA.map((_, i) => (
                            <div key={i} style={{
                                height: 2, borderRadius: 2,
                                width: i === activeIdx ? 24 : 6,
                                background: i === activeIdx ? T.a : T.border,
                                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                            }} />
                        ))}
                        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700, color: T.m, marginLeft: 8 }}>
                            {String(activeIdx + 1).padStart(2, "0")} / {String(EXP_DATA.length).padStart(2, "0")}
                        </span>
                    </div>
                </div>

                {/* Card rail — clips overflow, cards translate */}
                <div style={{ position: "relative", flex: 1, overflow: "visible", marginBottom: 60 }}>
                    {EXP_DATA.map((item, i) => {
                        const offset = (i - progress) * 105;
                        const dist = Math.abs(i - progress);
                        // isActive: card is active when it's within 0.45 of center
                        const isActive = dist < 0.45;

                        return (
                            <div key={item.id} style={{
                                position: "absolute",
                                inset: 0,
                                transform: `translateX(${offset}%) scale(${1 - dist * 0.06}) translateZ(0)`,
                                opacity: Math.max(0, 1 - dist * 0.65),
                                transition: "none",  // scroll-linked: no CSS transition
                                willChange: "transform, opacity",
                                filter: dist > 0.3 ? `blur(${Math.min(dist * 2, 4)}px)` : "none",
                            }}>
                                <CardContent item={item} T={T} dark={dark} active={isActive} />
                            </div>
                        );
                    })}
                </div>

                {/* Bottom progress bar */}
                <div style={{ height: 2, borderRadius: 2, background: T.border, position: "relative", overflow: "hidden", marginBottom: 8 }}>
                    <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: `${(progress / (EXP_DATA.length - 1)) * 100}%`,
                        background: T.a,
                        borderRadius: 2,
                        transition: "none",
                    }} />
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: T.m, letterSpacing: ".15em", textTransform: "uppercase" }}>
                    Scroll to navigate · {EXP_DATA.length} positions
                </div>
            </div>
        </div>
    );
}

/* ── Mobile card stat counter ────────────────────────────────────── */
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

/* ── Mobile fallback card ────────────────────────────────────────── */
function MobileCard({ item, T, dark, index }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const accent = T[item.typeColor];
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                obs.disconnect();
                // Double rAF: guarantee initial opacity:0 is painted before animation plays
                requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
            }
        }, { threshold: 0.08 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{
                borderRadius: 20,
                background: dark ? "#1A1D24" : "#FFFFFF",
                border: `1px solid ${T.border}`,
                overflow: "hidden",
                // CSS animation instead of CSS transition — always starts from 'from' keyframe
                opacity: visible ? undefined : 0,
                animation: visible
                    ? `aboutCardIn 0.7s ${index * 110}ms cubic-bezier(0.16,1,0.3,1) both`
                    : "none",
            }}
        >
            {/* Accent top bar — draws left to right */}
            <div style={{
                height: 3,
                background: `linear-gradient(90deg, ${accent}, ${T.a2})`,
                transformOrigin: "left",
                transform: visible ? "scaleX(1)" : "scaleX(0)",
                transition: `transform 0.8s ${index * 110 + 200}ms cubic-bezier(0.16,1,0.3,1)`,
            }} />

            <div style={{ padding: "28px 22px" }}>
                {/* Badge + date */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                    <span style={{
                        ...fm, fontSize: 9, fontWeight: 700, letterSpacing: ".18em",
                        color: accent, background: `${accent}14`,
                        border: `1px solid ${accent}30`, padding: "4px 10px", borderRadius: 20,
                        display: "inline-flex", alignItems: "center", gap: 6
                    }}>
                        <span style={{
                            width: 5, height: 5, borderRadius: "50%", background: accent,
                            display: "inline-block",
                            animation: item.type === "CURRENT" ? "pulse 1.8s ease-in-out infinite" : "none"
                        }} />
                        {item.type}
                    </span>
                    <span style={{ ...fm, fontSize: 11, color: T.m }}>{item.date}</span>
                </div>

                {/* Title */}
                <h3 style={{ ...sf, fontSize: "clamp(24px,7vw,36px)", fontWeight: 900, color: T.t, margin: "0 0 10px", letterSpacing: "-.04em", lineHeight: 0.95 }}>
                    {item.subRole}
                </h3>
                <div style={{ ...fm, fontSize: 12, color: T.a, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 28, height: 2, background: accent, display: "inline-block" }} />
                    <strong>{item.role}</strong> · {item.company}
                </div>

                {/* Stats row — count-up */}
                <div style={{
                    display: "flex", gap: 0,
                    borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
                    padding: "20px 0", marginBottom: 26,
                    color: T.m,
                }}>
                    {item.stats.map((s, i) => (
                        <div key={i} style={{ flex: 1, borderRight: i < item.stats.length - 1 ? `1px solid ${T.border}` : "none" }}>
                            <MobileCount to={s.val} suffix={s.suffix} label={s.label} color={accent} active={visible} />
                        </div>
                    ))}
                </div>

                {/* Bullets — staggered */}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                    {item.bullets.map((b, i) => (
                        <li key={i} style={{
                            display: "flex", gap: 12, alignItems: "flex-start",
                            opacity: visible ? 1 : 0,
                            transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(12px)",
                            transition: `opacity 0.6s ${index * 110 + 400 + i * 100}ms cubic-bezier(0.16,1,0.3,1), transform 0.6s ${index * 110 + 400 + i * 100}ms cubic-bezier(0.16,1,0.3,1)`,
                        }}>
                            <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: accent, marginTop: 8, boxShadow: `0 0 10px ${accent}40` }} />
                            <span style={{ ...fm, fontSize: 14, lineHeight: 1.8, color: dark ? "rgba(225,232,255,0.9)" : "rgba(45,55,75,0.95)", fontWeight: 450 }}>
                                <HighlightText text={b} accent={accent} />
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Tech tags — staggered pop */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {item.tech.map((t, i) => (
                        <TechPill key={t} label={t} T={T} dark={dark} accent={accent} visible={visible} delay={index * 110 + 700 + i * 40} />
                    ))}
                </div>
            </div>
        </div>
    );
}
