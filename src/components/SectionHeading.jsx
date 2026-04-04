import { useState, useEffect, useRef } from "react";

/* ── Cipher scramble characters ─────────────────────────────────────── */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#_+=<>|~";
function rndChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

function scramble(text, settledUpTo) {
    return text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        if (i < settledUpTo) return ch;
        return rndChar();
    }).join("");
}

/* ══════════════════════════════════════════════════════════════════════
   SH — Section Heading with cipher-scramble entrance
   Props: n  (e.g. "01"), title (e.g. "Experience"), T (theme)
══════════════════════════════════════════════════════════════════════ */
export default function SH({ n, title, T }) {
    const ref = useRef(null);
    const [triggered, setTriggered] = useState(false);
    const [displayTitle, setDisplayTitle] = useState(() => scramble(title, 0));
    const [displayNum, setDisplayNum] = useState("00");
    const [lineGo, setLineGo] = useState(false);
    const [settled, setSettled] = useState(false);

    /* ── Intersection trigger (+ sticky-section fallback) ── */
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setTriggered(true); obs.disconnect(); }
        }, { threshold: 0, rootMargin: "0px 0px -5px 0px" });
        if (ref.current) obs.observe(ref.current);
        // Sticky containers sometimes don't fire IO reliably — hard fallback
        const fb = setTimeout(() => setTriggered(true), 1200);
        return () => { obs.disconnect(); clearTimeout(fb); };
    }, []);

    /* ── Main animation sequence ── */
    useEffect(() => {
        if (!triggered) return;

        // Kick the divider line immediately
        setLineGo(true);

        // ① Number counts up (0 → n) over ~420 ms
        const target = parseInt(n, 10);
        const NUM_STEPS = 14;
        let step = 0;
        const numTimer = setInterval(() => {
            step++;
            if (step >= NUM_STEPS) {
                setDisplayNum(n);
                clearInterval(numTimer);
            } else {
                setDisplayNum(String(Math.round((step / NUM_STEPS) * target)).padStart(2, "0"));
            }
        }, 30);

        // ② Title scrambles after 80 ms — chars settle left-to-right
        let frame = 0;
        const titleTimer = setTimeout(() => {
            const iv = setInterval(() => {
                frame++;

                // Map scramble frame → how many chars are settled
                // Skips spaces (they're always correct)
                let nonSpaceSettled = Math.floor(frame / 3);
                let settledIdx = 0, nonSpaceSeen = 0;
                for (let i = 0; i < title.length; i++) {
                    if (title[i] !== " ") nonSpaceSeen++;
                    if (nonSpaceSeen > nonSpaceSettled) break;
                    settledIdx = i + 1;
                }

                if (settledIdx >= title.length) {
                    setDisplayTitle(title);
                    setSettled(true);
                    clearInterval(iv);
                } else {
                    setDisplayTitle(scramble(title, settledIdx));
                }
            }, 40); // ~25fps for the scramble (intentionally chunky — telegraphs the effect)
        }, 80);

        return () => {
            clearInterval(numTimer);
            clearTimeout(titleTimer);
        };
    }, [triggered, n, title]);

    const sf = { fontFamily: "'Sora', sans-serif" };
    const fm = { fontFamily: "'Inter', sans-serif" };
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

    return (
        <div
            ref={ref}
            data-sh
            style={{ marginBottom: 64, display: "flex", alignItems: "center", gap: 20, overflow: "visible" }}
        >
            {/* Left block: number + title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>

                {/* Section number — counts up */}
                <span style={{
                    ...fm, fontSize: 11, letterSpacing: ".2em",
                    color: T.a,
                    fontVariantNumeric: "tabular-nums",
                    fontFeatureSettings: '"tnum"',
                    opacity: triggered ? 1 : 0,
                    transition: "opacity 0.2s ease",
                }}>
                    {displayNum}
                </span>

                {/* Title — cipher scramble */}
                <h2 style={{
                    ...sf,
                    fontSize: "clamp(32px,5vw,56px)",
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    lineHeight: 1,
                    color: T.t,
                    // Gradient only snaps on AFTER scramble finishes (avoids clipping issue mid-scramble)
                    ...(settled && !isMobile ? {
                        backgroundImage: `linear-gradient(135deg,${T.t} 0%,${T.t} 45%,${T.a} 100%)`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    } : {}),
                    opacity: triggered ? 1 : 0,
                    transition: "opacity 0.15s ease",
                    whiteSpace: "nowrap",
                }}>
                    {displayTitle}
                </h2>
            </div>

            {/* Divider line — draws from left */}
            <div style={{
                flex: 1, height: 1, minWidth: 0,
                background: `linear-gradient(90deg,${T.a}60,${T.a2}40,transparent)`,
                transform: lineGo ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.85s 0.08s cubic-bezier(0.16,1,0.3,1)",
                opacity: 0.6,
            }} />
        </div>
    );
}
