import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import SectionHead from "./SectionHead";
import { useMedia } from "./hooks";
import PHOTOS from "../data/photos.json";

// Vertical pixels scrolled per horizontal pixel moved (<1 = gallery moves faster than the page)
const SPEED = 0.45;

const src = (n, sm) => `/photos/${n}${sm ? "-sm" : ""}.webp`;

function Lightbox({ idx, setIdx }) {
    const n = PHOTOS.length;
    const prev = useCallback(() => setIdx(i => (i - 1 + n) % n), [n, setIdx]);
    const next = useCallback(() => setIdx(i => (i + 1) % n), [n, setIdx]);
    useEffect(() => {
        const key = e => { if (e.key === "Escape") setIdx(-1); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
        window.addEventListener("keydown", key);
        window.__lenis?.stop();
        document.body.classList.add("is-locked");
        return () => { window.removeEventListener("keydown", key); window.__lenis?.start(); document.body.classList.remove("is-locked"); };
    }, [prev, next, setIdx]);
    const p = PHOTOS[idx];
    return (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={e => e.target === e.currentTarget && setIdx(-1)}>
            <div className="lb-bar">
                <span className="label">{String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
                <button className="label" onClick={() => setIdx(-1)} autoFocus>Close ✕</button>
            </div>
            <img key={p.n} src={src(p.n)} alt={`Photograph ${idx + 1} of ${n}`} width={p.w} height={p.h} />
            <button className="lb-nav lb-prev" onClick={prev} aria-label="Previous photo">←</button>
            <button className="lb-nav lb-next" onClick={next} aria-label="Next photo">→</button>
        </div>
    );
}

export default function Photos() {
    const outerRef = useRef(null);
    const trackRef = useRef(null);
    const [idx, setIdx] = useState(-1);
    const mobile = useMedia("(max-width: 860px)");

    // Vertical scroll drives the horizontal track while the section is pinned.
    useLayoutEffect(() => {
        const outer = outerRef.current, track = trackRef.current;
        if (mobile) { outer.style.height = ""; track.style.transform = ""; return; }
        let dist = 0, raf = 0;
        const measure = () => {
            dist = Math.max(0, track.scrollWidth - window.innerWidth);
            outer.style.height = `${dist * SPEED + window.innerHeight}px`;
            update();
        };
        const update = () => {
            const top = outer.getBoundingClientRect().top;
            const p = dist ? Math.min(1, Math.max(0, -top / (dist * SPEED))) : 0;
            track.style.transform = `translate3d(${-p * dist}px, 0, 0)`;
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(track);
        window.addEventListener("scroll", on, { passive: true });
        window.addEventListener("resize", measure);
        return () => { ro.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", measure); };
    }, [mobile]);

    return (
        <section id="photography" className="sec">
            <SectionHead n="06" label="Off-screen" aside="Landscape & street" title={["Through the", <><em>lens.</em></>]} />
            <div className="photos" ref={outerRef}>
                <div className="photos-sticky">
                    <div className="photos-track" ref={trackRef}>
                        {PHOTOS.map((p, i) => (
                            <button key={p.n} className="ph" style={{ aspectRatio: `${p.w} / ${p.h}` }} onClick={() => setIdx(i)} data-cursor="View" aria-label={`Open photograph ${i + 1}`}>
                                <img src={src(p.n, true)} alt="" loading="lazy" decoding="async" width={p.w} height={p.h} />
                                <span className="ph-n label">{String(i + 1).padStart(2, "0")}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {idx >= 0 && <Lightbox idx={idx} setIdx={setIdx} />}
        </section>
    );
}
