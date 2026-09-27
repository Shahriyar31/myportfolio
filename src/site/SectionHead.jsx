import { Fade } from "./Motion";
import { useInView } from "./hooks";

/** Big title: letters rise in one by one, and a colour wave runs through them. */
export function WaveTitle({ text, className = "" }) {
    const [ref, inView] = useInView({ threshold: 0.3 });
    let i = 0;
    const words = text.split(" ");
    return (
        <h2 ref={ref} className={`head-title ${inView ? "is-in" : ""} ${className}`} aria-label={text}>
            {words.map((w, wi) => (
                <span key={wi} aria-hidden="true">
                    <span className="w">
                        {[...w].map(c => { const ci = i++; return <span key={ci} className="c" style={{ "--ci": ci }}><span>{c}</span></span>; })}
                    </span>
                    {wi < words.length - 1 && " "}
                </span>
            ))}
        </h2>
    );
}

/** One heading pattern for every section: numbered kicker, big animated title, one-line subtitle. */
export default function SectionHead({ n, kicker, title, sub }) {
    return (
        <header className="head">
            <Fade className="head-kicker">
                <span className="head-n neu-sm mono">{n}</span>
                <span className="mono">{kicker}</span>
                <span className="head-rule" />
            </Fade>
            <WaveTitle text={title} />
            {sub && <Fade delay={200}><p className="head-sub">{sub}</p></Fade>}
        </header>
    );
}
