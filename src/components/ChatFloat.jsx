import { useState, useEffect, useRef, useCallback } from "react";

export default function ChatFloat({ T }) {
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([{ r: "b", t: "Hey! I'm Farhan's AI — ask me anything about projects, skills, or experience 👋" }]);
    const [inp, setInp] = useState(""); const [busy, setBusy] = useState(false);
    const [key, setKey] = useState(import.meta.env.VITE_GROQ_KEY || ""); const [showKey, setShowKey] = useState(false); const [started, setStarted] = useState(false);
    const hist = useRef([]); const btm = useRef(null); const dark = T.bg === "#1a1a22";
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const scrollRef = useRef(null);
    useEffect(() => { 
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [msgs, busy]);

    const send = useCallback(async txt => {
        if (!txt.trim() || busy) return;
        if (!key) { setShowKey(true); return; }
        setMsgs(p => [...p, { r: "u", t: txt }]); setInp(""); setBusy(true);
        hist.current = [...hist.current, { role: "user", content: txt }];
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{
                        role: "system",
                        content: "You are Farhan Shahriyar's AI assistant. Speak as Farhan in first person. MSc Data Science @ TUHH Hamburg. Werkstudent at Nordex SE since Aug 2025. Built internal AI assistant: Azure AI Foundry, RAG over 1,690 docs, GPT-4o at 11x lower cost. Projects: Poultry Shield (97.51% acc), Radiation Tracker, StockFlow. Skills: Python, Azure AI Foundry, RAG, MLOps, Kafka, Docker. Keep under 100 words. Be warm and specific."
                    }, ...hist.current],
                    max_tokens: 200, temperature: .72
                })
            });
            const d = await res.json(); if (d.error) throw new Error();
            const reply = d.choices[0].message.content;
            hist.current = [...hist.current, { role: "assistant", content: reply }];
            setMsgs(p => [...p, { r: "b", t: reply }]);
        } catch { setMsgs(p => [...p, { r: "b", t: "Check your Groq API key!" }]); }
        finally { setBusy(false); }
    }, [key, busy]);

    return (
        <>
            {/* Slide-in panel */}
            <div style={{
                position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 599,
                width: open ? 340 : 0,
                transition: "width .35s cubic-bezier(.16,1,.3,1)",
                overflow: "hidden", pointerEvents: open ? "auto" : "none",
            }}>
                <div style={{
                    width: 340, height: "100%", display: "flex", flexDirection: "column",
                    background: dark ? "rgba(10,10,20,0.98)" : "rgba(253,246,237,0.98)",
                    backdropFilter: "blur(28px)",
                    borderLeft: `1px solid ${T.border}`,
                    boxShadow: dark ? "0 0 60px rgba(0,0,0,.8)" : "0 0 60px rgba(139,69,19,.12)",
                }}>
                    {/* Header */}
                    <div style={{ padding: "18px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, background: `linear-gradient(135deg,${T.a}12,${T.a2}08)`, flexShrink: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.a},${T.a2})`, display: "flex", alignItems: "center", justifyContent: "center", ...fm, fontSize: 14, color: "white", fontWeight: 700, flexShrink: 0 }}>F</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ ...sf, fontSize: 14, fontWeight: 700, color: T.t }}>Ask Farhan</div>
                            <div style={{ ...fm, fontSize: 9, color: T.a3, letterSpacing: ".06em" }}>● Llama 3.3 · Groq · Free</div>
                        </div>
                        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: T.m, cursor: "none", fontSize: 18, padding: 4, lineHeight: 1, flexShrink: 0 }}>✕</button>
                    </div>

                    {/* Quick suggestions */}
                    <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
                        {["Nordex AI project", "Best skills", "Open to work?", "TUHH research"].map(s => (
                            <button key={s} onClick={() => send(s)} style={{ ...fm, fontSize: 9, color: T.m, border: `1px solid ${T.border}`, padding: "4px 10px", background: "none", cursor: "none", transition: "all .2s", borderRadius: 12 }}
                                onMouseEnter={e => { e.target.style.color = T.a; e.target.style.borderColor = T.a; e.target.style.background = `${T.a}10`; }}
                                onMouseLeave={e => { e.target.style.color = T.m; e.target.style.borderColor = T.border; e.target.style.background = "none"; }}>
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "thin", scrollbarColor: `${T.a}40 transparent`, overflowAnchor: "none", overscrollBehavior: "none" }}>
                        {msgs.map((m, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                    maxWidth: "87%", fontSize: 12, lineHeight: 1.7, ...fm,
                                    background: m.r === "u" ? T.a : dark ? "rgba(255,255,255,.06)" : "rgba(255,248,235,.9)",
                                    color: m.r === "u" ? "white" : T.t, padding: "10px 14px",
                                    borderRadius: m.r === "u" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                                    border: m.r === "b" ? `1px solid ${T.border}` : "none",
                                    boxShadow: m.r === "b" ? "0 2px 8px rgba(0,0,0,.08)" : "none"
                                }}>{m.t}</div>
                            </div>
                        ))}
                        {busy && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{ background: dark ? "rgba(255,255,255,.06)" : "rgba(255,248,235,.9)", padding: "12px 16px", borderRadius: "4px 16px 16px 16px", border: `1px solid ${T.border}`, display: "flex", gap: 5, alignItems: "center" }}>
                                    {[0, .2, .4].map(d => <div key={d} style={{ width: 6, height: 6, background: T.a, borderRadius: "50%", animation: `blink 1.1s ${d}s infinite` }} />)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* API key */}
                    {showKey && !key && (
                        <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.border}`, background: dark ? "rgba(251,191,36,.05)" : "rgba(251,191,36,.08)", flexShrink: 0 }}>
                            <div style={{ ...fm, fontSize: 9, color: "#d97706", marginBottom: 6 }}>⚡ Paste your free Groq API key (groq.com)</div>
                            <input value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === "Enter" && key && setShowKey(false)} placeholder="gsk_..."
                                style={{ width: "100%", background: "transparent", border: "1px solid rgba(217,119,6,.4)", color: T.t, padding: "7px 12px", ...fm, fontSize: 11, outline: "none", borderRadius: 10 }} />
                        </div>
                    )}

                    {/* Input */}
                    <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0, background: dark ? "rgba(0,0,0,.2)" : "rgba(253,246,237,.6)" }}>
                        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send(inp)}
                            placeholder="Ask me anything..."
                            style={{ flex: 1, background: dark ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.7)", border: `1px solid ${T.border}`, color: T.t, padding: "10px 14px", ...fm, fontSize: 12, outline: "none", borderRadius: 14, transition: "border-color .2s" }}
                            onFocus={e => e.target.style.borderColor = T.a} onBlur={e => e.target.style.borderColor = T.border} />
                        <button onClick={() => send(inp)} disabled={busy || !inp.trim()}
                            style={{ width: 42, height: 42, borderRadius: "50%", background: (busy || !inp.trim()) ? (dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)") : T.a, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "none", transition: "all .2s", flexShrink: 0, opacity: (busy || !inp.trim()) ? 0.4 : 1, boxShadow: (busy || !inp.trim()) ? "none" : `0 0 16px ${T.a}50` }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={(busy || !inp.trim()) ? T.m : "white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab trigger */}
            <button onClick={() => setOpen(o => !o)} style={{
                position: "fixed", right: open ? 340 : 0, bottom: 40, zIndex: 600,
                background: open ? (dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)") : T.a,
                border: open ? `1px solid ${T.border}` : `1px solid ${T.a}`,
                borderRight: "none", borderRadius: "12px 0 0 12px",
                padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                cursor: "none", transition: "right .35s cubic-bezier(.16,1,.3,1), background .2s",
                boxShadow: open ? "none" : `-4px 0 24px ${T.a}50`,
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={open ? T.m : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: open ? T.m : "white", letterSpacing: ".1em", writingMode: "vertical-rl", textOrientation: "mixed", textTransform: "uppercase", transform: "rotate(180deg)" }}>Ask AI</span>
            </button>
        </>
    );
}
