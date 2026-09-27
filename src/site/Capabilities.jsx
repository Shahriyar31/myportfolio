import SectionHead from "./SectionHead";
import { Fade } from "./Motion";
import { SKILLS, EDU_CHAPTERS } from "../data/constants";

const WORDS = ["Governed data", "Reliable pipelines", "Compliant AI", "Shipped, not slideware"];

export function Capabilities() {
    const domains = Object.entries(SKILLS);
    return (
        <section id="capabilities" className="sec">
            <SectionHead n="04" label="Capabilities" aside={`${domains.reduce((n, [, l]) => n + l.length, 0)} tools · 4 domains`} title={["A stack for", <><em>trustworthy</em> AI.</>]} />
            <div className="caps wrap">
                {domains.map(([dom, list], i) => (
                    <Fade key={dom} delay={i * 90} className="cap">
                        <div className="cap-h"><span className="label">{String(i + 1).padStart(2, "0")}</span><h3>{dom}</h3></div>
                        <ul>{list.map(s => <li key={s}>{s}</li>)}</ul>
                    </Fade>
                ))}
            </div>
            <div className="marquee" aria-hidden="true">
                <div className="marquee-track">
                    {[0, 1].map(k => (
                        <div key={k} style={{ display: "flex" }}>
                            {WORDS.map(w => <span key={w}>{w} <em>✦</em></span>)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Education() {
    const rows = [...EDU_CHAPTERS].reverse();
    return (
        <section id="education" className="sec">
            <SectionHead n="05" label="Education" aside="2018 — now" title={["Always", <><em>learning.</em></>]} />
            <ol className="wrap">
                {rows.map((c, i) => (
                    <Fade as="li" key={c.num} delay={i * 80} className="edu-row">
                        <span className="edu-y label">{c.year}{c.live && <><br /><span className="accent">In progress</span></>}</span>
                        <div className="edu-main">
                            <h3 className="edu-deg">{c.degree}</h3>
                            <p className="edu-sch">{c.school} — {c.location.replace(/ \S+$/u, "")}</p>
                        </div>
                        <div className="edu-side">
                            <p>{c.body}</p>
                            {c.num === "01" && (
                                <div className="edu-stats">
                                    <div><b>8.73</b><span className="label">CGPA / 10</span></div>
                                    <div><b>Top 10%</b><span className="label">of class</span></div>
                                </div>
                            )}
                        </div>
                    </Fade>
                ))}
            </ol>
        </section>
    );
}
