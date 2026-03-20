import { useState, useRef, useCallback, useEffect, useMemo } from "react";

/* ─────────────────────────────────────────────────────────────────────
   ABOUT SECTION — Top 1% Asymmetric Bento Grid
   
   Layout (CSS Grid):
   ┌─────────────────┬──────────┬──────────┐
   │                 │  Clock   │  Status  │
   │   Profile       │          │          │
   │   Photo         ├──────────┴──────────┤
   │                 │    Bio + Dossier    │
   ├────────┬────────┴─────────────────────┤
   │ Music  │      Origin Map (wide)       │
   ├────────┼──────────────────────────────┤
   │Hobbies │     GitHub Heatmap (wide)    │
   └────────┴──────────────────────────────┘
───────────────────────────────────────────────────────────────────── */

/* ── Live Hamburg Clock ──────────────────────────────────────────── */
function ClockWidget({ T, dark }) {
    const [time, setTime] = useState(new Date());
    const [tick, setTick] = useState(false);
    const prevS = useRef(-1);
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };

    useEffect(() => {
        const id = setInterval(() => {
            const now = new Date();
            const hb = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
            if (hb.getSeconds() !== prevS.current) { prevS.current = hb.getSeconds(); setTick(t => !t); }
            setTime(now);
        }, 250);
        return () => clearInterval(id);
    }, []);

    const hb = new Date(time.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
    const h = hb.getHours(), m = hb.getMinutes(), s = hb.getSeconds();
    const pad = n => String(n).padStart(2, "0");
    const hDeg = (h % 12) * 30 + m * 0.5, mDeg = m * 6, sDeg = s * 6;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.a3, boxShadow: `0 0 8px ${T.a3}`, animation: "pulse 2s ease-in-out infinite", flexShrink: 0 }} />
                Hamburg
            </div>
            <div style={{ ...sf, fontSize: "clamp(30px,3.5vw,48px)", fontWeight: 800, color: T.t, lineHeight: 1, letterSpacing: "-.03em" }}>
                {pad(h)}:{pad(m)}<span style={{ color: T.a, fontSize: "0.55em", opacity: 0.6 }}>:{pad(s)}</span>
            </div>
            <div style={{ ...fm, fontSize: 11, color: T.m, marginTop: 6, marginBottom: 16 }}>
                {hb.toLocaleDateString("en-DE", { weekday: "short", day: "numeric", month: "short" })}
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 100 100" style={{ width: 80, height: 80 }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke={T.border} strokeWidth="1.5" />
                    {[...Array(12)].map((_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return <line key={i} x1={50 + 37 * Math.cos(a)} y1={50 + 37 * Math.sin(a)} x2={50 + 43 * Math.cos(a)} y2={50 + 43 * Math.sin(a)} stroke={i % 3 === 0 ? T.a : T.border} strokeWidth={i % 3 === 0 ? 2 : 1} />; })}
                    <line x1="50" y1="50" x2={50 + 21 * Math.sin(hDeg * Math.PI / 180)} y2={50 - 21 * Math.cos(hDeg * Math.PI / 180)} stroke={T.t} strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="50" y1="50" x2={50 + 31 * Math.sin(mDeg * Math.PI / 180)} y2={50 - 31 * Math.cos(mDeg * Math.PI / 180)} stroke={T.t} strokeWidth="2" strokeLinecap="round" />
                    <line x1={50 - 9 * Math.sin(sDeg * Math.PI / 180)} y1={50 + 9 * Math.cos(sDeg * Math.PI / 180)} x2={50 + 34 * Math.sin(sDeg * Math.PI / 180)} y2={50 - 34 * Math.cos(sDeg * Math.PI / 180)} stroke={T.a} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="3" fill={T.a} />
                </svg>
            </div>
        </div>
    );
}

