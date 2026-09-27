import { useEffect, useRef, useState } from "react";
import SectionHead from "./SectionHead";
import { LANDMARKS } from "./landmarks";
import { scrollToId, reducedMotion } from "./hooks";
import { unlock } from "./game";

export default function WorldMap() {
    const canvasRef = useRef(null);
    const labelRefs = useRef({});
    const [ready, setReady] = useState(false);
    const [hover, setHover] = useState(null);

    const travel = id => {
        const L = LANDMARKS.find(l => l.id === id);
        if (!L) return;
        unlock("map");
        scrollToId(L.section);
    };

    useEffect(() => {
        let scene, io, alive = true;
        import("./IslandScene").then(({ default: IslandScene }) => {
            if (!alive) return;
            try { scene = new IslandScene(canvasRef.current, { labels: labelRefs.current, onHover: setHover, onPick: travel }); } catch { return; }
            setReady(true);
            if (reducedMotion()) { scene.tick(); return; }
            io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()));
            io.observe(canvasRef.current);
        });
        return () => { alive = false; io?.disconnect(); scene?.dispose(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const h = LANDMARKS.find(l => l.id === hover);

    return (
        <section id="map" className="act wrap">
            <SectionHead n="00" kicker="World map" title="Pick a level" sub="Drag the island to spin it. Click any place to travel there — or just keep scrolling." />
            <div className="map neu-lg">
                <canvas ref={canvasRef} className={`map-canvas ${ready ? "is-ready" : ""}`} aria-label="3D island with a landmark for every section of this site" role="img" />
                <div className="map-labels" aria-hidden="true">
                    {LANDMARKS.map(l => (
                        <span key={l.id} ref={el => { labelRefs.current[l.id] = el; }} className="map-pin">
                            <span className="map-pin-in"><i>{l.icon}</i><b>{l.name}</b></span>
                        </span>
                    ))}
                </div>
                <div className={`map-info neu ${h ? "is-on" : ""}`} aria-live="polite">
                    {h ? <><span className="map-info-icon">{h.icon}</span><span><b>{h.name}</b><span>{h.hint} · click to travel</span></span></>
                        : <span className="mono">↔ Drag to spin · click a place</span>}
                </div>
            </div>
            <nav className="map-quick" aria-label="Quick travel">
                {LANDMARKS.filter(l => l.id !== "plane").map(l => (
                    <button key={l.id} className="key key-sm" onClick={() => travel(l.id)}><span aria-hidden="true">{l.icon}</span>{l.name}</button>
                ))}
            </nav>
        </section>
    );
}
