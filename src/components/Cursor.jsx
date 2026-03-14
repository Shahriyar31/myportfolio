import { useEffect, useRef } from "react";

export default function Cursor() {
    const d = useRef(null), r = useRef(null);
    const rp = useRef({ x: 0, y: 0 }), cp = useRef({ x: 0, y: 0 }), raf = useRef(null);
    useEffect(() => {
        if (window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 768) return;
        const mv = e => { cp.current = { x: e.clientX, y: e.clientY }; if (d.current) { d.current.style.left = e.clientX + "px"; d.current.style.top = e.clientY + "px"; } };
        const lp = () => { rp.current.x += (cp.current.x - rp.current.x) * .1; rp.current.y += (cp.current.y - rp.current.y) * .1; if (r.current) { r.current.style.left = rp.current.x + "px"; r.current.style.top = rp.current.y + "px"; } raf.current = requestAnimationFrame(lp); };
        const on = () => document.body.classList.add("ch"), off = () => document.body.classList.remove("ch");
        document.addEventListener("mousemove", mv); raf.current = requestAnimationFrame(lp);
        const attach = () => document.querySelectorAll("a,button,.pcard,.spill").forEach(el => { el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off); el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", off); });
        attach(); const obs = new MutationObserver(attach); obs.observe(document.body, { childList: true, subtree: true });
        return () => { document.removeEventListener("mousemove", mv); cancelAnimationFrame(raf.current); obs.disconnect(); };
    }, []);
    return <><div id="cd" ref={d} /><div id="cr" ref={r} /></>;
}
