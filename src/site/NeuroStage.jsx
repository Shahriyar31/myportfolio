import { useEffect, useRef } from "react";
import { SPACING } from "./Neuro";
import { useChat } from "./chat";

/*
 * Mounts the vertical brain behind the page. Sections carry data-node="<region>";
 * the camera descends to whichever region is on screen. Labels name what you see.
 */
export const Net = { brain: null };

const LABELS = {
    1: ["1 · Input shield", "2 · AI judge", "3 · My AI", "4 · Output scan"].map((t, L) => ({ t, at: b => [b.cx + 3, -SPACING + 2.7 - L * 1.8, 0] })),
    2: ["Build", "Keep it legal", "Ship safely"].map((t, g) => ({ t, at: b => b.centerOf(2, g).add({ x: 0, y: 1.9, z: 0 }).toArray() })),
    3: [["Nordex Group", 0], ["TUHH", 1]].map(([t, g]) => ({ t, at: b => b.centerOf(3, g).add({ x: 0, y: g ? 1.9 : 2.8, z: 0 }).toArray() })),
    4: ["Argus AI", "Digital Twin", "Radiation Tracker", "StockFlow", "Poultry Shield", "Book Analysis"].map((t, g) => ({ t, big: !g, at: b => b.centerOf(4, g).add({ x: 0, y: g ? 1.05 : 2.4, z: 0 }).toArray() })),
    5: [["West Bengal, India", 0], ["Hamburg, Germany", 2]].map(([t, g]) => ({ t, big: 1, at: b => b.centerOf(5, g).add({ x: 0, y: 1.6, z: 0 }).toArray() })),
};

export default function NeuroStage() {
    const ref = useRef(null), labels = useRef(null);
    const { busy } = useChat();
    useEffect(() => { Net.brain?.setThinking(busy); }, [busy]);

    useEffect(() => {
        let brain = null, alive = true, raf = 0, lastMove = 0, lastY = scrollY, anchors = [];
        const mobile = innerWidth < 860, box = labels.current;
        const direct = () => {
            if (!brain) return;
            const keys = [...document.querySelectorAll("[data-node]")]; if (!keys.length) return;
            const mid = innerHeight / 2, c = keys.map(el => { const r = el.getBoundingClientRect(); return r.top + Math.min(r.height, innerHeight) / 2; });
            let i = c.findIndex(v => v > mid) - 1, A, B, t = 0;
            if (i < 0) A = B = keys[0]; else if (i >= keys.length - 1) A = B = keys[keys.length - 1];
            else { A = keys[i]; B = keys[i + 1]; t = Math.min(1, Math.max(0, (mid - c[i]) / (c[i + 1] - c[i]))); t = t * t * (3 - 2 * t); }
            const ra = +A.dataset.node, rb = +B.dataset.node, y = -(ra + (rb - ra) * t) * SPACING;
            const region = t < 0.5 ? ra : rb, zoom = region === 0 ? 15.5 : 17;
            brain.setView(y, mobile ? zoom * 1.35 : zoom, region, mobile ? (region === 0 ? 0.6 : 0.5) : 1);
            if (box.dataset.region !== String(region)) { box.dataset.region = region; renderLabels(region); }
            brain.flow(scrollY - lastY); lastY = scrollY;
        };
        const renderLabels = region => {
            box.innerHTML = ""; anchors = (LABELS[region] || []).map(l => { const el = document.createElement("span"); el.className = `v-nlabel ${l.big ? "is-big" : ""}`; el.textContent = l.t; box.appendChild(el); return { el, at: l.at(brain) }; });
        };
        const place = () => anchors.forEach(({ el, at }) => { const [x, y, ok] = brain.project(...at); el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`; el.style.opacity = ok ? "" : "0"; });
        const move = e => {
            brain?.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
            const now = performance.now(); if (brain && now - lastMove > 45) { lastMove = now; brain.touch(e.clientX, e.clientY); }
        };
        const click = e => { if (brain && !e.target.closest("a, button, input, textarea, .v-console, .v-card, .is-panel .v-wrap, .v-modal, .qr, .dock, .dock-wrap, .v-ask")) brain.burst(e.clientX, e.clientY); };
        const vis = () => (document.hidden ? brain?.stop() : brain?.start());
        import("./Neuro").then(({ default: Neuro }) => {
            if (!alive) return;
            try { brain = new Neuro(ref.current, { mobile }); Net.brain = brain; brain.afterTick = place; direct(); brain.start(); ref.current.classList.add("is-ready"); } catch { /* no WebGL: the page still reads fine */ }
        });
        const loop = () => { direct(); raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("pointerdown", click);
        document.addEventListener("visibilitychange", vis);
        return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", click); document.removeEventListener("visibilitychange", vis); brain?.dispose(); Net.brain = null; };
    }, []);
    return (
        <>
            <canvas ref={ref} className="v-net" aria-hidden="true" />
            <div ref={labels} className="v-nlabels" aria-hidden="true" />
        </>
    );
}
