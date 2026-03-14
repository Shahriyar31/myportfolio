import { useState, useEffect, useRef } from "react";

export default function SkillRadar({ T }) {
    const [prog, setProg] = useState(0);
    const [hov, setHov] = useState(-1);
    const ref = useRef(null);
    const raf = useRef(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                let start = null;
                const go = ts => {
                    if (!start) start = ts;
                    const t = Math.min(1, (ts - start) / 2000);
                    setProg(1 - Math.pow(1 - t, 3));
                    if (t < 1) raf.current = requestAnimationFrame(go);
                };
                raf.current = requestAnimationFrame(go);
                obs.disconnect();
            }
        }, { threshold: .2 });
        if (ref.current) obs.observe(ref.current);
        return () => { obs.disconnect(); if (raf.current) cancelAnimationFrame(raf.current); };
    }, []);

    const cats = ["AI & MLOps", "Data Eng.", "Cloud & DevOps", "Languages"];
    const colors = [T.a, T.a2, T.a3, "#f59e0b"];
    const levels = [.9, .82, .86, .74];
    const counts = [7, 6, 7, 6];
    const icons = ["🧠", "🗄️", "☁️", "💻"];

    const cx = 200, cy = 200, R = 130;
    const n = cats.length;
    const angles = cats.map((_, i) => (i / n) * Math.PI * 2 - Math.PI / 2);
    const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];

    const rings = [.25, .5, .75, 1];
    const dataPoints = angles.map((a, i) => pt(a, R * levels[i] * prog));

    return (
        <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 460, margin: "0 auto 56px", aspectRatio: "1" }}>
            {/* Glow behind */}
            <div style={{ position: "absolute", left: "50%", top: "50%", width: "70%", height: "70%", transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle,${T.a}12,transparent)`, filter: "blur(40px)", pointerEvents: "none", opacity: prog }} />

            <svg width="100%" height="100%" viewBox="0 0 400 400">
                <defs>
                    <linearGradient id="rfill" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={T.a} stopOpacity=".24" />
                        <stop offset="50%" stopColor={T.a2} stopOpacity=".14" />
                        <stop offset="100%" stopColor={T.a3} stopOpacity=".2" />
                    </linearGradient>
                    <filter id="rglow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="rglowBig">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Grid rings */}
                {rings.map((r, i) => (
                    <polygon key={i}
                        points={angles.map(a => pt(a, R * r).join(",")).join(" ")}
                        fill="none" stroke={T.border} strokeWidth={i === 3 ? "1" : ".5"}
                        opacity={prog > 0 ? .3 + i * .12 : 0}
                        style={{ transition: `opacity .5s ${i * .12}s` }} />
                ))}

                {/* Ring labels */}
                {rings.map((r, i) => {
                    const [lx, ly] = pt(angles[0], R * r);
                    return (
                        <text key={i} x={lx + 6} y={ly - 4} fill={T.dim} fontSize="7"
                            fontFamily="'JetBrains Mono',monospace" opacity={prog * .5}>
                            {Math.round(r * 100)}%
                        </text>
                    );
                })}

                {/* Axis lines with gradient */}
                {angles.map((a, i) => {
                    const [ex, ey] = pt(a, R);
                    return (
                        <line key={i} x1={cx} y1={cy} x2={ex} y2={ey}
                            stroke={colors[i]} strokeWidth="1.2"
                            opacity={.3}
                            strokeDasharray={`${R * prog} ${R}`} />
                    );
                })}

                {/* Data polygon */}
                {prog > 0 && (
                    <polygon
                        points={dataPoints.map(p => p.join(",")).join(" ")}
                        fill="url(#rfill)"
                        stroke={T.a} strokeWidth="1.8"
                        filter="url(#rglow)" />
                )}

                {/* Data vertices with pulse */}
                {dataPoints.map(([px, py], i) => {
                    const isH = hov === i;
                    return (
                        <g key={i}
                            onMouseEnter={() => setHov(i)}
                            onMouseLeave={() => setHov(-1)}
                            style={{ cursor: "none" }}>
                            {/* Outer pulse ring */}
                            <circle cx={px} cy={py} r="10" fill={colors[i]} opacity={prog * .1}>
                                <animate attributeName="r" values={isH ? "14;22;14" : "8;16;8"} dur="2.5s" repeatCount="indefinite" />
                            </circle>
                            {/* Core */}
                            <circle cx={px} cy={py} r={isH ? 6 : 4.5} fill={colors[i]} opacity={prog}
                                filter={isH ? "url(#rglowBig)" : "none"}
                                style={{ transition: "r .2s" }}>
                                <animate attributeName="r" values={isH ? "5;7;5" : "3.5;5.5;3.5"} dur="2s" repeatCount="indefinite" />
                            </circle>
                            {/* Hover hitbox */}
                            <circle cx={px} cy={py} r="22" fill="transparent" />
                        </g>
                    );
                })}

                {/* Category labels */}
                {angles.map((a, i) => {
                    const [lx, ly] = pt(a, R + 48);
                    const isH = hov === i;
                    return (
                        <g key={`l${i}`} style={{ transition: "transform .2s" }}>
                            <text x={lx} y={ly - 8} textAnchor="middle" fill={isH ? colors[i] : T.t}
                                fontSize={isH ? "11" : "9.5"} fontFamily="'JetBrains Mono',monospace"
                                letterSpacing=".08em" opacity={prog}
                                style={{ textTransform: "uppercase", fontWeight: isH ? 700 : 500, transition: "all .2s" }}>
                                {cats[i]}
                            </text>
                            <text x={lx} y={ly + 6} textAnchor="middle" fill={T.m}
                                fontSize="8" fontFamily="'JetBrains Mono',monospace"
                                opacity={prog * .6}>
                                {counts[i]} skills · {Math.round(levels[i] * 100)}%
                            </text>
                            <text x={lx} y={ly - 22} textAnchor="middle" fontSize="16" opacity={prog}>
                                {icons[i]}
                            </text>
                        </g>
                    );
                })}

                {/* Center core */}
                <circle cx={cx} cy={cy} r="3" fill={T.a} opacity={prog * .7}>
                    <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={cx} cy={cy} r="8" fill="none" stroke={T.a} strokeWidth=".6" opacity={prog * .25}>
                    <animate attributeName="r" values="6;14;6" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={cx} cy={cy} r="20" fill="none" stroke={T.a} strokeWidth=".3" opacity={prog * .12}>
                    <animate attributeName="r" values="16;26;16" dur="4s" repeatCount="indefinite" />
                </circle>
            </svg>

            {/* Proficiency legend */}
            <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 16, opacity: prog * .7 }}>
                {cats.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "none" }}
                        onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(-1)}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors[i], boxShadow: hov === i ? `0 0 10px ${colors[i]}` : "none", transition: "box-shadow .2s" }} />
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: hov === i ? colors[i] : T.m, transition: "color .2s", letterSpacing: ".06em" }}>{c}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
