import { useState, useEffect, useRef } from "react";

export default function PhotoGallery({ T, photos, onOpen }) {
    const [visible, setVisible] = useState({});
    const refs = useRef([]);

    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const idx = parseInt(e.target.dataset.idx);
                    setTimeout(() => setVisible(v => ({ ...v, [idx]: true })), idx * 55);
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: .08 });
        refs.current.forEach(r => r && obs.observe(r));
        return () => obs.disconnect();
    }, []);

    const heights = [220, 280, 200, 260, 240, 200, 300, 220, 260, 200, 280, 240, 200, 260, 300, 220, 240, 200, 280, 260];

    return (
        <div style={{ columns: "5 clamp(160px,18vw,280px)", columnGap: 12, lineHeight: 0, width: "100%" }}>
            {photos.map((n, i) => (
                <div key={n} ref={el => refs.current[i] = el} data-idx={i}
                    onClick={() => onOpen(i)}
                    style={{
                        breakInside: "avoid", marginBottom: 10, overflow: "hidden", borderRadius: 10,
                        height: heights[i] || 220, position: "relative", cursor: "none", display: "block",
                        opacity: visible[i] ? 1 : 0,
                        transform: visible[i] ? "translateY(0) scale(1)" : "translateY(30px) scale(.96)",
                        transition: "opacity .6s ease,transform .6s ease",
                    }}>
                    <img src={`https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/photo${n}.jpg`}
                        alt="" loading="lazy"
                        style={{
                            width: "100%", height: "100%", objectFit: "cover", display: "block",
                            transition: "transform .6s ease,filter .4s ease",
                            filter: "saturate(.88) brightness(.96)"
                        }}
                        onMouseEnter={e => { e.target.style.transform = "scale(1.07)"; e.target.style.filter = "saturate(1.1) brightness(1.02)"; }}
                        onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.filter = "saturate(.88) brightness(.96)"; }}
                        onError={e => { e.target.parentElement.style.background = T.card; e.target.style.display = "none"; }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 50%)", opacity: 0, transition: "opacity .35s", borderRadius: 10, display: "flex", alignItems: "flex-end", padding: "12px 14px" }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = 0; }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,.85)", letterSpacing: ".12em", textTransform: "uppercase" }}>Open ↗</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
