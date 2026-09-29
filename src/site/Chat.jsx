import SectionHead from "./SectionHead";
import { useEffect, useRef, useState } from "react";
import { useChat, ask, setDraft, cancelDemo, runDemo, openChat, describe, redo } from "./chat";
import { Icon } from "./Chrome";
import { useInView } from "./hooks";
import { Lines } from "./Motion";

const QUICK = ["How do you approach AI governance?", "What is Argus AI?", "Your stack?", "Open to work?"];

function Screen({ tall }) {
    const { msgs, typing, busy } = useChat();
    const ref = useRef(null);
    useEffect(() => { const el = ref.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, typing, busy]);
    return (
        <div className={`screen neu-in ${tall ? "is-tall" : ""}`} ref={ref} aria-live="polite" data-lenis-prevent>
            {msgs.map((m, i) => <div key={i} className={`bubble-wrap ${m.r}`}>
                {m.tools?.length > 0 && <p className="bubble-tools mono" aria-label="Tools the agent used">{m.tools.map(t => <span key={t}>{t}</span>)}</p>}
                <p className={`bubble ${m.r}`}>{m.t}</p>
                {m.acts?.length > 0 && <div className="bubble-acts">{m.acts.map((a, k) => <button key={k} onClick={() => redo(a)} title="Do it again"><i aria-hidden="true">↳</i>{describe(a)}<b aria-hidden="true">↻</b></button>)}</div>}
                {m.src?.length > 0 && <p className="bubble-src mono">from my notes: {m.src.map(x => x.title).join(" · ")}</p>}
            </div>)}
            {typing && <p className="bubble b">{typing}<span className="caret" /></p>}
            {busy && !typing && <p className="bubble b dots" aria-label="Thinking"><i /><i /><i /></p>}
        </div>
    );
}

function Composer({ inputRef }) {
    const { draft, busy } = useChat();
    return (
        <form className="composer" onSubmit={e => { e.preventDefault(); ask(draft); }}>
            <input
                ref={inputRef}
                className="neu-in-sm"
                value={draft}
                onFocus={cancelDemo}
                onChange={e => { cancelDemo(); setDraft(e.target.value); }}
                placeholder="Ask anything, or paste a job ad…"
                aria-label="Message Farhan's agent"
                maxLength={4000}
            />
            <button className="key key-accent send" type="submit" disabled={busy || !draft.trim()} aria-label="Send"><Icon n="arrow" size={18} /></button>
        </form>
    );
}

function Trace() {
    const { trace } = useChat();
    return (
        <ol className="trace" aria-label="Agent trace">
            {trace.map((s, i) => (
                <li key={s.id} className={`trace-step is-${s.status}`}>
                    <span className="trace-led neu-in-sm" aria-hidden="true"><i /></span>
                    <span className="trace-n mono">0{i + 1}</span>
                    <span className="trace-label">{s.label}</span>
                    <span className="trace-detail mono">{s.status === "run" ? "running…" : s.detail || "—"}</span>
                </li>
            ))}
        </ol>
    );
}

function Ledger() {
    const { ledger } = useChat();
    return (
        <div className="ledger">
            <div className="ledger-head"><span className="mono">Audit ledger · SHA-256 chain</span><span className="mono">{ledger.length} {ledger.length === 1 ? "entry" : "entries"}</span></div>
            <ol className="ledger-list" data-lenis-prevent>
                {ledger.length === 0 && <li className="ledger-empty mono">No entries yet — ask a question to write the first block.</li>}
                {ledger.map(e => (
                    <li key={e.hash} className="block neu-sm">
                        <span className="mono">#{String(e.n).padStart(3, "0")}</span>
                        <span className="block-q">{e.q}</span>
                        <code className="block-h" title={e.hash}>{e.hash.slice(0, 16)}…</code>
                        <code className="block-p mono" title={e.prev}>prev {e.prev.slice(0, 8)}…</code>
                    </li>
                ))}
            </ol>
        </div>
    );
}

/* Act 01 — the agent, working in the open */
export function AgentSection() {
    const inputRef = useRef(null);
    const { msgs } = useChat();
    const [ref, inView] = useInView({ threshold: 0.35 });
    useEffect(() => { if (inView) runDemo(); }, [inView]);
    useEffect(() => {
        const focus = () => inputRef.current?.focus({ preventScroll: true });
        window.addEventListener("focus-chat", focus);
        return () => window.removeEventListener("focus-chat", focus);
    }, []);
    return (
        <section id="agent" className="act wrap" ref={ref} data-station="sky">
            <SectionHead n="06" kicker="AI assistant" title="Ask my AI — and see how it thinks" sub="Every answer is checked against a policy and written to a tamper-proof log — the same way I build AI for companies." />
            <div className="agent-grid">
                <div className="device neu-lg">
                    <div className="device-head">
                        <span className="device-led" aria-hidden="true" />
                        <span className="mono">Ask Farhan · agent</span>
                        <span className="device-grille" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</span>
                    </div>
                    <Screen tall />
                    {msgs.length <= 5 && <div className="quick">{QUICK.map(q => <button key={q} className="key key-sm" onClick={() => { cancelDemo(); ask(q); }}>{q}</button>)}</div>}
                    <Composer inputRef={inputRef} />
                </div>
                <div className="console neu-lg">
                    <div className="device-head"><span className="mono">Live trace</span><span className="chip mono"><span className="dot-live" />Agent · LangGraph · Groq</span></div>
                    <Trace />
                    <Ledger />
                </div>
            </div>
        </section>
    );
}

