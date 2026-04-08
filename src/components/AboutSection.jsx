import { useState, useRef, useEffect, useMemo } from "react";

function CountUp({ to, suffix = "", duration = 1400 }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null), ran = useRef(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !ran.current) {
                ran.current = true;
                const s = performance.now();
                const tick = ts => {
                    const p = Math.min((ts - s) / duration, 1);
                    setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
                    if (p < 1) requestAnimationFrame(tick); else setVal(to);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [to, duration]);
    return <span ref={ref}>{val}{suffix}</span>;
}

function ClockWidget({ T }) {
    const [time, setTime] = useState(new Date());
    const fm = { fontFamily: "'Inter', sans-serif" }, sf = { fontFamily: "'Sora', sans-serif" };
    const radarRef = useRef(null);
    useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
    useEffect(() => {
        let frame, start = performance.now();
        const tick = (t) => { if (radarRef.current) radarRef.current.style.transform = `rotate(${(t - start) * 0.1}deg)`; frame = requestAnimationFrame(tick); };
        frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
    }, []);
    const hb = new Date(time.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
    const h = hb.getHours(), m = hb.getMinutes(), s = hb.getSeconds(), pad = n => String(n).padStart(2, "0");
    const hDeg = (h % 12) * 30 + m * 0.5, mDeg = m * 6, sDeg = s * 6;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 18, height: "100%", position: "relative" }}>
            <div style={{ position: "relative", width: 70, height: 70, flexShrink: 0, borderRadius: "50%", background: `${T.a}08`, boxShadow: `inset 0 0 20px ${T.a}30` }}>
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", position: "absolute", zIndex: 2 }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke={T.border} strokeWidth="1" />
                    {[...Array(12)].map((_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return <line key={i} x1={50 + 37 * Math.cos(a)} y1={50 + 37 * Math.sin(a)} x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)} stroke={i % 3 === 0 ? T.a : T.border} strokeWidth={i % 3 === 0 ? 2 : 1} />; })}
                    <line x1="50" y1="50" x2={50 + 22 * Math.sin(hDeg * Math.PI / 180)} y2={50 - 22 * Math.cos(hDeg * Math.PI / 180)} stroke={T.t} strokeWidth="3" strokeLinecap="round" />
                    <line x1="50" y1="50" x2={50 + 32 * Math.sin(mDeg * Math.PI / 180)} y2={50 - 32 * Math.cos(mDeg * Math.PI / 180)} stroke={T.t} strokeWidth="2" strokeLinecap="round" />
                    <line x1="50" y1="50" x2={50 + 36 * Math.sin(sDeg * Math.PI / 180)} y2={50 - 36 * Math.cos(sDeg * Math.PI / 180)} stroke={T.a} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="3" fill={T.a} boxShadow={`0 0 10px ${T.a}`} />
                </svg>
                <div ref={radarRef} style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, borderRadius: "50%", background: `conic-gradient(from 0deg, transparent 70%, ${T.a}80 100%)`, zIndex: 1 }} />
            </div>
            <div style={{ zIndex: 3 }}>
                <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.a, display: "inline-block", animation: "pulse 2s ease-in-out infinite", boxShadow: `0 0 8px ${T.a}` }} />
                    Hamburg · CET
                </div>
                <div style={{ ...sf, fontSize: "clamp(24px,2.8vw,38px)", fontWeight: 800, color: T.t, lineHeight: 1, letterSpacing: "-.03em" }}>{pad(h)}:{pad(m)}<span style={{ color: T.a, fontSize: "0.5em", opacity: 0.8 }}>:{pad(s)}</span></div>
            </div>
        </div>
    );
}

