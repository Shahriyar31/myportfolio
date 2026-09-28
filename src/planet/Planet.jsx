import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SKIES, NIGHT, DAY, WB, ORBS, PLACES, CHAPTERS } from "./world";
import { PROJECTS } from "../data/constants";
import { scrollToId, reducedMotion } from "../site/hooks";

/*
 * The planet behind the whole page. Sections carry data-angle (where on the planet this
 * chapter happens) and data-sky (its sky). The journey section drives the flight.
 * Clicks on the world: collect a skill orb, make me jump, plant a flower.
 * ← / → walk to the previous / next chapter.
 */
export const World = { scene: null };

/* the education story, in slots of scroll: college → getting ready → the flight → Hamburg */
export const JOURNEY = { spans: [1, 1, 1.4, 1], prep: [0.75, 1.85], takeoff: 2.05, land: 3.15 };

/* the project park: one stretch of scroll per project */
export const PROJECT_ORDER = PLACES.projects.items.map(i => i.id);
export function scrollToProject(k) {
    const el = document.getElementById("projects"); if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY + innerHeight * (+el.dataset.slot || 1) * (k + 0.15);
    window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.1 }) : scrollTo({ top: y, behavior: "smooth" });
}

/* small shared store: what the page shows (floor lit, flight progress, orbs found, project) */
const load = () => { try { return JSON.parse(localStorage.getItem("orbs") || "[]"); } catch { return []; } };
let state = { floor: -1, flight: 0, orbs: load(), project: 0, neural: false, toast: null, chapter: "home" };
const subs = new Set();
export const setUI = p => { state = { ...state, ...p }; subs.forEach(f => f()); };
export const useUI = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => state);
let toastTimer = 0;
export function toast(text) { clearTimeout(toastTimer); setUI({ toast: text }); toastTimer = setTimeout(() => setUI({ toast: null }), 3200); }
export function collect(id) {
    if (state.orbs.includes(id)) return;
    const orbs = [...state.orbs, id]; try { localStorage.setItem("orbs", JSON.stringify(orbs)); } catch { /* private mode */ }
    setUI({ orbs }); World.scene?.setCollected(orbs);
    const o = ORBS.find(x => x.id === id);
    toast(orbs.length === ORBS.length ? "All 5 skills found. Neural vision unlocked ✦" : `You found ${o.name} · ${orbs.length} / ${ORBS.length} skills`);
}

/* mix two skies (hex colours and numbers) */
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => "#" + a.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
const mixSky = (a, b, t) => { const o = {}; Object.keys(a).forEach(k => { o[k] = typeof a[k] === "number" ? a[k] + (b[k] - a[k]) * t : toHex(hex(a[k]).map((v, i) => v + (hex(b[k])[i] - v) * t)); }); return o; };
const smooth = x => x * x * (3 - 2 * x);
const SKY = v => (v === "N" ? NIGHT : v === "WB" ? WB : SKIES[v] || SKIES[0]);
/** how many slots of scroll we are into a deck section */
export const slotsInto = el => { const r = el.getBoundingClientRect(); return -r.top / (innerHeight * (+el.dataset.slot || 1)); };

