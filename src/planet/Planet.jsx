import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SKIES, NIGHT, DAY, WB, ORBS, PLACES, CHAPTERS } from "./world";
import { PROJECTS } from "../data/constants";
import { scrollToId, reducedMotion, compact } from "../site/hooks";

/*
 * The planet behind the whole page. Sections carry data-angle (where on the planet this
 * chapter happens) and data-sky (its sky). The journey section drives the flight.
 * Clicks on the world: collect a skill orb, make me jump, plant a flower.
 * ← / → walk to the previous / next chapter.
 */
export const World = { scene: null };
/* each chapter can ask for its own camera: Views[id] = () => ({ dy, fx, zoom, focus }) */
export const Views = {};
/* a line for me to say right now (overrides the chapter's line for a few seconds) */
let sayTimer = 0;
export function say(text, ms = 3200) { clearTimeout(sayTimer); setUI({ say: text }); sayTimer = setTimeout(() => setUI({ say: null }), ms); }

/* the education story, in slots of scroll: college → getting ready → the flight → Hamburg */
export const JOURNEY = { spans: [1, 2.3, 1.4, 1], prep: [0.75, 3.15], takeoff: 3.35, land: 4.45 };

/* the project park: one stretch of scroll per project */
export const PROJECT_ORDER = PLACES.projects.items.map(i => i.id);
export function scrollToProject(k) {
    const el = document.getElementById("projects"); if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY + innerHeight * (+el.dataset.slot || 1) * k;
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
                const k = Math.min(PROJECT_ORDER.length - 1, Math.max(0, Math.round(slotsInto(pj))));
                if (k !== state.project) setUI({ project: k });
                scene.setCoding(inView); scene.setProject(inView ? k : -1, PROJECTS.find(x => x.id === PROJECT_ORDER[k])?.color);
            }
            scene.setView(Views[state.chapter]?.() || {});
            // where I stand on screen, so panels can keep clear of me (--me-x / --me-y on :root)
            const me = scene.screenOf("me"); if (me && (Math.abs(me.x - (state.meX ?? 0)) > 2 || Math.abs(me.y - (state.meY ?? 0)) > 2)) { state.meX = me.x; state.meY = me.y; const st = document.documentElement.style; st.setProperty("--me-x", `${Math.round(me.x)}px`); st.setProperty("--me-y", `${Math.round(me.y)}px`); const ft = scene.screenOf("feet"); if (ft) st.setProperty("--me-feet", `${Math.round(ft.y)}px`); }
            const cur = CHAPTERS.map(([id]) => document.getElementById(id)).filter(Boolean).reduce((best, el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5 ? el.id : best; }, state.chapter);
            if (cur !== state.chapter) setUI({ chapter: cur });
        };
        const loop = () => { direct(); raf = requestAnimationFrame(loop); };
        const move = e => scene?.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
        const onDown = e => { down = e.target === ref.current || e.target.closest?.(".pl-sec, .pl-stage, .pl-deck, .pl-show-stage, .pl-what-stage, .pl-what-sec, .pl-show-track, .pl-hero-copy") === e.target ? [e.clientX, e.clientY] : null; };
        const onUp = e => {
            if (!down || !scene || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return;
            const r = scene.click(e.clientX, e.clientY); if (!r) return;
            if (r.orb) setTimeout(() => collect(r.orb), 400);
            else if (r.me) say(["Hi! 👋 Scroll to walk with me.", "Wheee!", "Try the arrow keys too."][Math.floor(Math.random() * 3)]);
            else if (r.letter !== undefined) say(["Hey, those are my letters! 😄", "Careful, that's my name!", "Boing! Try the others."][Math.floor(Math.random() * 3)]);
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
            <Bubble ui={ui} />
            <Welcome />
        </>
    );
}