/* ── Status Terminal ─────────────────────────────────────────────── */
function StatusWidget({ T, dark }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const [line, setLine] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const lines = ["Building RAG pipelines", "Evaluating LLM outputs", "Reading ML papers", "Open to your opportunity"];

    useEffect(() => {
        const phrase = lines[line]; let i = 0, timer;
        const type = () => {
            if (i <= phrase.length) { setDisplayed(phrase.slice(0, i)); i++; timer = setTimeout(type, 55); }
            else { setTimeout(() => { let j = phrase.length; const erase = () => { if (j >= 0) { setDisplayed(phrase.slice(0, j)); j--; timer = setTimeout(erase, 22); } else setLine(l => (l + 1) % lines.length); }; erase(); }, 1800); }
        };
        type(); return () => clearTimeout(timer);
    }, [line]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: -30, borderRadius: "50%", background: `radial-gradient(circle, ${T.a3}20, transparent 60%)`, animation: "pulse 3s ease-in-out infinite", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: T.a3, boxShadow: `0 0 10px ${T.a3}`, animation: "pulse 1.5s ease-in-out infinite" }} />
                <span style={{ ...fm, fontSize: 9, color: T.a3, letterSpacing: ".18em" }}>AVAILABLE</span>
            </div>
            <div>
                <div style={{ ...sf, fontSize: "clamp(18px,2.2vw,26px)", fontWeight: 800, color: T.t, lineHeight: 1.15, marginBottom: 12 }}>
                    Open to<br />great work
                </div>
                <div style={{ ...fm, fontSize: 12, color: T.a }}>
                    &gt; {displayed}<span style={{ color: T.a3, animation: "blink 1s step-end infinite" }}>█</span>
                </div>
            </div>
        </div>
    );
}

