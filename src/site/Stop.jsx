import { Fade } from "./Motion";
import { ZONES, zoneOf } from "./stations";

/** One screen-tall stop: the camera flies to `station`, the pane explains it. */
export default function Stop({ station, side = "left", id, flight, children, wide }) {
    const z = ZONES[zoneOf(station)];
    return (
        <article id={id} className={`stop is-${side}`} data-station={station} data-flight={flight ? "" : undefined} style={z ? { "--zone": z.color } : undefined}>
            <Fade className={`pane ${wide ? "is-wide" : ""} ${z ? "has-zone" : ""}`}>
                {z && <span className="pane-zone mono"><i />{z.name}</span>}
                {children}
            </Fade>
        </article>
    );
}

/** Section opener that sits over an overview shot of the world. */
export function Opener({ id, station, n, kicker, title, sub, children }) {
    return (
        <header id={id} className="opener wrap" data-station={station}>
            <Fade className="opener-in">
                <span className="head-kicker"><span className="head-n neu-sm mono">{n}</span><span className="mono">{kicker}</span><span className="head-rule" /></span>
                <h2 className="opener-title">{title}</h2>
                {sub && <p className="head-sub">{sub}</p>}
                {children}
            </Fade>
        </header>
    );
}
