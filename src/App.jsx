import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import "./styles/global.css";
import { Preloader, Nav, Cursor } from "./site/Chrome";
import Hero from "./site/Hero";
import About from "./site/About";
import Experience from "./site/Experience";
import Work from "./site/Work";
import { Capabilities, Education } from "./site/Capabilities";
import Photos from "./site/Photos";
import Contact from "./site/Contact";
import { Chat, CvModal } from "./site/Overlays";
import { reducedMotion } from "./site/hooks";

export default function App() {
    const [ready, setReady] = useState(false);
    const [cvOpen, setCvOpen] = useState(false);
    const reveal = useCallback(() => setReady(true), []);
    const openCv = useCallback(() => setCvOpen(true), []);
    const closeCv = useCallback(() => setCvOpen(false), []);

    // Smooth scrolling (skipped for reduced-motion users)
    useEffect(() => {
        if (reducedMotion()) return;
        const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
        window.__lenis = lenis;
        let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
        return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = undefined; };
    }, []);

    // Hold the page still until the preloader lifts
    useEffect(() => {
        if (ready) { window.__lenis?.start(); document.body.classList.remove("is-locked"); }
        else { window.__lenis?.stop(); document.body.classList.add("is-locked"); }
    }, [ready]);

    return (
        <>
            <a href="#about" className="sr-only">Skip to content</a>
            <Preloader onReveal={reveal} />
            <Cursor />
            <Nav onOpenCv={openCv} />
            <main>
                <Hero ready={ready} onOpenCv={openCv} />
                <About />
                <Experience />
                <Work />
                <Capabilities />
                <Education />
                <Photos />
            </main>
            <Contact onOpenCv={openCv} />
            <Chat />
            <CvModal open={cvOpen} onClose={closeCv} />
        </>
    );
}
