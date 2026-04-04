import { useEffect, useRef, useState } from "react";

const BUBBLES = [
    { id: "py", text: "Python", color: "#3776AB", x: 10, y: 10, vx: 2, vy: 1.5, size: 60 },
    { id: "dk", text: "Docker", color: "#2496ED", x: 40, y: 30, vx: -1.5, vy: 2, size: 60 },
    { id: "ml", text: "MLOps", color: "#FF6F00", x: 70, y: 60, vx: 1.2, vy: -1.8, size: 65 },
    { id: "rg", text: "RAG", color: "#00A67E", x: 20, y: 80, vx: -2, vy: -1.5, size: 55 },
    { id: "aw", text: "AWS", color: "#FF9900", x: 80, y: 20, vx: 1.8, vy: 2.2, size: 55 },
    { id: "kf", text: "Kafka", color: "#231F20", x: 50, y: 50, vx: -1.7, vy: 1.7, size: 60 },
];

export default function InteractivePlayground({ T }) {
    const containerRef = useRef(null);
    const [bubbles, setBubbles] = useState(
        BUBBLES.map(b => ({ ...b, x: b.x + Math.random()*10, y: b.y + Math.random()*10 }))
    );

    const dragRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

    useEffect(() => {
        let animationFrame;
        let lastTime = performance.now();

        const update = (time) => {
            const dt = (time - lastTime) / 16;
            lastTime = time;

            if (!containerRef.current) return;
            const bounds = containerRef.current.getBoundingClientRect();

            setBubbles(prev => prev.map(b => {
                if (dragRef.current === b.id) {
                    // Follow mouse if dragging
                    const targetX = ((mouseRef.current.x - bounds.left) / bounds.width) * 100;
                    const targetY = ((mouseRef.current.y - bounds.top) / bounds.height) * 100;
                    return { ...b, x: targetX, y: targetY, vx: mouseRef.current.vx, vy: mouseRef.current.vy };
                }

                let nx = b.x + b.vx * dt * 0.1;
                let ny = b.y + b.vy * dt * 0.1;
                let nvx = b.vx;
                let nvy = b.vy;

                // Bounce off walls (rough percentage-based bounds)
                if (nx < 0 || nx > 95) nvx *= -1;
                if (ny < 0 || ny > 90) nvy *= -1;

                // Simple friction
                nvx *= 0.999;
                nvy *= 0.999;

                // Mouse repel
                const px = (nx / 100) * bounds.width + bounds.left;
                const py = (ny / 100) * bounds.height + bounds.top;
                const dist = Math.hypot(px - mouseRef.current.x, py - mouseRef.current.y);
                
                if (dist < 150) {
                    const angle = Math.atan2(py - mouseRef.current.y, px - mouseRef.current.x);
                    const force = (150 - dist) * 0.05;
                    nvx += Math.cos(angle) * force;
                    nvy += Math.sin(angle) * force;
                }

                // Speed limit
                const speed = Math.hypot(nvx, nvy);
                if (speed > 5) {
                    nvx = (nvx / speed) * 5;
                    nvy = (nvy / speed) * 5;
                }
                if (speed < 0.5) {
                    nvx += (Math.random() - 0.5);
                    nvy += (Math.random() - 0.5);
                }

                return { ...b, x: nx, y: ny, vx: nvx, vy: nvy };
            }));

            animationFrame = requestAnimationFrame(update);
        };

        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    useEffect(() => {
        let lastMx = 0, lastMy = 0;
        const handleMouseMove = (e) => {
            mouseRef.current.vx = (e.clientX - lastMx) * 0.2;
            mouseRef.current.vy = (e.clientY - lastMy) * 0.2;
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
            lastMx = e.clientX;
            lastMy = e.clientY;
        };
        const handleMouseUp = () => { dragRef.current = null; };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {bubbles.map(b => (
                <div
                    key={b.id}
                    onMouseDown={(e) => { e.preventDefault(); dragRef.current = b.id; }}
                    style={{
                        position: "absolute",
                        left: `${b.x}%`, top: `${b.y}%`,
                        width: b.size, height: b.size,
                        borderRadius: "50%",
                        background: T.card,
                        border: `2px solid ${b.color}`,
                        color: T.t,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700,
                        boxShadow: `0 8px 32px ${b.color}40`,
                        cursor: dragRef.current === b.id ? "grabbing" : "grab",
                        pointerEvents: "auto",
                        userSelect: "none",
                        transform: "translate(-50%, -50%)",
                        transition: dragRef.current === b.id ? "transform 0.1s" : "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)"; }}
                >
                    {b.text}
                </div>
            ))}
        </div>
    );
}
