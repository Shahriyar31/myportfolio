import { useState, useRef, useEffect } from "react";

export default function ContactTerminal({ T, dark }) {
    const fm = { fontFamily: "'Inter', sans-serif" };
    const sf = { fontFamily: "'Sora', sans-serif" };
    
    const [msg, setMsg] = useState("");
    const [email, setEmail] = useState("");
    const [focus, setFocus] = useState(null);
    const [sent, setSent] = useState(false);
    const terminalRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    
    const isMobile = window.innerWidth <= 768;

    const onMove = (e) => {
        if (!terminalRef.current || isMobile) return;
        const rect = terminalRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
        
        // Tilt effect
        const rx = (e.clientX - rect.left) / rect.width - 0.5;
        const ry = (e.clientY - rect.top) / rect.height - 0.5;
        terminalRef.current.style.transform = `perspective(1000px) rotateY(${rx * 4}deg) rotateX(${-ry * 4}deg)`;
    };

    const onLeave = () => {
        if (!terminalRef.current || isMobile) return;
        terminalRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
    };

    const sendHit = (e) => {
        e.preventDefault();
        if(!msg || !email) return;
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setMsg("");
            setEmail("");
        }, 3000);
    };

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, width: "100%" }}>
            {/* Left Info Panel */}
            <div style={{ flex: "1 1 300px" }}>
                <h2 style={{ ...sf, fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.05, marginBottom: 20, color: T.t }}>
                    Signal <span style={{ color: T.a, fontStyle: "italic" }}>Acquired.</span>
                </h2>
                <p style={{ fontSize: 15, color: T.m, lineHeight: 1.85, marginBottom: 32, maxWidth: 400 }}>
                    Based in Hamburg, Germany. Open to discussing Werkstudent, internship, and full-time roles in Data Engineering, AI/ML Engineering, and modern software development.
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                        { icon: "✧", label: "Email", value: "shahriyarfarhan3101@gmail.com", href: "mailto:shahriyarfarhan3101@gmail.com" },
                        { icon: "✦", label: "GitHub", value: "Shahriyar31", href: "https://github.com/Shahriyar31" },
                        { icon: "❖", label: "LinkedIn", value: "farhanshahriyar", href: "https://www.linkedin.com/in/farhanshahriyar" }
                    ].map((btn, i) => (
                        <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer"
                            style={{ 
                                display: "flex", alignItems: "center", gap: 16, 
                                padding: "16px", borderRadius: 16, 
                                background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                border: `1px solid ${T.border}`,
                                textDecoration: "none", transition: "all .3s ease",
                                cursor: "none"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${T.a}10`; e.currentTarget.style.borderColor = T.a; e.currentTarget.style.transform = "translateX(8px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateX(0)"; }}>
                            <div style={{ ...fm, fontSize: 18, color: T.a, width: 24, textAlign: "center" }}>{btn.icon}</div>
                            <div>
                                <div style={{ ...fm, fontSize: 9, color: T.m, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{btn.label}</div>
                                <div style={{ ...fm, fontSize: 12, color: T.t, fontWeight: 600 }}>{btn.value}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Right Terminal Form Panel */}
            <div 
                ref={terminalRef}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                style={{ 
                    flex: "1 1 400px", 
                    position: "relative",
                    borderRadius: 24,
                    padding: "32px",
                    background: dark ? "rgba(10,12,20,0.6)" : "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: `1px solid ${T.border}`,
                    boxShadow: `0 30px 60px rgba(0,0,0,0.1), inset 0 0 0 1px ${T.a}20`,
                    transition: "transform 0.2s ease-out, box-shadow 0.3s ease",
                    overflow: "hidden"
                }}>
                
                {/* Dynamic Spotlight */}
                <div style={{ 
                    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
                    background: "none",
                    opacity: isMobile ? 0 : 1
                }} />

                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, paddingBottom: 16 }}>
                        <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: ".14em", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#64748B", animation: "blink 2s infinite" }} />
                            SYSTEM.SECURE_COMM_CHANNEL
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#64748B" }}/>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#64748B" }}/>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#64748B" }}/>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ ...fm, fontSize: 10, color: focus === 'email' ? T.t : T.m, transition: "color 0.3s" }}>RETURN_ADDRESS / EMAIL</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setFocus('email')}
                            onBlur={() => setFocus(null)}
                            placeholder="visitor@domain.com"
                            style={{ 
                                width: "100%", padding: "16px", borderRadius: 12, 
                                background: focus === 'email' ? `${T.a}08` : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
                                border: `1px solid ${focus === 'email' ? T.a : T.border}`,
                                color: T.t, ...fm, fontSize: 13,
                                outline: "none", transition: "all 0.3s",
                                cursor: "text"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ ...fm, fontSize: 10, color: focus === 'msg' ? T.t : T.m, transition: "color 0.3s" }}>PAYLOAD / MESSAGE</label>
                        <textarea
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            onFocus={() => setFocus('msg')}
                            onBlur={() => setFocus(null)}
                            placeholder="Initialize transmission..."
                            rows={4}
                            style={{
                                width: "100%", padding: "16px", borderRadius: 12,
                                background: focus === 'msg' ? `${T.a}08` : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
                                border: `1px solid ${focus === 'msg' ? T.a : T.border}`,
                                color: T.t, ...fm, fontSize: 13, resize: "none",
                                outline: "none", transition: "all 0.3s",
                                cursor: "text"
                            }}
                        />
                    </div>

                    <button 
                        onClick={sendHit}
                        disabled={sent || !msg || !email}
                        style={{ 
                            ...fm, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                            padding: "18px", borderRadius: 12, width: "100%",
                            background: sent ? "#64748B" : T.t,
                            color: T.bg, border: "none", cursor: "pointer",
                            opacity: (!msg || !email) ? 0.5 : 1,
                            transition: "all 0.3s ease",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                        }}
                    >
                        {sent ? "TRANSMISSION SUCCESSFUL ✓" : "EXECUTE_SEND()"}
                    </button>
                </div>
            </div>
        </div>
    );
}
