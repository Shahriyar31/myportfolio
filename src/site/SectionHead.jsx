import { Fade } from "./Motion";

/** One heading pattern for every section: numbered kicker, short title, one-line subtitle. */
export default function SectionHead({ n, kicker, title, sub }) {
    return (
        <header className="head">
            <Fade className="head-kicker">
                <span className="head-n neu-sm mono">{n}</span>
                <span className="mono">{kicker}</span>
            </Fade>
            <Fade delay={80}><h2 className="head-title">{title}</h2></Fade>
            {sub && <Fade delay={160}><p className="head-sub">{sub}</p></Fade>}
        </header>
    );
}
