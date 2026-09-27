import { useEffect, useRef, useState } from "react";
import SectionHead from "./SectionHead";
import { Fade } from "./Motion";
import { finePointer } from "./hooks";
import { PROJECTS } from "../data/constants";

/* Generative cover per project — no stock imagery, same visual language as the hero field. */
function Cover({ seed }) {
    const W = 400, H = 250;
    const rnd = (k => () => ((k = (k * 16807) % 2147483647) / 2147483647))(seed * 7919 + 13);
    const kind = seed % 3;
    const paths = [];
    if (kind === 0) {
        // streamlines
        for (let i = 0; i < 26; i++) {
            const y0 = (i / 26) * H + 6, amp = 8 + rnd() * 26, f = 0.008 + rnd() * 0.012, ph = rnd() * 6;
            let d = `M0 ${y0}`;
            for (let x = 0; x <= W; x += 10) d += ` L${x} ${(y0 + Math.sin(x * f + ph) * amp).toFixed(1)}`;
            paths.push({ d, hot: i % 9 === 4 });
        }
    } else if (kind === 1) {
        // concentric rings
        const cx = W * (0.35 + rnd() * 0.3), cy = H * (0.4 + rnd() * 0.2);
        for (let r = 12; r < 360; r += 12) paths.push({ d: `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy}`, hot: r === 96 });
    } else {
        // bars (signal / time series)
        for (let i = 0; i < 48; i++) {
            const x = 10 + i * 8, h = 20 + Math.abs(Math.sin(i * 0.35 + rnd() * 2)) * 150 * rnd() + 10;
            paths.push({ d: `M${x} ${H - 20} L${x} ${H - 20 - h}`, hot: i === 31 });
        }
    }
    return (
        <svg viewBox={`0 0 ${W} ${H}`} role="presentation">
            <rect width={W} height={H} fill="var(--bg-2)" />
            {paths.map((p, i) => (
                <path key={i} d={p.d} fill="none" stroke={p.hot ? "var(--accent)" : "var(--fg)"} strokeOpacity={p.hot ? 1 : 0.28} strokeWidth={p.hot ? 1.6 : 1} />
            ))}
        </svg>
    );
}

export default function Work() {
    const [hover, setHover] = useState(-1);
    const prevRef = useRef(null);

    useEffect(() => {
        if (!finePointer()) return;
        let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
        const move = e => { tx = e.clientX; ty = e.clientY; };
        const loop = () => {
            x += (tx - x) * 0.12; y += (ty - y) * 0.12;
            const el = prevRef.current;
            if (el) {
                // Sit right of the cursor; flip left near the edge, keep inside the viewport vertically
                const w = el.offsetWidth, h = el.firstChild?.offsetHeight || 320;
                const px = x + 28 + w > window.innerWidth - 16 ? x - w - 28 : x + 28;
                const py = Math.min(Math.max(16, y - h / 2), window.innerHeight - h - 16);
                el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
            }
            raf = requestAnimationFrame(loop);
        };
        loop();
        window.addEventListener("pointermove", move, { passive: true });
        return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); };
    }, []);

    return (
        <section id="work" className="sec">
            <SectionHead n="03" label="Selected work" aside={`${PROJECTS.length} projects`} title={[<>Things I've</>, <><em>built.</em></>]} />
            <ul className="work wrap" onPointerLeave={() => setHover(-1)}>
                {PROJECTS.map((p, i) => (
                    <Fade as="li" key={p.id} delay={i * 50} className="work-row" onPointerEnter={() => setHover(i)}>
                        <a className="work-link" href={p.link || undefined} target="_blank" rel="noreferrer" data-cursor={p.link ? (p.badge === "Live" ? "Visit" : "Code") : "Private"} aria-label={`${p.title} — ${p.sub}${p.link ? "" : " (private)"}`}>
                            <span className="work-i label">{String(i + 1).padStart(2, "0")}</span>
                            <span className="work-t">{p.title}</span>
                            <span className="work-s">{p.sub}</span>
                            <span className="work-tags label">{p.tags.slice(0, 2).join(" · ")}</span>
                            <span className="work-arrow" aria-hidden="true">↗</span>
                        </a>
                        <p className="work-d">{p.desc}</p>
                    </Fade>
                ))}
            </ul>

            <div className="work-preview" ref={prevRef} aria-hidden="true">
                {PROJECTS.map((p, i) => (
                    <div key={p.id} className={`wp ${hover === i ? "on" : ""}`}>
                        <Cover seed={p.id} />
                        <div className="wp-meta">
                            <span className="label accent">{p.badge}</span>
                            <p>{p.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
