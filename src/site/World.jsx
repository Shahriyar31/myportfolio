import { useEffect, useRef, useState } from "react";
import { STATIONS } from "./stations";
import { setWarmth } from "./theme";
import { scrollToId, reducedMotion } from "./hooks";

/*
 * Fixed 3D world behind the page. Every element with data-station="id" is a
 * camera keyframe: while its centre crosses the middle of the screen the camera
 * glides to that station. data-flight on an element maps its scroll progress
 * to the plane's flight.
 */
const SECTION_FOR = { lake: "bring", tower: "bring", gate: "game", sources: "bring", hq: "work", uni: "education", town: "bring", college: "education", "p-argus": "built", "p-poultry": "built", "p-radiation": "built", "p-stock": "built", "p-twin": "built", "p-books": "built" };

export default function World() {
    const ref = useRef(null);
    const [tip, setTip] = useState(null);
    const tipRef = useRef(null);
    const tipVal = useRef(null);

    useEffect(() => {
        let scene, alive = true, raf = 0;
        const mobile = innerWidth < 860;
        const pose = id => STATIONS[id] || STATIONS.overview;
        const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
        const update = () => {
            if (!scene) return;
            const narrow = innerWidth < 860; // layout can change on resize / rotation
            const keys = [...document.querySelectorAll("[data-station]")];
            if (!keys.length) return;
            const mid = innerHeight / 2;
            const c = keys.map(el => { const r = el.getBoundingClientRect(); return r.top + Math.min(r.height, innerHeight) / 2; });
            let i = c.findIndex(v => v > mid) - 1;
            let A, B, t = 0;
            if (i < 0) { A = B = keys[0]; } else if (i >= keys.length - 1) { A = B = keys[keys.length - 1]; } else {
                A = keys[i]; B = keys[i + 1];
                t = Math.min(1, Math.max(0, ((mid - c[i]) / (c[i + 1] - c[i]) - 0.25) / 0.5));
                t = t * t * (3 - 2 * t);
            }
            // the flight stop follows the plane: camera trails behind and beside it
            const fl = document.querySelector("[data-flight]");
            let flightT = 0;
            if (fl) { const r = fl.getBoundingClientRect(); flightT = (mid - r.top) / r.height; scene.setFlight(flightT); }
            const poseOf = el => {
                const st = pose(el.dataset.station);
                if (!st.follow) return st;
                const pt = scene.flightPoint(Math.min(1, Math.max(0, flightT)));
                return { ...st, l: pt, p: [pt[0] + 7, pt[1] + 3, pt[2] + 10] };
            };
            const a = poseOf(A), b = poseOf(B);
            const far = narrow ? 1.75 : 1.35 * Math.max(1, Math.sqrt(1.7 / (innerWidth / innerHeight))); // squarer screens need more room
            let look = mix(a.l, b.l, t);
            let pos = look.map((v, k) => v + (mix(a.p, b.p, t)[k] - v) * far);
            // keep the subject clear of the text pane: pane on the left → subject on the right
            const side = el => (el.classList.contains("is-left") ? 1 : el.classList.contains("is-right") ? -1 : 0);
            const sh = side(A) + (side(B) - side(A)) * t;
            const dx = look[0] - pos[0], dy = look[1] - pos[1], dz = look[2] - pos[2], dist = Math.hypot(dx, dy, dz);
            if (!narrow && sh) {
                const rl = Math.hypot(dx, dz) || 1, rx = -dz / rl, rz = dx / rl; // camera's right vector (horizontal)
                const k = -sh * dist * 0.24;
                pos = [pos[0] + rx * k, pos[1], pos[2] + rz * k]; look = [look[0] + rx * k, look[1], look[2] + rz * k];
            } else if (narrow && (A.classList.contains("stop") || B.classList.contains("stop"))) {
                const k = dist * 0.2; pos = [pos[0], pos[1] - k, pos[2]]; look = [look[0], look[1] - k, look[2]];
            }
            scene.setView(pos, look);
            scene.setFocus((t < 0.5 ? a : b).focus || null);
            setWarmth((a.warm || 0) + ((b.warm || 0) - (a.warm || 0)) * t);
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        const move = e => {
            scene?.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
            // hover names only where the world is the main thing on screen (hero)
            if (!scene || scrollY > innerHeight * 0.6 || e.target.closest("main .hero-copy, button, a, input, .top, .rail, .dock, .dock-wrap")) { if (tipVal.current) { tipVal.current = null; setTip(null); } return; }
            const hit = scene.hover(e.clientX, e.clientY);
            const nt = hit ? { label: hit.label, id: hit.id } : null;
            if (nt?.id !== tipVal.current?.id) { tipVal.current = nt; setTip(nt); }
            if (tipRef.current) tipRef.current.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY + 16}px, 0)`;
        };
        const click = e => { const t = tipVal.current; if (t?.id && SECTION_FOR[t.id] && !e.target.closest("button,a,input,textarea")) scrollToId(SECTION_FOR[t.id]); };
        const vis = () => (document.hidden ? scene?.stop() : scene?.start());

        import("./WorldScene").then(({ default: WorldScene }) => {
            if (!alive) return;
            try { scene = new WorldScene(ref.current, { mobile }); } catch { return; }
            if (import.meta.env.DEV) window.__world = scene;
            update();
            const s = pose(document.querySelector("[data-station]")?.dataset.station);
            scene.jumpView(s.p, s.l);
            if (reducedMotion()) { scene.tick(); window.addEventListener("scroll", () => requestAnimationFrame(() => { update(); scene.jumpView([...scene.goalPos.toArray()], [...scene.goalLook.toArray()]); scene.tick(); }), { passive: true }); }
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
            <div ref={tipRef} className={`world-tip neu ${tip ? "is-on" : ""}`} aria-hidden="true">{tip?.label}{tip && SECTION_FOR[tip.id] && <span className="mono">click to visit</span>}</div>
        </>
    );
}
