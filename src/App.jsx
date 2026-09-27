import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import "./styles/global.css";
import { Preloader, TopBar, Rail, Menu, CvModal } from "./site/Chrome";
import { ChatDock, AgentSection } from "./site/Chat";
import Journey from "./site/Journey";
import Hero from "./site/Hero";
import Work from "./site/Work";
import Education from "./site/Education";
import Built from "./site/Built";
import Toolkit from "./site/Toolkit";
import Lens from "./site/Lens";
import Hello from "./site/Hello";
import { reducedMotion } from "./site/hooks";

export default function App() {
    const [ready, setReady] = useState(false);
    const [cvOpen, setCvOpen] = useState(false);
    const [menu, setMenu] = useState(false);
    const reveal = useCallback(() => setReady(true), []);
    const openCv = useCallback(() => setCvOpen(true), []);
    const closeCv = useCallback(() => setCvOpen(false), []);

    // Smooth scrolling (skipped for reduced-motion users)
    useEffect(() => {
        if (reducedMotion()) return;
        const lenis = new Lenis({ lerp: 0.1 });
        window.__lenis = lenis;
        let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
        return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = undefined; };
    }, []);

    useEffect(() => {
        if (ready) { window.__lenis?.start(); document.body.classList.remove("is-locked"); }
        else { window.__lenis?.stop(); document.body.classList.add("is-locked"); }
    }, [ready]);

    return (
        <>
            <a href="#agent" className="sr-only">Skip to content</a>
            <Preloader onReveal={reveal} />
            <TopBar onOpenCv={openCv} onMenu={() => setMenu(m => !m)} menu={menu} />
            <Rail />
            <Menu open={menu} onClose={() => setMenu(false)} onOpenCv={openCv} />
            <main>
                <Hero ready={ready} onOpenCv={openCv} />
                <AgentSection />
                <Journey />
                <Work />
                <Education />
                <Built />
                <Toolkit />
                <Lens />
                <Hello onOpenCv={openCv} />
            </main>
            <ChatDock />
            <CvModal open={cvOpen} onClose={closeCv} />
        </>
    );
}
