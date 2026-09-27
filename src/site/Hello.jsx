import SectionHead from "./SectionHead";
import { useState } from "react";
import { Lines } from "./Motion";
import { Icon } from "./Chrome";
import { useHamburgTime, scrollToId } from "./hooks";
import { useChat } from "./chat";
import { useGame, ACHIEVEMENTS, SECTION_IDS, level, unlock } from "./game";

const EMAIL = "shahriyarfarhan3101@gmail.com";

/* The end screen of the game: what this visitor discovered */
function ReportCard() {
    const g = useGame();
    const pct = Math.round((g.seen.filter(s => SECTION_IDS.includes(s)).length / SECTION_IDS.length) * 100);
    const stats = [["Explored", `${pct}%`], ["Level", level(g.xp)], ["Skill coins", g.coins.length], ["Achievements", `${g.got.length}/${Object.keys(ACHIEVEMENTS).length}`]];
    return (
        <div className="report neu-lg">
            <div className="report-head"><span className="mono">Your run · report card</span><b>{pct >= 80 ? "You've seen almost everything. Impressive." : "Nice run — there's more to discover above."}</b></div>
            <dl className="report-stats">{stats.map(([k, v]) => <div key={k} className="neu-in-sm"><dt className="mono">{k}</dt><dd>{v}</dd></div>)}</dl>
            <ul className="report-ach">{Object.entries(ACHIEVEMENTS).map(([id, a]) => <li key={id} className={g.got.includes(id) ? "is-got" : ""} title={a.title}>{g.got.includes(id) ? a.icon : "🔒"}</li>)}</ul>
            <p>What you just explored is what I bring to a team: <b>useful AI, built safely, explained clearly.</b> Want the real thing?</p>
        </div>
    );
}

export default function Hello({ onOpenCv }) {
    const time = useHamburgTime();
    const { ledger } = useChat();
    const [pressed, setPressed] = useState(false);
    const [copied, setCopied] = useState(false);
    const press = () => {
        setPressed(true);
        setTimeout(() => { setPressed(false); unlock("hello"); window.location.href = `mailto:${EMAIL}?subject=Hello%20Farhan`; }, 420);
    };
    const copy = async () => {
        try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1800); }
        catch { window.location.href = `mailto:${EMAIL}`; }
    };
    return (
        <section id="hello" className="act hello wrap">
            <SectionHead n="10" kicker="Contact" title="Let's work together" sub="Open to roles in AI engineering, AI & data governance, AI security and agentic development." />

            <ReportCard />
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
                        : <>Designed &amp; built in Hamburg</>}
                </span>
                <button className="key key-sm" onClick={() => scrollToId("home")}>Back to top ↑</button>
            </footer>
        </section>
    );
}
