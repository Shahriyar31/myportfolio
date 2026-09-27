import { useEffect, useRef, useState } from "react";
import { NODES } from "./AgentScene.nodes";
import Logo from "./Logo";
import { reducedMotion, scrollToId } from "./hooks";

const clamp01 = v => Math.min(1, Math.max(0, v));
const TECH_NAMES = { docs: "Documents", postgres: "PostgreSQL", kafka: "Kafka", databricks: "Databricks", spark: "Spark", catalog: "Data catalogue", lineage: "Lineage", langchain: "LangGraph", python: "Python", eu: "EU AI Act", gdpr: "GDPR", answer: "Cited answers", ledger: "Audit log" };

/*
 * "How I build" — the 3D system told one step at a time.
 * Scrolling builds each piece, the camera flies to it and the caption explains
 * it in plain words; the last step pulls back to show the whole thing.
 */
export default function HowIBuild() {
    const sectionRef = useRef(null);
    const canvasRef = useRef(null);
    const labelRefs = useRef({});
    const sceneRef = useRef(null);
    const [step, setStep] = useState(0);
    const [overview, setOverview] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let scene, io, alive = true;
        import("./AgentScene").then(({ default: AgentScene }) => {
            if (!alive) return;
            try { scene = new AgentScene(canvasRef.current, { labels: labelRefs.current, story: true }); } catch { return; }
            sceneRef.current = scene;
            scene.setRevealed(1);
            scene.setActive(NODES[0].id);
            setReady(true);
            io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()));
            io.observe(canvasRef.current);
            if (reducedMotion()) { scene.setRevealed(NODES.length); scene.tick(); }
        });
        return () => { alive = false; io?.disconnect(); scene?.dispose(); };
    }, []);

    useEffect(() => {
        let raf = 0;
        const update = () => {
            const el = sectionRef.current;
            const r = el.getBoundingClientRect();
            const p = clamp01(-r.top / (el.offsetHeight - innerHeight));
            const slots = NODES.length + 1; // 7 steps + the overview
            const i = Math.min(slots - 1, Math.floor(p * slots));
            setStep(Math.min(i, NODES.length - 1));
            setOverview(i === slots - 1);
        };
        const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        update();
        window.addEventListener("scroll", on, { passive: true });
        return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); };
    }, []);

    useEffect(() => {
        const s = sceneRef.current;
        if (!s) return;
        s.setRevealed(overview ? NODES.length : step + 1);
        s.setActive(overview ? null : NODES[step].id);
        s.overview = overview;
    }, [step, overview, ready]);

    const jump = i => {
        const el = sectionRef.current;
        const y = el.offsetTop + ((i + 0.5) / (NODES.length + 1)) * (el.offsetHeight - innerHeight);
        window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: "smooth" });
    };

    const cur = NODES[step];

    return (
        <section id="how" className="how" ref={sectionRef} aria-label="How I build AI you can trust, step by step">
            <div className="how-stage">
                <canvas ref={canvasRef} className={`how-canvas ${ready ? "is-ready" : ""}`} aria-hidden="true" />
                <div className="hero-labels" aria-hidden="true">
                    {NODES.map(n => (
                        <span key={n.id} ref={el => { labelRefs.current[n.id] = el; }} className="node-tag is-hidden">
                            <span className="node-top"><i className="node-n">{n.n}</i><span className="node-logos">{n.logos.map(l => <Logo key={l} n={l} size={15} />)}</span></span>
                            <b>{n.title}</b>
                        </span>
                    ))}
                </div>

                <div className="how-inner wrap">
                    <header className="how-head">
                        <span className="head-kicker"><span className="head-n neu-sm mono">02</span><span className="mono">How I build</span></span>
                        <h2 className="head-title">AI you can trust, in seven steps</h2>
                        <p className="head-sub">Keep scrolling — each step builds itself.</p>
                    </header>

                    {!overview ? (
                        <article className="how-card neu-lg" key={cur.id}>
                            <div className="how-count"><b>{String(cur.n).padStart(2, "0")}</b><span className="mono">/ {String(NODES.length).padStart(2, "0")}</span></div>
                            <h3>{cur.title}</h3>
                            <p className="how-what">{cur.text}</p>
                            <p className="how-why neu-in-sm"><span className="mono">Why it matters</span>{cur.why}</p>
                            <ul className="how-tools">{cur.logos.map(l => <li key={l} className="tool neu-sm"><Logo n={l} size={16} /><span>{TECH_NAMES[l] || l}</span></li>)}</ul>
                        </article>
                    ) : (
                        <article className="how-card neu-lg is-summary">
                            <span className="mono">The whole system</span>
                            <h3>Clean data in. Useful AI in the middle. Safety and proof on the way out.</h3>
                            <p className="how-what">That's the loop I bring to every project — at Nordex, in Argus AI, and on this website.</p>
                            <div className="how-ctas">
                                <button className="key key-accent" onClick={() => scrollToId("work")}>See it in my experience</button>
                                <button className="key" onClick={() => scrollToId("agent")}>Try my AI</button>
                            </div>
                        </article>
                    )}

                    <nav className="how-steps neu" aria-label="Steps">
                        {NODES.map((n, i) => (
                            <button key={n.id} className={`how-step ${i === step && !overview ? "is-on" : ""} ${i < step || overview ? "is-done" : ""}`} onClick={() => jump(i)} aria-label={`Step ${n.n}: ${n.title}`}>
                                <span className="mono">{n.n}</span><span className="how-step-label">{n.title}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </section>
    );
}
