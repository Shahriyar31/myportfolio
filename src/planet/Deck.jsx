import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "../site/hooks";

/*
 * A deck of cards driven by scrolling. The section is tall; the cards sit on a stage that
 * stays on screen. For each card: it flies in (from the side, or pops out of a spot on the
 * planet), holds while you read, then crumbles into dust as the next one arrives.
 *
 * p = how many "slots" of scroll you are into the section (a slot is `slot` screen heights).
 */
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const clamp = t => Math.min(1, Math.max(0, t));

/** dust that follows the scroll: a card turns to sand from left to right as it leaves */
function makeDust() {
    const c = document.createElement("canvas"); c.className = "pl-dust"; document.body.appendChild(c);
    const x = c.getContext("2d"), sets = new Map(); let w = 0, h = 0, dpr = 1;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); w = innerWidth; h = innerHeight; c.width = w * dpr; c.height = h * dpr; c.style.width = `${w}px`; c.style.height = `${h}px`; };
    size(); addEventListener("resize", size);
    return {
        frame(list) { // list: [{ key, rect, e, color }]
            x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
            list.forEach(({ key, rect, e, color }) => {
                let ps = sets.get(key);
                if (!ps) { const n = Math.min(1500, Math.round(rect.width * rect.height / 150)), cols = [color, "#ffffff", color, "#5fd0ff"]; ps = Array.from({ length: n }, () => ({ fx: Math.random(), fy: Math.random(), s: 1 + Math.random() * 2.4, vx: 0.8 + Math.random() * 2.2, vy: -0.4 - Math.random() * 1.8, r: Math.random(), c: cols[Math.floor(Math.random() * cols.length)] })); sets.set(key, ps); }
                const edge = e * 1.25 - 0.18;
                ps.forEach(p => {
                    const u = (edge - p.fx * 0.92 - p.r * 0.08) / 0.4; if (u <= 0 || u >= 1) return;
                    const k = u * u; x.globalAlpha = (1 - u) * 0.95; x.fillStyle = p.c;
                    x.fillRect(rect.left + p.fx * rect.width + p.vx * k * 150, rect.top + p.fy * rect.height + p.vy * k * 150 + Math.sin(u * 7 + p.s) * 5, p.s, p.s);
                });
            });
        },
        dispose() { removeEventListener("resize", size); c.remove(); },
    };
}

/**
 * cards: [{ key, node, span = 1, from = "right" | "left" | "pop", pop: () => {x, y}, color, onProgress(q, el) }]
 * keys:  planet keyframes for this section, [[p, angle, sky], ...] (read by the planet)
 */
export default function Deck({ id, cards, keys, slot = 0.95, side = "left", className = "", sky, ...rest }) {
    const sec = useRef(null), wraps = useRef([]), inners = useRef([]), [near, setNear] = useState(0);
    const total = cards.reduce((a, c) => a + (c.span || 1), 0);
    const cardsRef = useRef(cards); cardsRef.current = cards;
    useEffect(() => {
        const dust = makeDust(), still = reducedMotion(); let raf = 0, lastNear = -1;
        const loop = () => {
            raf = requestAnimationFrame(loop);
            const el = sec.current; if (!el) return; const r = el.getBoundingClientRect();
            if (r.bottom < -200 || r.top > innerHeight + 200) { dust.frame([]); return; }
            const p = -r.top / (innerHeight * slot), cs = cardsRef.current, list = [];
            let s = 0, nr = 0;
            cs.forEach((c, k) => {
                const span = c.span || 1, start = s, end = s + span; s = end;
                const wrap = wraps.current[k], inner = inners.current[k]; if (!wrap || !inner) return;
                if (p > start - 0.45) nr = k;
                const tin = k === 0 ? 1 : clamp((p - (start - 0.42)) / 0.42), tout = k === cs.length - 1 ? 0 : clamp((p - (end - 0.5)) / 0.42);
                const vis = tin > 0 && tout < 1;
                wrap.style.visibility = vis ? "visible" : "hidden"; wrap.classList.toggle("is-live", tin >= 1 && tout <= 0); wrap.classList.toggle("is-pre", tin < 1);
                if (!vis) return;
                const e1 = ease(tin);
                let tf = "none";
                if (tin < 1 && !still) {
                    if (c.from === "pop" && c.pop) { const o = c.pop(), wr = wrap.getBoundingClientRect(); if (o) tf = `translate(${(o.x - wr.left - wr.width / 2) * (1 - e1)}px, ${(o.y - wr.top - wr.height / 2) * (1 - e1)}px) scale(${0.04 + 0.96 * e1})`; }
                    else { const d = c.from === "left" ? -1 : 1; tf = `perspective(1200px) translateX(${(1 - e1) * d * 75}vw) rotateY(${(1 - e1) * d * -38}deg) scale(${0.86 + 0.14 * e1})`; }
                }
                inner.style.transform = tf; inner.style.opacity = still ? String(tin * (1 - tout)) : String(Math.min(1, tin * 1.6));
                inner.style.filter = tin < 1 && !still ? `blur(${(1 - e1) * 8}px)` : "";
                if (tout > 0 && !still) { const X = tout * 125 - 18; inner.style.webkitMaskImage = inner.style.maskImage = `linear-gradient(100deg, transparent ${X}%, #000 ${X + 16}%)`; list.push({ key: c.key, rect: inner.getBoundingClientRect(), e: tout, color: c.color || "#5fd0ff" }); }
                else inner.style.webkitMaskImage = inner.style.maskImage = "";
                c.onProgress?.(clamp((p - start) / Math.max(0.5, span - 0.5)), inner);
            });
            dust.frame(list);
            if (nr !== lastNear) { lastNear = nr; setNear(nr); }
        };
        raf = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(raf); dust.dispose(); };
    }, [slot]);
    return (
        <section id={id} ref={sec} className={`pl-deck ${className}`} style={{ height: `calc(${total * slot * 100}svh + 100svh)` }} data-keys={JSON.stringify(keys)} data-slot={slot} {...rest}>
            <div className={`pl-stage pl-${side}`}>
                {cards.map((c, k) => (
                    <div key={c.key} className="pl-slot" ref={el => { wraps.current[k] = el; }}>
                        <div className="pl-slot-in" ref={el => { inners.current[k] = el; }}>{Math.abs(k - near) <= 1 ? c.node : null}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
