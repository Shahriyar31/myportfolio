import { useEffect, useRef, useState } from "react";
import { Lines, Fade } from "./Motion";
import { Icon } from "./Chrome";
import { scrollToId, reducedMotion } from "./hooks";
import { onPalette } from "./theme";
import { NODES } from "./AgentScene.nodes";

const PILLARS = [
    ["AI Governance", "EU AI Act · GDPR · Purview"],
    ["Data Platform", "Databricks · Spark · SQL"],
    ["Agentic AI", "LangGraph · RAG · evals"],
];

export default function Hero({ ready, onOpenCv }) {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const labelRefs = useRef({});
    const [sceneReady, setSceneReady] = useState(false);
    const [hover, setHover] = useState(null);
    const tipRef = useRef(null);

    useEffect(() => {
        let scene, io, alive = true;
        const canvas = canvasRef.current;
        // three.js loads after first paint so the page is interactive immediately
        import("./AgentScene").then(({ default: AgentScene }) => {
            if (!alive) return;
            try { scene = new AgentScene(canvas, { labels: labelRefs.current, onHover: setHover }); } catch { return; } // no WebGL → text-only hero
            sceneRef.current = scene;
            setSceneReady(true);
            if (reducedMotion()) { scene.tick(); scene._off = onPalette(() => scene.tick()); return; }
            io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? scene.start() : scene.stop()));
            io.observe(canvas);
        });
        const move = e => {
            const r = canvas.getBoundingClientRect();
            sceneRef.current?.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            if (tipRef.current) tipRef.current.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
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

    const node = NODES.find(n => n.id === hover);

    return (
        <section id="home" className={`hero ${hover ? "is-hovering" : ""}`}>
            <canvas
                ref={canvasRef}
                className={`hero-canvas ${sceneReady ? "is-ready" : ""}`}
                role="img"
                aria-label="Diagram of how I build: data sources flow into a Databricks lakehouse, governed by a catalogue, feeding a tool-using agent whose output passes a policy gate and is written to an audit ledger."
                onClick={() => node && scrollToId(node.section)}
            />
            <div className="hero-labels" aria-hidden="true">
                {NODES.map(n => (
                    <span key={n.id} ref={el => { labelRefs.current[n.id] = el; }} className="node-label">
                        <b>{n.label}</b>{n.sub && <span className="mono">{n.sub}</span>}
                    </span>
                ))}
            </div>
            <div ref={tipRef} className={`node-tip neu ${node ? "is-on" : ""}`} aria-hidden="true">
                {node && <><span className="mono accent">{node.label}</span><b>{node.title}</b><p>{node.text}</p><span className="mono">Click to see it in my work →</span></>}
            </div>

            <div className="hero-inner wrap">
                <div className="hero-copy">
                    <Fade play={ready} delay={100}>
                        <span className="chip mono"><span className="dot-live" />Open to AI &amp; data roles · Hamburg</span>
                    </Fade>
                    <h1 className="hero-name" aria-label="Farhan Shahriyar">
                        <Lines play={ready} delay={180} stagger={120} lines={["Farhan", "Shahriyar"]} />
                    </h1>
                    <Fade play={ready} delay={520}>
                        <p className="hero-bn bn" lang="bn">ফারহান শাহরিয়ার</p>
                    </Fade>
                    <Fade play={ready} delay={640}>
                        <p className="hero-lede">
                            I build <strong>AI agents that are governed by design</strong> — on lakehouse data you can trust, with the audit trail to prove it.
                        </p>
                    </Fade>
                    <Fade play={ready} delay={740} className="pillars">
                        {PILLARS.map(([k, v]) => (
                            <div key={k} className="pillar neu-sm"><b>{k}</b><span className="mono">{v}</span></div>
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

            <Fade play={ready} delay={1200} className="hero-hint mono">
                <span className="neu-in-sm hint-key">⌖</span>Hover the diagram — it's how I build
            </Fade>
            <button className="scroll-cue mono" onClick={() => scrollToId("agent")} aria-label="Scroll down">
                <span className="scroll-cue-track neu-in-sm"><i /></span>Scroll
            </button>
        </section>
    );
}
