import { useEffect, useRef, useState } from "react";
import { PLACES } from "./places";
import { setWarmth } from "./theme";
import { reducedMotion } from "./hooks";
import { Icon } from "./Chrome";

const KM = 7004; // great-circle Cooch Behar → Hamburg
const ph = n => `/photos/${n}-sm.webp`;

/* Each step owns a slice of the section's scroll progress. */
const STEPS = [
    { from: 0.0, to: 0.16, year: "2018", place: "Cooch Behar · West Bengal", title: "B.Tech, Computer Science", body: "Four years of algorithms, systems and late nights at Cooch Behar Government Engineering College. Graduated with an 8.73 / 10 CGPA — teaching assistant and student council along the way.", photos: [43, 17, 47], stat: ["8.73", "CGPA / 10"] },
    { from: 0.16, to: 0.32, year: "2022", place: "West Bengal", title: "The planning year", body: "A year of language classes, applications and portfolio work — and long walks photographing the streets I was about to leave behind.", photos: [45, 14, 20], stat: ["1", "year of prep"] },
    { from: 0.32, to: 0.58, year: "2023", place: "In the air", title: "One-way ticket", body: "Twenty-two, alone, one suitcase. Everything I knew on one side of the arc; everything I wanted on the other.", pass: true },
    { from: 0.58, to: 0.72, year: "2023", place: "Hamburg · Germany", title: "M.Sc. Data Science, TUHH", body: "Hamburg University of Technology: machine learning, big data, statistics — in a new country and a new language.", photos: [26, 35, 36], stat: ["M.Sc.", "Data Science"] },
    { from: 0.72, to: 0.86, year: "2025", place: "Nordex Group · Hamburg", title: "Enterprise data & AI", body: "Working student in Enterprise Data Management & AI Engineering: data governance, Databricks pipelines, and AI governance for the EU AI Act.", work: true },
    { from: 0.86, to: 1.01, year: "2026", place: "Now", title: "Building Argus AI", body: "An EU AI Act compliance platform I'm building on the side — and still, always, carrying a camera.", photos: [52, 34, 41], stat: ["7,004", "km from home"] },
];

const clamp01 = v => Math.min(1, Math.max(0, v));
const ease = t => t * t * (3 - 2 * t);

function Photos({ ids, local }) {
    return (
        <div className="jp">
            {ids.map((n, i) => (
                <figure key={n} className="jp-photo neu" style={{ "--r": `${[-7, 5, -2][i]}deg`, "--x": `${[0, 28, 56][i]}%`, "--d": `${(local - 0.5) * [-20, 14, -30][i]}px` }}>
                    <img src={ph(n)} alt="" loading="lazy" decoding="async" />
                </figure>
            ))}
        </div>
    );
}

function Pass({ km }) {
    return (
        <div className="pass neu">
            <div className="pass-main">
                <div className="pass-row mono"><span>Boarding pass</span><span>One-way</span></div>
                <div className="pass-route">
                    <div><b>WB</b><span className="mono">West Bengal</span></div>
                    <svg viewBox="0 0 120 24" aria-hidden="true"><path d="M4 18 Q60 -6 116 18" fill="none" stroke="currentColor" strokeDasharray="3 4" /><circle cx="116" cy="18" r="3" fill="currentColor" /></svg>
                    <div><b>HH</b><span className="mono">Hamburg</span></div>
                </div>
                <div className="pass-grid">
                    <div><span className="mono">Passenger</span><b>Farhan Shahriyar</b></div>
                    <div><span className="mono">Seat</span><b>22A</b><small className="mono">my age</small></div>
                    <div><span className="mono">Distance</span><b>{km.toLocaleString("en-US")} km</b></div>
                </div>
            </div>
            <div className="pass-stub neu-in-sm" aria-hidden="true">
                <span className="pass-fs">FS</span>
                <div className="barcode">{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ width: (i * 7) % 3 + 1 }} />)}</div>
            </div>
        </div>
    );
}

function WorkCard() {
    return (
        <div className="jt neu">
            <div className="jt-stack" aria-hidden="true">
                {["gold", "silver", "bronze"].map(l => <span key={l} className={`jt-slab ${l}`}>{l}</span>)}
            </div>
            <ul className="jt-list">
                {["Azure Databricks", "Data governance", "EU AI Act · GDPR", "Azure DevOps"].map(t => <li key={t} className="neu-in-sm mono">{t}</li>)}
            </ul>
        </div>
    );
}

