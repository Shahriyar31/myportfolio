import { useEffect, useRef, useState } from "react";
import SectionHead from "./SectionHead";
import Logo from "./Logo";
import { setWarmth } from "./theme";
import { collect, useGame } from "./game";
import { reducedMotion } from "./hooks";

/*
 * My story as a side-scroller: scroll to walk. The avatar collects skill
 * coins, boards the plane to Hamburg, and reaches the Argus lab.
 * World positions are in "screens" (1 = one viewport width).
 */

const WORLD = 6.2;
const FLIGHT = [2.15, 3.05];
const ph = n => `/photos/${n}-sm.webp`;

const SIGNS = [
    { x: 0.55, year: "2018", place: "Cooch Behar, West Bengal", title: "B.Tech, Computer Science", text: "Algorithms, systems, late nights — graduated with an 8.73 / 10 CGPA.", photos: [43, 17, 47] },
    { x: 1.45, year: "2022", place: "West Bengal", title: "The planning year", text: "Language classes, applications, and photographing the streets I was about to leave.", photos: [45, 14, 20] },
    { x: 2.45, year: "2023", place: "In the air", title: "One-way ticket", text: "Twenty-two, alone, one suitcase — 7,004 km to Hamburg.", flight: true },
    { x: 3.4, year: "2023", place: "Hamburg, Germany", title: "M.Sc. Data Science, TUHH", text: "Machine learning, big data and statistics — in a new country and a new language.", photos: [26, 35, 36] },
    { x: 4.3, year: "2025", place: "Nordex Group, Hamburg", title: "Enterprise data & AI", text: "Working student: AI assistant, governance, Databricks pipelines — and leading an AI project to its deadline." },
    { x: 5.2, year: "2026", place: "The lab", title: "Building Argus AI", text: "An EU AI Act compliance platform, built on the side. And still carrying a camera.", photos: [52, 34, 41] },
];

// [logo, x, high?]
const COINS = [
    ["python", 0.3, 0], ["sql", 0.42, 1], ["git", 0.78, 0], ["linux", 0.9, 1], ["bash", 1.05, 0],
    ["pandas", 1.2, 1], ["sklearn", 1.3, 0], ["tensorflow", 1.7, 1], ["flask", 1.82, 0], ["aws", 1.95, 1],
    ["docker", 3.2, 0], ["plotly", 3.62, 1], ["kafka", 3.75, 0], ["flink", 3.88, 1], ["gcp", 4.0, 0],
    ["databricks", 4.08, 1], ["spark", 4.52, 0], ["azure", 4.62, 1], ["azuredevops", 4.72, 0], ["eu", 4.85, 1],
    ["langchain", 4.98, 0], ["fastapi", 5.45, 1], ["postgres", 5.55, 0], ["terraform", 5.65, 1], ["kubernetes", 5.75, 0], ["owasp", 5.85, 1],
];
const clamp01 = v => Math.min(1, Math.max(0, v));

