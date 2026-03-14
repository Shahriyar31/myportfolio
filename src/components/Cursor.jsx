import { useEffect, useRef } from "react";

export default function Cursor() {
    const dot = useRef(null);
    const ring = useRef(null);
    const pos = useRef({ x: 0, y: 0 });
    const ringPos = useRef({ x: 0, y: 0 });
    const rot = useRef(0);
    const init = useRef(false);
    const isClicked = useRef(false);
    
    useEffect(() => {
        if (window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 768) return;

        let raf;
        const onMouseMove = (e) => {
            if (!init.current) {
                init.current = true;
                pos.current = { x: e.clientX, y: e.clientY };
                ringPos.current = { x: e.clientX, y: e.clientY };
                document.body.classList.add("cursor-active");
            }
            pos.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseDown = () => isClicked.current = true;
        const onMouseUp = () => isClicked.current = false;

        const render = () => {
            if (init.current) {
                const ds = isClicked.current ? 0.7 : 1;
                const rs = isClicked.current ? 0.85 : 1;

                if (dot.current) {
                    dot.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) scale(${ds})`;
                }

                ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
                ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;
                rot.current += 3.5;
                
                if (ring.current) {
                    ring.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) rotate(${rot.current}deg) scale(${rs})`;
                }
            }
            raf = requestAnimationFrame(render);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);
        raf = requestAnimationFrame(render);

        const on = () => document.body.classList.add("ch");
        const off = () => document.body.classList.remove("ch");
        
        const attach = () => document.querySelectorAll("a, button, .pcard, .spill, [role='button'], input, textarea").forEach(el => {
            el.removeEventListener("mouseenter", on);
            el.removeEventListener("mouseleave", off);
            el.addEventListener("mouseenter", on);
            el.addEventListener("mouseleave", off);
        });

        attach();
        const obs = new MutationObserver(attach);
        obs.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mouseup", onMouseUp);
            cancelAnimationFrame(raf);
            obs.disconnect();
        };
    }, []);

    return (
        <>
            <div id="cr" ref={ring}>
                <div className="satellite" />
            </div>
            <div id="cd" ref={dot} />
        </>
    );
}
