import { useState } from "react";
import { Head } from "./Hero";
import { Fade } from "./Motion";
import { Lightbox, photoSrc } from "./Lens";
import PHOTOS from "../data/photos.json";

/* 05 · The person — three beats and a strip of my photographs. */

const BEATS = [
    ["2018", "West Bengal, India", "B.Tech in Computer Science", "Top 10% with an 8.73 / 10 CGPA. Teaching assistant and student council member."],
    ["2023", "Hamburg, Germany", "Moved alone at 22", "Started an M.Sc. in Data Science at TUHH. New country, new language, new everything."],
    ["2025", "Nordex Group", "AI & data engineering", "Working student on data governance, Azure Databricks and applied AI at a global wind-energy company."],
];

export default function Story() {
    const [idx, setIdx] = useState(-1);
    const strip = PHOTOS.slice(0, 10);
    return (
        <section id="story" className="v-sec">
            <div className="v-wrap">
                <div className="v-person">
                    <Head n="05" kicker="The person" title="From one side of the world to the other." />
                    <Fade delay={150}><figure className="v-portrait"><img src="/images/profile-suit.jpg" alt="Farhan Shahriyar" width="480" height="600" loading="lazy" /><figcaption className="mono"><span>Farhan Shahriyar</span><span>Hamburg</span></figcaption></figure></Fade>
                </div>
                <ol className="v-beats">
                    {BEATS.map(([y, where, what, d], i) => (
                        <Fade as="li" key={y} delay={i * 120}>
                            <span className="v-beat-y mono">{y}</span>
                            <b>{what}</b><small className="mono">{where}</small>
                            <p>{d}</p>
                        </Fade>
                    ))}
                </ol>
                <Fade className="v-photos-head"><p>When I'm not building, I shoot landscape and street photography.</p></Fade>
            </div>
            <div className="v-photos" role="list">
                {strip.map((p, i) => (
                    <button key={p.n} role="listitem" className="v-photo" onClick={() => setIdx(i)} aria-label={`Open photo: ${p.t || p.c}`}>
                        <img src={photoSrc(p.n)} alt={p.t || `${p.c} photograph`} loading="lazy" width={p.w} height={p.h} />
                    </button>
                ))}
            </div>
            {idx >= 0 && <Lightbox list={strip} idx={idx} setIdx={setIdx} />}
        </section>
    );
}
