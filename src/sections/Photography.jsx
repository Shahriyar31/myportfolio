import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import SH from "../components/SectionHeading";
import PhotoGallery from "../components/PhotoGallery";
import Mag from "../components/Mag";
import { PhotographyBG } from "../components/SectionBgs";
import { PHOTO_COUNT } from "../data/constants";

const fm = { fontFamily: "'Inter', sans-serif" };
const sp = { padding: "100px clamp(20px,6vw,120px)", width: "100%" };
const BASE_URL = "https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images";
const PHOTOS = Array.from({ length: PHOTO_COUNT }, (_, i) => i + 1);

export default function Photography() {
    const { T } = useTheme();
    const [lightbox, setLightbox] = useState(false);
    const [lbIdx, setLbIdx] = useState(0);

    useEffect(() => {
        if (!lightbox) return;
        const handler = e => {
            if (e.key === "ArrowRight") setLbIdx(i => (i + 1) % PHOTO_COUNT);
            if (e.key === "ArrowLeft") setLbIdx(i => (i - 1 + PHOTO_COUNT) % PHOTO_COUNT);
            if (e.key === "Escape") setLightbox(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [lightbox]);

    const openAt = idx => { setLbIdx(idx); setLightbox(true); };

    return (
        <section id="photography" className="section" style={{ background: "transparent", overflow: "hidden", position: "relative" }}>
            <PhotographyBG T={T} />
            <div className="sec-inner" style={{ ...sp }}>
                <SH n="06" title="Photography" T={T} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
                    <p className="rv" style={{ fontSize: 15, color: T.m, maxWidth: 480, lineHeight: 1.8, fontStyle: "italic", fontFamily: "'Sora', sans-serif", margin: 0 }}>
                        Beyond the code — landscape and street photography from Hamburg and beyond.
                    </p>
                    <div className="rv2" style={{ display: "flex", gap: 16, ...fm, fontSize: 10, color: T.m }}>
                        <span>58 photographs</span><span style={{ color: T.dim }}>·</span><span>Click to open</span>
                    </div>
                </div>
            </div>

            {/* Marquee strip */}
            <div style={{ overflow: "hidden", marginBottom: 32, position: "relative", maskImage: "linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%)", WebkitMaskImage: "linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%)" }}>
                <div
                    id="mq"
                    style={{ display: "flex", gap: 10, width: "max-content", animation: "marqueeScroll 50s linear infinite" }}
                    onMouseEnter={() => document.getElementById("mq").style.animationPlayState = "paused"}
                    onMouseLeave={() => document.getElementById("mq").style.animationPlayState = "running"}>
                    {[...PHOTOS, ...PHOTOS].map((n, i) => (
                        <div key={i} onClick={() => openAt((n - 1) % PHOTO_COUNT)}
                            style={{ width: 220, height: 150, flexShrink: 0, overflow: "hidden", borderRadius: 10, cursor: "none", position: "relative", background: T.card }}>
                            <img src={`${BASE_URL}/photo${n}.jpg`} alt="" loading="lazy"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .5s ease,filter .4s ease", filter: "saturate(.85)" }}
                                onMouseEnter={e => { e.target.style.transform = "scale(1.08)"; e.target.style.filter = "saturate(1.1)"; }}
                                onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.filter = "saturate(.85)"; }}
                                onError={e => { e.target.style.display = "none"; }} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="sec-inner" style={{ ...sp, paddingTop: 0 }}>
                <PhotoGallery T={T} photos={PHOTOS} onOpen={openAt} />
                <div className="rv" style={{ marginTop: 36, textAlign: "center" }}>
                    <Mag as="a" href="https://shahriyar31.github.io/Farhan-Shahriyar.github.io/#photography" target="_blank" rel="noreferrer"
                        style={{ ...fm, fontSize: 10, color: T.a, border: `1px solid ${T.a}`, padding: "12px 28px", textDecoration: "none", letterSpacing: ".12em", textTransform: "uppercase", display: "inline-block", borderRadius: 24, transition: "all .3s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.a; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.a; }}>
                        View All 58 Photos ↗
                    </Mag>
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(0,0,0,.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "none", animation: "fadeUp .2s ease" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ ...fm, fontSize: 10, color: "rgba(255,255,255,.5)", letterSpacing: ".12em" }}>{lbIdx + 1} / {PHOTO_COUNT}</span>
                        <button onClick={() => setLightbox(false)} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "white", cursor: "none", padding: "8px 16px", borderRadius: 20, ...fm, fontSize: 11, letterSpacing: ".08em" }}>✕ CLOSE</button>
                    </div>
                    <img key={lbIdx} src={`${BASE_URL}/photo${lbIdx + 1}.jpg`} alt="" style={{ maxWidth: "80vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 6, animation: "lbEnter .35s cubic-bezier(.16,1,.3,1)" }} />
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "20%", display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 24, cursor: "none" }}
                        onClick={() => setLbIdx(i => (i - 1 + PHOTO_COUNT) % PHOTO_COUNT)}>
                        <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", fontSize: 18, color: "rgba(255,255,255,.7)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}>←</div>
                    </div>
                    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "20%", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 24, cursor: "none" }}
                        onClick={() => setLbIdx(i => (i + 1) % PHOTO_COUNT)}>
                        <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", fontSize: 18, color: "rgba(255,255,255,.7)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}>→</div>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 24px", display: "flex", gap: 8, justifyContent: "center", overflowX: "auto", scrollbarWidth: "none" }}>
                        {PHOTOS.map((_, i) => (
                            <div key={i} onClick={e => { e.stopPropagation(); setLbIdx(i); }}
                                style={{ width: 56, height: 40, flexShrink: 0, borderRadius: 4, overflow: "hidden", border: lbIdx === i ? "2px solid white" : "2px solid rgba(255,255,255,.2)", opacity: lbIdx === i ? 1 : .55, transition: "all .2s", cursor: "none" }}>
                                <img src={`${BASE_URL}/photo${i + 1}.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
