import { useEffect, useRef, useState } from "react";
import { STATIONS, CHAPTERS } from "./stations";
import { setWarmth } from "./theme";
import { scrollToId, reducedMotion } from "./hooks";

/*
 * Fixed 3D world behind the page. Every element with data-station="id" is a
 * camera keyframe: while its centre crosses the middle of the screen the camera
 * glides to that station. data-flight on an element maps its scroll progress
 * to the plane's flight.
 */
const SECTION_FOR = { lake: "bring", tower: "bring", gate: "game", sources: "bring", hq: "work", uni: "tuhh", town: "bring", college: "education", "p-argus": "built", "p-poultry": "built", "p-radiation": "built", "p-stock": "built", "p-twin": "built", "p-books": "built", desk: "agent" };

// district tags shown on the wide shots, so visitors learn the map
const DISTRICTS = [["Data valley", -8, 5, -6], ["Governance gate", 3, 5.2, -1], ["AI tower", 9.5, 10.5, -4], ["Nordex HQ", -3, 11.4, 10], ["Campus · TUHH", 3.5, 4.4, 13.5],
    ["Argus lab", 13.5, 4, -11], ["Radar", 16, 5.5, 0], ["StockFlow", 11.5, 4.5, 12.5], ["Digital twin", -9.5, 4.8, 13.5], ["Poultry barn", -15, 3.6, 10], ["My desk", -12.5, 3, 4.5], ["Home · West Bengal", -78, 4, -60]];
const WIDE = new Set(["overview", "finale", "photos"]);

// top-down points of interest for the mini-map (x, z)
const POI = [[-4, 1], [3, -1], [9.5, -4], [-3, 10], [5, 11], [13.5, -11], [16, 0], [11.5, 12.5], [-9.5, 13.5], [-15, 10], [1.5, 14.8], [-12.5, 4.5], [-79.5, -61], [-75, -58]];

function Hud({ hudRef, meRef, placeRef, chapRef, barRef, exploredRef, nextRef }) {
    return (
        <div ref={hudRef} className="hud neu" aria-hidden="true">
            <div className="hud-map neu-in-sm">
                <svg viewBox="-24 -22 48 42">
                    <circle className="isl" cx="0" cy="0" r="19" />
                    <circle className="isl" cx="-78" cy="-60" r="9" />
                    <path className="route" d="M-71.5 -55 Q-50 -10 -8.5 4.5" />
                    {POI.map(([x, z]) => <circle key={x + "," + z} className="poi" cx={x} cy={z} r="1.8" />)}
                    <g ref={meRef}><circle className="me-ring" r="2.4" /><circle className="me" r="2.2" /></g>
                </svg>
            </div>
            <div className="hud-txt">
                <span ref={chapRef} className="mono" />
                <b ref={placeRef} />
                <span ref={exploredRef} className="hud-found mono" />
                <button ref={nextRef} className="hud-next mono" onClick={e => { const t = e.currentTarget.target; if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY + Math.min(t.offsetHeight, innerHeight) / 2 - innerHeight / 2, behavior: "smooth" }); }} />
                <span ref={barRef} className="hud-bar">{CHAPTERS.map(([id]) => <i key={id} />)}</span>
            </div>
        </div>
    );
}

