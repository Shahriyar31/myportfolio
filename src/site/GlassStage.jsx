import { useEffect, useRef } from "react";

/*
 * One persistent glass box for the whole page. Elements with data-glass are "slots":
 * the box glides to whichever slot is nearest the middle of the screen, opening up by
 * its data-explode value. With no slot in view it fades out and stops rendering.
 */
export const Glass = { box: null };

export default function GlassStage() {
    const ref = useRef(null);
    useEffect(() => {
        let box = null, alive = true, raf = 0, shown = 0, cur = null, since = 0, lastY = scrollY;
        const cv = ref.current;
        const frame = () => {
            raf = requestAnimationFrame(frame);
            if (!box) return;
            box.kick(scrollY - lastY); lastY = scrollY;
            const slots = [...document.querySelectorAll("[data-glass]")], mid = innerHeight / 2;
            let best = null, bw = 0, vis = 0;
            slots.forEach(el => {
                const r = el.getBoundingClientRect();
                if (!r.height) return;
                const w = Math.max(0, 1 - Math.abs(r.top + r.height / 2 - mid) / (innerHeight * 0.85));
                const overlap = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / Math.min(r.height, innerHeight);
                vis = Math.max(vis, overlap);
                if (w > bw) { bw = w; best = r; best.explode = Number(el.dataset.explode || 0); best.el = el; }
            });
            shown += ((vis > 0.3 ? 1 : 0) - shown) * 0.2;
            cv.style.opacity = shown < 0.02 ? "0" : shown.toFixed(3);
            if (best && best.el !== cur) { cur = best.el; since = performance.now(); }
            // glide for ~0.9 s after switching slots, then stick to the slot exactly
            if (best) box.setMood(best.el.dataset.mood === "ok" ? 1 : 0);
            if (best) box.place(best.left + best.width / 2, best.top + best.height / 2, best.height, best.explode, performance.now() - since > 900);
            if (shown < 0.01) box.stop(); else box.start();
        };
        const move = e => box?.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
        const boot = () => import("./GlassBox").then(({ default: GlassBox }) => {
            if (!alive) return;
            try { box = new GlassBox(cv, { mobile: innerWidth < 860 }); Glass.box = box; } catch { /* no WebGL: slots show their captions only */ }
        });
        (window.requestIdleCallback || (f => setTimeout(f, 300)))(boot);
        raf = requestAnimationFrame(frame);
        window.addEventListener("pointermove", move, { passive: true });
        return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); box?.dispose(); Glass.box = null; };
    }, []);
    return <canvas ref={ref} className="v-glass" aria-hidden="true" />;
}