function StatusWidget({ T }) {
    const fm = { fontFamily: "'Inter', sans-serif" }, sf = { fontFamily: "'Sora', sans-serif" };
    const [line, setLine] = useState(0), [displayed, setDisplayed] = useState("");
    const lines = ["Building RAG pipelines", "Evaluating LLM outputs", "Reading ML papers", "Open to great work"];
    useEffect(() => {
        const phrase = lines[line]; let i = 0, timer;
        const type = () => { if (i <= phrase.length) { setDisplayed(phrase.slice(0, i)); i++; timer = setTimeout(type, 55); } else { setTimeout(() => { let j = phrase.length; const erase = () => { if (j >= 0) { setDisplayed(phrase.slice(0, j)); j--; timer = setTimeout(erase, 22); } else setLine(l => (l + 1) % lines.length); }; erase(); }, 1900); } };
        type(); return () => clearTimeout(timer);
    }, [line]);
    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.a, display: "inline-block", boxShadow: `0 0 12px ${T.a}`, animation: "pulse 1.5s ease-in-out infinite" }} />
                <span style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em" }}>AVAILABLE NOW</span>
            </div>
            <div style={{ position: "relative", zIndex: 2, marginTop: "auto", marginBottom: "auto" }}>
                <div style={{ ...sf, fontSize: "clamp(18px,2vw,26px)", fontWeight: 800, color: T.t, lineHeight: 1.1, marginBottom: 14 }}>Open to<br />great work</div>
                <div style={{ ...fm, fontSize: 12, color: T.a, minHeight: 18, background: `${T.a}10`, padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.a}30` }}>
                    &gt; {displayed}<span style={{ animation: "blink 1s step-end infinite" }}>█</span>
                </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", zIndex: 2 }}>
                {["Full-time", "Werkstudent"].map(t => <span key={t} style={{ ...fm, fontSize: 9, padding: "5px 12px", background: `${T.a}15`, border: `1px solid ${T.a}40`, color: T.a, borderRadius: 20 }}>{t}</span>)}
            </div>
        </div>
    );
}

function BioWidget({ T }) {
    const fm = { fontFamily: "'Inter', sans-serif" }, sf = { fontFamily: "'Sora', sans-serif" };
    // Node connection graph simulation
    const nodes = Array.from({ length: 15 }, () => ({
        x: Math.random() * 100, y: Math.random() * 100, anim: Math.random() * 2
    }));

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", position: "relative", zIndex: 2 }}>
            
            {/* Background Neural Network Animation */}
            <div style={{ position: "absolute", right: 0, top: "-10%", width: "45%", height: "120%", pointerEvents: "none", zIndex: -1, opacity: 0.15 }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {nodes.map((n, i) => (
                        <g key={i}>
                            <circle cx={n.x} cy={n.y} r="1.5" fill={T.a} style={{ animation: `pulse ${2 + n.anim}s infinite` }} />
                            {i > 0 && <line x1={n.x} y1={n.y} x2={nodes[i-1].x} y2={nodes[i-1].y} stroke={T.a} strokeWidth="0.2" />}
                            {i < nodes.length - 2 && <line x1={n.x} y1={n.y} x2={nodes[i+2].x} y2={nodes[i+2].y} stroke={T.a} strokeWidth="0.1" strokeDasharray="1 1" />}
                        </g>
                    ))}
                </svg>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div className="anim-fade-up" style={{ width: 5, height: 90, background: T.a, borderRadius: 4, flexShrink: 0, marginTop: 4, boxShadow: `0 0 20px ${T.a}`, animationDelay: "0.1s" }} />
                <div className="anim-fade-up" style={{ animationDelay: "0.2s" }}>
                    <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: ".25em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.a, display: "inline-block", animation: "pulse 1.5s ease-in-out infinite", boxShadow: `0 0 8px ${T.a}` }} />
                        <span className="text-glow">Production AI Engineer</span>
                    </div>
                    <h2 className="animated-gradient-text" style={{ margin: 0, ...sf, fontSize: "clamp(26px, 4.2vw, 55px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-.04em" }}>
                        I build <span style={{ color: T.a, textShadow: `0 0 35px ${T.a}90`, WebkitTextFillColor: T.a }}>AI</span> that works<br />in production.
                    </h2>
                </div>
            </div>

            <p className="anim-fade-up" style={{ margin: "20px 0 28px 0", fontSize: "clamp(15px, 1.2vw, 18px)", color: T.m, lineHeight: 1.85, maxWidth: "85%", animationDelay: "0.3s" }}>
                Moved from <strong style={{ color: T.t }}>West Bengal to Hamburg</strong> alone at 22. Now at <strong style={{ color: T.a }}>TUHH</strong> and engineering enterprise AI for <strong style={{ color: T.a }}>Nordex SE</strong> — shipped a multi-agent evaluator replacing GPT-4 dependencies entirely.
            </p>

            {/* Live Data Streaming Terminal Line */}
            <div className="anim-fade-up" style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${T.a}30`, borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 28, width: "fit-content", animationDelay: "0.4s" }}>
                <span style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: 1 }}>STATUS</span>
                <span style={{ width: 1, height: 12, background: `${T.a}50` }} />
                <span className="live-typing-stream" style={{ ...fm, fontSize: 11, color: T.m, width: 220, overflow: "hidden", whiteSpace: "nowrap" }}>
                    &gt; RAG Vectors Synchronized... OK
                </span>
            </div>

            <div className="anim-fade-up" style={{ display: "flex", gap: "5%", borderTop: `1px solid ${T.border}`, paddingTop: 24, animationDelay: "0.5s" }}>
                {[{ to: 1690, suffix: "+", l: "Docs Indexed", p: "In Qdrant Vector DB" }, 
                  { to: 11, suffix: "×", l: "Cost Decrease", p: "Custom LLM Router" }, 
                  { to: 215, suffix: "", l: "OSS Commits", p: "Continuous Integration" }].map((s, i) => (
                    <div key={i} className="stat-float" style={{ flex: 1, borderLeft: i > 0 ? `1px solid ${T.border}` : "none", paddingLeft: i > 0 ? "5%" : 0, animationDelay: `${i * 0.15}s` }}>
                        <div style={{ ...sf, fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, color: T.a, lineHeight: 1, marginBottom: 6, textShadow: `0 0 15px ${T.a}50` }}><CountUp to={s.to} suffix={s.suffix} /></div>
                        <div style={{ ...fm, fontSize: 12, color: T.t, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{s.l}</div>
                        <div style={{ ...fm, fontSize: 10, color: T.a2, opacity: 0.8 }}>{s.p}</div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes typewriter { 
                    0% { content: "> Initializing GPU Cluster..."; }
                    25% { content: "> Embedding 1690+ nodes..."; }
                    50% { content: "> RAG Index Synchronized... OK"; }
                    75% { content: "> Cost Optimized 11x limit..."; }
                    100% { content: "> Deploying to production."; }
                }
                .live-typing-stream::after {
                    content: "";
                    animation: typewriter 8s infinite step-end;
                }
                @keyframes textShine {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                .animated-gradient-text {
                    background: linear-gradient(110deg, ${T.t} 30%, ${T.a} 50%, ${T.t} 70%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: textShine 7s linear infinite;
                }
                @keyframes fadeUpSlide {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .anim-fade-up {
                    opacity: 0;
                    animation: fadeUpSlide 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes subtleFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .stat-float {
                    animation: subtleFloat 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function OriginWidget({ T, dark }) {
// ... keeping other components exactly identical ...
// but I am replacing Origin, HeatMap, etc sequentially as defined via the Line Range so they don't get deleted ...
    const mapRef = useRef(null), mapInstanceRef = useRef(null), animRef = useRef(null);
    useEffect(() => {
        import("leaflet").then(L => {
            if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
            if (!document.getElementById("leaflet-css")) { const lk = document.createElement("link"); lk.id = "leaflet-css"; lk.rel = "stylesheet"; lk.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(lk); }
            if (!mapRef.current) return;
            const map = L.map(mapRef.current, { center: [40, 50], zoom: 3, zoomControl: false, attributionControl: false, scrollWheelZoom: false, dragging: true, doubleClickZoom: false });
            mapInstanceRef.current = map;
            L.tileLayer(dark ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
            const wb = [22.5, 88.3], hh = [53.5, 10.0];
            const pin = (c, l) => L.divIcon({ className: "", html: `<div style="position:relative"><div style="width:12px;height:12px;border-radius:50%;background:${c};border:2px solid white;box-shadow:0 0 15px ${c}"></div><div style="position:absolute;bottom:18px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:white;font-size:10px;padding:3px 8px;border-radius:4px;white-space:nowrap;font-family:'Inter',sans-serif">${l}</div></div>`, iconSize: [12, 12], iconAnchor: [6, 6] });
            L.marker(wb, { icon: pin(T.a2, "🇮🇳 W. Bengal") }).addTo(map);
            L.marker(hh, { icon: pin(T.a, "🇩🇪 Hamburg") }).addTo(map);
            const pts = []; for (let i = 0; i <= 80; i++) { const t = i / 80; pts.push([wb[0] + (hh[0] - wb[0]) * t + Math.sin(t * Math.PI) * 14, wb[1] + (hh[1] - wb[1]) * t]); }
            L.polyline(pts, { color: T.a, weight: 3, opacity: 0.6, dashArray: "10 8" }).addTo(map);
            map.fitBounds([wb, hh], { padding: [40, 60] });
            const dot = L.circleMarker(pts[0], { radius: 6, fillColor: "#fff", color: T.a, weight: 3, fillOpacity: 1 }).addTo(map);
            let step = 0; const animate = () => { step = (step + 0.3) % 81; dot.setLatLng(pts[Math.min(Math.floor(step), pts.length - 1)]); animRef.current = requestAnimationFrame(animate); };
            animRef.current = requestAnimationFrame(animate);
        });
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
    }, [dark, T]);
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: T.t }}>22. Solo. One-way ticket. 🎒</div>
            <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: "none", boxShadow: T.neuSm, minHeight: 160, position: "relative" }}>
                <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 160 }} />
                <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)", pointerEvents: "none", zIndex: 400 }} />
            </div>
        </div>
    );
}

function HeatmapWidget({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" }, sf = { fontFamily: "'Sora', sans-serif" };
    const WEEKS = 26, DAYS = 7;
    const [hl, setHl] = useState(null), [tt, setTt] = useState(null);
    const cells = useMemo(() => { const arr = Array(WEEKS * DAYS).fill(0); let p = 0; while (p < 65) { const w = Math.floor(Math.random() * WEEKS), d = Math.floor(Math.random() * DAYS), idx = w * DAYS + d; const prob = d === 0 || d === 6 ? 0.2 : (w / WEEKS > 0.65 ? 0.72 : 0.38); if (Math.random() < prob && arr[idx] < 4) { arr[idx]++; p++; } } return arr; }, []);
    useEffect(() => {
        let frame, start = performance.now();
        const tick = (time) => {
            const currentWeekX = Math.floor(((time - start) * 0.005) % WEEKS);
            const colStart = currentWeekX * DAYS, activeInCol = [];
            for (let i = 0; i < DAYS; i++) if (cells[colStart + i] > 0) activeInCol.push(colStart + i);
            if (activeInCol.length > 0) { setHl(activeInCol[Math.floor(Math.random() * activeInCol.length)]); setTt("System Scan..."); } else setHl(null);
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
    }, [cells]);
    const colors = ["transparent", T.a + "30", T.a + "60", T.a + "90", T.a];
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div><div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em", textTransform: "uppercase" }}>GitHub · shahriyar31</div><div style={{ ...sf, fontSize: 22, fontWeight: 800, color: T.t, lineHeight: 1 }}>215 <span style={{ ...fm, fontSize: 11, color: T.m, fontWeight: 400 }}>commits</span></div></div>
                {tt && <div style={{ ...fm, fontSize: 10, color: T.a, background: dark ? "rgba(59,130,246,0.12)" : "rgba(37,99,235,0.08)", padding: "3px 10px", borderRadius: 6 }}>{tt}</div>}
            </div>
            <div style={{ display: "flex", gap: 3, flex: 1, marginTop: "auto", marginBottom: "auto" }}>
                <div style={{ display: "grid", gridTemplateRows: "repeat(7,1fr)", gap: 3 }}>
                    {["M", "", "W", "", "F", "", "S"].map((l, i) => <div key={i} style={{ ...fm, fontSize: 8, color: T.m, display: "flex", alignItems: "center", paddingRight: 4 }}>{l}</div>)}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${WEEKS},1fr)`, gridTemplateRows: `repeat(${DAYS},1fr)`, gap: 3, gridAutoFlow: "column" }}>
                    {cells.map((v, i) => <div key={i} style={{ borderRadius: 3, background: v === 0 ? (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)") : colors[v], transform: hl === i ? "scale(1.8) translateZ(10px)" : "scale(1)", boxShadow: hl === i ? `0 0 15px ${T.a}` : "none", zIndex: hl === i ? 10 : 1, transition: "transform 0.2s, box-shadow 0.2s" }} />)}
                </div>
            </div>
            <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 5, gap: 1 }}>
                {[{ pct: 85.6, color: "#DA5B0B" }, { pct: 5.82, color: "#FF7340" }, { pct: 4.53, color: "#3572A5" }].map((l, i) => <div key={i} style={{ width: `${l.pct}%`, background: l.color, flexShrink: 0, boxShadow: `0 0 5px ${l.color}` }} />)}
            </div>
        </div>
    );
}

function HobbiesWidget({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const items = [{ icon: "📷", label: "Photography", sub: "Landscape" }, { icon: "☕", label: "Coffee", sub: "First cup" }, { icon: "🗣️", label: "Languages", sub: "Bengali · English · German" }, { icon: "✈️", label: "Travel", sub: "India → Germany" }];
    const ref = useRef(null);
    useEffect(() => {
        let frame, start = performance.now();
        const tick = (time) => {
            if (ref.current) { const c = ref.current.children; for (let i = 0; i < c.length; i++) c[i].style.transform = `translate(${Math.sin((time - start) * 0.002 + i) * 6}px, ${Math.cos((time - start) * 0.0015 + i) * 3}px)`; }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
    }, []);
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em", textTransform: "uppercase" }}>Beyond the Code</div>
            <div ref={ref} style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1, alignContent: "flex-start", marginTop: 8 }}>
                {items.map((it, i) => (
                    <div key={i} style={{ flex: "1 1 calc(50% - 10px)", display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 10, background: T.bg, border: "none", boxShadow: T.neuSm, willChange: "transform" }}>
                        <span style={{ fontSize: 22 }}>{it.icon}</span>
                        <div><div style={{ ...fm, fontSize: 11, color: T.t, fontWeight: 700 }}>{it.label}</div><div style={{ ...fm, fontSize: 9, color: T.m }}>{it.sub}</div></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PhotoInner({ T }) {
    const fm = { fontFamily: "'Inter', sans-serif" }, sf = { fontFamily: "'Sora', sans-serif" };
    const imgRef = useRef(null), flareRef = useRef(null), coreRef = useRef(null);
    
    useEffect(() => {
        let frame, start = performance.now();
        const tick = (time) => {
            const dt = time - start;
            if (imgRef.current) imgRef.current.style.transform = `scale(1.05) translate(${Math.sin(dt * 0.001) * 8}px, ${Math.cos(dt * 0.0013) * 8}px)`;
            if (flareRef.current) flareRef.current.style.transform = `translateX(${((dt * 0.0005) % 3) * 400 - 200}%) rotate(45deg)`;
            if (coreRef.current) coreRef.current.style.transform = `rotateX(${Math.sin(dt * 0.001) * 20}deg) rotateY(${Math.cos(dt * 0.0012) * 20}deg)`;
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div ref={coreRef} style={{ position: "absolute", inset: 0, borderRadius: "50%", transformStyle: "preserve-3d" }}>
            
            {/* The Fully Rounded Profile Image */}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", border: `2px solid ${T.a}50`, background: "#000", boxShadow: `inset 0 0 40px rgba(0,0,0,0.8), 0 20px 50px rgba(0,0,0,0.4), 0 0 60px ${T.a}20` }}>
                <img ref={imgRef} src="/images/profile-cartoon.jpg" alt="Farhan" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%", display: "block", willChange: "transform", filter: "contrast(1.1) brightness(0.95)" }} onError={e => { e.target.src = "https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/profile.jpg"; }} />
                <div ref={flareRef} style={{ position: "absolute", top: -100, left: 0, width: "50%", height: "200%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", pointerEvents: "none", zIndex: 10 }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "80px 24px 30px", background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)", textAlign: "center" }}>
                    <div style={{ ...sf, fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Farhan</div>
                    <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: ".15em", textTransform: "uppercase" }}>AI Engineer</div>
                </div>
            </div>

            {/* Orbital Cyber-Rings (The 3D Animation) */}
            <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "120%", height: "120%", border: `1px solid ${T.a}40`, borderRadius: "50%", transform: "translateZ(30px) rotateX(60deg) rotateY(20deg)", animation: "orbit1 10s linear infinite" }} />
            <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "110%", height: "110%", border: `1px dashed ${T.a}80`, borderRadius: "50%", transform: "translateZ(-30px) rotateX(-50deg) rotateY(-30deg)", animation: "orbit2 15s linear infinite" }} />
            <div style={{ position: "absolute", top: "-15%", left: "-15%", width: "130%", height: "130%", border: `2px solid ${T.a}20`, borderRadius: "50%", transform: "translateZ(10px) rotateX(70deg) rotateY(40deg)", animation: "orbit3 20s linear infinite" }} />
            
            <style>{`
                @keyframes orbit1 { to { transform: translateZ(30px) rotateX(60deg) rotateY(20deg) rotateZ(360deg); } }
                @keyframes orbit2 { to { transform: translateZ(-30px) rotateX(-50deg) rotateY(-30deg) rotateZ(-360deg); } }
                @keyframes orbit3 { to { transform: translateZ(10px) rotateX(70deg) rotateY(40deg) rotateZ(360deg); } }
            `}</style>
        </div>
    );
}

/* ── 3D Card Shell ───────────────────────────────────────────────── */
function Card({ dark, T, style = {}, children, hoverGlow = true, w = "380px" }) {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="marquee-card"
            style={{
                width: w,
                flexShrink: 0,
                borderRadius: 24,
                background: T.bg,
                border: "none",
                overflow: "hidden",
                position: "relative",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isHovered && hoverGlow ? T.neuHover : T.neu,
                transform: isHovered && hoverGlow ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)",
                ...style,
            }}>
            {children}
            {/* Elegant inner glow on hover */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
                background: isHovered && hoverGlow ? `radial-gradient(circle at 50% 0%, ${T.a}15 0%, transparent 70%)` : "transparent",
                transition: "background 0.3s ease"
            }} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN — Hero + Infinite Scrolling Marquee Data Stream
══════════════════════════════════════════════════════════════════ */
export default function AboutSection({ T, dark }) {
    const SCROLLING_CARDS = [
        <Card key="h1" dark={dark} T={T} w="440px" style={{ padding: 24 }}><HeatmapWidget T={T} dark={dark} /></Card>,
        <Card key="s1" dark={dark} T={T} w="320px" style={{ padding: 24 }}><StatusWidget T={T} /></Card>,
        <Card key="m1" dark={dark} T={T} w="380px" style={{ padding: 24 }}><OriginWidget T={T} dark={dark} /></Card>,
        <Card key="hb1" dark={dark} T={T} w="360px" style={{ padding: 24 }}><HobbiesWidget T={T} dark={dark} /></Card>,
        <Card key="c1" dark={dark} T={T} w="300px" style={{ padding: 24 }}><ClockWidget T={T} /></Card>,
        
        <Card key="h2" dark={dark} T={T} w="440px" style={{ padding: 24 }}><HeatmapWidget T={T} dark={dark} /></Card>,
        <Card key="s2" dark={dark} T={T} w="320px" style={{ padding: 24 }}><StatusWidget T={T} /></Card>,
        <Card key="m2" dark={dark} T={T} w="380px" style={{ padding: 24 }}><OriginWidget T={T} dark={dark} /></Card>,
        <Card key="hb2" dark={dark} T={T} w="360px" style={{ padding: 24 }}><HobbiesWidget T={T} dark={dark} /></Card>,
        <Card key="c2" dark={dark} T={T} w="300px" style={{ padding: 24 }}><ClockWidget T={T} /></Card>,
    ];

    return (
        <div className="about-section-container" style={{ width: "100%", padding: window.innerWidth > 1024 ? "80px 0" : "40px 0" }}> {/* Removed global overflow: hidden which was cutting off card tops! */}
            
            {/* 1. TOP ROW: The Hero Identity Plate */}
            <div className="top-row-identity" style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: window.innerWidth > 1024 ? "0 140px 0 20px" : "0 20px", display: "flex", gap: "4%", marginBottom: 80, alignItems: "center" }}>
                
                {/* 3D Circular Orbital Profile Object */}
                <div style={{ width: "300px", height: "300px", flexShrink: 0, position: "relative", perspective: "1000px", marginLeft: "-60px" }}>
                    <PhotoInner T={T} />
                </div>

                {/* Cybernetic Dashboard Bio Card */}
                <Card dark={dark} T={T} w="100%" hoverGlow={true} style={{ padding: "40px 45px", minHeight: "360px" }}>
                    <BioWidget T={T} />
                </Card>

            </div>

            {/* 2. BOTTOM ROW: Infinite Animated Data Stream. Handled internally to stop lateral breaking */}
            <div className="marquee-wrapper" style={{ position: "relative", width: "100%", padding: "40px 0", overflowX: "hidden" }}> 
                
                {/* Gradient Fades for the edges so the scrolling cards fade in/out beautifully */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "10vw", background: `linear-gradient(to right, ${dark ? '#0a0a0f' : '#f0f2f5'} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "10vw", background: `linear-gradient(to left, ${dark ? '#0a0a0f' : '#f0f2f5'} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />

                <div className="marquee-track" style={{ display: "flex", gap: 24, paddingLeft: 24 }}>
                    {SCROLLING_CARDS}
                </div>
            </div>

            <style>{`
                /* The Infinite Horizontal Ticker Animation */
                @keyframes dataStreamScroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-50% - 12px)); /* -50% shifts exactly half the duplicates. -12px accounts for half the 24px gap */ }
                }

                .marquee-track {
                    animation: dataStreamScroll 40s linear infinite;
                    width: max-content;
                }

                /* MAGICAL UX: When hovering ANY card in the track, PAUSE the entire track so they can read/interact with it */
                .marquee-wrapper:hover .marquee-track {
                    animation-play-state: paused;
                }

                /* Mobile Overrides */
                @media (max-width: 1024px) {
                    .top-row-identity {
                        flex-direction: column;
                    }
                    .top-row-identity > .marquee-card {
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}