/* ── Clay-style props (SVG) ── */
const House = () => (
    <svg viewBox="0 0 160 130" className="prop house"><path d="M20 60 80 14l60 46" fill="#e07a5f" /><rect x="30" y="58" width="100" height="66" rx="10" fill="#f1e2c8" /><rect x="68" y="84" width="24" height="40" rx="5" fill="#9c6b4e" /><rect x="40" y="72" width="20" height="18" rx="4" fill="#9fdcff" /><rect x="100" y="72" width="20" height="18" rx="4" fill="#9fdcff" /></svg>
);
const Palm = () => (
    <svg viewBox="0 0 100 180" className="prop palm"><path d="M52 175c-6-50 2-100 6-128" stroke="#9c6b4e" strokeWidth="9" fill="none" strokeLinecap="round" /><g fill="#5fae6b"><path d="M58 46C40 26 18 30 6 42c18-4 34 0 52 4Z" /><path d="M58 46c10-22 32-30 46-24-16 2-30 12-46 24Z" /><path d="M58 46c-4-22-20-38-38-40 14 10 26 22 38 40Z" /><path d="M58 46c20-8 38-2 42 12-12-8-26-10-42-12Z" /></g></svg>
);
const Books = () => (
    <svg viewBox="0 0 120 110" className="prop books"><rect x="10" y="80" width="100" height="22" rx="5" fill="#e07a5f" /><rect x="18" y="58" width="86" height="22" rx="5" fill="#73a7ff" /><rect x="12" y="36" width="92" height="22" rx="5" fill="#f2c14e" /><text x="58" y="52" fontSize="12" fontWeight="700" textAnchor="middle" fill="#3a2a00">DEUTSCH</text><rect x="24" y="14" width="74" height="22" rx="5" fill="#8fcf8a" /></svg>
);
const Tower = () => (
    <svg viewBox="0 0 90 170" className="prop atc"><rect x="38" y="60" width="14" height="110" rx="4" fill="#cfd8e3" /><path d="M20 40h50l-6 24H26Z" fill="#9fdcff" /><rect x="16" y="32" width="58" height="10" rx="4" fill="#e6ebf0" /><rect x="43" y="14" width="4" height="18" fill="#39424e" /><circle cx="45" cy="12" r="4" fill="#e0524d" /></svg>
);
const Skyline = () => (
    <svg viewBox="0 0 520 200" className="prop skyline"><path d="M20 200V120c30-20 60-30 90-20s50-28 90-18 40 20 70 6v112Z" fill="#9fb8d9" /><path d="M40 120 60 60h40l20 60" fill="#dfe8f3" /><path d="M36 64c20-14 40-18 70-6" stroke="#dfe8f3" strokeWidth="10" fill="none" strokeLinecap="round" /><rect x="300" y="70" width="40" height="130" rx="4" fill="#b7c7dd" /><rect x="350" y="100" width="46" height="100" rx="4" fill="#c7d4e6" /><path d="M430 200V60M430 60h70M470 60v40" stroke="#e0524d" strokeWidth="7" fill="none" strokeLinecap="round" /><rect x="456" y="100" width="28" height="18" fill="#f2c14e" /></svg>
);
const Uni = () => (
    <svg viewBox="0 0 200 140" className="prop uni"><path d="M10 50 100 10l90 40Z" fill="#eadfcb" /><rect x="14" y="48" width="172" height="10" rx="3" fill="#f4efe7" /><g fill="#f4efe7">{[30, 62, 94, 126, 158].map(x => <rect key={x} x={x} y="58" width="14" height="62" rx="4" />)}</g><rect x="8" y="120" width="184" height="16" rx="5" fill="#dcd3c3" /><text x="100" y="42" fontSize="14" fontWeight="800" textAnchor="middle" fill="#6b5b45">TUHH</text></svg>
);
const Office = () => (
    <svg viewBox="0 0 120 220" className="prop office"><rect x="20" y="20" width="80" height="200" rx="10" fill="#cfd8e3" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x="30" y={34 + i * 22} width="60" height="10" rx="4" fill="var(--accent)" opacity=".75" />)}<rect x="48" y="186" width="24" height="34" rx="4" fill="#39424e" /></svg>
);
const Lab = () => (
    <svg viewBox="0 0 200 150" className="prop lab"><rect x="20" y="104" width="160" height="40" rx="12" fill="#f4efe7" /><path d="M36 106a64 64 0 0 1 128 0Z" fill="#9fdcff" opacity=".85" /><circle cx="100" cy="84" r="14" fill="var(--accent)" /><path d="M140 60V20" stroke="#39424e" strokeWidth="4" /><circle cx="140" cy="16" r="6" fill="#e0524d" /><text x="100" y="132" fontSize="15" fontWeight="800" textAnchor="middle" fill="#3b4c63">ARGUS AI</text></svg>
);
const Flag = () => (
    <svg viewBox="0 0 80 160" className="prop flag"><rect x="10" y="10" width="6" height="150" rx="3" fill="#39424e" /><path d="M16 14h54l-12 18 12 18H16Z" fill="var(--accent)" /><text x="40" y="37" fontSize="11" fontWeight="800" textAnchor="middle" fill="#fff">GOAL</text></svg>
);
const Plane = () => (
    <svg viewBox="0 0 200 90" className="plane-svg"><path d="M20 50c0-10 20-16 60-16h70c20 0 36 8 36 16s-16 16-36 16H80c-40 0-60-6-60-16Z" fill="#f4efe7" /><path d="M90 50 60 88h26l40-38Z" fill="#d7dee8" /><path d="M36 40 22 10h20l24 30Z" fill="var(--accent)" /><circle cx="150" cy="46" r="7" fill="#9fdcff" /><circle cx="128" cy="46" r="7" fill="#9fdcff" /></svg>
);
const Cloud = ({ s = 1 }) => <svg viewBox="0 0 120 60" className="cloud" style={{ width: 120 * s }}><path d="M20 50a18 18 0 0 1 4-35 24 24 0 0 1 44-6 20 20 0 0 1 30 18 14 14 0 0 1 2 23Z" fill="#fff" opacity=".9" /></svg>;