export default function Journey() {
    const sectionRef = useRef(null);
    const canvasRef = useRef(null);
    const labels = { home: useRef(null), hamburg: useRef(null), plane: useRef(null) };
    const [p, setP] = useState(0);
    const sceneRef = useRef(null);

    // 3D globe (lazy)
    useEffect(() => {
        let scene, io, alive = true;
        import("./GlobeScene").then(({ default: GlobeScene }) => {
            if (!alive) return;
            try {
                scene = new GlobeScene(canvasRef.current, { labels: { home: labels.home.current, hamburg: labels.hamburg.current, plane: labels.plane.current } });
            } catch { return; }
            sceneRef.current = scene;
            io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()));
            io.observe(canvasRef.current);
            if (reducedMotion()) scene.tick();
        });
        return () => { alive = false; io?.disconnect(); scene?.dispose(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll → progress, globe state and the site's colour temperature
    useEffect(() => {
        let raf = 0;
        const update = () => {
            const el = sectionRef.current;
            const r = el.getBoundingClientRect();
            const total = el.offsetHeight - innerHeight;
            const prog = clamp01(-r.top / total);
            setP(prog);

            const flight = STEPS[2];
            const fl = clamp01((prog - flight.from) / (flight.to - flight.from));
            const arc = ease(fl);
            // warm while in Bengal, cooling during the flight; neutral outside the section
            let w = prog < flight.from ? 1 : 1 - arc;
            const enter = clamp01((innerHeight - r.top) / (innerHeight * 0.9));
            const leave = clamp01((r.bottom - innerHeight * 0.2) / (innerHeight * 0.6));
            w *= Math.min(enter, leave);
            setWarmth(w);

            const s = sceneRef.current;
            if (s) {
                let focus, zoom;
                if (prog < flight.from) { focus = PLACES.home; zoom = prog < 0.16 ? 4.5 : 4.9; }
                else if (prog < flight.to) {
                    const pt = s.curve.getPointAt(Math.max(0.001, arc)).normalize();
                    focus = { lat: Math.asin(pt.y) * 57.2958, lon: Math.atan2(pt.x, pt.z) * 57.2958 };
                    zoom = 4.9 + Math.sin(Math.PI * fl) * 1.3;
                } else { focus = PLACES.hamburg; zoom = 4.5; }
                s.set(prog < flight.from ? 0 : arc, focus, zoom);
            }
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        update();
        window.addEventListener("scroll", on, { passive: true });
        window.addEventListener("resize", on);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); setWarmth(0); };
    }, []);

    const idx = Math.max(0, STEPS.findIndex(s => p >= s.from && p < s.to));
    const flight = STEPS[2];
    const km = Math.round(ease(clamp01((p - flight.from) / (flight.to - flight.from))) * KM);
    const jump = i => {
        const el = sectionRef.current;
        const y = el.offsetTop + (STEPS[i].from + 0.02) * (el.offsetHeight - innerHeight) + (i === 2 ? (el.offsetHeight - innerHeight) * 0.18 : 0);
        window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.6 }) : window.scrollTo({ top: y, behavior: "smooth" });
    };

    return (
        <section id="route" className="journey" ref={sectionRef} aria-label="The route: from West Bengal to Hamburg">
            <div className="journey-stage">
                <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
                <span ref={labels.home} className="geo-label"><b>{PLACES.home.name}</b><span className="mono">{PLACES.home.sub}</span></span>
                <span ref={labels.hamburg} className="geo-label"><b>{PLACES.hamburg.name}</b><span className="mono">{PLACES.hamburg.sub}</span></span>
                <span ref={labels.plane} className="geo-plane mono">{km.toLocaleString("en-US")} km</span>

                <div className="journey-inner wrap">
                    <header className="journey-head">
                        <span className="head-kicker"><span className="head-n neu-sm mono">05</span><span className="mono">My story</span></span>
                        <h2 className="head-title">From West Bengal to Hamburg</h2>
                        <p className="head-sub">7,004 km and one suitcase — keep scrolling to follow the journey.</p>
                    </header>

                    <div className="cards">
                        {STEPS.map((s, i) => {
                            const local = clamp01((p - s.from) / (s.to - s.from));
                            const state = i === idx ? "is-on" : i < idx ? "is-past" : "is-next";
                            return (
                                <article key={i} className={`card neu-lg ${state}`} aria-hidden={i !== idx}>
                                    <div className="card-top">
                                        <span className="card-year">{s.year}</span>
                                        <span className="chip mono">{s.place}</span>
                                    </div>
                                    <h3 className="card-title">{s.title}</h3>
                                    <p className="card-body">{s.body}</p>
                                    {s.photos && <Photos ids={s.photos} local={local} />}
                                    {s.pass && <Pass km={km} />}
                                    {s.work && <WorkCard />}
                                    {s.stat && <div className="card-stat neu-in-sm"><b>{s.stat[0]}</b><span className="mono">{s.stat[1]}</span></div>}
                                </article>
                            );
                        })}
                    </div>

                    <nav className="steps neu" aria-label="Journey steps">
                        {STEPS.map((s, i) => (
                            <button key={i} className={`step ${i === idx ? "is-on" : ""} ${i < idx ? "is-done" : ""}`} onClick={() => jump(i)} aria-label={`${s.year}: ${s.title}`}>
                                {i === 2 ? <Icon n="route" size={16} /> : s.year}
                            </button>
                        ))}
                        <span className="steps-fill" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />
                    </nav>
                </div>
            </div>
        </section>
    );
}
