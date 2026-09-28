import { useEffect, useRef, useState } from "react";
import Stop, { Opener } from "./Stop";
import Logo from "./Logo";
import { useInView } from "./hooks";
import { scrollToId } from "./hooks";

/* Story & education: from the home island to Hamburg, with game-style readouts */

function Gauge({ value, max, label }) {
    const [ref, seen] = useInView({ threshold: 0.4 });
    const pct = seen ? value / max : 0, R = 52, C = Math.PI * R;
    return (
        <div ref={ref} className="gauge">
            <svg viewBox="0 0 130 74"><path d="M13 66a52 52 0 0 1 104 0" className="g-bg" /><path d="M13 66a52 52 0 0 1 104 0" className="g-fg" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - pct) }} /></svg>
            <b>{value}</b><span className="mono">{label}</span>
        </div>
    );
}

function Badges({ items }) {
    const [ref, seen] = useInView({ threshold: 0.4 });
    return (
        <ul ref={ref} className={`badges ${seen ? "is-in" : ""}`}>
            {items.map(([icon, t, sub], i) => (
                <li key={t} className="badge neu-sm" style={{ "--k": i }}>
                    <span className="badge-ico">{icon}</span><span><b>{t}</b><small className="mono">{sub}</small></span><span className="badge-tick">✓</span>
                </li>
            ))}
        </ul>
    );
}

function Checklist({ items, done }) {
    const [ref, seen] = useInView({ threshold: 0.4 });
    return (
        <div ref={ref} className={`checklist ${seen ? "is-in" : ""}`}>
            <ul>{items.map((t, i) => <li key={t} style={{ "--k": i }}><span className="ck" />{t}</li>)}</ul>
            <div className="ck-bar neu-in-sm"><i /></div><span className="mono">{done}</span>
        </div>
    );
}

function Bars({ items }) {
    const [ref, seen] = useInView({ threshold: 0.4 });
    return (
        <ul ref={ref} className={`skillbars ${seen ? "is-in" : ""}`}>
            {items.map(([t, logo, v], i) => (
                <li key={t} style={{ "--k": i, "--v": `${v}%` }}><Logo n={logo} size={16} /><span>{t}</span><span className="sb-track neu-in-sm"><i /></span></li>
            ))}
        </ul>
    );
}

function BoardingPass() {
    const ref = useRef(null);
    const [p, setP] = useState(0);
    useEffect(() => {
        const el = ref.current?.closest("[data-flight]");
        let raf = 0;
        const up = () => { const r = el.getBoundingClientRect(); setP(Math.min(1, Math.max(0, (innerHeight / 2 - r.top) / r.height))); };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(up); };
        up(); window.addEventListener("scroll", on, { passive: true });
        return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); };
    }, []);
    const km = Math.round(p * 7004);
    return (
        <div ref={ref} className="pass neu">
            <div className="pass-main">
                <div className="pass-row mono"><span>Boarding pass</span><span>One-way · 2023</span></div>
                <div className="pass-route">
                    <div><b>CCU</b><span className="mono">West Bengal</span></div>
                    <div className="pass-line"><i style={{ width: `${p * 100}%` }} /><span style={{ left: `${p * 100}%` }}>✈</span></div>
                    <div><b>HAM</b><span className="mono">Hamburg</span></div>
                </div>
                <div className="pass-grid">
                    <div><span className="mono">Passenger</span><b>Farhan Shahriyar</b></div>
                    <div><span className="mono">Seat</span><b>22A</b><small className="mono">my age</small></div>
                    <div><span className="mono">Flown</span><b>{km.toLocaleString("en-US")} km</b></div>
                </div>
            </div>
            <div className="pass-stub neu-in-sm"><span className="pass-fs">{p >= 1 ? "LANDED" : "IN FLIGHT"}</span><div className="barcode">{Array.from({ length: 22 }, (_, i) => <i key={i} />)}</div></div>
        </div>
    );
}

export default function Journey() {
    return (
        <section id="story" aria-label="My story and education">
            <Opener station="photos" n="03" kicker="Education" title="From one island to another"
                sub="That small island in the sky is where I started — West Bengal. Scroll to visit my college, then fly with me to Hamburg." />

            <Stop id="education" station="home-college" side="left">
                <div className="pane-kicker"><span className="chip mono">Education · 01</span><span className="mono">2018 — 2022</span></div>
                <h3 className="pane-title">B.Tech, Computer Science & Engineering</h3>
                <p className="stack-org">Cooch Behar Government Engineering College · West Bengal</p>
                <div className="pane-split tight">
                    <Gauge value={8.73} max={10} label="CGPA / 10" />
                    <Badges items={[["🏅", "Top 10%", "of the class"], ["🧑‍🏫", "Teaching assistant", "unlocked"], ["🗳️", "Student council", "unlocked"]]} />
                </div>
            </Stop>

            <Stop station="home-house" side="right">
                <div className="pane-kicker"><span className="chip mono">2022</span><span className="mono">Level: preparation</span></div>
                <h3 className="pane-title">The planning year</h3>
                <p className="pane-lede sm">A full year to get ready for Europe.</p>
                <Checklist items={["Learn German basics", "Build a portfolio of projects", "Apply to universities", "Get admitted to TUHH", "Visa & one suitcase"]} done="Ready for take-off · 100%" />
            </Stop>

            <Stop station="flight" side="left" flight>
                <div className="pane-kicker"><span className="chip mono">2023</span><span className="mono">Scroll to fly</span></div>
                <h3 className="pane-title">One-way ticket</h3>
                <p className="pane-lede sm">Twenty-two, alone, one suitcase. Watch the plane cross the sky.</p>
                <BoardingPass />
            </Stop>

            <Stop id="tuhh" station="tuhh" side="right">
                <div className="pane-kicker"><span className="chip mono is-live"><span className="dot-live" />Education · 02 · now</span><span className="mono">2023 — now</span><span className="pane-where mono">📍 TUHH campus</span></div>
                <h3 className="pane-title">M.Sc. Data Science — where I am today</h3>
                <p className="stack-org">Hamburg University of Technology (TUHH)</p>
                <div className="pane-stack">
                    <Bars items={[["Machine learning", "tensorflow", 90], ["Big data", "spark", 85], ["MLOps", "mlflow", 85], ["Data engineering", "databricks", 90]]} />
                </div>
                <div className="pane-end">
                    <p className="pane-lede sm">Studying by day, building AI at Nordex, shipping Argus AI on the side. Next level: <b>your team?</b></p>
                    <button className="key key-accent" onClick={() => scrollToId("hello")}>Let's talk</button>
                </div>
            </Stop>
        </section>
    );
}
