import { useEffect, useRef, useState } from "react";
import { Fade } from "./Motion";
import { scrollToId, reducedMotion, finePointer } from "./hooks";

/* The hook: one giant name over the floating valley. Letters lean toward the cursor,
   and as you scroll they scatter into the sky while the camera dives into the world. */

const ROLES = ["trustworthy AI agents", "governed data platforms", "EU AI Act-ready systems", "secure LLM apps"];
const NAME = ["Farhan", "Shahriyar"];

function RoleTicker() {
    const [i, setI] = useState(0);
    useEffect(() => {
        if (reducedMotion()) return;
        const t = setInterval(() => setI(v => (v + 1) % ROLES.length), 2400);
        return () => clearInterval(t);
    }, []);
    return (
        <span className="hx-ticker" aria-label={ROLES.join(", ")}>
            <span className="hx-ticker-track" style={{ transform: `translateY(${-i * 1.25}em)` }} aria-hidden="true">
                {ROLES.map(r => <span key={r}>{r}</span>)}
            </span>
        </span>
    );
}

export default function Hero({ ready }) {
    const root = useRef(null);
    const letters = useRef([]);

    useEffect(() => {
        const el = root.current, ls = letters.current.filter(Boolean);
        // a fixed random scatter per letter, so the break-up looks hand-thrown, not uniform
        const rnd = ls.map((_, i) => { const r = Math.sin(i * 91.7) * 43758.5; return r - Math.floor(r); });
        let boxes = [], mx = -1e4, my = -1e4, raf = 0, lift = ls.map(() => 0);
        const measure = () => { boxes = ls.map(l => { const r = l.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2 + scrollY]; }); };
        const move = e => { mx = e.clientX; my = e.clientY + scrollY; };
        const leave = () => { mx = my = -1e4; };
        const still = reducedMotion();
        const loop = () => {
            const run = el.offsetHeight - innerHeight;
            const p = Math.min(1, Math.max(0, scrollY / (run || 1)));
            el.style.setProperty("--p", p.toFixed(3));
            if (p < 1 && !still) {
                ls.forEach((l, i) => {
                    const [cx, cy] = boxes[i] || [0, 0];
                    const d = Math.hypot(mx - cx, my - cy);
                    lift[i] += (Math.max(0, 1 - d / 240) - lift[i]) * 0.14;
                    const k = lift[i], r = rnd[i], side = i / (ls.length - 1) - 0.5;
                    const x = side * p * 260 + (r - 0.5) * p * 120, y = -p * (140 + r * 260) - k * 22;
                    l.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${((r - 0.5) * p * 50).toFixed(1)}deg) scale(${(1 + k * 0.08).toFixed(3)})`;
                    l.style.opacity = String(Math.max(0, 1 - p * (1.2 + r * 0.8)));
                });
            }
            raf = requestAnimationFrame(loop);
        };
        measure();
        const t = setTimeout(measure, 1600); // after the intro animation and font swap
        window.addEventListener("resize", measure);
        if (finePointer()) { window.addEventListener("pointermove", move, { passive: true }); document.addEventListener("pointerleave", leave); }
        loop();
        return () => { cancelAnimationFrame(raf); clearTimeout(t); window.removeEventListener("resize", measure); window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
    }, []);

    let n = 0;
    return (
        <section id="home" ref={root} className={`hx ${ready ? "is-in" : ""}`} data-station="hero">
            <div className="hx-stick">
                <div className="hx-top"><Fade play={ready} delay={100}>
                    <span className="chip mono"><span className="dot-live" />Open to new roles · Hamburg, Germany</span>
                </Fade></div>
                <h1 className="hx-name" aria-label="Farhan Shahriyar">
                    {NAME.map((w, wi) => (
                        <span key={w} className={`hx-word w${wi}`} aria-hidden="true">
                            {[...w].map((ch, ci) => {
                                const i = n++;
                                return <span key={ci} className="hx-l" ref={el => { letters.current[i] = el; }}><span className="hx-li" style={{ "--i": i }}>{ch}</span></span>;
                            })}
                        </span>
                    ))}
                </h1>
                <div className="hx-fade"><Fade play={ready} delay={900} className="hx-sub">
                    <p>AI & Data Engineer. I build <RoleTicker /></p>
                </Fade></div>
                <button className="hx-cue" onClick={() => scrollToId("bring")} aria-label="Scroll to enter the valley">
                    <span className="hx-cue-ring neu-sm"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" /></svg><i /></span>
                    <span className="mono">Scroll to enter the valley</span>
                </button>
            </div>
        </section>
    );
}
