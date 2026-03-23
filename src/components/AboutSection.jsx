import { useState, useRef, useEffect, useMemo, useCallback } from "react";

/* ── CountUp ─────────────────────────────────────────────────────── */
function CountUp({ to, suffix = "", duration = 1400 }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const ran = useRef(false);
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

/* ── Live Clock ──────────────────────────────────────────────────── */
function ClockWidget({ T }) {
    const [time, setTime] = useState(new Date());
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
    const hb = new Date(time.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
    const h = hb.getHours(), m = hb.getMinutes(), s = hb.getSeconds();
    const pad = n => String(n).padStart(2, "0");
    const hDeg = (h % 12) * 30 + m * 0.5, mDeg = m * 6, sDeg = s * 6;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 18, height: "100%" }}>
            <svg viewBox="0 0 100 100" style={{ width: 64, height: 64, flexShrink: 0 }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke={T.border} strokeWidth="1.5" />
                {[...Array(12)].map((_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return <line key={i} x1={50 + 37 * Math.cos(a)} y1={50 + 37 * Math.sin(a)} x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)} stroke={i % 3 === 0 ? T.a : T.border} strokeWidth={i % 3 === 0 ? 2 : 1} />; })}
                <line x1="50" y1="50" x2={50 + 22 * Math.sin(hDeg * Math.PI / 180)} y2={50 - 22 * Math.cos(hDeg * Math.PI / 180)} stroke={T.t} strokeWidth="3" strokeLinecap="round" />
                <line x1="50" y1="50" x2={50 + 32 * Math.sin(mDeg * Math.PI / 180)} y2={50 - 32 * Math.cos(mDeg * Math.PI / 180)} stroke={T.t} strokeWidth="2" strokeLinecap="round" />
                <line x1={50 - 8 * Math.sin(sDeg * Math.PI / 180)} y1={50 + 8 * Math.cos(sDeg * Math.PI / 180)} x2={50 + 33 * Math.sin(sDeg * Math.PI / 180)} y2={50 - 33 * Math.cos(sDeg * Math.PI / 180)} stroke={T.a} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="50" cy="50" r="3" fill={T.a} />
            </svg>
            <div>
                <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.a, display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
                    Hamburg · CET
                </div>
                <div style={{ ...sf, fontSize: "clamp(24px,2.8vw,38px)", fontWeight: 800, color: T.t, lineHeight: 1, letterSpacing: "-.03em" }}>
                    {pad(h)}:{pad(m)}<span style={{ color: T.a, fontSize: "0.5em", opacity: 0.8 }}>:{pad(s)}</span>
                </div>
                <div style={{ ...fm, fontSize: 11, color: T.m, marginTop: 5 }}>
                    {hb.toLocaleDateString("en-DE", { weekday: "long", day: "numeric", month: "short" })}
                </div>
            </div>
        </div>
    );
}

/* ── Status ──────────────────────────────────────────────────────── */
function StatusWidget({ T }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const [line, setLine] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const lines = ["Building RAG pipelines", "Evaluating LLM outputs", "Reading ML papers 📄", "Open to great work"];
    useEffect(() => {
        const phrase = lines[line]; let i = 0, timer;
        const type = () => { if (i <= phrase.length) { setDisplayed(phrase.slice(0, i)); i++; timer = setTimeout(type, 55); } else { setTimeout(() => { let j = phrase.length; const erase = () => { if (j >= 0) { setDisplayed(phrase.slice(0, j)); j--; timer = setTimeout(erase, 22); } else setLine(l => (l + 1) % lines.length); }; erase(); }, 1900); } };
        type(); return () => clearTimeout(timer);
    }, [line]);
    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.a, display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: T.a, letterSpacing: ".18em" }}>AVAILABLE NOW</span>
            </div>
            <div>
                <div style={{ ...sf, fontSize: "clamp(18px,2vw,26px)", fontWeight: 800, color: T.t, lineHeight: 1.1, marginBottom: 14 }}>
                    Open to<br />great work
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.a, minHeight: 18 }}>
                    &gt; {displayed}<span style={{ animation: "blink 1s step-end infinite" }}>█</span>
                </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Full-time", "Werkstudent"].map(t => (
                    <span key={t} style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, padding: "4px 10px", border: `1px solid ${T.a}40`, color: T.a, borderRadius: 20 }}>{t}</span>
                ))}
            </div>
        </div>
    );
}

