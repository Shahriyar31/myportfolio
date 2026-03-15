import { useState, useRef, useEffect } from "react";

/* Hologram Parallax Glitch Profile Card */
export default function ProfileCard({ T, dark }) {
    const ref = useRef(null);
    const [hov, setHov] = useState(false);
    const [m, setM] = useState({ x: 0, y: 0 });
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };

    const onMove = e => {
        const r = ref.current?.getBoundingClientRect(); if (!r) return;
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        // Ease the mouse movement for smoothness
        setM({ x, y });
        ref.current.style.transform = `perspective(800px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) scale(1.05)`;
    };
    
    const onLeave = () => {
        if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale(1)";
        setHov(false);
        setM({ x: 0, y: 0 });
    };

    const imgSrc = "/images/profile-cartoon.jpg";
    const fbSrc = "https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/profile.jpg";

    return (
        <div ref={ref}
            onMouseMove={onMove}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={onLeave}
            style={{
                position: "relative", borderRadius: 24, overflow: "hidden", cursor: "none",
                willChange: "transform", width: "100%", aspectRatio: "1",
                transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: hov ? `0 30px 60px ${T.a}40` : "0 10px 30px rgba(0,0,0,0.2)",
                border: `1px solid ${hov ? T.a : T.border}`,
                background: dark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)"
            }}>
            
            {/* Spinning Neon Core Border */}
            {hov && <div style={{
                position: "absolute", inset: -20, borderRadius: 24,
                background: `conic-gradient(from 0deg, ${T.a}, transparent 40%, ${T.a} 50%, transparent 90%, ${T.a})`,
                animation: "spin 3s linear infinite", opacity: 0.6, zIndex: 0
            }} />}
            
            {/* Main Content Mask */}
            <div style={{ position: "absolute", inset: 2, borderRadius: 22, overflow: "hidden", background: T.bg, zIndex: 1 }}>
                
                {/* Base Image Container */}
                <div style={{ position: "absolute", inset: 0, perspective: "1000px" }}>
                    {/* Base Image */}
                    <img src={imgSrc} alt="Farhan Shahriyar" 
                        style={{
                            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                            filter: hov ? "grayscale(30%) contrast(1.1) brightness(0.6)" : "saturate(0.9)",
                            transition: "all 0.5s ease"
                        }}
                        onError={e => { e.target.src = fbSrc; }} 
                    />

                    {/* Glitch Hologram Layer 1 : Cyan */}
                    <div style={{
                        position: "absolute", inset: -20, backgroundImage: `url(${imgSrc})`, backgroundSize: "cover", backgroundPosition: "center",
                        mixBlendMode: "screen", filter: "sepia(100%) hue-rotate(150deg) saturate(400%) contrast(1.5)",
                        opacity: hov ? 0.8 : 0, pointerEvents: "none",
                        transform: hov ? `translate(${m.x * -40}px, ${m.y * -40}px) scale(1.1)` : "scale(1)",
                        transition: "opacity 0.4s, transform 0.1s linear"
                    }} />

                    {/* Glitch Hologram Layer 2 : Red */}
                    <div style={{
                        position: "absolute", inset: -20, backgroundImage: `url(${imgSrc})`, backgroundSize: "cover", backgroundPosition: "center",
                        mixBlendMode: "screen", filter: "sepia(100%) hue-rotate(300deg) saturate(400%) contrast(1.5)",
                        opacity: hov ? 0.8 : 0, pointerEvents: "none",
                        transform: hov ? `translate(${m.x * 40}px, ${m.y * 40}px) scale(1.1)` : "scale(1)",
                        transition: "opacity 0.4s, transform 0.1s linear"
                    }} />

                    {/* Cyber Grid Overlay */}
                    <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        backgroundImage: `linear-gradient(${T.a}40 1px, transparent 1px), linear-gradient(90deg, ${T.a}40 1px, transparent 1px)`,
                        backgroundSize: "20px 20px", opacity: hov ? 0.4 : 0.05,
                        transition: "opacity 0.5s"
                    }} />
                    
                    {/* Interactive Cyber Scanline */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: "4px", pointerEvents: "none",
                        background: T.a, boxShadow: `0 0 20px 5px ${T.a}`,
                        opacity: hov ? 0.9 : 0,
                        transform: `translateY(${hov ? (m.y + 0.5) * 400 + "px" : "-10px"})`,
                        transition: "opacity 0.3s, transform 0.1s linear"
                    }} />
                </div>

                {/* Permanent Gradient Overlay for Text */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 24px 20px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
                    zIndex: 2, display: "flex", flexDirection: "column", gap: 4,
                    transform: hov ? "translateY(5px)" : "translateY(0)",
                    transition: "transform 0.4s"
                }}>
                    <div style={{ ...sf, fontSize: 20, fontWeight: 700, color: "white", letterSpacing: "1px" }}>Farhan Shahriyar</div>
                    <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: ".1em", textTransform: "uppercase" }}>Hamburg, Germany 🇩🇪</div>
                </div>

                {/* Floating Status Badge */}
                <div style={{
                    position: "absolute", top: 20, right: 20, zIndex: 2,
                    ...fm, fontSize: 9, color: T.bg, background: T.a, padding: "6px 14px", borderRadius: 20,
                    fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
                    transform: hov ? `translate(${m.x * 20}px, ${m.y * 20}px)` : "translate(0,0)",
                    transition: "transform 0.2s ease-out", boxShadow: `0 10px 20px ${T.a}40`
                }}>
                    LIVE
                </div>
            </div>
        </div>
    );
}
