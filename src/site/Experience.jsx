import { useState } from "react";
import SectionHead from "./SectionHead";
import { Fade } from "./Motion";
import { EXPERIENCE } from "../data/constants";

export default function Experience() {
    const [open, setOpen] = useState(() => Math.max(0, EXPERIENCE.findIndex(e => e.current)));
    return (
        <section id="experience" className="sec">
            <SectionHead n="02" label="Experience" aside={`${EXPERIENCE.length} roles · 2025 — now`} title={["Where the", <><em>work</em> happens.</>]} />
            <ol className="wrap">
                {EXPERIENCE.map((e, i) => {
                    const isOpen = open === i;
                    return (
                        <Fade as="li" key={e.id} delay={i * 80} className={`xp-row ${isOpen ? "is-open" : ""}`}>
                            <button className="xp-head" aria-expanded={isOpen} aria-controls={`xp-${e.id}`} onClick={() => setOpen(isOpen ? -1 : i)} data-cursor={isOpen ? "Close" : "Open"}>
                                <span className="xp-date label">{e.date}</span>
                                <span className="xp-co">{e.company}{e.current && <span className="xp-now">Now</span>}</span>
                                <span className="xp-role">{e.role}<br /><span className="label">{e.location}</span></span>
                                <span className="xp-plus" aria-hidden="true" />
                            </button>
                            <div className="xp-body" id={`xp-${e.id}`} role="region" aria-label={`${e.company} details`}>
                                <div className="xp-body-inner" inert={!isOpen}>
                                    <div className="xp-grid">
                                        <p className="xp-sum">{e.summary}</p>
                                        <ul className="xp-tech" aria-label="Technologies">{e.tech.map(t => <li key={t}>{t}</li>)}</ul>
                                        <div className="xp-focus">
                                            {e.focus.map((f, j) => (
                                                <div className="xp-f" key={f.k}>
                                                    <span className="label">{String(j + 1).padStart(2, "0")}</span>
                                                    <h4>{f.k}</h4>
                                                    <p>{f.d}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Fade>
                    );
                })}
            </ol>
        </section>
    );
}
