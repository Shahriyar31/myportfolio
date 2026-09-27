import { useEffect, useRef } from "react";
import SectionHead from "./SectionHead";
import { Fade } from "./Motion";
import { reducedMotion } from "./hooks";

const STORY = [
    "I moved from West Bengal to Hamburg alone at 22 to study data science.",
    "Today I work where data governance, cloud platforms and AI meet —",
    "making sure the data behind AI is catalogued, *trustworthy* and compliant,",
    "and that the AI built on top of it actually *ships.*",
].join(" ");

const FACTS = [
    ["Origin", "West Bengal, India"],
    ["Based", "Hamburg, Germany"],
    ["Languages", "Bengali · English · German (A1)"],
    ["Off-screen", "Landscape & street photography"],
];

const JOURNEY = [
    ["2018", "B.Tech Computer Science", "Cooch Behar Government Engineering College"],
    ["2022", "Planning the move", "A year of language study and applications"],
    ["2023", "M.Sc. Data Science", "Hamburg University of Technology"],
    ["2025", "Nordex Group", "Enterprise Data Management & AI"],
    ["2026", "Argus AI", "An EU AI Act compliance platform, built on the side"],
];

/** Words light up as the paragraph scrolls through the viewport. */
function ScrollWords({ text }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        const words = [...el.querySelectorAll(".w")];
        if (reducedMotion()) { words.forEach(w => w.classList.add("on")); return; }
        let raf = 0;
        const update = () => {
            const r = el.getBoundingClientRect(), vh = window.innerHeight;
            const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
            const lit = Math.round(p * words.length);
            words.forEach((w, i) => w.classList.toggle("on", i < lit));
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        update();
        window.addEventListener("scroll", on, { passive: true });
        return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); };
    }, []);
    return (
        <p ref={ref} className="words">
            {text.split(" ").map((w, i) => {
                const em = w.startsWith("*");
                const clean = w.replace(/\*/g, "");
                return <span key={i} className="w">{em ? <em>{clean}</em> : clean}{" "}</span>;
            })}
        </p>
    );
}

export default function About() {
    return (
        <section id="about" className="sec">
            <SectionHead n="01" label="About" aside="Hamburg, since 2023" title={["From West Bengal", <>to <em>Hamburg.</em></>]} />
            <div className="about wrap">
                <Fade className="about-photo">
                    <figure>
                        <img src="/images/profile-suit.jpg" alt="Portrait of Farhan Shahriyar" loading="lazy" width="793" height="777" />
                    </figure>
                    <figcaption><span className="label">Farhan Shahriyar</span><span className="label">Hover for colour</span></figcaption>
                </Fade>
                <div className="about-body">
                    <ScrollWords text={STORY} />
                    <dl className="facts">
                        {FACTS.map(([k, v], i) => (
                            <Fade key={k} delay={i * 60}><dt className="label">{k}</dt><dd>{v}</dd></Fade>
                        ))}
                    </dl>
                    <ol className="journey" aria-label="Journey">
                        {JOURNEY.map(([y, t, s], i) => (
                            <Fade as="li" key={y} delay={i * 60}>
                                <span className="label">{y}</span>
                                <span className="j-t">{t}<small>{s}</small></span>
                                <span className="label">{i === JOURNEY.length - 1 ? "Now" : ""}</span>
                            </Fade>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
