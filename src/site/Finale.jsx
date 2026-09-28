import { useEffect, useState } from "react";
import { Net } from "./NeuroStage";
import { Head } from "./Hero";
import { Fade } from "./Motion";
import { useProgress, mark } from "./progress";
import { useAttack } from "./attack";
import { useHamburgTime, scrollToId } from "./hooks";
import { NAME, EMAIL } from "../data/profile";

/* 06 · Your verdict — the visitor decides, then gets in touch. */
export default function Finale({ onOpenCv, onQuick }) {
    const p = useProgress(), a = useAttack(), time = useHamburgTime();
    const [copied, setCopied] = useState(""), verified = p.verdict?.status === "solved";
    useEffect(() => { Net.brain?.setMood(verified ? 1 : 0); }, [verified]);
    const done = ["build", "legal", "ship"].filter(id => p[id]?.status === "solved").length;
    const brag = a.tries ? `I tried ${a.tries} attack${a.tries === 1 ? "" : "s"} on ${NAME}'s AI and the secret never leaked. Can you break it?` : `${NAME} builds AI you can trust. Try to break it:`;
    const copy = async (text, what) => { try { if (what === "share" && navigator.share) { await navigator.share({ text, url: location.origin }); return; } await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(""), 1800); } catch { /* cancelled */ } };

    return (
        <section id="contact" className="v-sec v-finale is-panel" data-node="6">
            <div className="v-wrap">
                <Head n="06" kicker="Your verdict" title={["So, can you trust", "this AI engineer?"]} />
                <Fade className="v-verdict">
                    <div className="v-verdict-l">
                        <span className="mono">What you checked</span>
                        <ul>
                            <li className={a.tries ? "is-ok" : ""}>{a.tries ? "✓" : "○"} Break my AI {a.tries ? `· ${a.tries} tries, 0 leaks` : <button onClick={() => scrollToId("challenge")}>try it</button>}</li>
                            <li className={done ? "is-ok" : ""}>{done ? "✓" : "○"} Hands-on demos · {done} of 3 {done < 3 && <button onClick={() => scrollToId("what")}>open</button>}</li>
                            <li className="is-ok">✓ Experience and work</li>
                        </ul>
                    </div>
                    {verified
                        ? <div className="v-stamp is-ok is-big mono">Verified<small>by you · {new Date().toLocaleDateString("en-GB")}</small></div>
                        : <button className="v-btn is-ok" onClick={() => mark("verdict", "solved")}>Stamp it: trustworthy ✓</button>}
                </Fade>
                <Fade delay={120} className="v-contact">
                    <p className="v-contact-lead">Open to AI engineering roles: RAG and agents, AI platforms on Azure, AI governance and security.</p>
                    <a className="v-mail" href={`mailto:${EMAIL}?subject=Let's%20talk`}>{EMAIL}</a>
                    <div className="v-ctas">
                        <a className="v-btn is-main" href={`mailto:${EMAIL}?subject=Let's%20talk`}>Email me</a>
                        <button className="v-btn" onClick={() => copy(EMAIL, "mail")}>{copied === "mail" ? "Copied ✓" : "Copy address"}</button>
                        <button className="v-btn" onClick={onOpenCv}>Résumé</button>
                        <button className="v-btn" onClick={onQuick}>Quick read</button>
                        <a className="v-btn" href="https://www.linkedin.com/in/farhanshahriyar" target="_blank" rel="noreferrer">LinkedIn ↗</a>
                        <a className="v-btn" href="https://github.com/Shahriyar31" target="_blank" rel="noreferrer">GitHub ↗</a>
                        <button className="v-btn is-ghost" onClick={() => copy(`${brag} ${location.origin}`, "share")}>{copied === "share" ? "Copied ✓" : "Share the challenge"}</button>
                    </div>
                </Fade>
                <footer className="v-foot mono"><span>© {new Date().getFullYear()} {NAME} · Hamburg · {time}</span><button onClick={() => scrollToId("home")}>Back to top ↑</button></footer>
            </div>
        </section>
    );
}
