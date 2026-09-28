import { useLayoutEffect, useRef } from "react";
import { useInView, finePointer } from "./hooks";

/**
 * Masked line reveal. `lines` may contain JSX (e.g. <em>).
 * `play` gates the reveal (e.g. until the preloader has finished).
 */
export function Lines({ lines, as: Tag = "div", className = "", delay = 0, stagger = 90, play = true }) {
    const [ref, inView] = useInView({ threshold: 0.25 });
    return (
        <Tag ref={ref} className={`lines ${play && inView ? "is-in" : ""} ${className}`}>
            {lines.map((l, i) => (
                <span className="line" key={i}>
                    <span className="line-inner" style={{ transitionDelay: `${delay + i * stagger}ms` }}>{l}</span>
                </span>
            ))}
        </Tag>
    );
}

export function Fade({ as: Tag = "div", delay = 0, className = "", play = true, children, style, ...rest }) {
    const [ref, inView] = useInView({ threshold: 0.15 });
    return (
        <Tag ref={ref} className={`fade ${play && inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>
            {children}
        </Tag>
    );
}

/** Scales a single line of text to exactly fill its container width. */
export function FitChars({ text, play, delay = 0, className = "" }) {
    const wrapRef = useRef(null);
    const innerRef = useRef(null);
    useLayoutEffect(() => {
        const wrap = wrapRef.current, inner = innerRef.current;
        const fit = () => {
            inner.style.fontSize = "100px";
            const w = inner.scrollWidth;
            if (w) inner.style.fontSize = `${(100 * wrap.clientWidth) / w}px`;
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(wrap);
        document.fonts?.ready.then(fit);
        return () => ro.disconnect();
    }, [text]);
    return (
        <div ref={wrapRef} className={className} aria-label={text}>
            <span ref={innerRef} className={`fit chars ${play ? "is-in" : ""}`} style={{ display: "inline-block", whiteSpace: "nowrap" }} aria-hidden="true">
                {text.split("").map((c, i) => (
                    <span className="ch" key={i}>
                        <span style={{ transitionDelay: `${delay + i * 35}ms` }}>{c === " " ? " " : c}</span>
                    </span>
                ))}
            </span>
        </div>
    );
}

/** Pulls its child toward the pointer while hovered. */
export function Magnetic({ children, strength = 0.3 }) {
    const ref = useRef(null);
    const move = e => {
        if (!finePointer()) return;
        const el = ref.current, r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const leave = () => { ref.current.style.transform = ""; };
    return <span ref={ref} className="magnetic" onPointerMove={move} onPointerLeave={leave}>{children}</span>;
}

export const Arrow = ({ className = "arrow" }) => (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/** Letter-by-letter 3D reveal. `lines` items are strings or <em>string</em>. */
export function Chars({ lines, as: Tag = "div", className = "", delay = 0, stagger = 22, play = true }) {
    const [ref, inView] = useInView({ threshold: 0.3 });
    let n = 0;
    const split = (text, wrap) => text.split(/(\s+)/).map((w, wi) => (/^\s+$/.test(w) ? w : (
        <span className="chw" key={wi}>{[...w].map((c, ci) => { const d = delay + n++ * stagger; const ch = <span className="ch" key={ci} style={{ transitionDelay: `${d}ms` }}>{c}</span>; return wrap ? wrap(ch, ci) : ch; })}</span>
    )));
    return (
        <Tag ref={ref} className={`chars ${play && inView ? "is-in" : ""} ${className}`} aria-label={lines.map(l => (typeof l === "string" ? l : l.props.children)).join(" ")}>
            {lines.map((l, i) => (
                <span className="chl" key={i} aria-hidden="true">
                    {typeof l === "string" ? split(l) : <l.type {...l.props}>{split(String(l.props.children))}</l.type>}
                </span>
            ))}
        </Tag>
    );
}

/** Counts up to `to` when it scrolls into view (non-numeric values are shown as-is). */
export function CountUp({ to, ms = 1400 }) {
    const [ref, inView] = useInView({ threshold: 0.5 });
    const num = Number(to), spanRef = useRef(null);
    useLayoutEffect(() => {
        if (!inView || Number.isNaN(num) || !spanRef.current) return;
        let raf = 0; const t0 = performance.now();
        const f = now => { const k = Math.min(1, (now - t0) / ms); spanRef.current.textContent = String(Math.round(num * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(f); };
        raf = requestAnimationFrame(f);
        return () => cancelAnimationFrame(raf);
    }, [inView, num, ms]);
    return <b ref={ref}><span ref={spanRef}>{Number.isNaN(num) ? to : 0}</span></b>;
}
