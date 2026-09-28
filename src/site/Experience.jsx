import { Head } from "./Hero";
import { Fade } from "./Motion";
import { EXPERIENCE } from "../data/constants";

/* 03 · Experience — a plain, scannable timeline. */
export default function Experience() {
    return (
        <section id="experience" className="v-sec is-panel" data-cam="wide">
            <div className="v-wrap">
                <Head n="03" kicker="Experience" title="Where I do it for real." />
                <ol className="v-timeline" data-draw>
                    {EXPERIENCE.map((e, i) => (
                        <Fade as="li" key={e.id} delay={i * 100} className="v-job">
                            <div className="v-job-when mono">{e.date}{e.current && <b>Now</b>}</div>
                            <div className="v-job-body">
                                <h3>{e.role}</h3>
                                <p className="v-job-org">{e.company} · {e.location}</p>
                                <p>{e.summary}</p>
                                <dl>{e.focus.map(f => <div key={f.k}><dt>{f.k}</dt><dd>{f.d}</dd></div>)}</dl>
                                <p className="v-job-tech mono">{e.tech.join(" · ")}</p>
                            </div>
                        </Fade>
                    ))}
                </ol>
            </div>
        </section>
    );
}