/* where each skill orb floats, and a way to get there */
const goEnd = id => { const el = document.getElementById(id); if (!el) return; const y = el.getBoundingClientRect().top + scrollY + el.offsetHeight - innerHeight * 1.05; window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: "smooth" }); };
const ORB_HINTS = {
    azure: ["Next to the AI tower (What I do)", () => scrollToId("what")],
    databricks: ["By the Nordex tower, before the ride up", () => scrollToId("experience")],
    rag: ["At the far end of the project park", () => scrollToProject(PROJECT_ORDER.length - 1)],
    euaiact: ["On the TUHH campus, after the flight", () => goEnd("journey")],
    python: ["Close to my desk", () => scrollToId("contact")],
};
/* the skill-orb counter and messages */
function Hud({ ui }) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (!open) return; const y0 = scrollY, f = () => Math.abs(scrollY - y0) > 120 && setOpen(false); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, [open]);
    return (
        <>
            <button className={`pl-orbs ${ui.chapter === "lens" ? "is-hide" : ""}`} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={`Skills found: ${ui.orbs.length} of ${ORBS.length}`}>
                {ORBS.map(o => <i key={o.id} className={ui.orbs.includes(o.id) ? "is-got" : ""} style={{ "--c": o.color }} />)}
                <span className="mono">{ui.orbs.length}/{ORBS.length} skills found</span>
            </button>
            <button className={`pl-vision ${ui.neural ? "is-on" : ""} ${ui.chapter === "lens" ? "is-hide" : ""}`} onClick={() => setUI({ neural: !ui.neural })} aria-pressed={ui.neural} title="See my world the way my AI sees it">
                <i aria-hidden="true" /><span>{ui.neural ? "Back to my world" : "AI vision"}</span>
            </button>
            {open && (
                <div className="pl-orbs-tip pl-glass" data-lenis-prevent role="dialog" aria-label="Skill orbs">
                    <div className="pl-orbs-top"><b>Find my 5 skill orbs</b><button onClick={() => setOpen(false)} aria-label="Close">×</button></div>
                    <p>They float along my path. Walk there, then click the glowing orb. {ui.orbs.length === ORBS.length ? "You found them all: neural vision is yours ✦" : "Find all five to unlock neural vision."}</p>
                    <ul>{ORBS.map(o => { const got = ui.orbs.includes(o.id), h = ORB_HINTS[o.id]; return (
                        <li key={o.id} className={got ? "is-got" : ""} style={{ "--c": o.color }}><i /><div><b>{o.name}</b><small>{got ? "Found ✓" : h[0]}</small></div>
                            {!got && <button onClick={() => { setOpen(false); h[1](); }}>Take me there →</button>}</li>); })}
                    </ul>
                </div>
            )}
            <div className={`pl-toast pl-glass ${ui.toast ? "is-on" : ""}`} role="status" aria-live="polite">{ui.toast}</div>
        </>
    );
}

