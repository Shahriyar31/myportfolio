import { createPortal } from "react-dom";
import SectionHead from "./SectionHead";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lines } from "./Motion";
import { reducedMotion, useMedia, lockScroll, unlockScroll } from "./hooks";
import PHOTOS from "../data/photos.json";

const CATS = ["All", "Street", "Mountains", "Wildlife", "Light", "Close-up"];
const src = (n, big) => `/photos/${n}${big ? "" : "-sm"}.webp`;

function Lightbox({ list, idx, setIdx }) {
    const n = list.length;
    const prev = useCallback(() => setIdx(i => (i - 1 + n) % n), [n, setIdx]);
    const next = useCallback(() => setIdx(i => (i + 1) % n), [n, setIdx]);
    useEffect(() => {
        const key = e => { if (e.key === "Escape") setIdx(-1); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
        window.addEventListener("keydown", key); lockScroll();
        return () => { window.removeEventListener("keydown", key); unlockScroll(); };
    }, [prev, next, setIdx]);
    const p = list[idx];
    return createPortal(
        <div className="lb" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={e => e.target === e.currentTarget && setIdx(-1)}>
            <figure className="lb-frame neu-lg">
                <img key={p.n} src={src(p.n, true)} alt={p.t || `${p.c} photograph`} width={p.w} height={p.h} />
                <figcaption><span className="mono">{String(idx + 1).padStart(2, "0")} / {n} · {p.c}</span>{p.t && <b>{p.t}</b>}</figcaption>
            </figure>
            <button className="key lb-btn lb-prev" onClick={prev} aria-label="Previous photo">←</button>
            <button className="key lb-btn lb-next" onClick={next} aria-label="Next photo">→</button>
            <button className="key key-sm lb-close" onClick={() => setIdx(-1)} autoFocus>Close</button>
        </div>, document.body
    );
}

export default function Lens() {
    const [cat, setCat] = useState("All");
    const [open, setOpen] = useState(-1);
    const mobile = useMedia("(max-width: 860px)");
    const list = useMemo(() => (cat === "All" ? PHOTOS : PHOTOS.filter(p => p.c === cat)), [cat]);
    const rows = useMemo(() => {
        const per = Math.max(8, Math.ceil(list.length / (list.length > 24 ? 2 : 1)));
        return list.length > 24 ? [list.slice(0, per), list.slice(per)] : [list];
    }, [list]);

    const stageRef = useRef(null);
    const ringRefs = useRef([]);
    const state = useRef({ angle: 0, vel: 0, drag: false, lastX: 0, moved: 0 });

    // Spin: slow auto-rotation + drag with inertia + a nudge from page scroll speed
    useEffect(() => {
        const st = state.current;
        let raf = 0, lastY = scrollY, visible = false;
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
        io.observe(stageRef.current);
        const loop = () => {
            if (visible) {
                const sv = scrollY - lastY; lastY = scrollY;
                if (!st.drag) { st.vel = st.vel * 0.94 + (reducedMotion() ? 0 : 0.035) * 0.06 + sv * 0.004; }
                st.angle += st.vel;
                ringRefs.current.forEach((r, i) => { if (r) r.style.transform = `translateZ(calc(var(--R) * -1)) rotateY(${(i ? -1 : 1) * st.angle}deg)`; });
            } else lastY = scrollY;
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => { cancelAnimationFrame(raf); io.disconnect(); };
    }, []);

    // Drag is tracked on window (not pointer capture) so clicks still reach each photo
    const down = e => { const st = state.current; st.drag = true; st.lastX = e.clientX; st.moved = 0; };
    useEffect(() => {
        const move = e => {
            const st = state.current;
            if (!st.drag) return;
            const dx = e.clientX - st.lastX;
            st.lastX = e.clientX; st.moved += Math.abs(dx);
            st.vel = dx * 0.12;
        };
        const up = () => { state.current.drag = false; };
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
        return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
    }, []);

    const W = mobile ? 150 : 200, GAP = mobile ? 14 : 22;

    return (
        <section id="lens" className="act" data-station="sky">
            <div className="wrap"><SectionHead n="07" kicker="Photography" title="Through my lens" sub="Street, mountains and wildlife — mostly West Bengal and the Himalaya. Drag the rings to spin them." /></div>

            <div className="lens-filters wrap" role="tablist" aria-label="Photo categories">
                {CATS.map(c => {
                    const count = c === "All" ? PHOTOS.length : PHOTOS.filter(p => p.c === c).length;
                    return <button key={c} role="tab" aria-selected={cat === c} className={`key key-sm ${cat === c ? "is-down" : ""}`} onClick={() => setCat(c)}>{c}<span className="mono">{count}</span></button>;
                })}
            </div>

            <div className="lens-stage" ref={stageRef} onPointerDown={down}>
                {rows.map((row, ri) => {
                    const step = 360 / row.length;
                    const R = Math.max(420, (row.length * (W + GAP)) / (2 * Math.PI));
                    return (
                        <div key={`${cat}-${ri}`} className="ring-wrap" style={{ "--R": `${R}px`, "--W": `${W}px` }}>
                            <div className="ring" ref={el => { ringRefs.current[ri] = el; }}>
                                {row.map((p, i) => (
                                    <button
                                        key={p.n}
                                        className="ph"
                                        style={{ transform: `rotateY(${i * step}deg) translateZ(${R}px)`, animationDelay: `${(i % 12) * 40}ms` }}
                                        onClick={() => { if (state.current.moved < 6) { setOpen(list.indexOf(p)); } }}
                                        aria-label={`Open ${p.t || p.c + " photograph"}`}
                                    >
                                        <img src={src(p.n)} alt="" loading="lazy" decoding="async" draggable="false" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {open >= 0 && <Lightbox list={list} idx={open} setIdx={setOpen} />}
        </section>
    );
}