export default function Planet() {
    const ref = useRef(null);
    const ui = useUI();

    useEffect(() => {
        let scene = null, alive = true, raf = 0, down = null;
        const mobile = innerWidth < 860 || innerHeight < 560;
        // keyframes along the page: [page y, planet angle, sky]
        const keys = () => {
            const out = [], sy = scrollY;
            document.querySelectorAll("[data-angle], [data-keys]").forEach(el => {
                const r = el.getBoundingClientRect(), top = r.top + sy, h = r.height;
                if (el.dataset.keys) {
                    const slot = innerHeight * (+el.dataset.slot || 1), base = top + innerHeight / 2;
                    JSON.parse(el.dataset.keys).forEach(([p, a, sk]) => out.push([base + slot * p, a, SKY(sk)]));
                } else {
                    const a = +el.dataset.angle;
                    const sky = SKIES[+el.dataset.sky || 0], span = Math.min(h, innerHeight);
                    out.push([top + span * 0.3, a, sky], [top + Math.max(span * 0.7, h - span * 0.3), a, sky]);
                }
            });
            return out;
        };
        const direct = () => {
            if (!scene) return;
            const k = keys(); if (!k.length) return;
            const y = scrollY + innerHeight / 2;
            let i = k.findIndex(p => p[0] > y) - 1, angle, sky;
            if (i < 0) { angle = k[0][1]; sky = k[0][2]; } else if (i >= k.length - 1) { angle = k[k.length - 1][1]; sky = k[k.length - 1][2]; }
            else { const [ya, aa, sa] = k[i], [yb, ab, sb] = k[i + 1], t = smooth(Math.min(1, Math.max(0, (y - ya) / (yb - ya || 1)))); angle = aa + (ab - aa) * t; sky = mixSky(sa, sb, t); }
            const light = document.documentElement.dataset.theme === "light";
            if (light) sky = mixSky(sky, DAY, 0.68);
            scene.setAngle(angle); scene.setSky(state.neural ? mixSky(sky, NIGHT, 0.9) : sky);
            // chapter moments
            const J = document.getElementById("journey"), c = document.getElementById("contact");
            if (J) { const p = slotsInto(J), f = Math.min(1, Math.max(0, (p - JOURNEY.takeoff) / (JOURNEY.land - JOURNEY.takeoff))); scene.setFlight(p < JOURNEY.takeoff ? 0 : f); scene.setPrep(p > JOURNEY.prep[0] && p < JOURNEY.prep[1]); if (Math.abs(f - state.flight) > 0.004 || Math.abs(p - (state.journey ?? 0)) > 0.02) setUI({ flight: f, journey: p }); }
            if (c) { const r = c.getBoundingClientRect(); scene.setSit(r.top < innerHeight * 0.55 && r.bottom > innerHeight * 0.4); }
            const pj = document.getElementById("projects");
            if (pj) {
                const r = pj.getBoundingClientRect(), inView = r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
                const k = Math.min(PROJECT_ORDER.length - 1, Math.max(0, Math.floor(slotsInto(pj) + 0.45)));
                if (k !== state.project) setUI({ project: k });
                scene.setCoding(inView); scene.setProject(inView ? k : -1, PROJECTS.find(x => x.id === PROJECT_ORDER[k])?.color);
            }
            const cur = CHAPTERS.map(([id]) => document.getElementById(id)).filter(Boolean).reduce((best, el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5 ? el.id : best; }, state.chapter);
            if (cur !== state.chapter) setUI({ chapter: cur });
        };
        const loop = () => { direct(); raf = requestAnimationFrame(loop); };
        const move = e => scene?.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
        const onDown = e => { down = e.target === ref.current || e.target.closest?.(".pl-sec, .pl-stage, .pl-deck") === e.target ? [e.clientX, e.clientY] : null; };
        const onUp = e => {
            if (!down || !scene || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return;
            const r = scene.click(e.clientX, e.clientY); if (!r) return;
            if (r.orb) setTimeout(() => collect(r.orb), 400);
            else if (r.me) toast(["Hi! 👋 Scroll to walk with me.", "Wheee!", "Try the arrow keys too."][Math.floor(Math.random() * 3)]);
        };
        const key = e => {
            if (e.target.closest?.("input, textarea, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
            const dirn = e.key === "ArrowRight" || e.key === "d" ? 1 : e.key === "ArrowLeft" || e.key === "a" ? -1 : 0; if (!dirn) return;
            const ids = CHAPTERS.map(c => c[0]), i = Math.max(0, ids.indexOf(state.chapter)), next = ids[Math.min(ids.length - 1, Math.max(0, i + dirn))];
            e.preventDefault(); scrollToId(next);
        };
        const vis = () => (document.hidden ? scene?.stop() : scene?.start());
        import("./PlanetScene").then(({ default: PlanetScene }) => {
            if (!alive) return;
            try { scene = new PlanetScene(ref.current, { mobile }); } catch { return; }
            World.scene = scene; scene.setCollected(state.orbs); scene.setMail(false);
            direct(); scene.angle = scene.goalAngle; scene.start(); ref.current.classList.add("is-ready");
            if (reducedMotion()) scene.renderer.setPixelRatio(1);
        });
        raf = requestAnimationFrame(loop);
        addEventListener("pointermove", move, { passive: true }); addEventListener("pointerdown", onDown); addEventListener("pointerup", onUp); addEventListener("keydown", key); document.addEventListener("visibilitychange", vis);
        return () => { alive = false; cancelAnimationFrame(raf); removeEventListener("pointermove", move); removeEventListener("pointerdown", onDown); removeEventListener("pointerup", onUp); removeEventListener("keydown", key); document.removeEventListener("visibilitychange", vis); scene?.dispose(); World.scene = null; };
    }, []);

    useEffect(() => { World.scene?.setNeural(ui.neural); }, [ui.neural]);

    return (
        <>
            <canvas ref={ref} className="pl-world" aria-hidden="true" />
            <Hud ui={ui} />
        </>
    );
}

/* the skill-orb counter and messages */
function Hud({ ui }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button className={`pl-orbs ${ui.chapter === "lens" ? "is-hide" : ""}`} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={`Skills found: ${ui.orbs.length} of ${ORBS.length}`}>
                {ORBS.map(o => <i key={o.id} className={ui.orbs.includes(o.id) ? "is-got" : ""} style={{ "--c": o.color }} />)}
                <span className="mono">{ui.orbs.length}/{ORBS.length} skills found</span>
            </button>
            <button className={`pl-vision ${ui.neural ? "is-on" : ""} ${ui.chapter === "lens" ? "is-hide" : ""}`} onClick={() => setUI({ neural: !ui.neural })} aria-pressed={ui.neural} title="See my world the way my AI sees it">
                <i aria-hidden="true" /><span>{ui.neural ? "Back to my world" : "AI vision"}</span>
            </button>
            {open && <div className="pl-orbs-tip pl-glass" role="status">Five glowing skill orbs are hidden on my planet. Click one when you see it. {ui.orbs.length === ORBS.length ? "You found them all: neural vision is yours." : "Find all five to unlock neural vision."}</div>}
            <div className={`pl-toast pl-glass ${ui.toast ? "is-on" : ""}`} role="status" aria-live="polite">{ui.toast}</div>
        </>
    );
}