/* what I say in each chapter (and at each stop of the journey) */
const LINES = {
    home: "Hey there, welcome to my little planet! 👋",
    what: "Here's what I actually do. Three things, done properly.",
    break: "Go on, try to break my AI. I won't mind.",
    experience: "Happy to walk you through my work at Nordex. Let's ride up!",
    projects: "Things I've built. Some are early work, but I learned from every one.",
    contact: "Thanks for walking with me. Fancy writing me a letter?",
};
const JOURNEY_LINES = ["Welcome to my college tour: Cooch Behar, where it all started.", "A year of forms, visas and packing. Worth it.", "Off to Germany! Wish me luck ✈", "Landed! Hamburg, rain and all. 🌧"];
function journeyStop(p) { const [a, b] = JOURNEY.spans; return p < a - 0.1 ? 0 : p < a + b - 0.1 ? 1 : p < JOURNEY.land ? 2 : 3; }
/* a speech bubble above my head; it follows me (or the plane) around the screen */
function Bubble({ ui }) {
    const el = useRef(null), [shown, setShown] = useState(""), text = ui.say || (ui.chapter === "journey" ? JOURNEY_LINES[journeyStop(ui.journey ?? 0)] : LINES[ui.chapter]) || "";
    const flying = ui.chapter === "journey" && journeyStop(ui.journey ?? 0) === 2;
    useEffect(() => { // type it out
        if (reducedMotion()) { setShown(text); return; }
        setShown(""); let i = 0; const id = setInterval(() => { i += text.length > 90 ? 4 : 2; setShown(text.slice(0, i)); if (i >= text.length) clearInterval(id); }, 28); return () => clearInterval(id);
    }, [text]);
    useEffect(() => {
        let raf = 0;
        const loop = () => {
            raf = requestAnimationFrame(loop); const b = el.current, s = World.scene; if (!b) return;
            const at = s?.screenOf(flying ? "plane" : "me");
            if (!at || !text || state.neural || at.y < 40 || at.y > innerHeight + 10 || at.x < -20 || at.x > innerWidth + 20) { b.style.opacity = "0"; return; }
            const hit = document.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, at.x)), Math.max(0, Math.min(innerHeight - 1, at.y + 18)));
            if (hit && hit.tagName !== "CANVAS" && !hit.matches?.("main, body, .pl-sec, .pl-deck, .pl-stage, .pl-show-stage, .pl-show-track, .pl-show-slot, .pl-what-sec, .pl-what-stage, .pl-hero, .pl-desk, .pl-in, .pl-sats-row, .pl-beams, .pl-exp-line, .pl-exp-line path")) { b.style.opacity = "0"; return; }
            const w = b.offsetWidth, h = b.offsetHeight, y = Math.max(80, at.y - 14), fit = x => Math.max(12, Math.min(innerWidth - w - (!compact() ? 110 : 12), x));
            // sit on whichever side of me is free of panels (the diary, the passport, a laptop)
            const R = [...document.querySelectorAll(".pl-avoid")].map(e => e.getBoundingClientRect()).filter(r => r.width), hits = x => R.some(r => x < r.right && x + w > r.left && y - h < r.bottom && y > r.top);
            let left = fit(at.x - 26); if (hits(left)) { const l2 = fit(at.x - w + 26); if (!hits(l2)) left = l2; }
            b.style.opacity = "1"; b.style.transform = `translate(${left}px, ${y}px) translateY(-100%)`; b.style.setProperty("--tail", `${Math.min(w - 16, Math.max(16, at.x - left))}px`);
        };
        raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
    }, [flying, text]);
    return <div ref={el} className={`pl-bubble ${text.length > 90 ? "is-long" : ""}`} aria-live="polite" role="status">{shown}<span className="pl-caret" aria-hidden="true" /></div>;
}

/* the first time someone visits: a short, honest hello */
function Welcome() {
    const [on, setOn] = useState(false);
    useEffect(() => {
        let seen = false; try { seen = !!localStorage.getItem("fs-welcomed"); } catch { /* private mode */ }
        if (seen) return;
        const id = setInterval(() => { if (!document.body.classList.contains("is-locked") && World.scene) { clearInterval(id); setTimeout(() => { setOn(true); World.scene?.once("emote-yes"); }, 1400); } }, 300);
        return () => clearInterval(id);
    }, []);
    const close = () => { setOn(false); try { localStorage.setItem("fs-welcomed", "1"); } catch { /* private mode */ } };
    if (!on) return null;
    return (
        <div className="pl-welcome" role="dialog" aria-label="Welcome">
            <div className="pl-welcome-box">
                <span className="pl-wave" aria-hidden="true">👋</span>
                <h2>Hi, I'm Farhan.</h2>
                <p>Thanks for stopping by. I'm an AI engineer at the start of my career, and I'm still learning something new every week.</p>
                <p>I built this little planet to show you what I work on, honestly and without the buzzwords. Walk with me, or take the 60-second read if you're short on time.</p>
                <div className="pl-ctas"><button className="pl-btn is-main" onClick={close}>Walk with me →</button><button className="pl-btn" onClick={() => { close(); dispatchEvent(new Event("quick-read")); }}>Quick read · 60 s</button></div>
            </div>
        </div>
    );
}
