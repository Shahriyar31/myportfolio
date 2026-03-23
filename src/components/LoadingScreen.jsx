import { useEffect, useRef } from "react";

export default function LoadingScreen({ onDone }) {
    const rootRef = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const root = rootRef.current;
        if (!root) return;

        const accent = "#7eb8be";
        const accent2 = "#8890aa";

        // Inject keyframes
        const style = document.createElement("style");
        style.textContent = `
            @keyframes ls-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
            @keyframes ls-pulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
            @keyframes ls-scanline { 0%{top:-10%} 100%{top:110%} }
            @keyframes ls-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        `;
        document.head.appendChild(style);

        root.style.cssText = `
            position:fixed;inset:0;z-index:99999;
            background:#060a0b;
            display:flex;align-items:center;justify-content:center;
            overflow:hidden;
            transition:opacity 0.4s ease;
        `;

        // Ambient glow blobs — CSS only, GPU composited
        [
            { color: accent, x: "30%", y: "40%", size: "50vw" },
            { color: accent2, x: "70%", y: "60%", size: "40vw" },
        ].forEach(({ color, x, y, size }) => {
            const blob = document.createElement("div");
            blob.style.cssText = `
                position:absolute;
                left:${x};top:${y};
                width:${size};height:${size};
                transform:translate(-50%,-50%);
                border-radius:50%;
                background: none;
                animation:ls-pulse ${3 + Math.random()}s ease-in-out infinite;
                pointer-events:none;
                will-change:transform,opacity;
            `;
            root.appendChild(blob);
        });

        // Horizontal lines (CRT feel, CSS only)
        const lines = document.createElement("div");
        lines.style.cssText = `
            position:absolute;inset:0;pointer-events:none;
            background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px);
        `;
        root.appendChild(lines);

        // Moving scan line — single div, GPU transform
        const scan = document.createElement("div");
        scan.style.cssText = `
            position:absolute;left:0;right:0;height:60px;pointer-events:none;
            background:linear-gradient(to bottom,transparent,${accent}08,transparent);
            animation:ls-scanline 2s linear infinite;
            will-change:top;
        `;
        root.appendChild(scan);

        // Corner brackets
        [
            "top:20px;left:20px;border-top:1px solid;border-left:1px solid;",
            "top:20px;right:20px;border-top:1px solid;border-right:1px solid;",
            "bottom:20px;left:20px;border-bottom:1px solid;border-left:1px solid;",
            "bottom:20px;right:20px;border-bottom:1px solid;border-right:1px solid;",
        ].forEach(pos => {
            const b = document.createElement("div");
            b.style.cssText = `position:absolute;width:18px;height:18px;${pos}border-color:${accent}50;pointer-events:none;`;
            root.appendChild(b);
        });

        // Name
        const nameWrap = document.createElement("div");
        nameWrap.style.cssText = `
            position:relative;z-index:10;
            display:flex;flex-direction:column;align-items:center;gap:10px;
            opacity:0;animation:ls-fadein 0.5s 0.3s ease forwards;
        `;
        nameWrap.innerHTML = `
            <div style="
                font-family:'Playfair Display',Georgia,serif;
                font-size:clamp(32px,5vw,64px);
                font-weight:800;
                letter-spacing:-.02em;
                line-height:1;
                background:linear-gradient(135deg,${accent} 0%,#fff 50%,${accent} 100%);
                background-size:200% auto;
                -webkit-background-clip:text;
                -webkit-text-fill-color:transparent;
                background-clip:text;
                animation:ls-shimmer 2s linear infinite;
                will-change:background-position;
            ">Farhan Shahriyar</div>
            <div style="
                font-family:'Inter', sans-serif;
                font-size:10px;
                color:rgba(255,255,255,0.35);
                letter-spacing:.22em;
                text-transform:uppercase;
                margin-top:2px;
            ">AI & Data Engineer · Hamburg 🇩🇪</div>
        `;
        root.appendChild(nameWrap);

        // Fade out after 1.8s
        setTimeout(() => {
            root.style.opacity = "0";
            root.style.pointerEvents = "none";
            setTimeout(() => {
                style.remove();
                if (onDone) onDone();
            }, 400);
        }, 1200);

    }, []);

    return <div ref={rootRef} />;
}