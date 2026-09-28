import { Chars, Fade } from "./Motion";

/* A full-screen cinematic beat between chapters: one idea, big type, the network does the rest. */
export default function Moment({ cam, kicker, lines, sub }) {
    return (
        <section className="v-moment" data-cam={cam}>
            <div className="v-wrap">
                {kicker && <Fade><span className="v-kick mono">{kicker}</span></Fade>}
                <Chars as="p" className="v-moment-t" stagger={20} lines={lines} />
                {sub && <Fade delay={400}><p className="v-sub">{sub}</p></Fade>}
            </div>
        </section>
    );
}