/* ── Profile Card ────────────────────────────────────────────────── */
function ProfileCard({ T, dark }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const ref = useRef(null);
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

    const onMove = useCallback(e => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    }, []);

    return (
        <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setMouse({ x: 0.5, y: 0.5 })}
            style={{ position: "absolute", inset: 0, cursor: "none", transform: `perspective(1000px) rotateY(${(mouse.x - 0.5) * 10}deg) rotateX(${(mouse.y - 0.5) * -7}deg)`, transition: "transform 0.12s ease-out" }}>
            <img
                src="/images/profile-cartoon.jpg"
                alt="Farhan Shahriyar"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%", display: "block" }}
                onError={e => { e.target.src = "https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/profile.jpg"; }}
            />
            {/* Spotlight */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at ${mouse.x * 100}% ${mouse.y * 100}%, ${T.a}20, transparent 58%)`, transition: "background 0.12s" }} />
            {/* Scanlines */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 3px)" }} />
            {/* Gradient bottom */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 22px 22px", background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }}>
                <div style={{ ...sf, fontSize: 19, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Farhan Shahriyar</div>
                <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".14em", textTransform: "uppercase" }}>AI & Data Engineer · Hamburg 🇩🇪</div>
            </div>
            {/* Corner brackets */}
            {[{ t: 14, l: 14, bt: 1, bl: 1 }, { t: 14, r: 14, bt: 1, br: 1 }, { b: 14, l: 14, bb: 1, bl: 1 }, { b: 14, r: 14, bb: 1, br: 1 }].map((c, i) => (
                <div key={i} style={{ position: "absolute", width: 15, height: 15, top: c.t, right: c.r, bottom: c.b, left: c.l, borderTop: c.bt ? `2px solid ${T.a}70` : 0, borderBottom: c.bb ? `2px solid ${T.a}70` : 0, borderLeft: c.bl ? `2px solid ${T.a}70` : 0, borderRight: c.br ? `2px solid ${T.a}70` : 0 }} />
            ))}
        </div>
    );
}

/* ── Bio Widget ──────────────────────────────────────────────────── */
function BioWidget({ T, dark }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const [hov, setHov] = useState(null);
    const dossier = [
        { icon: "📍", label: "Origin", value: "West Bengal → Hamburg 🇩🇪", sub: "Relocated solo at 22" },
        { icon: "🎓", label: "Studying", value: "M.Sc. Data Science", sub: "TUHH Hamburg" },
        { icon: "⚡", label: "Role", value: "AI Engineer · Nordex SE", sub: "RAG · LLM Eval · MLOps" },
        { icon: "🎯", label: "Status", value: "Open to Hire", sub: "Full-time & Werkstudent" },
    ];
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".28em", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 18, height: 1, background: T.a }} />
                    <span style={{ animation: "pulse 2s ease-in-out infinite" }}>● LIVE PROFILE</span>
                </div>
                <h2 style={{ margin: 0, lineHeight: 0.9, letterSpacing: "-.04em", fontSize: "clamp(30px,4vw,58px)", fontWeight: 900 }}>
                    <span style={{ ...sf, display: "block", color: T.t }}>I build</span>
                    <span style={{ ...sf, display: "inline-block", background: `linear-gradient(135deg, ${T.a} 0%, ${T.a2} 45%, ${T.a3} 90%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", backgroundSize: "200%", animation: "shimmer 4s linear infinite" }}>AI that works</span>
                    <span style={{ ...sf, display: "block", color: T.t }}>in production.</span>
                </h2>
            </div>
            <p style={{ fontSize: 14, color: T.m, lineHeight: 1.9, margin: 0, maxWidth: 560 }}>
                Moved from <strong style={{ color: T.t }}>West Bengal to Hamburg</strong> alone at 22. Now at <strong style={{ color: T.a }}>TUHH</strong> and building enterprise AI at <strong style={{ color: T.a }}>Nordex SE</strong> — shipped an LLM evaluation framework that cut costs <strong style={{ color: T.a3 }}>11× vs GPT-5</strong>.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
                {dossier.map((item, i) => (
                    <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                        style={{ padding: "10px 14px", borderRadius: 14, background: hov === i ? (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)") : "transparent", border: `1px solid ${hov === i ? T.a + "45" : T.border}`, transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", transform: hov === i ? "translateY(-3px)" : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                        <div>
                            <div style={{ ...fm, fontSize: 8, color: T.a, letterSpacing: ".18em", marginBottom: 2 }}>{item.label}</div>
                            <div style={{ ...fm, fontSize: 11, color: T.t, fontWeight: 600, lineHeight: 1.3 }}>{item.value}</div>
                            <div style={{ ...fm, fontSize: 10, color: T.m, marginTop: 1 }}>{item.sub}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Origin Map ──────────────────────────────────────────────────── */
function OriginWidget({ T, dark }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        import("leaflet").then(L => {
            if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
            if (!document.getElementById("leaflet-css")) {
                const link = document.createElement("link"); link.id = "leaflet-css"; link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link);
            }
            if (!mapRef.current) return;

            const touchDevice = window.matchMedia("(hover: none)").matches;
            const map = L.map(mapRef.current, { center: [40, 50], zoom: 3, zoomControl: false, attributionControl: false, scrollWheelZoom: false, dragging: !touchDevice, doubleClickZoom: false, tap: false });
            mapInstanceRef.current = map;

            L.tileLayer(dark ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);

            const accent = dark ? "#7eb8be" : "#2d4a6b";
            const wb = [22.5, 88.3], hh = [53.5, 10.0];

            const pin = (color, label) => L.divIcon({ className: "", html: `<div style="position:relative;"><div style="width:11px;height:11px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 12px ${color}80;"></div><div style="position:absolute;bottom:17px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;font-size:10px;padding:2px 7px;border-radius:5px;white-space:nowrap;font-family:'JetBrains Mono',monospace;">${label}</div></div>`, iconSize: [11, 11], iconAnchor: [5.5, 5.5] });
            L.marker(wb, { icon: pin("#f59e0b", "🇮🇳 W. Bengal") }).addTo(map);
            L.marker(hh, { icon: pin(accent, "🇩🇪 Hamburg") }).addTo(map);

            const pts = [];
            for (let i = 0; i <= 80; i++) { const t = i / 80; pts.push([wb[0] + (hh[0] - wb[0]) * t + Math.sin(t * Math.PI) * 14, wb[1] + (hh[1] - wb[1]) * t]); }
            L.polyline(pts, { color: accent, weight: 1.8, opacity: 0.45, dashArray: "8 5" }).addTo(map);
            map.fitBounds([wb, hh], { padding: [50, 70] });

            const dot = L.circleMarker(pts[0], { radius: 6, fillColor: accent, color: "white", weight: 2, fillOpacity: 1 }).addTo(map);
            const glow = L.circleMarker(pts[0], { radius: 12, fillColor: accent, color: "transparent", fillOpacity: 0.15 }).addTo(map);

            let step = 0;
            const animate = () => { step = (step + 0.35) % 81; const p = pts[Math.min(Math.floor(step), pts.length - 1)]; dot.setLatLng(p); glow.setLatLng(p); animRef.current = requestAnimationFrame(animate); };
            animRef.current = requestAnimationFrame(animate);
        });
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
    }, [dark]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.a2 }} />
                    <span style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em", textTransform: "uppercase" }}>Origin Journey</span>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                    {[{ c: "#f59e0b", l: "West Bengal" }, { c: T.a, l: "Hamburg" }].map((x, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: x.c }} />
                            <span style={{ ...fm, fontSize: 10, color: T.m }}>{x.l}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, minHeight: 180 }}>
                <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 180 }} />
            </div>
            <div style={{ ...sf, fontSize: "clamp(16px,1.8vw,20px)", fontWeight: 700, color: T.t }}>
                22. Solo. One-way ticket. <span style={{ color: T.a2 }}>🎒</span>
            </div>
        </div>
    );
}