export default function World() {
    const ref = useRef(null);
    const [tip, setTip] = useState(null);
    const tipRef = useRef(null);
    const tipVal = useRef(null);
    const pinRef = useRef(null), tagsRef = useRef(null), view = useRef({ pin: null, wide: false });
    const nextRef = useRef(null), exploredRef = useRef(null), seen = useRef(new Set()), hudRef = useRef(null), meRef = useRef(null), placeRef = useRef(null), chapRef = useRef(null), barRef = useRef(null);

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
                // the hero is a tall sticky runway: dive in step with its scroll progress
                if (A.dataset.station === "hero") { const r = A.getBoundingClientRect(); const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight || 1))); t = p * p * (3 - 2 * p); }
            }
            // the flight stop follows the plane: camera trails behind and beside it
            const fl = document.querySelector("[data-flight]");
            let flightT = 0;
            if (fl) { const r = fl.getBoundingClientRect(); flightT = (mid - r.top) / r.height; scene.setFlight(flightT); }
            const poseOf = el => {
                const st = pose(el.dataset.station);
                if (!st.follow) return st;
                const pt = scene.flightPoint(Math.min(1, Math.max(0, flightT)));
                return { ...st, l: pt, p: [pt[0] + 9, pt[1] + 3.5, pt[2] + 4] }; // side-on chase view; ends east of the lake, clear of the HQ
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
            // the hero sways slowly around the valley, and stops as you dive in
            scene.setOrbit(A.dataset.station === "hero" ? 1 - t : 0);
            const cur = t < 0.5 ? A : B;
            scene.setFocus((t < 0.5 ? a : b).focus || null);
            // what the pin points at: the subject of the card on screen
            {
                const st = t < 0.5 ? a : b, el = t < 0.5 ? A : B, title = el.querySelector(".pane-title")?.textContent;
                view.current.wide = WIDE.has(el.dataset.station);
                view.current.pin = el.classList.contains("stop") && title && !st.follow ? { at: st.l, name: st.name, title } : null;
                const pe = pinRef.current;
                if (pe && view.current.pin && pe.dataset.k !== title) { pe.dataset.k = title; pe.querySelector("span").textContent = st.name; pe.querySelector("b").textContent = title; }
            }
            // tour HUD: which chapter, which place, where on the map
            const ch = CHAPTERS.findIndex(([id]) => id === cur.closest("section[id]")?.id);
            hudRef.current?.classList.toggle("is-on", ch >= 0 && !cur.closest("section.act") && !cur.classList.contains("opener")); // big cards need the corner
            if (ch >= 0) {
                const name = (t < 0.5 ? a : b).name || "";
                chapRef.current.textContent = `${String(ch + 1).padStart(2, "0")} / ${String(CHAPTERS.length).padStart(2, "0")} · ${CHAPTERS[ch][1]}`;
                if (placeRef.current.textContent !== name) {
                    placeRef.current.textContent = name;
                    // a light collect-them-all: every new place you reach counts
                    if (name) seen.current.add(name);
                    const all = new Set([...document.querySelectorAll("main [data-station]")].map(e => STATIONS[e.dataset.station]?.name).filter(Boolean));
                    const n = [...seen.current].filter(x => all.has(x)).length;
                    exploredRef.current.textContent = n >= all.size ? `All ${all.size} places explored ★` : `Explored ${n} / ${all.size} places`;
                }
                [...barRef.current.children].forEach((b, k) => { b.className = k < ch ? "is-done" : k === ch ? "is-cur" : ""; });
                // next stop: one click takes you to the next place in the story
                const ks = keys.filter(e => e.closest("main")), nx = ks[ks.indexOf(cur) + 1];
                if (nextRef.current.target !== nx) { nextRef.current.target = nx; nextRef.current.textContent = nx ? `Next: ${STATIONS[nx.dataset.station]?.name || "keep scrolling"} ↓` : "The end ★"; }
                meRef.current.setAttribute("transform", `translate(${look[0].toFixed(1)} ${look[2].toFixed(1)})`);
                // zoom the map to the island you are on; show both while travelling between them
                const far = look[0] < -24, vb = far ? "-92 -74 122 100" : "-24 -22 48 42";
                const svg = meRef.current.ownerSVGElement;
                if (svg.getAttribute("viewBox") !== vb) { svg.setAttribute("viewBox", vb); svg.classList.toggle("is-far", far); }
            }
            setWarmth((a.warm || 0) + ((b.warm || 0) - (a.warm || 0)) * t);
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        const move = e => {
            scene?.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
            // hover names only where the world is the main thing on screen (hero)
            if (!scene || scrollY > innerHeight * 0.6 || e.target.closest(".hx-name, .hx-sub, button, a, input, .top, .rail, .dock, .dock-wrap")) { if (tipVal.current) { tipVal.current = null; setTip(null); } return; }
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
            // labels follow the camera every frame
            scene.afterTick = () => {
                const v = view.current, pe = pinRef.current, tg = tagsRef.current;
                if (pe) {
                    const p = v.pin && scene.project(v.pin.at[0], v.pin.at[1] + 1.3, v.pin.at[2]);
                    pe.classList.toggle("is-on", !!(p && p[2]));
                    if (p) pe.style.transform = `translate3d(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px, 0)`;
                }
                if (tg) {
                    tg.classList.toggle("is-on", v.wide);
                    if (v.wide) [...tg.children].forEach((el, i) => { const [, x, y, z] = DISTRICTS[i], p = scene.project(x, y, z); el.style.transform = `translate3d(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px, 0)`; el.style.opacity = p[2] ? "" : "0"; });
                }
            };
            if (import.meta.env.DEV) window.__world = scene;
            update();
            scene.jumpView(scene.goalPos.toArray(), scene.goalLook.toArray());
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
            <div ref={pinRef} className="world-pin" aria-hidden="true"><div className="world-pin-card neu"><span className="mono" /><b /></div></div>
            <div ref={tagsRef} className="world-tags" aria-hidden="true">{DISTRICTS.map(([n]) => <span key={n} className="world-tag mono">{n}</span>)}</div>
            <Hud hudRef={hudRef} meRef={meRef} placeRef={placeRef} chapRef={chapRef} barRef={barRef} exploredRef={exploredRef} nextRef={nextRef} />
            <div ref={tipRef} className={`world-tip neu ${tip ? "is-on" : ""}`} aria-hidden="true">{tip?.label}{tip && SECTION_FOR[tip.id] && <span className="mono">click to visit</span>}</div>
        </>
    );
}