/* ── Bio ─────────────────────────────────────────────────────────── */
function BioWidget({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 3, height: 52, background: T.a, borderRadius: 2, flexShrink: 0, marginTop: 4 }} />
                <div>
                    <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.a, display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
                        Live Profile
                    </div>
                    <h2 style={{ margin: 0, ...sf, fontSize: "clamp(22px,3vw,44px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-.04em", color: T.t }}>
                        I build <span style={{ color: T.a }}>AI</span> that works<br />in production.
                    </h2>
                </div>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: T.m, lineHeight: 1.85 }}>
                Moved from <strong style={{ color: T.t }}>West Bengal to Hamburg</strong> alone at 22.
                Now at <strong style={{ color: T.a }}>TUHH</strong> and building enterprise AI at <strong style={{ color: T.a }}>Nordex SE</strong> —
                shipped an LLM evaluation framework that cut costs <strong style={{ color: T.t }}>11× vs GPT-5</strong>.
            </p>
            <div style={{ display: "flex", gap: 0, borderTop: `1px solid ${T.border}`, paddingTop: 18 }}>
                {[{ to: 1690, suffix: "+", label: "RAG docs" }, { to: 11, suffix: "×", label: "Cost saved" }, { to: 215, suffix: "", label: "Commits" }].map((s, i) => (
                    <div key={i} style={{ flex: 1, paddingRight: 20, borderRight: i < 2 ? `1px solid ${T.border}` : "none", paddingLeft: i > 0 ? 20 : 0 }}>
                        <div style={{ ...sf, fontSize: "clamp(22px,2.5vw,34px)", fontWeight: 800, color: T.a, lineHeight: 1, marginBottom: 3 }}>
                            <CountUp to={s.to} suffix={s.suffix} />
                        </div>
                        <div style={{ ...fm, fontSize: 10, color: T.m, textTransform: "uppercase", letterSpacing: ".1em" }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[{ icon: "📍", text: "West Bengal → Hamburg" }, { icon: "🎓", text: "M.Sc. Data Science · TUHH" }, { icon: "⚡", text: "Nordex SE · AI Engineer" }, { icon: "🎯", text: "Open to Hire" }].map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 20, border: `1px solid ${T.border}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
                        <span style={{ fontSize: 12 }}>{f.icon}</span>
                        <span style={{ ...fm, fontSize: 11, color: T.m }}>{f.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Origin Map ──────────────────────────────────────────────────── */
function OriginWidget({ T, dark }) {
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
            const pin = (c, l) => L.divIcon({ className: "", html: `<div style="position:relative"><div style="width:10px;height:10px;border-radius:50%;background:${c};border:2px solid white"></div><div style="position:absolute;bottom:15px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.78);color:white;font-size:9px;padding:2px 6px;border-radius:4px;white-space:nowrap;font-family:'Inter',sans-serif">${l}</div></div>`, iconSize: [10, 10], iconAnchor: [5, 5] });
            L.marker(wb, { icon: pin(T.a2, "🇮🇳 W. Bengal") }).addTo(map);
            L.marker(hh, { icon: pin(T.a, "🇩🇪 Hamburg") }).addTo(map);
            const pts = [];
            for (let i = 0; i <= 80; i++) { const t = i / 80; pts.push([wb[0] + (hh[0] - wb[0]) * t + Math.sin(t * Math.PI) * 14, wb[1] + (hh[1] - wb[1]) * t]); }
            L.polyline(pts, { color: T.a, weight: 1.8, opacity: 0.5, dashArray: "7 5" }).addTo(map);
            map.fitBounds([wb, hh], { padding: [40, 60] });
            const dot = L.circleMarker(pts[0], { radius: 5, fillColor: T.a, color: "white", weight: 2, fillOpacity: 1 }).addTo(map);
            let step = 0;
            const animate = () => { step = (step + 0.3) % 81; dot.setLatLng(pts[Math.min(Math.floor(step), pts.length - 1)]); animRef.current = requestAnimationFrame(animate); };
            animRef.current = requestAnimationFrame(animate);
        });
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
    }, [dark]);
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(14px,1.6vw,20px)", fontWeight: 800, color: T.t }}>22. Solo. One-way ticket. 🎒</div>
                <div style={{ display: "flex", gap: 14 }}>
                    {[{ c: T.a2, l: "W. Bengal" }, { c: T.a, l: "Hamburg" }].map((x, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: x.c, display: "inline-block" }} />
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: T.m }}>{x.l}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, minHeight: 160 }}>
                <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 160 }} />
            </div>
        </div>
    );
}

/* ── GitHub Heatmap ──────────────────────────────────────────────── */
function HeatmapWidget({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const WEEKS = 26, DAYS = 7;
    const [hl, setHl] = useState(null), [tt, setTt] = useState(null);
    const langs = [{ name: "Jupyter", pct: 85.6, color: "#DA5B0B" }, { name: "Astro", pct: 5.82, color: "#FF7340" }, { name: "Python", pct: 4.53, color: "#3572A5" }, { name: "JS", pct: 2.39, color: "#F1E05A" }];
    const cells = useMemo(() => { const arr = Array(WEEKS * DAYS).fill(0); let p = 0; while (p < 65) { const w = Math.floor(Math.random() * WEEKS), d = Math.floor(Math.random() * DAYS), idx = w * DAYS + d; const prob = d === 0 || d === 6 ? 0.2 : (w / WEEKS > 0.65 ? 0.72 : 0.38); if (Math.random() < prob && arr[idx] < 4) { arr[idx]++; p++; } } return arr; }, []);
    const colors = ["transparent", T.a + "30", T.a + "55", T.a + "85", T.a];
    const msgs = ["Rest day", "Light commit", "Good session", "Productive day", "Full sprint 🔥"];
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 4 }}>GitHub · shahriyar31</div>
                    <div style={{ ...sf, fontSize: 22, fontWeight: 800, color: T.t, lineHeight: 1 }}>215 <span style={{ ...fm, fontSize: 11, color: T.m, fontWeight: 400 }}>contributions</span></div>
                </div>
                {tt && <div style={{ ...fm, fontSize: 10, color: T.a, background: dark ? "rgba(59,130,246,0.12)" : "rgba(37,99,235,0.08)", padding: "3px 10px", borderRadius: 6 }}>{tt}</div>}
            </div>
            <div style={{ display: "flex", gap: 3, flex: 1 }}>
                <div style={{ display: "grid", gridTemplateRows: "repeat(7,1fr)", gap: 3 }}>
                    {["M", "", "W", "", "F", "", "S"].map((l, i) => <div key={i} style={{ ...fm, fontSize: 8, color: T.m, display: "flex", alignItems: "center", paddingRight: 4 }}>{l}</div>)}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${WEEKS},1fr)`, gridTemplateRows: `repeat(${DAYS},1fr)`, gap: 3, gridAutoFlow: "column" }}>
                    {cells.map((v, i) => <div key={i} onMouseEnter={() => { setHl(i); setTt(msgs[v]); }} onMouseLeave={() => { setHl(null); setTt(null); }}
                        style={{ borderRadius: 3, cursor: "default", background: v === 0 ? (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)") : colors[v], transform: hl === i ? "scale(1.8)" : "scale(1)", transition: "transform 0.12s" }} />)}
                </div>
            </div>
            <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 5, gap: 1, marginTop: 4 }}>
                {langs.map((l, i) => <div key={i} style={{ width: `${l.pct}%`, background: l.color, flexShrink: 0 }} />)}
            </div>
        </div>
    );
}

/* ── Music Widget ────────────────────────────────────────────────── */
function MusicWidget({ T }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const BARS = 16;
    const [paused, setPaused] = useState(false);
    const [heights, setHeights] = useState(() => Array.from({ length: BARS }, () => Math.random() * 60 + 15));
    const [idx, setIdx] = useState(0);
    const pods = ["Lex Fridman", "Huberman Lab", "ML Street Talk", "TWIML AI"];
    useEffect(() => { if (paused) return; const id = setInterval(() => setHeights(Array.from({ length: BARS }, () => Math.random() * 65 + 10)), 180); return () => clearInterval(id); }, [paused]);
    useEffect(() => { const id = setInterval(() => setIdx(i => (i + 1) % pods.length), 3500); return () => clearInterval(id); }, []);
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" }} onClick={() => setPaused(p => !p)}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: T.a2, letterSpacing: ".18em", textTransform: "uppercase" }}>🎙 Listening</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(13px,1.5vw,17px)", fontWeight: 700, color: T.t, lineHeight: 1.3 }}>{pods[idx]}</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: T.m }}>{paused ? "⏸ Paused" : "▶ Playing"}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, flex: 1, minHeight: 60 }}>
                {heights.map((ht, i) => <div key={i} style={{ flex: 1, borderRadius: 2, background: paused ? T.border : (i % 2 === 0 ? T.a : T.a2), height: paused ? 4 : `${ht}%`, minHeight: 4, transition: paused ? "height 0.4s" : "height 0.18s ease-out", opacity: paused ? 0.3 : 1 }} />)}
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: T.m }}>Click to {paused ? "resume" : "pause"}</div>
        </div>
    );
}

