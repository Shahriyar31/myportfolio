import { useEffect, useRef } from "react";
import { STATIONS, CHAPTERS } from "./stations";
import { setWarmth } from "./theme";
import { reducedMotion } from "./hooks";

/*
 * The Model behind the page. Every element with data-station="id" is a keyframe:
 * while its centre crosses the middle of the screen the particles morph into that
 * station's shape. data-flight maps an element's scroll progress to the plane's flight.
 */
export default function World() {
    const ref = useRef(null);
    const hudRef = useRef(null), placeRef = useRef(null), chapRef = useRef(null), barRef = useRef(null), exploredRef = useRef(null), seen = useRef(new Set());

    useEffect(() => {
        let scene, alive = true, raf = 0;
        const pose = id => STATIONS[id] || STATIONS.overview;
        const update = () => {
            if (!scene) return;
            const narrow = innerWidth < 860;
            const keys = [...document.querySelectorAll("[data-station]")];
            if (!keys.length) return;
            const mid = innerHeight / 2;
            const c = keys.map(el => { const r = el.getBoundingClientRect(); return r.top + Math.min(r.height, innerHeight) / 2; });
            const i = c.findIndex(v => v > mid) - 1;
            let A, B, t = 0;
            if (i < 0) { A = B = keys[0]; } else if (i >= keys.length - 1) { A = B = keys[keys.length - 1]; } else {
                A = keys[i]; B = keys[i + 1];
                t = Math.min(1, Math.max(0, ((mid - c[i]) / (c[i + 1] - c[i]) - 0.25) / 0.5));
                // the hero is a tall sticky runway: morph in step with its scroll progress
                if (A.dataset.station === "hero") { const r = A.getBoundingClientRect(); t = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight || 1))); }
                t = t * t * (3 - 2 * t);
            }
            const a = pose(A.dataset.station), b = pose(B.dataset.station), cur = t < 0.5 ? A : B, cs = t < 0.5 ? a : b;
            scene.setMorph(a.shape, b.shape, t);

            // keep the shape clear of the text pane: pane on the left → shape on the right
            const side = el => (el.classList.contains("is-left") ? 1 : el.classList.contains("is-right") ? -1 : 0);
            const card = cur.closest("section.act");
            scene.setLayout({ side: side(A) + (side(B) - side(A)) * t, dim: card ? 0.35 : 1, narrow: narrow && !!cur.closest(".stop"), y: A.dataset.station === "hero" ? -0.9 * (1 - t) : 0 });
            const fl = cs.flight ? document.querySelector("[data-flight]") : null;
            if (fl) { const r = fl.getBoundingClientRect(); scene.setFlight((mid - r.top) / r.height); } else scene.setFlight(null);
            setWarmth((a.warm || 0) + ((b.warm || 0) - (a.warm || 0)) * t);

            // tour HUD: chapter, place, how much you have explored
            const ch = CHAPTERS.findIndex(([id]) => id === cur.closest("section[id]")?.id);
            hudRef.current?.classList.toggle("is-on", ch >= 0 && !card);
            if (ch >= 0) {
                chapRef.current.textContent = `${String(ch + 1).padStart(2, "0")} / ${String(CHAPTERS.length).padStart(2, "0")} · ${CHAPTERS[ch][1]}`;
                [...barRef.current.children].forEach((el, k) => { el.className = k < ch ? "is-done" : k === ch ? "is-cur" : ""; });
                if (placeRef.current.textContent !== cs.name) {
                    placeRef.current.textContent = cs.name;
                    seen.current.add(cs.name);
                    const all = new Set(keys.filter(e => e.closest("main")).map(e => STATIONS[e.dataset.station]?.name).filter(Boolean));
                    const n = [...seen.current].filter(x => all.has(x)).length;
                    exploredRef.current.textContent = n >= all.size ? `All ${all.size} stops explored ★` : `Explored ${n} / ${all.size} stops`;
                }
            }
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        const move = e => scene?.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
        const click = e => { if (!e.target.closest("button,a,input,textarea,.pane,.act,.dock")) scene?.pulse(); };
        const vis = () => (document.hidden ? scene?.stop() : scene?.start());

        import("./ModelScene").then(({ default: ModelScene }) => {
            if (!alive) return;
            try { scene = new ModelScene(ref.current, { mobile: innerWidth < 860 }); } catch { return; }
            update();
            if (reducedMotion()) { scene.tick(); window.addEventListener("scroll", () => requestAnimationFrame(() => { update(); scene.tick(); }), { passive: true }); }
            else scene.start();
            ref.current.classList.add("is-ready");
        });
        window.addEventListener("scroll", on, { passive: true });
        window.addEventListener("resize", on);
        window.addEventListener("pointermove", move, { passive: true });
        document.addEventListener("visibilitychange", vis);
        window.addEventListener("click", click);
        return () => {
            alive = false; cancelAnimationFrame(raf); scene?.dispose(); setWarmth(0);
            window.removeEventListener("scroll", on); window.removeEventListener("resize", on);
            window.removeEventListener("pointermove", move); window.removeEventListener("click", click); document.removeEventListener("visibilitychange", vis);
        };
    }, []);

    return (
        <>
            <canvas ref={ref} className="world" aria-hidden="true" />
            <div ref={hudRef} className="hud neu" aria-hidden="true">
                <div className="hud-txt">
                    <span ref={chapRef} className="mono" />
                    <b ref={placeRef} />
                    <span ref={exploredRef} className="hud-found mono" />
                    <span ref={barRef} className="hud-bar">{CHAPTERS.map(([id]) => <i key={id} />)}</span>
                </div>
            </div>
        </>
    );
}
