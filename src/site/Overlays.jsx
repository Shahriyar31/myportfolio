import { useEffect, useRef, useState } from "react";
import { SOCIALS } from "./Chrome";

/* ── Chat: talks to the serverless proxy in api/chat.js (key never reaches the browser) ── */
const QUICK = ["What do you work on?", "What is Argus AI?", "Are you open to work?", "Strongest skills?"];

export function Chat() {
    const [open, setOpen] = useState(false);
    const [shown, setShown] = useState(false); // stays out of the hero's way
    const [msgs, setMsgs] = useState([{ r: "b", t: "Hi — I'm Farhan's AI assistant. Ask me about his work, projects or availability." }]);
    const [inp, setInp] = useState("");
    const [busy, setBusy] = useState(false);
    const hist = useRef([]);
    const logRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Visible between the hero and the contact section (where it would cover content)
        const on = () => {
            const y = window.scrollY, vh = window.innerHeight;
            const nearEnd = y + vh > document.documentElement.scrollHeight - vh * 0.9;
            setShown(y > vh * 0.6 && !nearEnd);
        };
        on();
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);
    useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
        const esc = e => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [open]);

    const send = async txt => {
        txt = txt.trim();
        if (!txt || busy) return;
        setInp("");
        setMsgs(m => [...m, { r: "u", t: txt }]);
        hist.current = [...hist.current, { role: "user", content: txt }].slice(-12);
        setBusy(true);
        try {
            const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: hist.current }) });
            const data = await res.json();
            const reply = data?.choices?.[0]?.message?.content;
            if (!reply) throw new Error();
            hist.current = [...hist.current, { role: "assistant", content: reply }];
            setMsgs(m => [...m, { r: "b", t: reply }]);
        } catch {
            setMsgs(m => [...m, { r: "b", t: "I can't reach the assistant right now — email shahriyarfarhan3101@gmail.com instead." }]);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button className={`chat-fab ${open || !shown ? "is-hidden" : ""}`} tabIndex={shown ? 0 : -1} onClick={() => setOpen(true)} aria-label="Open chat with Farhan's AI assistant"><i />Ask my AI</button>
            <div className={`chat ${open ? "is-open" : ""}`} role="dialog" aria-label="Chat with Farhan's AI assistant" aria-hidden={!open} inert={!open}>
                <div className="chat-head">
                    <div><b>Ask Farhan</b><div className="label">AI assistant · Llama 3.3</div></div>
                    <button className="label" onClick={() => setOpen(false)}>Close ✕</button>
                </div>
                <div className="chat-log" ref={logRef} aria-live="polite" data-lenis-prevent>
                    {msgs.map((m, i) => <div key={i} className={`msg ${m.r}`}>{m.t}</div>)}
                    {busy && <div className="msg b typing" aria-label="Typing"><i /><i /><i /></div>}
                </div>
                {msgs.length < 3 && <div className="chat-quick">{QUICK.map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>}
                <form className="chat-form" onSubmit={e => { e.preventDefault(); send(inp); }}>
                    <input ref={inputRef} value={inp} onChange={e => setInp(e.target.value)} placeholder="Ask anything…" aria-label="Message" maxLength={500} />
                    <button type="submit" disabled={busy || !inp.trim()} aria-label="Send">→</button>
                </form>
            </div>
        </>
    );
}

/* ── CV: shows the PDF if it is deployed, otherwise a graceful fallback ── */
export const RESUME_URL = "/Farhan_Shahriyar_Resume.pdf";

export function CvModal({ open, onClose }) {
    const [ok, setOk] = useState(null);
    useEffect(() => {
        if (!open) return;
        fetch(RESUME_URL, { method: "HEAD" })
            .then(r => setOk(r.ok && (r.headers.get("content-type") || "").includes("pdf")))
            .catch(() => setOk(false));
        const esc = e => e.key === "Escape" && onClose();
        window.addEventListener("keydown", esc);
        window.__lenis?.stop();
        document.body.classList.add("is-locked");
        return () => { window.removeEventListener("keydown", esc); window.__lenis?.start(); document.body.classList.remove("is-locked"); };
    }, [open, onClose]);
    if (!open) return null;
    return (
        <div className="cv" role="dialog" aria-modal="true" aria-label="Résumé" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="cv-card">
                <div className="cv-bar">
                    <span className="label">Résumé — Farhan Shahriyar</span>
                    <div style={{ display: "flex", gap: 18 }}>
                        {ok && <a className="label" href={RESUME_URL} download>Download ↓</a>}
                        <button className="label" onClick={onClose} autoFocus>Close ✕</button>
                    </div>
                </div>
                {ok ? <iframe title="Résumé PDF" src={RESUME_URL} /> : (
                    <div className="cv-empty">
                        <span className="label">{ok === null ? "Loading…" : "On request"}</span>
                        {ok === false && <>
                            <h3>Happy to send my CV.</h3>
                            <div className="row">
                                <a className="btn btn-solid btn-sm" href="mailto:shahriyarfarhan3101@gmail.com?subject=CV%20request">Request by email</a>
                                <a className="btn btn-ghost btn-sm" href={SOCIALS[1][1]} target="_blank" rel="noreferrer">LinkedIn ↗</a>
                            </div>
                        </>}
                    </div>
                )}
            </div>
        </div>
    );
}
