import SectionHead from "./SectionHead";
import { useEffect, useRef, useState } from "react";
import { useChat, ask, setDraft, cancelDemo, runDemo, openChat } from "./chat";
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
            {msgs.map((m, i) => <p key={i} className={`bubble ${m.r}`}>{m.t}</p>)}
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
                placeholder="Ask my agent anything…"
                aria-label="Message Farhan's agent"
                maxLength={500}
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
        <section id="agent" className="act wrap" ref={ref}>
            <SectionHead n="07" kicker="AI assistant" title="Ask my AI — and see how it thinks" sub="Every answer is checked against a policy and written to a tamper-proof log — the same way I build AI for companies." />
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
                    <div className="device-head"><span className="mono">Live trace</span><span className="chip mono"><span className="dot-live" />running in your browser</span></div>
                    <Trace />
                    <Ledger />
                </div>
            </div>
        </section>
    );
}

/* Floating button + panel for the rest of the page */
export function ChatDock() {
    const { open } = useChat();
    const inputRef = useRef(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
        // Hidden while the hero and the agent section are on screen
        const on = () => {
            const a = document.getElementById("agent");
            const past = a ? a.getBoundingClientRect().bottom < innerHeight * 0.3 : scrollY > innerHeight;
            const nearEnd = scrollY + innerHeight > document.documentElement.scrollHeight - innerHeight * 0.8;
            setShown(past && !nearEnd);
        };
        on();
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
        const esc = e => e.key === "Escape" && openChat(false);
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [open]);
    return (
        <>
            <button className={`dock-btn key ${open || !shown ? "is-hidden" : ""}`} tabIndex={shown ? 0 : -1} onClick={() => { cancelDemo(); openChat(true); }} aria-label="Chat with Farhan's agent">
                <span className="device-led" aria-hidden="true" /><span className="dock-label">Ask my agent</span>
            </button>
            <div className={`dock neu-lg ${open ? "is-open" : ""}`} role="dialog" aria-label="Chat with Farhan's agent" inert={!open}>
                <div className="device-head">
                    <span className="device-led" aria-hidden="true" />
                    <span className="mono">Ask Farhan · agent</span>
                    <button className="key key-sm" onClick={() => openChat(false)}>Close</button>
                </div>
                <Screen />
                <Composer inputRef={inputRef} />
            </div>
        </>
    );
}
