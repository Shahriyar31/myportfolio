import { useState } from "react";
import { Lines, Fade } from "./Motion";
import Logo from "./Logo";

const DEGREES = [
    {
        id: "msc", seal: "TUHH", ring: "HAMBURG UNIVERSITY OF TECHNOLOGY • M.SC. DATA SCIENCE • ",
        degree: "M.Sc. Data Science", school: "Hamburg University of Technology (TUHH)", place: "Hamburg, Germany", years: "Oct 2023 — present", status: "In progress", live: true,
        stats: [["M.Sc.", "Data Science"], ["2023", "Started"], ["HH", "Hamburg"]],
        highlights: ["Research project: Digital Twin dashboard with anomaly detection & forecasting", "MLOps: CI/CD with GitHub Actions, containerised with Docker", "Working student in data & AI alongside the degree"],
        modules: [["Machine Learning", "tensorflow"], ["Deep Learning", "tensorflow"], ["Big Data", "spark"], ["Statistics", "eval"], ["MLOps", "mlflow"], ["Digital Twins", "plotly"], ["Data Engineering", "databricks"]],
    },
    {
        id: "btech", seal: "CGEC", ring: "COOCH BEHAR GOVERNMENT ENGINEERING COLLEGE • B.TECH CSE • ",
        degree: "B.Tech Computer Science & Engineering", school: "Cooch Behar Government Engineering College", place: "West Bengal, India", years: "Jul 2018 — Aug 2022", status: "Graduated",
        stats: [["8.73", "CGPA / 10"], ["Top 10%", "of class"], ["4", "years"]],
        highlights: ["Teaching assistant", "Student council member", "Foundation in algorithms, systems and databases"],
        modules: [["Algorithms", "tool"], ["Data Structures", "lineage"], ["Operating Systems", "linux"], ["DBMS", "database"], ["Software Engineering", "git"], ["Discrete Mathematics", "eval"], ["Computer Networks", "stream"]],
    },
];

function Seal({ text, label, live }) {
    return (
        <div className="seal neu" aria-hidden="true">
            <svg viewBox="0 0 120 120" className="seal-ring">
                <defs><path id={`c-${label}`} d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
                <text><textPath href={`#c-${label}`}>{text.repeat(2)}</textPath></text>
            </svg>
            <span className="seal-core neu-in"><Logo n="grad" size={22} /><b>{label}</b></span>
            {live && <span className="seal-live dot-live" />}
        </div>
    );
}

function Degree({ d, i }) {
    const [flipped, setFlipped] = useState(false);
    return (
        <Fade delay={i * 120} className={`deg ${flipped ? "is-flipped" : ""}`}>
            <div className="deg-inner">
                <article className="deg-face deg-front neu-lg" aria-hidden={flipped}>
                    <div className="deg-top">
                        <Seal text={d.ring} label={d.seal} live={d.live} />
                        <div className="deg-meta">
                            <span className={`chip mono ${d.live ? "is-live" : ""}`}>{d.live && <span className="dot-live" />}{d.status}</span>
                            <span className="mono">{d.years}</span>
                        </div>
                    </div>
                    <h3 className="deg-title">{d.degree}</h3>
                    <p className="deg-school">{d.school} · {d.place}</p>
                    <dl className="deg-stats">
                        {d.stats.map(([v, k]) => <div key={k} className="neu-in-sm"><dt className="mono">{k}</dt><dd>{v}</dd></div>)}
                    </dl>
                    <ul className="deg-hl">{d.highlights.map(h => <li key={h}>{h}</li>)}</ul>
                    <button className="key key-sm deg-flip" onClick={() => setFlipped(true)} tabIndex={flipped ? -1 : 0}>See modules ↻</button>
                </article>
                <article className="deg-face deg-back neu-lg" aria-hidden={!flipped}>
                    <div className="deg-back-head">
                        <span className="mono">{d.seal} · core modules</span>
                        <button className="key key-sm" onClick={() => setFlipped(false)} tabIndex={flipped ? 0 : -1}>Back ↺</button>
                    </div>
                    <h3 className="deg-title sm">{d.degree}</h3>
                    <ul className="mods">
                        {d.modules.map(([m, logo], k) => (
                            <li key={m} className="mod" style={{ transitionDelay: `${flipped ? 250 + k * 50 : 0}ms` }}>
                                <span className="mod-ico neu-in-sm"><Logo n={logo} size={18} /></span>{m}
                            </li>
                        ))}
                    </ul>
                </article>
            </div>
        </Fade>
    );
}

export default function Education() {
    return (
        <section id="education" className="act wrap">
            <header className="act-head">
                <span className="act-no neu mono">04</span>
                <div className="act-kicker"><span className="mono">Academic</span></div>
                <h2 className="act-title"><Lines lines={["Education —", <span className="accent" key="a">two degrees, two countries.</span>]} /></h2>
                <p className="act-lede">Computer science in India, data science in Germany. Flip a card to see the modules behind each degree.</p>
            </header>

            <Fade className="edu-rule neu-in" aria-hidden="true">
                <span className="edu-fill" />
                {[["2018", 0], ["2022", 57], ["2023", 71], ["Now", 100]].map(([y, x]) => (
                    <span key={y} className={`edu-tick ${y === "Now" ? "is-now" : ""}`} style={{ left: `${x}%` }}><i className="neu-sm" /><b className="mono">{y}</b></span>
                ))}
                <span className="edu-seg" style={{ left: "0%", width: "57%" }}><span className="mono">B.Tech · India</span></span>
                <span className="edu-seg" style={{ left: "71%", width: "29%" }}><span className="mono">M.Sc. · Germany</span></span>
            </Fade>

            <div className="degs">{DEGREES.map((d, i) => <Degree key={d.id} d={d} i={i} />)}</div>
        </section>
    );
}