/* ── GitHub Heatmap ──────────────────────────────────────────────── */
function HeatmapWidget({ T, dark }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const WEEKS = 26, DAYS = 7;
    const [tt, setTt] = useState(null);
    const [hl, setHl] = useState(null);

    const langs = [{ name: "Jupyter", pct: 85.6, color: "#DA5B0B" }, { name: "Astro", pct: 5.82, color: "#FF7340" }, { name: "Python", pct: 4.53, color: "#3572A5" }, { name: "JS", pct: 2.39, color: "#F1E05A" }, { name: "Shell", pct: 1.03, color: "#89E051" }, { name: "TS", pct: 0.63, color: "#3178C6" }];

    const cells = useMemo(() => {
        const arr = Array(WEEKS * DAYS).fill(0); let placed = 0;
        while (placed < 65) { const w = Math.floor(Math.random() * WEEKS), d = Math.floor(Math.random() * DAYS), idx = w * DAYS + d; const prob = d === 0 || d === 6 ? 0.2 : (w / WEEKS > 0.65 ? 0.72 : 0.38); if (Math.random() < prob && arr[idx] < 4) { arr[idx] = Math.min(arr[idx] + 1, 4); placed++; } }
        return arr;
    }, []);

    const colors = ["transparent", T.a + "30", T.a + "55", T.a + "85", T.a];
    const msgs = ["Rest day", "Light commit", "Good session", "Productive day", "Full sprint 🔥"];
    const stats = [{ icon: "⭐", val: 17, l: "Stars" }, { icon: "📦", val: 19, l: "Repos" }, { icon: "🔥", val: 10, l: "Streak" }, { icon: "⚡", val: 215, l: "Contribs" }];

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <div>
                    <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 4 }}>GitHub · shahriyar31</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ ...sf, fontSize: 26, fontWeight: 800, color: T.t, lineHeight: 1 }}>215</span><span style={{ ...fm, fontSize: 11, color: T.m }}>contributions</span></div>
                </div>
                {tt && <div style={{ ...fm, fontSize: 10, color: T.a, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", padding: "3px 9px", borderRadius: 7 }}>{tt}</div>}
            </div>
            <div style={{ display: "flex", gap: 3, flex: 1 }}>
                <div style={{ display: "grid", gridTemplateRows: "repeat(7,1fr)", gap: 3 }}>
                    {["M", "", "W", "", "F", "", "S"].map((l, i) => <div key={i} style={{ ...fm, fontSize: 8, color: T.m, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 3, whiteSpace: "nowrap" }}>{l}</div>)}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${WEEKS},1fr)`, gridTemplateRows: `repeat(${DAYS},1fr)`, gap: 3, gridAutoFlow: "column" }}>
                    {cells.map((v, i) => <div key={i} onMouseEnter={() => { setHl(i); setTt(msgs[v]); }} onMouseLeave={() => { setHl(null); setTt(null); }} style={{ borderRadius: 3, cursor: "default", background: v === 0 ? (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)") : colors[v], transform: hl === i ? "scale(1.7)" : "scale(1)", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: hl === i ? `0 0 8px ${T.a}90` : "none" }} />)}
                </div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {stats.map((s, i) => <div key={i} style={{ ...fm, fontSize: 10, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${T.border}`, borderRadius: 8, padding: "3px 8px", display: "flex", gap: 4, alignItems: "center" }}><span>{s.icon}</span><span style={{ color: T.t, fontWeight: 700 }}>{s.val}</span><span style={{ color: T.m, fontSize: 9 }}>{s.l}</span></div>)}
            </div>
            <div>
                <div style={{ ...fm, fontSize: 9, color: T.m, marginBottom: 4, letterSpacing: ".08em", textTransform: "uppercase" }}>Languages</div>
                <div style={{ display: "flex", borderRadius: 5, overflow: "hidden", height: 7, gap: 1 }}>
                    {langs.map((l, i) => <div key={i} title={`${l.name} ${l.pct}%`} style={{ width: `${l.pct}%`, background: l.color, flexShrink: 0, borderRadius: i === 0 ? "5px 0 0 5px" : i === langs.length - 1 ? "0 5px 5px 0" : 0 }} />)}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginTop: 5 }}>
                    {langs.map((l, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: l.color, display: "inline-block" }} /><span style={{ ...fm, fontSize: 9, color: T.m }}>{l.name} <span style={{ color: T.t, fontWeight: 600 }}>{l.pct}%</span></span></div>)}
                </div>
            </div>
        </div>
    );
}

