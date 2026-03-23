import { useState, useRef, useEffect } from "react";

/* Minimal Matte Profile Card */
export default function ProfileCard({ T, dark }) {
    const [hov, setHov] = useState(false);
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };

    const imgSrc = "/images/profile-cartoon.jpg";
    const fbSrc = "https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/profile.jpg";

    return (
        <div 
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: "relative", borderRadius: 16, overflow: "hidden", cursor: "pointer",
                width: "100%", aspectRatio: "1",
                transition: "all 0.3s ease-in-out",
                border: `1px solid ${hov ? T.a : T.border}`,
                background: T.card,
                transform: hov ? "scale(1.02)" : "scale(1)"
            }}>
            
            {/* Main Content */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, zIndex: 1 }}>
                
                {/* Base Image Container */}
                <div style={{ position: "absolute", inset: 0 }}>
                    <img src={imgSrc} alt="Farhan Shahriyar" 
                        style={{
                            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                            transition: "all 0.5s ease"
                        }}
                        onError={e => { e.target.src = fbSrc; }} 
                    />
                </div>

                {/* Solid Info Bar Overlay */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px",
                    background: T.card, borderTop: `1px solid ${T.border}`,
                    zIndex: 2, display: "flex", flexDirection: "column", gap: 4,
                }}>
                    <div style={{ ...sf, fontSize: 18, fontWeight: 700, color: T.t, letterSpacing: "1px" }}>Farhan Shahriyar</div>
                    <div style={{ ...fm, fontSize: 10, color: T.m, letterSpacing: ".05em", textTransform: "uppercase" }}>Hamburg, Germany</div>
                </div>

                {/* Floating Status Badge */}
                <div style={{
                    position: "absolute", top: 16, right: 16, zIndex: 2,
                    ...fm, fontSize: 10, color: dark ? T.card : T.t, background: T.a, padding: "4px 12px", borderRadius: 12,
                    fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    LIVE
                </div>
            </div>
        </div>
    );
}
