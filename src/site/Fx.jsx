import { useEffect, useRef } from "react";
import { finePointer, reducedMotion } from "./hooks";

/*
 * Page-wide interaction layer:
 * - a soft glowing cursor that grows over anything clickable (desktop only)
 * - cards tilt toward the pointer, with a light that follows it (--mx / --my)
 * - [data-draw] elements get --p = how far they've scrolled through the screen (0..1)
 */
export default function Fx() {
    const dot = useRef(null);
    useEffect(() => {
        const still = reducedMotion(), fine = finePointer();
        let mx = -100, my = -100, x = -100, y = -100, raf = 0, hot = false;
        const move = e => {
            mx = e.clientX; my = e.clientY;
            hot = !!e.target.closest?.("a, button, input, [role=button]");
            const card = e.target.closest?.(".v-card, .v-proj, .v-feature, .v-early");
            document.querySelectorAll(".is-tilt").forEach(c => { if (c !== card) { c.classList.remove("is-tilt"); c.style.transform = ""; } });
            if (card) {
                const r = card.getBoundingClientRect(), px = (mx - r.left) / r.width, py = (my - r.top) / r.height;
                card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`); card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
                if (!still && !card.classList.contains("v-early")) { card.classList.add("is-tilt"); card.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 5).toFixed(2)}deg) rotateY(${((px - 0.5) * 7).toFixed(2)}deg) translateY(-4px)`; }
            }
        };
        const draw = () => { document.querySelectorAll("[data-draw]").forEach(el => { const r = el.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height))); el.style.setProperty("--p", p.toFixed(3)); }); };
        const loop = () => {
            raf = requestAnimationFrame(loop);
            if (fine && dot.current) { x += (mx - x) * 0.2; y += (my - y) * 0.2; dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${hot ? 2.6 : 1})`; }
        };
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("scroll", draw, { passive: true }); draw();
        if (fine && !still) loop();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("scroll", draw); };
    }, []);
    return <div ref={dot} className="v-cursor" aria-hidden="true" />;
}
