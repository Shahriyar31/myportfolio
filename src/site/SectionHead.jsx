import { Lines, Fade } from "./Motion";

/** Shared section header: hairline meta row + large masked title. */
export default function SectionHead({ n, label, aside, title }) {
    return (
        <header className="sec-head wrap">
            <Fade className="sec-meta">
                <span className="label">({n})</span>
                <span className="label">{label}</span>
                <span className="label">{aside}</span>
            </Fade>
            <h2 className="sec-title"><Lines lines={title} /></h2>
        </header>
    );
}
