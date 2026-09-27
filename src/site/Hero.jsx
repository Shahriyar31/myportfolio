import { useEffect, useRef, useState } from "react";
import { Lines, Fade } from "./Motion";
import { Icon } from "./Chrome";
import Logo from "./Logo";
import { scrollToId, reducedMotion } from "./hooks";
import { onPalette } from "./theme";
import { NODES } from "./AgentScene.nodes";

const PILLARS = [
    ["eu", "AI Governance", "EU AI Act · GDPR"],
    ["databricks", "Data Platform", "Databricks · Spark · SQL"],
    ["langchain", "Agentic AI", "LangGraph · RAG · evals"],
];
const STEP_MS = 3600;

export default function Hero({ ready, onOpenCv }) {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const labelRefs = useRef({});
    const [sceneReady, setSceneReady] = useState(false);
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(true);
    const [hover, setHover] = useState(null);

    useEffect(() => {
        let scene, io, alive = true;
        const canvas = canvasRef.current;
        // three.js loads after first paint so the page is interactive immediately
        import("./AgentScene").then(({ default: AgentScene }) => {
            if (!alive) return;
            try { scene = new AgentScene(canvas, { labels: labelRefs.current, onHover: setHover }); } catch { return; } // no WebGL → labels + story still explain it
            sceneRef.current = scene;
            scene.setActive(NODES[0].id);
            setSceneReady(true);
            if (reducedMotion()) { scene.tick(); scene._off = onPalette(() => scene.tick()); return; }
            io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? scene.start() : scene.stop()));
            io.observe(canvas);
        });
        const move = e => {
            const r = canvas.getBoundingClientRect();
            sceneRef.current?.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        };
        const leave = () => sceneRef.current?.setPointer(9, 9);
        const vis = () => { const s = sceneRef.current; if (!s) return; if (document.hidden) s.stop(); else if (scrollY < innerHeight * 1.2) s.start(); };
        window.addEventListener("pointermove", move, { passive: true });
        document.documentElement.addEventListener("pointerleave", leave);
        document.addEventListener("visibilitychange", vis);
        return () => {
            alive = false; io?.disconnect(); scene?._off?.(); scene?.dispose();
            window.removeEventListener("pointermove", move);
            document.documentElement.removeEventListener("pointerleave", leave);
            document.removeEventListener("visibilitychange", vis);
        };
    }, []);

    // Guided story: walk through the steps; hovering a node jumps to it and pauses
    useEffect(() => {
        if (hover) { const i = NODES.findIndex(n => n.id === hover); if (i >= 0) setStep(i); }
    }, [hover]);
    useEffect(() => {
        if (!ready || !playing || hover || reducedMotion()) return;
        const t = setTimeout(() => setStep(s => (s + 1) % NODES.length), STEP_MS);
        return () => clearTimeout(t);
    }, [ready, playing, hover, step]);
    useEffect(() => { sceneRef.current?.setActive(NODES[step].id); }, [step, sceneReady]);

    const cur = NODES[step];

    return (
        <section id="home" className={`hero ${hover ? "is-hovering" : ""}`}>
            <canvas
                ref={canvasRef}
                className={`hero-canvas ${sceneReady ? "is-ready" : ""}`}
                role="img"
                aria-label="How I build: company data is cleaned in Databricks, governed, used by an AI agent, checked for EU AI Act and GDPR compliance, returned as a trusted answer, and logged."
                onClick={() => hover && scrollToId(NODES.find(n => n.id === hover).section)}
            />
            <div className="hero-labels" aria-hidden="true">
                {NODES.map(n => (
                    <span key={n.id} ref={el => { labelRefs.current[n.id] = el; }} className="node-tag">
                        <span className="node-top"><i className="node-n">{n.n}</i><span className="node-logos">{n.logos.map(l => <Logo key={l} n={l} size={15} />)}</span></span>
                        <b>{n.title}</b>
                        <small className="mono">{n.tech}</small>
                    </span>
                ))}
            </div>

            <div className="hero-inner wrap">
                <div className="hero-copy">
                    <Fade play={ready} delay={100}>
                        <span className="chip mono"><span className="dot-live" />Open to AI &amp; data roles · Hamburg</span>
                    </Fade>
                    <h1 className="hero-name" aria-label="Farhan Shahriyar">
                        <Lines play={ready} delay={180} stagger={120} lines={["Farhan", "Shahriyar"]} />
                    </h1>
                    <Fade play={ready} delay={560}>
                        <p className="hero-role">AI &amp; Data Engineer · MSc Data Science, TUHH</p>
                    </Fade>
                    <Fade play={ready} delay={640}>
                        <p className="hero-lede">
                            I build <strong>AI that companies can trust</strong>: clean, governed data in, a capable AI agent in the middle, and compliance checks and an audit trail on the way out.
                        </p>
                    </Fade>
                    <Fade play={ready} delay={740} className="pillars">
                        {PILLARS.map(([logo, k, v]) => (
                            <div key={k} className="pillar neu-sm"><span className="pillar-ico neu-in-sm"><Logo n={logo} size={18} /></span><div><b>{k}</b><span className="mono">{v}</span></div></div>
                        ))}
                    </Fade>
                    <Fade play={ready} delay={860} className="hero-ctas">
                        <button className="key key-accent" onClick={() => { scrollToId("agent"); setTimeout(() => window.dispatchEvent(new Event("focus-chat")), 900); }}>
                            Talk to my agent<Icon n="arrow" size={18} />
                        </button>
                        <button className="key" onClick={() => scrollToId("route")}>My story</button>
                        <button className="key" onClick={onOpenCv}>Résumé</button>
                    </Fade>
                </div>
            </div>

            <Fade play={ready} delay={1100} className="story neu" aria-live="polite">
                <div className="story-head">
                    <span className="mono">How I build · step {cur.n} of {NODES.length}</span>
                    <button className="story-play key key-sm" onClick={() => setPlaying(p => !p)} aria-label={playing ? "Pause the walkthrough" : "Play the walkthrough"}>{playing ? "❚❚" : "▶"}</button>
                </div>
                <div className="story-body" key={cur.id}>
                    <span className="story-ico neu-in-sm">{cur.logos.slice(0, 2).map(l => <Logo key={l} n={l} size={20} />)}</span>
                    <div><b>{cur.title}</b><p>{cur.text}</p></div>
                </div>
                <div className="story-dots" role="tablist" aria-label="Steps">
                    {NODES.map((n, i) => (
                        <button key={n.id} role="tab" aria-selected={i === step} aria-label={`Step ${n.n}: ${n.title}`} className={`story-dot ${i === step ? "is-on" : ""} ${i < step ? "is-done" : ""}`} onClick={() => { setStep(i); setPlaying(false); }}>
                            {i === step && playing && !hover && <i style={{ animationDuration: `${STEP_MS}ms` }} />}
                        </button>
                    ))}
                </div>
            </Fade>

            <button className="scroll-cue mono" onClick={() => scrollToId("agent")} aria-label="Scroll down">
                <span className="scroll-cue-track neu-in-sm"><i /></span>Scroll
            </button>
        </section>
    );
}