/* Floating button + panel for the rest of the page */
/* A question that fits whatever section the visitor is looking at */
const CONTEXT = {
    home: "What does Farhan do?", bring: "What value can he bring to my team?", 
    work: "What did he do at Nordex?", skills: "What's his strongest skill?", built: "What is Argus AI?",
    story: "Why did he move to Germany?", game: "How does he make AI safe?", education: "What did he study?", agent: "How does this AI work?",
    lens: "What does he photograph?", hello: "Is he open to work?",
    what: "What does Farhan build?", break: "How does he make AI safe?", experience: "What did he do at Nordex?", projects: "What is Argus AI?", journey: "Why did he move to Germany?", contact: "Is he open to work?",
};

/* While the agent acts on the page, say so: a pill names the action and the target glows for a moment */
function AgentActs() {
    const [act, setAct] = useState(null);
    useEffect(() => {
        let t = 0;
        const on = e => {
            const d = e.detail || {}; setAct({ ...d, k: Date.now() }); clearTimeout(t); t = setTimeout(() => setAct(null), 3400);
            const el = d.target === "contact" ? document.querySelector(".pl-envelope") : d.target && document.getElementById(d.target);
            if (el) { el.classList.remove("is-agent-lit"); void el.offsetWidth; el.classList.add("is-agent-lit"); setTimeout(() => el.classList.remove("is-agent-lit"), 3200); }
        };
        addEventListener("agent-act", on); return () => { removeEventListener("agent-act", on); clearTimeout(t); };
    }, []);
    return act && <div className="agent-pill" key={act.k} role="status"><span className="agent-pill-dot" aria-hidden="true" /><span className="mono">My AI agent</span>{act.text}</div>;
}

/* Floating assistant, on every screen */
export function ChatDock() {
    const { open } = useChat();
    const inputRef = useRef(null);
    const [section, setSection] = useState("home");
    const [hint, setHint] = useState(true);
    useEffect(() => {
        const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setSection(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
        Object.keys(CONTEXT).forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
        return () => io.disconnect();
    }, []);
    // Suggest a question when entering a section, then tuck it away
    useEffect(() => { setHint(true); const t = setTimeout(() => setHint(false), 7000); return () => clearTimeout(t); }, [section]);
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
        const focus = () => inputRef.current?.focus();
        addEventListener("focus-dock", focus);
        const esc = e => e.key === "Escape" && openChat(false);
        window.addEventListener("keydown", esc);
        return () => { window.removeEventListener("keydown", esc); removeEventListener("focus-dock", focus); };
    }, [open]);
    const q = CONTEXT[section] || CONTEXT.home;
    return (
        <>
            <AgentActs />
            <div className={`dock-wrap ${open ? "is-hidden" : ""}`}>
                {hint && (
                    <div className="dock-hint neu" key={section}>
                        <button className="dock-hint-q" onClick={() => { cancelDemo(); openChat(true); ask(q); }}>
                            <span className="mono">Ask about this</span>{q}
                        </button>
                        <button className="dock-hint-x" onClick={() => setHint(false)} aria-label="Hide suggestion">×</button>
                    </div>
                )}
                <button className="dock-btn key" onClick={() => { cancelDemo(); openChat(true); }} aria-label="Chat with Farhan's AI">
                    <img className="dock-av" src="/images/profile-cartoon.jpg" alt="" /><span className="dock-label">Ask my AI agent</span><span className="device-led" aria-hidden="true" />
                </button>
            </div>
            <div className={`dock neu-lg ${open ? "is-open" : ""}`} data-lenis-prevent role="dialog" aria-label="Chat with Farhan's AI" inert={!open}>
                <div className="device-head">
                    <span className="device-led" aria-hidden="true" />
                    <span className="mono">Farhan's AI agent · live on Groq</span>
                    <button className="key key-sm" onClick={() => openChat(false)}>Close</button>
                </div>
                <Screen />
                <div className="quick"><button className="key key-sm" onClick={() => ask(q)}>{q}</button></div>
                <Composer inputRef={inputRef} />
            </div>
        </>
    );
}
