import { useState, useEffect, useRef } from "react";

const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$&*";

export default function GlitchName({ text, T }) {
    const [d, setD] = useState(text); const it = useRef(0);
    useEffect(() => {
        it.current = 0;
        const id = setInterval(() => {
            setD(text.split("").map((c, i) => { if (c === " ") return " "; if (i < it.current) return text[i]; return CH[Math.floor(Math.random() * CH.length)]; }).join(""));
            it.current += .55; if (it.current >= text.length) clearInterval(id);
        }, 36);
        return () => clearInterval(id);
    }, [text]);
    return (
        <span style={{ position: "relative", display: "block" }}>
            <span style={{ color: T.t, display: "block" }}>{d}</span>
            <span style={{ position: "absolute", top: 0, left: 0, color: T.a, opacity: 0.5, clipPath: "polygon(0 20%,100% 20%,100% 42%,0 42%)", animation: "glitch1 4.5s infinite", pointerEvents: "none", display: "block", mixBlendMode: "normal" }}>{text}</span>
            <span style={{ position: "absolute", top: 0, left: 0, color: T.a2, opacity: 0.5, clipPath: "polygon(0 60%,100% 60%,100% 78%,0 78%)", animation: "glitch2 4.5s infinite", pointerEvents: "none", display: "block", mixBlendMode: "normal" }}>{text}</span>
        </span>
    );
}