/* ── Music Widget ────────────────────────────────────────────────── */
function MusicWidget({ T, dark }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const BARS = 14;
    const [paused, setPaused] = useState(false);
    const [heights, setHeights] = useState(() => Array.from({ length: BARS }, () => Math.random() * 60 + 10));
    const [idx, setIdx] = useState(0);
    const pods = ["Lex Fridman", "Huberman Lab", "ML Street Talk", "TWIML AI"];

    useEffect(() => { if (paused) return; const id = setInterval(() => setHeights(Array.from({ length: BARS }, () => Math.random() * 65 + 8)), 180); return () => clearInterval(id); }, [paused]);
    useEffect(() => { const id = setInterval(() => setIdx(i => (i + 1) % pods.length), 3500); return () => clearInterval(id); }, []);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" }} onClick={() => setPaused(p => !p)}>
            <div style={{ ...fm, fontSize: 9, color: T.a2, letterSpacing: ".18em", textTransform: "uppercase" }}>🎙️ Listening</div>
            <div>
                <div style={{ ...sf, fontSize: "clamp(14px,1.8vw,18px)", fontWeight: 700, color: T.t, lineHeight: 1.3, marginBottom: 4 }}>{pods[idx]}</div>
                <div style={{ ...fm, fontSize: 10, color: T.m }}>{paused ? "⏸ Paused" : "▶ Playing"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, flex: 1, minHeight: 48 }}>
                {heights.map((ht, i) => <div key={i} style={{ flex: 1, borderRadius: 3, background: paused ? T.a2 + "40" : `linear-gradient(to top, ${T.a2}CC, ${T.a}EE)`, height: paused ? 4 : `${ht}%`, minHeight: 4, transition: paused ? "height 0.4s" : "height 0.18s ease-out" }} />)}
            </div>
            <div style={{ ...fm, fontSize: 9, color: T.m }}>Click to {paused ? "resume" : "pause"}</div>
        </div>
    );
}

