import { useState } from "react";
import { Lines } from "./Motion";
import { Icon } from "./Chrome";
import { useHamburgTime, scrollToId } from "./hooks";
import { useChat } from "./chat";

const EMAIL = "shahriyarfarhan3101@gmail.com";

export default function Hello({ onOpenCv }) {
    const time = useHamburgTime();
    const { ledger } = useChat();
    const [pressed, setPressed] = useState(false);
    const [copied, setCopied] = useState(false);
    const press = () => {
        setPressed(true);
        setTimeout(() => { setPressed(false); window.location.href = `mailto:${EMAIL}?subject=Hello%20Farhan`; }, 420);
    };
    const copy = async () => {
        try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1800); }
        catch { window.location.href = `mailto:${EMAIL}`; }
    };
    return (
        <section id="hello" className="act hello wrap">
            <header className="act-head">
                <span className="act-no neu mono">07</span>
                <div className="act-kicker"><span className="mono">Hello</span><span className="bn">নমস্কার · Moin</span></div>
                <h2 className="act-title"><Lines lines={["Let's build AI", <span className="accent" key="a">people can trust.</span>]} /></h2>
                <p className="act-lede">Open to full-time and working-student roles in AI governance, data engineering and agentic AI. It's {time} in Hamburg.</p>
            </header>

            <div className="hello-grid">
                <button className={`big-btn ${pressed ? "is-pressed" : ""}`} onClick={press} aria-label={`Email ${EMAIL}`}>
                    <span className="big-btn-face">
                        <Icon n="hello" size={34} />
                        <b>Say hello</b>
                        <span className="mono">press me</span>
                    </span>
                </button>
                <div className="hello-side">
                    <div className="hello-card neu">
                        <span className="mono">Email</span>
                        <a href={`mailto:${EMAIL}`} className="hello-mail">{EMAIL}</a>
                        <button className="key key-sm" onClick={copy}>{copied ? "Copied ✓" : "Copy address"}</button>
                    </div>
                    <div className="hello-row">
                        <a className="key" href="https://www.linkedin.com/in/farhanshahriyar" target="_blank" rel="noreferrer">LinkedIn ↗</a>
                        <a className="key" href="https://github.com/Shahriyar31" target="_blank" rel="noreferrer">GitHub ↗</a>
                        <button className="key" onClick={onOpenCv}>Résumé</button>
                    </div>
                </div>
            </div>

            <footer className="foot">
                <span className="mono">© {new Date().getFullYear()} Farhan Shahriyar · Hamburg</span>
                <span className="mono">
                    {ledger.length
                        ? <>My agent wrote {ledger.length} audit {ledger.length === 1 ? "entry" : "entries"} for you · last {ledger[0].hash.slice(0, 8)}…</>
                        : <>Designed &amp; built in Hamburg · <span className="bn">ফ</span></>}
                </span>
                <button className="key key-sm" onClick={() => scrollToId("home")}>Back to top ↑</button>
            </footer>
        </section>
    );
}
