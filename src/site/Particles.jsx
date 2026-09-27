import { useEffect, useRef } from "react";
import { reducedMotion } from "./hooks";

/*
 * Drives the particle universe from the page: every element with
 * data-shape="…" is a keyframe. Between two keyframes' centres the
 * particles hold, then swirl into the next shape.
 * data-side: "right" | "left" | "center" (+ data-dy), data-dim: 0..1
 */
const SIDE_X = { right: 4.2, left: -4.2, center: 0 };

export default function Particles() {
    const ref = useRef(null);
    useEffect(() => {
        let scene, alive = true, raf = 0;
        const mobile = innerWidth < 860;
        const cfg = el => ({
            shape: el.dataset.shape,
            x: mobile ? 0 : SIDE_X[el.dataset.side || "right"],
            y: (mobile ? (el.dataset.side === "center" ? 0 : 2.2) : 0) + Number(el.dataset.dy || 0),
            dim: Math.min(0.95, Number(el.dataset.dim || 0) + (mobile && el.dataset.side !== "center" ? 0.35 : 0)),
        });
        const update = () => {
            if (!scene) return;
            const keys = [...document.querySelectorAll("[data-shape]")];
            if (!keys.length) return;
            const mid = innerHeight / 2;
            const centres = keys.map(el => { const r = el.getBoundingClientRect(); return r.top + Math.min(r.height, innerHeight) / 2; });
            let i = centres.findIndex(c => c > mid) - 1;
            if (i < -1) i = keys.length - 1;
            if (i === -1) { const c = cfg(keys[0]); scene.set(c, c, 0); return; }
            if (i >= keys.length - 1) { const c = cfg(keys[keys.length - 1]); scene.set(c, c, 0); return; }
            const t = (mid - centres[i]) / (centres[i + 1] - centres[i]);
            const m = Math.min(1, Math.max(0, (t - 0.3) / 0.45));
            scene.set(cfg(keys[i]), cfg(keys[i + 1]), m);
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        const move = e => scene?.pointer(e.clientX, e.clientY);
        const click = e => { if (!e.target.closest("a,button,input,canvas.game,textarea,label,[role=button]")) scene?.burst(e.clientX, e.clientY); };
        const vis = () => (document.hidden ? scene?.stop() : scene?.start());

        import("./ParticleScene").then(({ default: ParticleScene }) => {
            if (!alive) return;
            try { scene = new ParticleScene(ref.current, { mobile }); } catch { return; }
            update();
            if (reducedMotion()) { scene.tick(); return; }
            scene.start();
            ref.current.classList.add("is-ready");
        });
        window.addEventListener("scroll", on, { passive: true });
        window.addEventListener("resize", on);
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("pointerdown", click);
        document.addEventListener("visibilitychange", vis);
        return () => {
            alive = false; cancelAnimationFrame(raf); scene?.dispose();
            window.removeEventListener("scroll", on); window.removeEventListener("resize", on);
            window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", click);
            document.removeEventListener("visibilitychange", vis);
        };
    }, []);
    return <canvas ref={ref} className="particles" aria-hidden="true" />;
}
