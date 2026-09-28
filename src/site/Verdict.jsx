import { useState } from "react";
import Stop from "./Stop";
import { useProgress, mark } from "./progress";
import { useAttack } from "./attack";
import { scrollToId } from "./hooks";
import { NAME, EMAIL } from "../data/profile";

/* 08:00 — go live. The visitor's on-call report, then they stamp the audit from the front door. */

const ITEMS = [
    ["build", "06:00", "Build it", "RAG agent answers from approved sources", "incident-build"],
    ["legal", "07:00", "Keep it legal", "AI ideas sorted by EU AI Act risk", "incident-legal"],
    ["ship", "07:30", "Ship it safely", "Secure release through the pipeline", "incident-ship"],
];

export default function Verdict({ onOpenCv }) {
    const p = useProgress(), a = useAttack();
    const [copied, setCopied] = useState(false);
    const verified = p.verdict?.status === "solved";
    const solved = ITEMS.filter(([id]) => p[id]?.status === "solved").length;
    const url = typeof location !== "undefined" ? location.origin : "";
    const brag = a.tries ? `I tried ${a.tries} attack${a.tries === 1 ? "" : "s"} on ${NAME}'s AI and the secret never leaked. Can you break it?` : `I just did ${NAME}'s job for two minutes: built a RAG agent, kept it legal and shipped it safely.`;

    const share = async () => {
        const text = `${brag} ${url}`;
        try { if (navigator.share) { await navigator.share({ text, url }); return; } await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* cancelled */ }
    };

    return (
        <section id="verdict" aria-label="08:00 verdict">
            <Stop station="dawn" side="left" wide>
                <div className="inc-kick mono"><span className="inc-clock is-live">08:00</span><span>Go live · your on-call report</span></div>
                <h3 className="pane-title">The sun is up. The AI is live. Did it hold?</h3>

                <ul className="vd-list">
                    {ITEMS.map(([id, t, name, what, sec]) => {
                        const s = p[id]?.status;
                        return <li key={id} className={s ? `is-${s}` : ""}>
                            <span className="mono">{t}</span><b>{name}</b><small>{s === "solved" ? p[id].score : s === "skipped" ? "skipped" : what}</small>
                            {s === "solved" ? <i aria-label="solved">✓</i> : <button className="mono" onClick={() => scrollToId(sec)}>{s ? "retry" : "play"}</button>}
                        </li>;
                    })}
                    <li className={a.tries ? "is-solved" : ""}>
                        <span className="mono">anytime</span><b>Break my AI</b><small>{a.tries ? `${a.tries} attempts · ${a.blocked} blocked · secret leaked never` : "try to leak the secret code"}</small>
                        {a.tries ? <i aria-label="done">✓</i> : <button className="mono" onClick={() => scrollToId("home")}>play</button>}
                    </li>
                </ul>

                <div className={`vd-stampbox ${verified ? "is-on" : ""}`}>
                    <div>
                        <span className="mono">The report said: high impact · low risk</span>
                        <p>{solved === 3 ? "You ran the whole shift. Your call:" : solved ? `You ran ${solved} of 3 incidents. Your call:` : "You've seen the claims. Your call:"}</p>
                    </div>
                    {verified
                        ? <div className="vd-stamp mono" aria-live="polite">Verified<small>by you · {new Date().toLocaleDateString("en-GB")}</small></div>
                        : <button className="vd-do" onClick={() => mark("verdict", "solved")}>Stamp it: trustworthy ✓</button>}
                </div>

                <div className="vd-actions">
                    <a className="bi-ask" href={`mailto:${EMAIL}?subject=Let's talk`}>Hire me: let's talk</a>
                    <button className="fd-btn vd-ghost" onClick={onOpenCv}>Résumé</button>
                    <button className="fd-btn vd-ghost" onClick={share}>{copied ? "Copied ✓" : "Share your score"}</button>
                </div>
                <p className="vd-brag">“{brag}”</p>
            </Stop>
        </section>
    );
}
