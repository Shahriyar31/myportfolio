import { useEffect, useRef } from "react";
import FlowField from "./FlowField";
import { Lines, Fade, FitChars, Magnetic, Arrow } from "./Motion";
import { useHamburgTime, scrollToId, finePointer } from "./hooks";

export default function Hero({ ready, onOpenCv }) {
    const time = useHamburgTime();
    const nameRef = useRef(null);
    const portraitRef = useRef(null);

    // Portrait follows the pointer while hovering the name
    useEffect(() => {
        if (!finePointer()) return;
        const area = nameRef.current, pic = portraitRef.current;
        let x = 0, y = 0, tx = 0, ty = 0, raf = 0, prevX = 0;
        const move = e => { const r = area.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; };
        const enter = e => { move(e); x = tx; y = ty; pic.classList.add("on"); };
        const leave = () => pic.classList.remove("on");
        const loop = () => {
            x += (tx - x) * 0.14; y += (ty - y) * 0.14;
            const tilt = Math.max(-12, Math.min(12, (x - prevX) * 0.6));
            prevX = x;
            pic.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -60%) rotate(${tilt}deg)`;
            raf = requestAnimationFrame(loop);
        };
        loop();
        area.addEventListener("pointermove", move);
        area.addEventListener("pointerenter", enter);
        area.addEventListener("pointerleave", leave);
        return () => {
            cancelAnimationFrame(raf);
            area.removeEventListener("pointermove", move);
            area.removeEventListener("pointerenter", enter);
            area.removeEventListener("pointerleave", leave);
        };
    }, []);

    const meta = [
        ["Role", "AI & Data Engineer"],
        ["Currently", "Nordex Group · MSc @ TUHH"],
        ["Based", "Hamburg — 53.55°N 9.99°E"],
        ["Local time", time],
    ];

    return (
        <section id="home" className="hero">
            <FlowField className="hero-flow" />
            <div className="hero-flow-veil" />

            <div className="hero-meta">
                {meta.map(([k, v], i) => (
                    <Fade key={k} play={ready} delay={500 + i * 70} className="meta-item">
                        <span className="label">{k}</span>
                        <span className="meta-v">{v}</span>
                    </Fade>
                ))}
            </div>

            <div className="hero-main wrap">
                <h1 className="hero-title" aria-label="Data you can trust. AI you can ship.">
                    <Lines play={ready} delay={80} stagger={110} lines={[
                        <>Data you can <em>trust.</em></>,
                        <>AI you can <em>ship.</em></>,
                    ]} />
                </h1>
                <div className="hero-side">
                    <Fade play={ready} delay={650}>
                        <p className="hero-lede">
                            I build <strong>governed data and AI systems</strong> on Azure — Databricks pipelines, data catalogued with Purview, and LLM tools designed for the <strong>EU AI Act</strong>.
                        </p>
                    </Fade>
                    <Fade play={ready} delay={760} className="hero-ctas">
                        <Magnetic>
                            <button className="btn btn-solid" onClick={() => scrollToId("work")}>Selected work <Arrow /></button>
                        </Magnetic>
                        <Magnetic>
                            <button className="btn btn-ghost" onClick={onOpenCv}>Résumé</button>
                        </Magnetic>
                    </Fade>
                    <Fade play={ready} delay={860}>
                        <span className="status label"><i />Open to AI &amp; data roles</span>
                    </Fade>
                </div>
            </div>

            <div className="hero-name wrap" ref={nameRef} data-cursor="Hello">
                <span className="hero-hint label" aria-hidden="true">(Wind field — live. Move your cursor)</span>
                <div className="hero-portrait" ref={portraitRef} aria-hidden="true">
                    <img src="/images/profile-suit.jpg" alt="" width="793" height="777" />
                </div>
                <FitChars text="Farhan Shahriyar" play={ready} delay={200} />
            </div>
        </section>
    );
}
