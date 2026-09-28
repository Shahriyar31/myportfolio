import { useEffect, useRef } from "react";

/*
 * The neural network behind the whole page. Every element with data-cam="key" is a
 * camera keyframe; as its centre crosses the middle of the screen, the camera, the
 * brain → network morph and the brightness glide to that key's values.
 * The cursor fires neurons; a click in the hero sets off a burst.
 */
export const Net = { brain: null };

// p = camera position, l = look-at, mix = 0 brain … 1 layered network, dim = brightness
const CAMS = {
    hero: { p: [-3.6, 0.6, 18], l: [-3.6, 0, 0], mix: 0, dim: 1 }, // brain on the right, title on the left
    dive: { p: [0.4, 0.3, 3.4], l: [0, 0, -6], mix: 0, dim: 0.75 },
    layers: { p: [-3.8, 1.6, 14], l: [-3.8, 0, 0], mix: 1, dim: 1 },
    what: { p: [-4.4, -0.8, 12.5], l: [-4.4, 0, 0], mix: 1, dim: 0.95 },
    wide: { p: [0, 0, 24], l: [0, 0, 0], mix: 0.4, dim: 0.3 },
    person: { p: [0, 0.5, 13], l: [0, 0, 0], mix: 0, dim: 1 },
    story: { p: [6, 1, 20], l: [6, 0, 0], mix: 0, dim: 0.35 },
    end: { p: [0, 3, 27], l: [0, 0, 0], mix: 0, dim: 0.85 },
};

export default function BrainStage() {
    const ref = useRef(null);
    useEffect(() => {
        let brain = null, alive = true, raf = 0, lastMove = 0;
        const mobile = innerWidth < 860;
        const direct = () => {
            if (!brain) return;
            const keys = [...document.querySelectorAll("[data-cam]")]; if (!keys.length) return;
            const mid = innerHeight / 2, c = keys.map(el => { const r = el.getBoundingClientRect(); return r.top + Math.min(r.height, innerHeight) / 2; });
            let i = c.findIndex(v => v > mid) - 1, A, B, t = 0;
            if (i < 0) A = B = keys[0]; else if (i >= keys.length - 1) A = B = keys[keys.length - 1];
            else { A = keys[i]; B = keys[i + 1]; t = Math.min(1, Math.max(0, (mid - c[i]) / (c[i + 1] - c[i]))); t = t * t * (3 - 2 * t); }
            const a = CAMS[A.dataset.cam] || CAMS.hero, b = CAMS[B.dataset.cam] || CAMS.hero, m = (x, y) => x + (y - x) * t;
            let p = a.p.map((v, k) => m(v, b.p[k])), l = a.l.map((v, k) => m(v, b.l[k]));
            if (mobile) { p = [0, p[1], p[2] * 1.45]; l = [0, l[1], l[2]]; } // panels are full width on phones
            brain.setView(p, l, m(a.mix, b.mix), m(a.dim, b.dim) * (mobile && A.dataset.cam !== "hero" && A.dataset.cam !== "dive" && A.dataset.cam !== "person" ? 0.6 : 1));
        };
        const move = e => {
            brain?.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
            const now = performance.now();
            if (brain && now - lastMove > 45) { lastMove = now; brain.touch(e.clientX, e.clientY); }
        };
        const click = e => { if (brain && !e.target.closest("a, button, input, textarea, .v-console, .v-card, .v-panel, .v-modal, .qr, .dock, .dock-wrap")) brain.burst(e.clientX, e.clientY); };
        const vis = () => (document.hidden ? brain?.stop() : brain?.start());
        import("./Brain").then(({ default: Brain }) => {
            if (!alive) return;
            try { brain = new Brain(ref.current, { mobile }); Net.brain = brain; direct(); brain.start(); ref.current.classList.add("is-ready"); } catch { /* no WebGL: the page still reads fine */ }
        });
        const loop = () => { direct(); raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("pointerdown", click);
        document.addEventListener("visibilitychange", vis);
        return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", click); document.removeEventListener("visibilitychange", vis); brain?.dispose(); Net.brain = null; };
    }, []);
    return <canvas ref={ref} className="v-net" aria-hidden="true" />;
}
