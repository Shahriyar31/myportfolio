import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";

const fm = { fontFamily: "'Inter', sans-serif" };
const sf = { fontFamily: "'Sora', sans-serif" };

export default function SH({ n, title, T }) {
    const headingRef = useRef(null);
    const lineRef = useRef(null);
    const [vis, setVis] = useState(false);
    const animStarted = useRef(false);

    useEffect(() => {
        const el = headingRef.current;
        if (!el) return;

        // --- Build clipped char spans manually (mimics splitText with clip wrap) ---
        el.innerHTML = "";
        const chars = [];

        title.split("").forEach((char) => {
            // Outer clip wrapper — overflow:hidden clips the sliding character
            const clip = document.createElement("span");
            clip.style.cssText =
                "display:inline-block; overflow:hidden; vertical-align:bottom; line-height:1.1;";

            // Inner character span — this is what will be animated
            const inner = document.createElement("span");
            inner.style.cssText =
                "display:inline-block; transform:translateY(110%);";
            inner.textContent = char === " " ? "\u00a0" : char;

            clip.appendChild(inner);
            el.appendChild(clip);
            chars.push(inner);
        });

        // --- Wait for section to be in view, then trigger ---
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !animStarted.current) {
                    animStarted.current = true;
                    observer.disconnect();
                    setVis(true);
                    runAnimation(chars);
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
        observer.observe(el);

        // Fallback for sticky sections
        const t = setTimeout(() => {
            if (!animStarted.current) {
                animStarted.current = true;
                setVis(true);
                runAnimation(chars);
            }
        }, 800);

        return () => {
            observer.disconnect();
            clearTimeout(t);
        };
    }, [title]);

    // Animate line on vis
    useEffect(() => {
        if (!vis || !lineRef.current) return;
        lineRef.current.style.transform = "scaleX(1)";
    }, [vis]);

    return (
        <div style={{ marginBottom: 64, display: "flex", alignItems: "center", gap: 20, overflow: "visible" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <span style={{ ...fm, fontSize: 11, letterSpacing: ".2em", color: T.a }}>{n}</span>

                {/* AnimeJS will inject clipped char spans here */}
                <h2
                    ref={headingRef}
                    style={{
                        ...sf,
                        fontSize: "clamp(32px,5vw,56px)",
                        fontWeight: 700,
                        letterSpacing: "-.02em",
                        lineHeight: 1,
                        margin: 0,
                        display: "flex",
                        flexWrap: "wrap",
                        // Gradient shimmer on the heading container
                        backgroundImage: `linear-gradient(120deg, ${T.t} 0%, ${T.a} 45%, ${T.a2} 75%, ${T.t} 100%)`,
                        backgroundSize: "300% auto",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animation: "sh-shimmer 5s linear infinite",
                    }}
                />
            </div>

            {/* Reveal line */}
            <div
                ref={lineRef}
                style={{
                    flex: 1, height: 1, minWidth: 0,
                    background: `linear-gradient(90deg, ${T.a}70, ${T.a2}50, transparent)`,
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.9s 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                    opacity: 0.7,
                }}
            />

            <style>{`
                @keyframes sh-shimmer {
                    0%   { background-position: 0%   center; }
                    50%  { background-position: 100% center; }
                    100% { background-position: 200% center; }
                }
            `}</style>
        </div>
    );
}

/* ─── Core animation: clip-reveal up, hold, exit up, then loop ─────── */
function runAnimation(chars) {
    animate(chars, {
        y: [
            // Slide in from below
            { to: "0%",    duration: 700, ease: "out(3)" },
            // Hold briefly, then exit upward
            { to: "-110%", delay: 900, duration: 600, ease: "in(3)" },
        ],
        delay: stagger(45),
        loop: true,
        // After exit, silently reset for next loop
        loopBegin() {
            // nothing needed — animeJS handles reset internally for loop
        },
    });
}