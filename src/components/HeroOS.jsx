import { useState, useEffect, useRef, useCallback } from "react";
import { SUGGS } from "../data/constants";

const fm   = { fontFamily: "'Inter', sans-serif" };
const mono = { fontFamily: "'Fira Code', monospace" };
const sf   = { fontFamily: "'Sora', sans-serif" };

// ── API ───────────────────────────────────────────────────────────────────────
const DEV_KEY = import.meta.env.VITE_GROQ_KEY;
const SYS     = `You are Farhan Shahriyar's AI assistant. Speak AS Farhan in first person. MSc Data Science @ TUHH Hamburg. Werkstudent at Nordex SE since Aug 2025. Built internal AI assistant: Azure AI Foundry, RAG over 1,690 docs, GPT-4o at 11× lower cost vs GPT-5. Projects: Poultry Shield (97.51% acc), Radiation Tracker, StockFlow. Skills: Python, Azure AI Foundry, RAG, MLOps, Kafka, Docker. Keep under 90 words. Be warm and specific.`;

async function callChat(history) {
    if (DEV_KEY) {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEV_KEY}` },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: SYS }, ...history], max_tokens: 220, temperature: 0.72 }),
        });
        return r.json();
    }
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) });
    return r.json();
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const PROJECTS = [
    {
        icon: "🤖", color: "#3b82f6", badge: "PRODUCTION", badgeClr: "#4ade80", link: null,
        title: "Internal AI Assistant",
        sub: "Nordex SE · Azure AI Foundry · Aug 2025 – Present",
        desc: "End-to-end RAG pipeline over 1,690 internal documents. Custom rapidfuzz tool router solving a core Azure AI Foundry limitation. Delivered 11× lower cost vs GPT-5 with 4× faster inference.",
        tags: ["Azure AI Foundry", "RAG", "GPT-4o", "Python", "Docker"],
        metric: "11× cost · 4× faster · 1,690 docs",
    },
    {
        icon: "🐔", color: "#10b981", badge: "97.51% ACC", badgeClr: "#10b981", link: "https://github.com/Shahriyar31/Poultry_Shield-Deep-Learning-for-Poultry-Coccidiosis-Diagnosis",
        title: "Poultry Shield",
        sub: "AI Veterinary Diagnostics · AWS EC2 · Flask",
        desc: "CNN achieving 97.51% diagnostic accuracy on Coccidiosis detection. Flask + OpenCV deployed on AWS EC2, reducing diagnosis time by 40% with no veterinary domain knowledge.",
        tags: ["TensorFlow", "Flask", "AWS EC2", "OpenCV", "Python"],
        metric: "97.51% accuracy · −40% diagnosis time",
    },
    {
        icon: "🔬", color: "#8b5cf6", badge: "RESEARCH", badgeClr: "#8b5cf6", link: "https://github.com/rkraeuter/DigitalTwinGF3",
        title: "Digital Twin Dashboard",
        sub: "TUHH Research · Real-Time Anomaly Detection",
        desc: "Real-time anomaly detection & forecasting for a digital twin simulation. Full CI/CD pipeline via GitHub Actions + Docker. Built for active research use.",
        tags: ["Python", "Dash", "Plotly", "Docker", "Scikit-learn"],
        metric: "Real-time · CI/CD · Docker · Research",
    },
    {
        icon: "☢️", color: "#f59e0b", badge: "STREAMING", badgeClr: "#f59e0b", link: "https://github.com/Shahriyar31/Radiaton_Tracking",
        title: "Radiation Tracker",
        sub: "GCP · Apache Kafka · Apache Flink",
        desc: "GCP streaming platform processing radiation sensor data with Apache Kafka & Flink. Fully containerised with Docker Compose for production-like deployment.",
        tags: ["Apache Kafka", "Apache Flink", "GCP", "Docker", "Node.js"],
        metric: "Real-time streaming · GCP · Kafka",
    },
];

const INSIGHTS = [
    { icon: "⚡", color: "#f59e0b", tag: "Architecture",
      title: "Built the router Azure couldn't ship",
      stat: "200+", statLabel: "Internal users",
      body: "Azure AI Foundry had no native cost-aware routing. I designed and shipped a custom rapidfuzz tool router from scratch — the workaround that unlocked the whole system. Deployed to 200+ Nordex employees with zero extra infrastructure cost.",
      tech: ["Azure AI Foundry", "rapidfuzz", "Python", "LLM Eval", "RAG"] },
    { icon: "💸", color: "#4ade80", tag: "ROI",
      title: "11× cheaper. 4× faster. In production.",
      stat: "11×", statLabel: "Cost reduction",
      body: "Swapped expensive GPT-5 direct calls for an evaluated GPT-4o pipeline with smarter retrieval. Not a demo, not a benchmark — this runs every single day at a Fortune 500 wind energy company serving real users.",
      tech: ["GPT-4o", "Azure AI", "RAG", "LLM Eval", "Python", "Docker"] },
    { icon: "🧠", color: "#a78bfa", tag: "ML Engineering",
      title: "97.5% accuracy. Zero domain knowledge.",
      stat: "97.51%", statLabel: "CNN accuracy",
      body: "Built a Coccidiosis detection model from scratch without any veterinary background. Pure engineering: TensorFlow, OpenCV, iterative training. Cut a vet's 30-minute diagnosis to under 3 seconds. Deployed on AWS EC2.",
      tech: ["TensorFlow", "CNN", "OpenCV", "Flask", "AWS EC2", "Python"] },
    { icon: "🌊", color: "#38bdf8", tag: "Data Engineering",
      title: "Real-time or nothing.",
      stat: "3", statLabel: "Streaming stacks",
      body: "Built three independent real-time streaming systems across different cloud providers — Kafka + Flink on GCP, Apache Kafka on AWS, Azure Databricks pipelines. Batch processing was never fast enough for the problems I chose to solve.",
      tech: ["Apache Kafka", "Apache Flink", "GCP", "Azure Databricks", "Docker"] },
    { icon: "🌍", color: "#f472b6", tag: "Story",
      title: "India → Hamburg at 22. Alone.",
      stat: "8.73", statLabel: "B.Tech CGPA",
      body: "Left West Bengal with a B.Tech (top 10%, 8.73 CGPA) and enrolled at TUHH Hamburg — alone, without contacts, in a new country. Within months, landed a Werkstudent role at Nordex SE and started building production AI from scratch. That's the mindset.",
      tech: ["TUHH Hamburg", "Nordex SE", "MSc Data Science", "Top 10%"] },
    { icon: "✅", color: "#34d399", tag: "Availability",
      title: "Available NOW — Hamburg 🇩🇪",
      stat: "NOW", statLabel: "Start date",
      body: "Open to full-time AI/Data Engineering roles and Werkstudent positions in Germany. Already here, no visa wait. Fluent English, conversational German, native Bengali. Ready to ship on day one.",
      tech: ["Full-time", "Werkstudent", "Hamburg", "Germany", "Immediately"] },
];

const CMD_INDEX = [
    { type: "project",  icon: "🤖", label: "Internal AI Assistant",          sub: "Nordex SE · RAG · 11× cheaper" },
    { type: "project",  icon: "🐔", label: "Poultry Shield",                  sub: "CNN · 97.51% accuracy · AWS" },
    { type: "project",  icon: "🔬", label: "Digital Twin Dashboard",          sub: "TUHH Research · CI/CD · Docker" },
    { type: "project",  icon: "☢️", label: "Radiation Tracker",               sub: "GCP · Kafka · Flink · Streaming" },
    { type: "project",  icon: "📈", label: "StockFlow",                       sub: "Kafka · AWS S3 · AWS Glue" },
    { type: "skill",    icon: "☁️", label: "Azure AI Foundry",                sub: "RAG, GPT-4o, LLM evaluation" },
    { type: "skill",    icon: "⚡", label: "Apache Kafka",                    sub: "Event streaming · 3 projects" },
    { type: "skill",    icon: "🐳", label: "Docker & Kubernetes",             sub: "Containerisation · CI/CD" },
    { type: "skill",    icon: "🐍", label: "Python",                          sub: "Primary language · 5+ years" },
    { type: "skill",    icon: "🔥", label: "Spark / Flink",                   sub: "Distributed & streaming" },
    { type: "fact",     icon: "📍", label: "Hamburg, Germany 🇩🇪",            sub: "Available NOW · Full-time & Werkstudent" },
    { type: "fact",     icon: "🎓", label: "MSc Data Science @ TUHH",         sub: "Hamburg University of Technology" },
    { type: "fact",     icon: "🏢", label: "Werkstudent @ Nordex SE",         sub: "Fortune 500 · Production AI" },
    { type: "contact",  icon: "📧", label: "shahriyarfarhan3101@gmail.com",   sub: "Email" },
    { type: "contact",  icon: "💼", label: "linkedin.com/in/farhanshahriyar", sub: "LinkedIn" },
    { type: "contact",  icon: "🐙", label: "github.com/Shahriyar31",          sub: "GitHub" },
];
const TYPE_CLR = { project: "#3b82f6", skill: "#8b5cf6", fact: "#10b981", contact: "#f59e0b" };

// ── CLOCK ─────────────────────────────────────────────────────────────────────
function useClock() {
    const fmt = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const [t, setT] = useState(fmt);
    useEffect(() => { const iv = setInterval(() => setT(fmt()), 15000); return () => clearInterval(iv); }, []);
    return t;
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onSelect, onCmd, T }) {
    const NAV = [
        { id: "chat",     icon: "🤖", label: "AI Chat"  },
        { id: "projects", icon: "📁", label: "Projects" },
        { id: "insights", icon: "💡", label: "Insights" },
    ];
    return (
        <div style={{ width: 64, borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "stretch", background: "rgba(0,0,0,0.25)", flexShrink: 0 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 10, gap: 2 }}>
                {NAV.map(({ id, icon, label }) => (
                    <button key={id} onClick={() => onSelect(id)} title={label}
                        style={{ width: "100%", height: 60, background: active === id ? "rgba(255,255,255,0.07)" : "transparent", border: "none", borderLeft: `3px solid ${active === id ? T.a : "transparent"}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, transition: "all .15s" }}
                        onMouseEnter={e => { if (active !== id) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderLeftColor = "rgba(255,255,255,0.15)"; } }}
                        onMouseLeave={e => { if (active !== id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; } }}
                    >
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <span style={{ ...fm, fontSize: 9, color: active === id ? T.a : "rgba(255,255,255,0.3)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: active === id ? 600 : 400 }}>{label}</span>
                    </button>
                ))}
            </div>
            {/* ⌘K at bottom */}
            <button onClick={onCmd} title="Search (⌘K)"
                style={{ width: "100%", height: 52, background: "transparent", border: "none", borderLeft: "3px solid transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 8, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
                <span style={{ ...mono, fontSize: 15, color: "rgba(255,255,255,0.28)" }}>⌘K</span>
                <span style={{ ...fm, fontSize: 9, color: "rgba(255,255,255,0.22)", letterSpacing: ".06em", textTransform: "uppercase" }}>search</span>
            </button>
        </div>
    );
}