/* ── Hobbies Widget ──────────────────────────────────────────────── */
function HobbiesWidget({ T, dark }) {
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const [hov, setHov] = useState(null);
    const items = [
        { icon: "📷", label: "Photography", sub: "Landscape & Street", accent: T.a },
        { icon: "☕", label: "Coffee", sub: "First cup = first commit", accent: "#f59e0b" },
        { icon: "🗣️", label: "Languages", sub: "Bengali · English · German", accent: T.a3 },
        { icon: "✈️", label: "Travel", sub: "India → Germany", accent: T.a2 },
    ];
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ ...fm, fontSize: 9, color: T.a3, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 4 }}>Beyond the Code</div>
            {items.map((it, i) => (
                <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 10, background: hov === i ? (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)") : "transparent", border: `1px solid ${hov === i ? it.accent + "45" : "transparent"}`, transition: "all 0.28s cubic-bezier(0.16,1,0.3,1)", transform: hov === i ? "translateX(6px)" : "none" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{it.icon}</span>
                    <div>
                        <div style={{ ...fm, fontSize: 11, color: hov === i ? T.t : T.m, fontWeight: 600, transition: "color 0.25s" }}>{it.label}</div>
                        <div style={{ ...fm, fontSize: 9, color: T.m }}>{it.sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN ABOUT SECTION — Asymmetric Bento Grid
   
   CSS Grid layout:
   Col: [photo]  [clock] [status]
        [bio bio bio bio bio bio]
        [music] [map map map map]
        [hobbies] [heatmap heatmap]
══════════════════════════════════════════════════════════════════ */
export default function AboutSection({ T, dark }) {
    const [vis, setVis] = useState({});
    const ref = useRef(null);

    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const i = parseInt(e.target.dataset.cell || "0");
                    setTimeout(() => setVis(v => ({ ...v, [i]: true })), i * 90);
                }
            });
        }, { threshold: 0.05 });
        ref.current?.querySelectorAll("[data-cell]").forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    const cell = (i, extra = {}) => ({
        borderRadius: 20,
        background: dark ? "rgba(255,255,255,0.028)" : "rgba(255,255,255,0.72)",
        border: `1px solid ${T.border}`,
        backdropFilter: "blur(14px)",
        overflow: "hidden",
        position: "relative",
        transition: `opacity 0.7s ${i * 0.07}s ease, transform 0.7s ${i * 0.07}s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s`,
        opacity: vis[i] ? 1 : 0,
        transform: vis[i] ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)",
        ...extra,
    });

    const hover = accent => ({
        onMouseEnter: e => { e.currentTarget.style.borderColor = accent + "45"; e.currentTarget.style.boxShadow = `0 24px 60px ${accent}12, inset 0 0 60px ${accent}05`; },
        onMouseLeave: e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; },
    });

    return (
        <div ref={ref} style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "clamp(200px,22%,280px) 1fr 1fr",
            gridTemplateRows: "auto auto auto auto",
        }} className="about-bento">

            {/* ── PHOTO — tall, spans 2 rows ── */}
            <div data-cell="0" {...hover(T.a)} style={{ ...cell(0, { gridColumn: "1", gridRow: "1 / 3", minHeight: 440, padding: 0 }) }}>
                <ProfileCard T={T} dark={dark} />
            </div>

            {/* ── CLOCK ── */}
            <div data-cell="1" {...hover(T.a)} style={{ ...cell(1, { gridColumn: "2", gridRow: "1", padding: 24 }) }}>
                <ClockWidget T={T} dark={dark} />
            </div>

            {/* ── STATUS ── */}
            <div data-cell="2" {...hover(T.a3)} style={{ ...cell(2, { gridColumn: "3", gridRow: "1", padding: 24 }) }}>
                <StatusWidget T={T} dark={dark} />
            </div>

            {/* ── BIO — spans 2 columns ── */}
            <div data-cell="3" {...hover(T.a)} style={{ ...cell(3, { gridColumn: "2 / 4", gridRow: "2", padding: 32 }) }}>
                <BioWidget T={T} dark={dark} />
            </div>

            {/* ── MUSIC ── */}
            <div data-cell="4" {...hover(T.a2)} style={{ ...cell(4, { gridColumn: "1", gridRow: "3", padding: 24 }) }}>
                <MusicWidget T={T} dark={dark} />
            </div>

            {/* ── ORIGIN MAP — spans 2 columns ── */}
            <div data-cell="5" {...hover(T.a2)} style={{ ...cell(5, { gridColumn: "2 / 4", gridRow: "3", padding: 24, minHeight: 320 }) }}>
                <OriginWidget T={T} dark={dark} />
            </div>

            {/* ── HOBBIES ── */}
            <div data-cell="6" {...hover(T.a3)} style={{ ...cell(6, { gridColumn: "1", gridRow: "4", padding: 24 }) }}>
                <HobbiesWidget T={T} dark={dark} />
            </div>

            {/* ── GITHUB HEATMAP — spans 2 columns ── */}
            <div data-cell="7" {...hover(T.a)} style={{ ...cell(7, { gridColumn: "2 / 4", gridRow: "4", padding: 24 }) }}>
                <HeatmapWidget T={T} dark={dark} />
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .about-bento {
                        grid-template-columns: 1fr 1fr !important;
                        grid-template-rows: auto !important;
                    }
                    .about-bento > [data-cell="0"] { grid-column: 1 / 3 !important; grid-row: auto !important; min-height: 300px !important; aspect-ratio: 16/9; }
                    .about-bento > [data-cell="3"] { grid-column: 1 / 3 !important; grid-row: auto !important; }
                    .about-bento > [data-cell="5"] { grid-column: 1 / 3 !important; grid-row: auto !important; }
                    .about-bento > [data-cell="7"] { grid-column: 1 / 3 !important; grid-row: auto !important; }
                }
                @media (max-width: 640px) {
                    .about-bento { grid-template-columns: 1fr !important; }
                    .about-bento > [data-cell] { grid-column: 1 !important; grid-row: auto !important; }
                }
                @keyframes rippleOut { from{transform:scale(.8);opacity:.6} to{transform:scale(2.2);opacity:0} }
            `}</style>
        </div>
    );
}