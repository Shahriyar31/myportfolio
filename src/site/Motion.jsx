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