/* ── Hobbies ─────────────────────────────────────────────────────── */
function HobbiesWidget({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const [hov, setHov] = useState(null);
    const items = [
        { icon: "📷", label: "Photography", sub: "Landscape & Street" },
        { icon: "☕", label: "Coffee", sub: "First cup = first commit" },
        { icon: "🗣️", label: "Languages", sub: "Bengali · English · German" },
        { icon: "✈️", label: "Travel", sub: "India → Germany" },
    ];
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 4 }}>Beyond the Code</div>
            {items.map((it, i) => (
                <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: hov === i ? (dark ? "rgba(59,130,246,0.08)" : "rgba(37,99,235,0.05)") : "transparent", border: `1px solid ${hov === i ? T.a + "40" : "transparent"}`, transition: "all 0.26s", transform: hov === i ? "translateX(6px)" : "none" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{it.icon}</span>
                    <div>
                        <div style={{ ...fm, fontSize: 11, color: hov === i ? T.t : T.m, fontWeight: 600, transition: "color 0.22s" }}>{it.label}</div>
                        <div style={{ ...fm, fontSize: 9, color: T.m }}>{it.sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Card shell ──────────────────────────────────────────────────── */
function Card({ dark, T, accent, delay = 0, style = {}, children }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                borderRadius: 20,
                background: dark ? "#1A1D24" : "#FFFFFF",
                border: `1px solid ${hov ? (accent || T.a) + "55" : T.border}`,
                overflow: "hidden",
                position: "relative",
                transition: "border-color 0.25s",
                animation: `aboutCardIn 0.55s ${delay}ms cubic-bezier(0.16,1,0.3,1) both`,
                ...style,
            }}>
            {children}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN — Flexbox outer (photo left, content right)
   Photo is a simple flex child, NEVER depends on grid areas
   Right side: 2-column CSS grid
══════════════════════════════════════════════════════════════════ */
export default function AboutSection({ T, dark }) {
    const P = { padding: 24 };
    const P2 = { padding: 32 };

    return (
        <>
            {/* ── DESKTOP: side-by-side flex ── */}
            <div className="about-outer">

            {/* LEFT: Profile photo — fixed height, aligned to top */}
                <div className="about-photo-col">
                    <div style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 20,
                        overflow: "hidden",
                        border: `1px solid ${T.border}`,
                        position: "relative",
                        animation: "aboutCardIn 0.4s ease both",
                    }}>
                        <PhotoInner T={T} />
                    </div>
                </div>

                {/* RIGHT: 2-col sub-grid */}
                <div className="about-right-grid">

                    {/* Row 1: Clock + Status */}
                    <Card dark={dark} T={T} accent={T.a} delay={80} style={{ ...P, minHeight: 180 }}>
                        <ClockWidget T={T} />
                    </Card>
                    <Card dark={dark} T={T} accent={T.a} delay={160} style={{ ...P, minHeight: 180 }}>
                        <StatusWidget T={T} />
                    </Card>

                    {/* Row 2: Bio — full width */}
                    <Card dark={dark} T={T} accent={T.a} delay={240} style={{ ...P2, gridColumn: "1 / 3" }}>
                        <BioWidget T={T} dark={dark} />
                    </Card>

                    {/* Row 3: Map + Music */}
                    <Card dark={dark} T={T} accent={T.a2} delay={320} style={{ ...P, minHeight: 260 }}>
                        <OriginWidget T={T} dark={dark} />
                    </Card>
                    <Card dark={dark} T={T} accent={T.a2} delay={400} style={{ ...P }}>
                        <MusicWidget T={T} />
                    </Card>

                    {/* Row 4: Heatmap + Hobbies */}
                    <Card dark={dark} T={T} accent={T.a} delay={480} style={{ ...P }}>
                        <HeatmapWidget T={T} dark={dark} />
                    </Card>
                    <Card dark={dark} T={T} accent={T.a} delay={560} style={{ ...P }}>
                        <HobbiesWidget T={T} dark={dark} />
                    </Card>
                </div>
            </div>

            <style>{`
                .about-outer {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                }
                .about-photo-col {
                    width: 260px;
                    flex-shrink: 0;
                    height: clamp(440px, 52vh, 540px);
                    position: sticky;
                    top: 80px;
                    align-self: flex-start;
                }
                .about-right-grid {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                /* iPad */
                @media (max-width: 1024px) {
                    .about-outer { flex-direction: column; }
                    .about-photo-col {
                        width: 100%;
                        height: 300px;
                        position: static;
                    }
                }
                /* Mobile */
                @media (max-width: 640px) {
                    .about-right-grid { grid-template-columns: 1fr; }
                    .about-right-grid > * { grid-column: 1 !important; }
                    .about-photo-col { height: 320px; }
                }
            `}</style>
        </>
    );
}

/* ── Photo inner (separated so ProfileCard tilt is clean) ───────── */
function PhotoInner({ T }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    const ref = useRef(null);
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
    const onMove = useCallback(e => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    }, []);
    return (
        <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setMouse({ x: 0.5, y: 0.5 })}
            style={{ position: "absolute", inset: 0, transform: `perspective(900px) rotateY(${(mouse.x - 0.5) * 8}deg) rotateX(${(mouse.y - 0.5) * -6}deg)`, transition: "transform 0.12s ease-out" }}>
            <img
                src="/images/profile-cartoon.jpg"
                alt="Farhan Shahriyar"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%", display: "block" }}
                onError={e => { e.target.src = "https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/profile.jpg"; }}
            />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.018) 2px,rgba(0,0,0,0.018) 3px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "64px 22px 22px", background: "linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.2) 65%,transparent 100%)" }}>
                <div style={{ ...sf, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Farhan Shahriyar</div>
                <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".14em", textTransform: "uppercase" }}>AI & Data Engineer · Hamburg 🇩🇪</div>
            </div>
            {[{ t: 14, l: 14, bt: true, bl: true }, { t: 14, r: 14, bt: true, br: true }, { b: 14, l: 14, bb: true, bl: true }, { b: 14, r: 14, bb: true, br: true }].map((c, i) => (
                <div key={i} style={{ position: "absolute", width: 18, height: 18, top: c.t, right: c.r, bottom: c.b, left: c.l, borderTop: c.bt ? `2px solid ${T.a}90` : 0, borderBottom: c.bb ? `2px solid ${T.a}90` : 0, borderLeft: c.bl ? `2px solid ${T.a}90` : 0, borderRight: c.br ? `2px solid ${T.a}90` : 0 }} />
            ))}
        </div>
    );
}