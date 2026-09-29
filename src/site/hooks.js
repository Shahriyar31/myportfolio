import { useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * One scroll lock for the whole site. Every popup, the menu and the preloader call
 * lockScroll() when they open and unlockScroll() when they close; the page only
 * scrolls again when nothing is holding it. (Separate locks used to fight each other.)
 */
let locks = 0;
export function lockScroll() { locks++; if (locks === 1) { window.__lenis?.stop(); document.body.classList.add("is-locked"); } }
export function unlockScroll() { locks = Math.max(0, locks - 1); if (locks === 0) { window.__lenis?.start(); document.body.classList.remove("is-locked"); } }

/*
 * Fit: a panel measures itself against the space it has. If it is too tall it drops
 * its least important details, one level at a time (data-drop="1" goes first, then 2,
 * then 3), so nothing is ever cut off, on any screen. max(compact) returns the height
 * the panel may use, in px.
 */
export function useFit(ref, max, deps = []) {
    const mx = useRef(max); mx.current = max;
    useLayoutEffect(() => {
        const el = ref.current; if (!el) return;
        let raf = 0;
        const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
            const room = mx.current(window.matchMedia(COMPACT).matches);
            el.style.maxHeight = ""; el.classList.remove("is-scroll"); el.removeAttribute("data-lenis-prevent");
            for (let l = 0; l <= 3; l++) { el.dataset.fit = String(l); if (el.offsetHeight <= room + 1) break; }
            // last resort on very small screens: the panel scrolls inside instead of being cut off
            if (el.offsetHeight > room + 1) { el.style.maxHeight = `${Math.max(160, room)}px`; el.classList.add("is-scroll"); el.setAttribute("data-lenis-prevent", ""); }
        }); };
        run(); const t = setTimeout(run, 400);
        addEventListener("resize", run); document.fonts?.ready.then(run);
        return () => { cancelAnimationFrame(raf); clearTimeout(t); removeEventListener("resize", run); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

export const reducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** phones and upright tablets get the compact arrangement */
export const COMPACT = "(max-width: 860px), (max-width: 1180px) and (orientation: portrait)";
export const compact = () => typeof window !== "undefined" && window.matchMedia(COMPACT).matches;

export const finePointer = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Fires once when the element scrolls into view. */
export function useInView({ threshold = 0.2, rootMargin = "0px 0px -8% 0px" } = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setInView(true); io.disconnect(); }
        }, { threshold, rootMargin });
        io.observe(el);
        return () => io.disconnect();
    }, [threshold, rootMargin]);
    return [ref, inView];
}

export function useMedia(query) {
    const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const on = () => setMatch(mq.matches);
        on();
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, [query]);
    return match;
}

const fmtTime = () =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", timeZoneName: "short" })
        .format(new Date())
        .replace("GMT+2", "CEST")
        .replace("GMT+1", "CET");

/** Local time in Hamburg, e.g. "14:05 CEST". */
export function useHamburgTime() {
    const [t, setT] = useState(fmtTime);
    useEffect(() => {
        const id = setInterval(() => setT(fmtTime()), 15000);
        return () => clearInterval(id);
    }, []);
    return t;
}

/** Smooth-scroll to a section, via Lenis when it is running. */
export function scrollToId(id) {
    const el = id === "home" ? 0 : document.getElementById(id);
    if (el === null) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.6 });
    else if (el === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else el.scrollIntoView({ behavior: "smooth" });
}

/** From inside a demo overlay: close it, then scroll to a section. */
export function goTo(id) {
    window.dispatchEvent(new Event("demo-close"));
    setTimeout(() => scrollToId(id), 380);
}
