import { useRef } from "react";

export default function Mag({ as: Tag = "button", children, style = {}, href, target, rel, onClick, onMouseEnter, onMouseLeave, className, title, ...props }) {
    const ref = useRef(null);
    const mv = e => { const r = ref.current?.getBoundingClientRect(); if (!r) return; const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; if (ref.current) ref.current.style.transform = `translate(${x * .28}px,${y * .38}px)`; };
    const lv = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
    const base = { className, title, ref, style: { cursor: "none", transition: "transform .12s", ...style }, onMouseMove: mv, onMouseLeave: e => { lv(); onMouseLeave?.(e); }, onClick, onMouseEnter, ...props };
    if (Tag === "a") return <a {...base} href={href} target={target} rel={rel}>{children}</a>;
    return <button {...base}>{children}</button>;
}