// ── CHAT PANEL ────────────────────────────────────────────────────────────────
const WELCOME_TEXT = "Hey 👋 I'm Farhan's AI — ask me about his work at Nordex, his projects, or why you should hire him!";

function ChatPanel({ T }) {
    const [msgs,    setMsgs]    = useState([]);
    const [inp,     setInp]     = useState("");
    const [busy,    setBusy]    = useState(false);
    const [started, setStarted] = useState(false);
    const hist    = useRef([]);
    const endRef  = useRef(null);
    const inputRef = useRef(null);

    // Type-in welcome message
    useEffect(() => {
        let i = 0;
        const iv = setInterval(() => {
            i++;
            setMsgs([{ r: "b", t: WELCOME_TEXT.slice(0, i), welcome: true }]);
            if (i >= WELCOME_TEXT.length) clearInterval(iv);
        }, 16);
        return () => clearInterval(iv);
    }, []);

    const scroll = () => setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 40);

    const send = useCallback(async (txt) => {
        if (!txt.trim() || busy) return;
        setStarted(true);
        setMsgs(p => [...p.filter(m => !m.welcome), { r: "u", t: txt }]);
        setInp("");
        setBusy(true);
        hist.current = [...hist.current, { role: "user", content: txt }];
        scroll();
        try {
            const data  = await callChat(hist.current);
            if (data.error) throw new Error();
            const reply = data.choices[0].message.content;
            hist.current = [...hist.current, { role: "assistant", content: reply }];
            setMsgs(p => [...p, { r: "b", t: reply }]);
            scroll();
        } catch {
            setMsgs(p => [...p, { r: "b", t: "Something went wrong — please try again." }]);
        } finally { setBusy(false); }
    }, [busy]);

    const CHIPS = [
        { emoji: "🏭", text: "What did you build at Nordex?" },
        { emoji: "🧠", text: "Your strongest skill?" },
        { emoji: "💼", text: "Open to work?" },
        { emoji: "🎓", text: "Research at TUHH?" },
    ];

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "24px 28px 22px" }}>
            {/* Header */}
            <div style={{ marginBottom: 20, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "pulseDot 2s infinite" }} />
                    <span style={{ ...sf, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>Ask Farhan anything</span>
                </div>
                <p style={{ ...fm, fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0 18px" }}>Powered by Llama 3.3 · Groq — real answers, not canned responses</p>
            </div>

            {/* Quick action chips — large, 2×2 grid */}
            {!started && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20, flexShrink: 0 }}>
                    {CHIPS.map(({ emoji, text }) => (
                        <button key={text} onClick={() => send(text)}
                            style={{ ...fm, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", padding: "12px 16px", borderRadius: 10, cursor: "pointer", transition: "all .2s", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}
                            onMouseEnter={e => { e.currentTarget.style.color = T.a; e.currentTarget.style.borderColor = T.a + "55"; e.currentTarget.style.background = T.a + "10"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "none"; }}
                        >
                            <span style={{ fontSize: 16 }}>{emoji}</span>
                            {text}
                        </button>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent", minHeight: 0 }}>
                {msgs.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start", animation: "msgIn .22s ease-out" }}>
                        <div style={{ maxWidth: "78%", ...fm, fontSize: 13, lineHeight: 1.7, padding: "11px 16px", borderRadius: m.r === "u" ? "18px 18px 4px 18px" : "4px 18px 18px 18px", background: m.r === "u" ? T.a : "rgba(255,255,255,0.06)", color: m.r === "u" ? "#fff" : "rgba(255,255,255,0.87)", border: m.r === "b" ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                            {m.t}
                            {m.welcome && m.t.length < WELCOME_TEXT.length && (
                                <span style={{ display: "inline-block", width: 2, height: 14, background: T.a, marginLeft: 2, verticalAlign: "middle", animation: "cursorBlink .9s step-end infinite" }} />
                            )}
                        </div>
                    </div>
                ))}
                {busy && (
                    <div style={{ display: "flex" }}>
                        <div style={{ background: "rgba(255,255,255,0.06)", padding: "12px 18px", borderRadius: "4px 18px 18px 18px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 5, alignItems: "center" }}>
                            {[0,.15,.3].map(d => <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: T.a, animation: `chatDot 1.1s ${d}s ease-in-out infinite` }} />)}
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ flexShrink: 0, marginTop: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "10px 10px 10px 18px", transition: "border-color .2s" }}
                    onFocusCapture={e => e.currentTarget.style.borderColor = T.a + "70"}
                    onBlurCapture={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
                >
                    <input ref={inputRef} value={inp} onChange={e => setInp(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(inp); } }}
                        placeholder="Ask me anything about Farhan…"
                        style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.9)", ...fm, fontSize: 13 }}
                    />
                    <button onClick={() => send(inp)} disabled={busy || !inp.trim()}
                        style={{ width: 38, height: 38, borderRadius: 10, background: !busy && inp.trim() ? T.a : "rgba(255,255,255,0.07)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: !busy && inp.trim() ? "pointer" : "not-allowed", transition: "all .2s", opacity: !busy && inp.trim() ? 1 : .4, boxShadow: !busy && inp.trim() ? `0 0 18px ${T.a}55` : "none", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={!busy && inp.trim() ? "#fff" : "rgba(255,255,255,0.4)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── PROJECTS PANEL ────────────────────────────────────────────────────────────
function ProjectsPanel({ T }) {
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "24px 28px 16px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexShrink: 0 }}>
                <div>
                    <span style={{ ...sf, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>Projects</span>
                    <span style={{ ...fm, fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 10 }}>4 of 6 shown</span>
                </div>
                <a href="https://github.com/Shahriyar31" target="_blank" rel="noreferrer"
                    style={{ ...fm, fontSize: 11, color: "rgba(255,255,255,0.38)", textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = T.a}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.38)"}
                >All projects on GitHub →</a>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent", paddingRight: 4 }}>
                {PROJECTS.map((p, i) => (
                    <div key={i}
                        onClick={() => p.link && window.open(p.link, "_blank")}
                        style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${p.color}25`, background: `${p.color}0c`, cursor: p.link ? "pointer" : "default", transition: "all .22s", animation: `slideIn .3s ${i * .06}s both`, flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "50"; e.currentTarget.style.background = p.color + "16"; e.currentTarget.style.transform = "translateX(4px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = p.color + "25"; e.currentTarget.style.background   = p.color + "0c"; e.currentTarget.style.transform = "none"; }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{p.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Title row */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                                    <span style={{ ...sf, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{p.title}</span>
                                    <span style={{ ...mono, fontSize: 9, color: p.badgeClr, background: `${p.badgeClr}18`, padding: "2px 7px", borderRadius: 4, letterSpacing: ".06em", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                                        {p.badge === "PRODUCTION" && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: p.badgeClr, animation: "pulseDot 2s infinite" }} />}
                                        {p.badge}
                                    </span>
                                </div>
                                <div style={{ ...fm, fontSize: 10, color: "rgba(255,255,255,0.38)", marginBottom: 6 }}>{p.sub}</div>
                                <div style={{ ...fm, fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 8 }}>{p.desc}</div>
                                {/* Tags + metric */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                        {p.tags.slice(0, 4).map(t => (
                                            <span key={t} style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 4 }}>{t}</span>
                                        ))}
                                    </div>
                                    <span style={{ ...mono, fontSize: 10, color: p.color, background: `${p.color}14`, padding: "3px 10px", borderRadius: 5, flexShrink: 0 }}>{p.metric}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── INSIGHTS PANEL ────────────────────────────────────────────────────────────
function InsightsPanel({ T }) {
    const [idx,     setIdx]     = useState(0);
    const [visible, setVisible] = useState(true);
    const [dir,     setDir]     = useState(1); // 1 = forward, -1 = back
    const timerRef = useRef(null);

    const goTo = useCallback((next, direction = 1) => {
        setDir(direction);
        setVisible(false);
        setTimeout(() => { setIdx(next); setVisible(true); }, 320);
    }, []);

    const next = useCallback(() => goTo((idx + 1) % INSIGHTS.length, 1), [idx, goTo]);
    const prev = useCallback(() => goTo((idx - 1 + INSIGHTS.length) % INSIGHTS.length, -1), [idx, goTo]);

    // Auto-advance every 5s
    useEffect(() => {
        timerRef.current = setInterval(next, 5000);
        return () => clearInterval(timerRef.current);
    }, [next]);

    const ins = INSIGHTS[idx];

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 32px 24px", overflow: "hidden" }}>

            {/* Animated content */}
            <div style={{ flex: 1, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : `translateY(${dir * 10}px)`, transition: "opacity .32s ease, transform .32s ease", display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}>

                {/* Tag */}
                <div style={{ marginBottom: 16, flexShrink: 0 }}>
                    <span style={{ ...mono, fontSize: 10, color: ins.color, letterSpacing: ".14em", textTransform: "uppercase", padding: "3px 10px", border: `1px solid ${ins.color}40`, borderRadius: 20, background: `${ins.color}12` }}>{ins.tag}</span>
                </div>

                {/* Title + Stat side by side */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 20, flexShrink: 0 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 32 }}>{ins.icon}</span>
                            <h3 style={{ ...sf, fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.95)", margin: 0, lineHeight: 1.25 }}>{ins.title}</h3>
                        </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ ...mono, fontSize: 38, fontWeight: 800, color: ins.color, lineHeight: 1, letterSpacing: "-.02em" }}>{ins.stat}</div>
                        <div style={{ ...fm, fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 3, textTransform: "uppercase", letterSpacing: ".08em" }}>{ins.statLabel}</div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: `linear-gradient(90deg, ${ins.color}30, transparent)`, marginBottom: 18, flexShrink: 0 }} />

                {/* Body */}
                <p style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, margin: 0, flex: 1 }}>{ins.body}</p>

                {/* Tech pills */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 18, flexShrink: 0 }}>
                    {ins.tech.map(t => (
                        <span key={t} style={{ ...mono, fontSize: 10, color: ins.color, background: `${ins.color}14`, border: `1px solid ${ins.color}28`, padding: "3px 10px", borderRadius: 5 }}>{t}</span>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexShrink: 0, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={prev}
                    style={{ ...fm, fontSize: 12, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", transition: "all .18s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = ins.color; e.currentTarget.style.borderColor = ins.color + "50"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >← Prev</button>

                {/* Dot nav */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {INSIGHTS.map((ins2, i) => (
                        <button key={i} onClick={() => { clearInterval(timerRef.current); goTo(i, i > idx ? 1 : -1); timerRef.current = setInterval(next, 5000); }}
                            style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, background: i === idx ? ins.color : "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", transition: "all .35s ease", padding: 0 }}
                        />
                    ))}
                </div>

                <button onClick={next}
                    style={{ ...fm, fontSize: 12, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", transition: "all .18s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = ins.color; e.currentTarget.style.borderColor = ins.color + "50"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >Next →</button>
            </div>
        </div>
    );
}

// ── COMMAND PALETTE ───────────────────────────────────────────────────────────
function CmdPalette({ open, onClose, T }) {
    const [q,   setQ]   = useState("");
    const [sel, setSel] = useState(0);
    const ref = useRef(null);

    const res = q.trim()
        ? CMD_INDEX.filter(c => (c.label + " " + c.sub).toLowerCase().includes(q.toLowerCase()))
        : CMD_INDEX.slice(0, 8);

    useEffect(() => {
        if (open) { setQ(""); setSel(0); setTimeout(() => ref.current?.focus(), 60); }
    }, [open]);

    useEffect(() => {
        const fn = (e) => {
            if (!open) return;
            if (e.key === "Escape")    onClose();
            if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, res.length - 1)); }
            if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
        };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [open, res.length, onClose]);

    if (!open) return null;
    return (
        <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)", borderRadius: 18, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 60 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "82%", maxWidth: 520, background: "rgba(14,18,30,0.99)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.9)", animation: "cmdIn .18s ease-out" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input ref={ref} value={q} onChange={e => { setQ(e.target.value); setSel(0); }} placeholder="Search projects, skills, facts…"
                        style={{ flex: 1, background: "transparent", border: "none", color: "rgba(255,255,255,0.9)", ...fm, fontSize: 14, outline: "none" }} />
                    <span style={{ ...mono, fontSize: 10, color: "rgba(255,255,255,0.22)", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 5 }}>ESC</span>
                </div>
                <div style={{ maxHeight: 300, overflowY: "auto", scrollbarWidth: "none" }}>
                    {res.length === 0
                        ? <div style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "24px 0" }}>No results for "{q}"</div>
                        : res.map((r, i) => (
                            <div key={i} onMouseEnter={() => setSel(i)}
                                style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 18px", background: sel === i ? "rgba(255,255,255,0.06)" : "transparent", borderLeft: `2px solid ${sel === i ? (TYPE_CLR[r.type] || T.a) : "transparent"}`, cursor: "pointer", transition: "background .1s" }}>
                                <span style={{ fontSize: 18 }}>{r.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ ...fm, fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 500, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{r.label}</div>
                                    <div style={{ ...fm, fontSize: 11, color: "rgba(255,255,255,0.38)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{r.sub}</div>
                                </div>
                                <span style={{ ...fm, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: TYPE_CLR[r.type] || "rgba(255,255,255,0.3)", flexShrink: 0 }}>{r.type}</span>
                            </div>
                        ))
                    }
                </div>
                <div style={{ ...mono, fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "9px 18px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 18 }}>
                    <span>↑↓ navigate</span><span>ESC close</span>
                </div>
            </div>
        </div>
    );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function HeroOS({ T }) {
    const [panel,   setPanel]  = useState("chat");
    const [cmdOpen, setCmdOpen] = useState(false);
    const clock = useClock();

    useEffect(() => {
        const fn = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(o => !o); } };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, []);

    return (
        <div style={{ width: "100%", maxWidth: 820, position: "relative", animation: "fadeUp 1.2s cubic-bezier(.2,.8,.2,1) both" }}>
            <div style={{ height: 600, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#080c16", boxShadow: "0 50px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)", position: "relative" }}>

                {/* Wallpaper */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", zIndex: 0 }} />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 40%, rgba(59,130,246,0.08), transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(139,92,246,0.06), transparent 45%)", pointerEvents: "none", zIndex: 0 }} />

                {/* Menu bar */}
                <div style={{ position: "relative", zIndex: 10, height: 36, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56" }} />
                        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
                        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f"  }} />
                    </div>
                    <span style={{ flex: 1, textAlign: "center", ...mono, fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: ".05em" }}>farhan@portfolio</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ ...mono, fontSize: 11, color: "rgba(255,255,255,0.22)" }}>{clock}</span>
                        <button onClick={() => setCmdOpen(true)}
                            style={{ ...mono, fontSize: 10, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "3px 10px", cursor: "pointer", transition: "all .2s" }}
                            onMouseEnter={e => { e.currentTarget.style.color = T.a; e.currentTarget.style.borderColor = T.a + "55"; e.currentTarget.style.background = T.a + "15"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                        >⌘K</button>
                    </div>
                </div>

                {/* App area: sidebar + content */}
                <div style={{ position: "relative", zIndex: 1, display: "flex", height: "calc(100% - 36px)" }}>
                    <Sidebar active={panel} onSelect={setPanel} onCmd={() => setCmdOpen(true)} T={T} />
                    <div key={panel} style={{ flex: 1, overflow: "hidden", animation: "panelIn .22s ease-out" }}>
                        {panel === "chat"     && <ChatPanel     T={T} />}
                        {panel === "projects" && <ProjectsPanel T={T} />}
                        {panel === "insights" && <InsightsPanel T={T} />}
                    </div>
                </div>

                <CmdPalette open={cmdOpen} onClose={() => setCmdOpen(false)} T={T} />
            </div>

            {/* Ambient glow */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "80%", height: "80%", background: `linear-gradient(135deg,${T.a}1a,#8b5cf614)`, filter: "blur(90px)", opacity: .7, pointerEvents: "none", zIndex: -1 }} />

            <style>{`
                @keyframes chatDot    { 0%,80%,100%{transform:scale(.7);opacity:.4} 40%{transform:scale(1.1);opacity:1} }
                @keyframes cursorBlink{ 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes msgIn      { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
                @keyframes slideIn    { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
                @keyframes cmdIn      { from{opacity:0;transform:translateY(-10px) scale(.97)} to{opacity:1;transform:none} }
                @keyframes panelIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
                @keyframes pulseDot   { 0%,100%{opacity:.5;transform:scale(.85)} 50%{opacity:1;transform:scale(1.2)} }
            `}</style>
        </div>
    );
}
