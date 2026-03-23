import { useState, useRef } from "react";

/* 3D tilt profile card with orbital rings and glassmorphism */
export default function ProfileCard({ T, dark }) {
    const ref = useRef(null);
    const [hov, setHov] = useState(false);
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };

    const onMove = e => {
        const r = ref.current?.getBoundingClientRect(); if (!r) return;
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        ref.current.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    };
    const onLeave = () => {
        if (ref.current) ref.current.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale(1)";
        setHov(false);
    };

    return (
        <div ref={ref}
            onMouseMove={onMove}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={onLeave}
            style={{
                position: "relative", borderRadius: 20, overflow: "hidden",
                transition: "transform .12s ease",
                willChange: "transform", cursor: "none",
            }}>
            {/* Image */}
            <div style={{ position: "relative", aspectRatio: "1", borderRadius: 20, overflow: "hidden" }}>
                {/* Animated border ring */}
                <div style={{
                    position: "absolute", inset: -3, borderRadius: 22,
                    background: `conic-gradient(from ${hov ? "180deg" : "0deg"},${T.a},${T.a2},${T.a3},${T.a})`,
                    animation: "spin 6s linear infinite",
                    opacity: hov ? .8 : .4,
                    transition: "opacity .4s",
                }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: T.bg }} />

                <img src="https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/profile.jpg" alt="Farhan Shahriyar"
                    style={{
                        width: "100%", height: "100%", objectFit: "cover", display: "block",
                        position: "relative", zIndex: 1, borderRadius: 20,
                        filter: hov ? "saturate(1.1) brightness(1.05)" : "saturate(.9)",
                        transition: "filter .4s",
                    }}
                    onError={e => { e.target.parentElement.style.background = T.card; e.target.style.display = "none"; }} />

                {/* Gradient overlay */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
                    padding: "32px 18px 16px",
                    background: "linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.3) 50%,transparent 100%)",
                    borderRadius: "0 0 20px 20px",
                }}>
                    <div style={{ ...sf, fontSize: 16, fontWeight: 700, color: "white", marginBottom: 3 }}>Farhan Shahriyar</div>
                    <div style={{ ...fm, fontSize: 9, color: "rgba(255,255,255,.7)", letterSpacing: ".08em" }}>Hamburg, Germany 🇩🇪</div>
                </div>

                {/* Shine effect on hover */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
                    background: "linear-gradient(115deg,transparent 35%,rgba(255,255,255,.12) 45%,transparent 55%)",
                    transform: hov ? "translateX(100%)" : "translateX(-100%)",
                    transition: "transform .6s ease",
                    borderRadius: 20,
                }} />
            </div>

            {/* Orbiting decorations */}
            {hov && (
                <>
                    <div style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, zIndex: 0 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                position: "absolute",
                                width: 6, height: 6, borderRadius: "50%",
                                background: [T.a, T.a2, T.a3][i],
                                boxShadow: `0 0 8px ${[T.a, T.a2, T.a3][i]}`,
                                animation: `orbit${["A", "B", "C"][i]} ${8 + i * 4}s linear infinite`,
                                opacity: .6,
                            }} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