const PROPS = [
    [0.12, House], [0.3, Palm], [0.95, Palm, 0.7], [1.2, House, 0.8], [1.7, Books], [2.05, Tower],
    [3.25, Skyline, 1.35], [3.9, Uni], [4.45, Office], [5.05, Lab], [5.95, Flag],
];

function Avatar({ walking, back, flying, jump, fy }) {
    return (
        <div className={`hero-av ${walking ? "is-walk" : ""} ${back ? "is-back" : ""} ${flying ? "is-fly" : ""} ${jump ? "is-jump" : ""}`} style={{ "--fy": `${fy}svh` }}>
            <div className="av-plane"><Plane /><img src="/images/profile-cartoon.jpg" alt="" /></div>
            <div className="av-body">
                <img className="av-head" src="/images/profile-cartoon.jpg" alt="" />
                <span className="av-torso" /><span className="av-bag" />
                <span className="av-leg l" /><span className="av-leg r" />
            </div>
            <span className="av-shadow" />
        </div>
    );
}

export default function Quest() {
    const secRef = useRef(null);
    const trackRef = useRef(null);
    const farRef = useRef(null);
    const [st, setSt] = useState({ p: 0, walking: false, back: false, flying: 0, jump: false, sw: 1200 });
    const [got, setGot] = useState(() => new Set());
    const g = useGame();

    useEffect(() => {
        let raf = 0, last = scrollY, stopT, jumpT;
        const update = () => {
            const el = secRef.current, sw = innerWidth;
            const total = el.offsetHeight - innerHeight;
            const p = clamp01(-el.getBoundingClientRect().top / total);
            const worldPx = WORLD * sw, shift = p * (worldPx - sw);
            trackRef.current.style.transform = `translate3d(${-shift}px,0,0)`;
            farRef.current.style.transform = `translate3d(${-shift * 0.35}px,0,0)`;
            const avX = shift + sw * (sw < 700 ? 0.2 : 0.28); // avatar position in world px
            const ax = avX / sw;
            const fl = clamp01((ax - FLIGHT[0]) / (FLIGHT[1] - FLIGHT[0]));
            const flying = fl > 0 && fl < 1 ? Math.sin(Math.PI * fl) : 0;
            // sky: warm in Bengal, dusk in the air, cool in Hamburg (only while the quest is on screen)
            const r = el.getBoundingClientRect();
            const inView = r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4;
            setWarmth(inView ? (ax < FLIGHT[0] ? 1 : 1 - fl) : 0);
            // coins
            let jumpNow = false;
            setGot(prev => {
                let next = prev;
                COINS.forEach(([id, x, high]) => {
                    if (ax >= x && !prev.has(id)) { if (next === prev) next = new Set(prev); next.add(id); collect(id, COINS.length); }
                    if (high && x - ax > 0 && x - ax < 0.05) jumpNow = true;
                });
                return next;
            });
            const dy = scrollY - last; last = scrollY;
            setSt(s => ({ ...s, p, flying, sw, walking: Math.abs(dy) > 0.5 && !flying ? true : s.walking, back: dy < -0.5 ? true : dy > 0.5 ? false : s.back }));
            if (jumpNow && !reducedMotion()) { setSt(s => ({ ...s, jump: true })); clearTimeout(jumpT); jumpT = setTimeout(() => setSt(s => ({ ...s, jump: false })), 520); }
            clearTimeout(stopT); stopT = setTimeout(() => setSt(s => ({ ...s, walking: false })), 140);
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        update();
        window.addEventListener("scroll", on, { passive: true });
        window.addEventListener("resize", on);
        return () => { cancelAnimationFrame(raf); clearTimeout(stopT); clearTimeout(jumpT); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); setWarmth(0); };
    }, []);

    const sw = st.sw;
    const km = Math.round(clamp01((st.p * (WORLD - 1) + (sw < 700 ? 0.2 : 0.28) - FLIGHT[0]) / (FLIGHT[1] - FLIGHT[0])) * 7004);
    const collected = COINS.filter(([id]) => got.has(id) || g.coins.includes(id)).length;

    return (
        <section id="quest" className="quest" ref={secRef} aria-label="My story as a side-scrolling game">
            <div className="quest-stage">
                <div className="quest-sky" aria-hidden="true">
                    <div className="quest-sun" />
                    <div className="quest-far" ref={farRef} style={{ width: WORLD * sw }}>
                        {[0.4, 1.3, 2.3, 2.8, 3.6, 4.6, 5.5].map((x, i) => <span key={i} style={{ left: x * sw * 0.35 + i * 40, top: 60 + (i % 3) * 40 }}><Cloud s={0.7 + (i % 3) * 0.3} /></span>)}
                        <svg className="hills" viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ width: WORLD * sw }}><path d="M0 200V120C120 60 220 60 340 110S560 150 700 90 960 40 1200 120V200Z" /></svg>
                    </div>
                </div>

                <div className="quest-track" ref={trackRef} style={{ width: WORLD * sw }}>
                    <div className="quest-ground" />
                    {PROPS.map(([x, P, s], i) => <div key={i} className="prop-wrap" style={{ left: x * sw, "--s": s || 1 }}><P /></div>)}
                    {COINS.map(([id, x, high]) => (
                        <span key={id} className={`coin3d ${high ? "high" : ""} ${got.has(id) || g.coins.includes(id) ? "is-got" : ""}`} style={{ left: x * sw }}>
                            <span className="coin3d-face"><Logo n={id} size={22} /></span>
                        </span>
                    ))}
                    {SIGNS.map(s => (
                        <article key={s.year + s.title} className="q-sign neu-lg" style={{ left: s.x * sw }}>
                            <div className="card-top"><span className="card-year">{s.year}</span><span className="chip mono">{s.place}</span></div>
                            <h3>{s.title}</h3>
                            <p>{s.text}</p>
                            {s.photos && <div className="q-photos">{s.photos.map((n, i) => <img key={n} src={ph(n)} alt="" loading="lazy" style={{ "--r": `${[-6, 3, -2][i]}deg` }} />)}</div>}
                            {s.flight && <div className="q-km"><b>{km.toLocaleString("en-US")}</b><span className="mono">/ 7,004 km flown</span></div>}
                            <span className="q-post" />
                        </article>
                    ))}
                </div>

                <Avatar walking={st.walking} back={st.back} flying={st.flying > 0.02} jump={st.jump} fy={(st.flying * 34).toFixed(1)} />

                <div className="quest-head wrap">
                    <SectionHead n="06" kicker="My story · a playable level" title="From West Bengal to Hamburg" />
                </div>
                <div className="quest-bar wrap">
                    <div className="quest-progress neu">
                        <span className="mono">Level 1 · Life so far</span>
                        <span className="qp-track neu-in-sm"><i style={{ transform: `scaleX(${st.p})` }} />{SIGNS.map(s => <b key={s.year + s.x} style={{ left: `${(s.x / WORLD) * 100}%` }} className={st.p * (WORLD - 1) + 0.28 >= s.x ? "is-hit" : ""} />)}</span>
                        <span className="qp-coins">🪙 {collected}/{COINS.length}</span>
                    </div>
                    <span className="quest-hint mono">↓ Scroll to walk</span>
                </div>
            </div>
        </section>
    );
}
