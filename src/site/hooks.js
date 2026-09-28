import { useEffect, useRef, useState } from "react";

export const reducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
