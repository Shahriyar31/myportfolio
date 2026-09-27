import { useEffect, useState } from "react";
import { useGame, ACHIEVEMENTS, SECTION_IDS, level, levelProgress, visit } from "./game";
import { scrollToId } from "./hooks";

/* Top-centre HUD: level, XP, coins, trophies — plus achievement toasts */
export default function Hud() {
    const g = useGame();
    const [open, setOpen] = useState(false);
    const [bump, setBump] = useState(false);

    // Every section counts as "visited" once it fills the middle of the screen
    useEffect(() => {
        const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && visit(e.target.id)), { rootMargin: "-40% 0px -40% 0px" });
        const t = setTimeout(() => SECTION_IDS.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); }), 500);
        return () => { clearTimeout(t); io.disconnect(); };
    }, []);
    useEffect(() => { setBump(true); const t = setTimeout(() => setBump(false), 500); return () => clearTimeout(t); }, [g.xp]);

    const lv = level(g.xp);
    const pct = Math.round((g.seen.filter(s => SECTION_IDS.includes(s)).length / SECTION_IDS.length) * 100);
    const toast = g.toast && ACHIEVEMENTS[g.toast];

    return (
        <>
            <div className={`hud neu ${bump ? "is-bump" : ""}`}>
                <button className="hud-main" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={`Level ${lv}, ${g.xp} XP, ${g.coins.length} skill coins, ${g.got.length} achievements. Show achievements`}>
                    <span className="hud-lv"><span className="mono">LV</span>{lv}</span>
                    <span className="hud-xp neu-in-sm"><i style={{ transform: `scaleX(${levelProgress(g.xp)})` }} /></span>
                    <span className="hud-stat" title="Skill coins">🪙 {g.coins.length}</span>
                    <span className="hud-stat" title="Achievements">🏆 {g.got.length}</span>
                </button>
                <button className="hud-map" onClick={() => scrollToId("map")} aria-label="Open the world map">🗺️</button>
            </div>

            {open && (
                <div className="hud-panel neu-lg" role="dialog" aria-label="Achievements">
                    <div className="hud-panel-head"><b>Explored {pct}%</b><span className="mono">{g.xp} XP · level {lv}</span></div>
                    <ul>
                        {Object.entries(ACHIEVEMENTS).map(([id, a]) => {
                            const got = g.got.includes(id);
                            return (
                                <li key={id} className={got ? "is-got" : ""}>
                                    <span className="hud-ach neu-in-sm">{got ? a.icon : "🔒"}</span>
                                    <span><b>{a.title}</b><span>{a.text}</span></span>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="mono">Just here for the facts? Everything on the page is readable without playing.</p>
                </div>
            )}

            <div className={`ach-toast neu-lg ${toast ? "is-on" : ""}`} role="status" aria-live="polite">
                {toast && <>
                    <span className="ach-icon">{toast.icon}</span>
                    <span><span className="mono">Achievement unlocked · +150 XP</span><b>{toast.title}</b><span>{toast.text}</span></span>
                </>}
            </div>
        </>
    );
}
