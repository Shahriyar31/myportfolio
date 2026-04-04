import { useState, useRef, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { SUGGS } from "../data/constants";

const fm = { fontFamily: "'Inter', sans-serif" };
const sf = { fontFamily: "'Sora', sans-serif" };

// In local dev, fall back to a direct Groq call if VITE_GROQ_KEY is set.
// In production (Vercel), the serverless function at /api/chat handles it.
const DEV_KEY = import.meta.env.VITE_GROQ_KEY;
const DEV_SYSTEM = `You are Farhan Shahriyar's AI assistant. Speak AS Farhan in first person. MSc Data Science @ TUHH Hamburg. Werkstudent at Nordex SE since Aug 2025. Built internal AI assistant: Azure AI Foundry, RAG over 1,690 docs, GPT-4o at 11× lower cost vs GPT-5. Projects: Poultry Shield (97.51% acc), Radiation Tracker, StockFlow. Skills: Python, Azure AI Foundry, RAG, MLOps, Kafka, Docker. Keep under 90 words. Be warm and specific.`;

async function callChat(history) {
    if (DEV_KEY) {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEV_KEY}` },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: DEV_SYSTEM }, ...history],
                max_tokens: 220,
                temperature: 0.72,
            }),
        });
        return res.json();
    }
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
    });
    return res.json();
}

export default function HeroChat({ T }) {
    const { dark } = useTheme();
    const [msgs, setMsgs] = useState([]);
    const [inp, setInp] = useState("");
    const [busy, setBusy] = useState(false);
    const [started, setStarted] = useState(false);
    const hist = useRef([]);
    const scrollRef = useRef(null);

    const scrollToBottom = () => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    };

    const send = useCallback(async txt => {
        if (!txt.trim() || busy) return;
        if (!started) setStarted(true);
        setMsgs(p => [...p, { r: "u", t: txt }]);
        setInp("");
        setBusy(true);
        hist.current = [...hist.current, { role: "user", content: txt }];
        setTimeout(scrollToBottom, 50);
        try {
            const data = await callChat(hist.current);
            if (data.error) throw new Error(data.error);
            const reply = data.choices[0].message.content;
            hist.current = [...hist.current, { role: "assistant", content: reply }];
            setMsgs(p => [...p, { r: "b", t: reply }]);
            setTimeout(scrollToBottom, 50);
        } catch {
            setMsgs(p => [...p, { r: "b", t: "Something went wrong — please try again." }]);
        } finally {
            setBusy(false);
        }
    }, [busy, started]);

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: started ? 380 : 140, transition: "height 0.4s cubic-bezier(0.16,1,0.3,1)", contain: "layout style" }}>

            {/* Messages / suggestions */}
            <div ref={scrollRef} style={{ width: "100%", maxWidth: "clamp(320px,60vw,700px)", flex: started ? "1 1 0" : "0 0 auto", minHeight: 0, overflowY: "auto", marginBottom: 16, display: "flex", flexDirection: "column", gap: 8, padding: "0 4px", scrollbarWidth: "thin", scrollbarColor: `${T.a}40 transparent`, overflowAnchor: "none", overscrollBehavior: "none", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
                {!started && (
                    <div style={{ display: "flex", flexWrap: "nowrap", gap: 8, justifyContent: "flex-start", marginBottom: 12, width: "100%", maxWidth: "clamp(320px,60vw,700px)", overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
                        {SUGGS.map(s => (
                            <button type="button" key={s} onClick={() => send(s)}
                                style={{ ...fm, fontSize: 11, color: T.m, border: `1px solid ${T.border}`, padding: "8px 16px", background: dark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.5)", cursor: "none", transition: "all .22s", borderRadius: 22, whiteSpace: "nowrap", backdropFilter: "blur(8px)" }}
                                onMouseEnter={e => { e.currentTarget.style.color = T.a; e.currentTarget.style.borderColor = T.a; e.currentTarget.style.background = `${T.a}12`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.color = T.m; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = dark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.5)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                {msgs.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start" }}>
                        <div style={{ maxWidth: "82%", fontSize: 13, lineHeight: 1.65, ...fm, background: m.r === "u" ? T.a : dark ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.7)", color: m.r === "u" ? "white" : T.t, padding: "10px 16px", borderRadius: m.r === "u" ? "18px 18px 4px 18px" : "4px 18px 18px 18px", boxShadow: m.r === "b" ? `0 2px 12px ${T.a}20` : "none", border: m.r === "b" ? `1px solid ${T.border}` : "none" }}>{m.t}</div>
                    </div>
                ))}
                {busy && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.7)", padding: "12px 16px", borderRadius: "4px 18px 18px 18px", border: `1px solid ${T.border}`, display: "flex", gap: 5, alignItems: "center" }}>
                            {[0, .2, .4].map(d => <div key={d} style={{ width: 6, height: 6, background: T.a, borderRadius: "50%", animation: `blink 1.1s ${d}s infinite` }} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div style={{ width: "100%", maxWidth: "clamp(320px,60vw,700px)", background: dark ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.85)", border: `1px solid ${T.border}`, borderRadius: 32, padding: "7px 7px 7px 22px", display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(24px)", boxShadow: dark ? "0 8px 40px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06)" : "0 8px 40px rgba(91,33,182,.1),inset 0 1px 0 rgba(255,255,255,.8)", transition: "box-shadow .3s" }}
                onFocus={e => { if (e.target.tagName !== "INPUT") return; e.currentTarget.style.boxShadow = `0 8px 40px ${T.a}25, 0 0 0 1px ${T.a}40`; }}
                onBlur={e => { e.currentTarget.style.boxShadow = dark ? "0 8px 40px rgba(0,0,0,.4)" : "0 8px 40px rgba(91,33,182,.1)"; }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${T.a},${T.a2})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...sf, fontSize: 13, color: "white", fontWeight: 700 }}>F</div>
                <input
                    value={inp}
                    onChange={e => setInp(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(inp); } }}
                    placeholder="Ask Farhan anything..."
                    style={{ flex: 1, background: "transparent", border: "none", color: T.t, padding: "5px 0", ...fm, fontSize: 13, outline: "none", minWidth: 0 }}
                />
                <button type="button" onClick={() => send(inp)} disabled={busy || !inp.trim()}
                    style={{ width: 40, height: 40, borderRadius: "50%", background: (busy || !inp.trim()) ? (dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)") : T.a, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "none", transition: "all .2s", flexShrink: 0, opacity: (busy || !inp.trim()) ? 0.45 : 1, boxShadow: (busy || !inp.trim()) ? "none" : `0 0 16px ${T.a}50` }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={(busy || !inp.trim()) ? T.m : "white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
            <div style={{ ...fm, fontSize: 9, color: T.m, marginTop: 8, letterSpacing: ".06em", opacity: .6, textAlign: "center" }}>
                Powered by Llama 3.3 · Groq
            </div>
        </div>
    );
}
