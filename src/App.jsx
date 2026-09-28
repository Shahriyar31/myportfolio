import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import "./styles/global.css";
import { Preloader, TopBar, Menu, CvModal } from "./site/Chrome";
import { ChatDock } from "./site/Chat";
import Hero from "./site/Hero";
import Challenge from "./site/Challenge";
import WhatIDo from "./site/WhatIDo";
import Experience from "./site/Experience";
import Projects from "./site/Projects";
import Story from "./site/Story";
import Finale from "./site/Finale";
import QuickRead from "./site/QuickRead";
import GlassStage from "./site/GlassStage";
import { reducedMotion } from "./site/hooks";

/*
 * One story, six short chapters:
 * claim (hero) → challenge (break my AI) → what I do (+ demos) → experience → work → the person → your verdict.
 */
export default function App() {
    const [ready, setReady] = useState(false);
    const [cvOpen, setCvOpen] = useState(false), [quick, setQuick] = useState(false), [menu, setMenu] = useState(false);
    const reveal = useCallback(() => setReady(true), []);
    const openCv = useCallback(() => setCvOpen(true), []), closeCv = useCallback(() => setCvOpen(false), []);
    const openQuick = useCallback(() => setQuick(true), []), closeQuick = useCallback(() => setQuick(false), []);

    useEffect(() => { window.addEventListener("quick-read", openQuick); return () => window.removeEventListener("quick-read", openQuick); }, [openQuick]);

    // Smooth scrolling (skipped for reduced-motion users)
    useEffect(() => {
        if (reducedMotion()) return;
        const lenis = new Lenis({ lerp: 0.12 });
        window.__lenis = lenis;
        let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
        return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = undefined; };
    }, []);
    useEffect(() => {
        if (ready) { window.__lenis?.start(); document.body.classList.remove("is-locked"); }
        else { window.__lenis?.stop(); document.body.classList.add("is-locked"); }
    }, [ready]);

    // a hairline that shows how far through the story you are
    useEffect(() => {
        const bar = document.querySelector(".v-progress i");
        const on = () => { const h = document.documentElement.scrollHeight - innerHeight; if (bar) bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
        window.addEventListener("scroll", on, { passive: true }); on();
        return () => window.removeEventListener("scroll", on);
    }, []);

    return (
        <>
            <a href="#challenge" className="sr-only">Skip to content</a>
            <div className="v-bg" aria-hidden="true" />
            <div className="v-progress" aria-hidden="true"><i /></div>
            <GlassStage />
            <Preloader onReveal={reveal} />
            <TopBar onOpenCv={openCv} onQuick={openQuick} onMenu={() => setMenu(m => !m)} menu={menu} />
            <Menu open={menu} onClose={() => setMenu(false)} onOpenCv={openCv} onQuick={openQuick} />
            <main>
                <Hero ready={ready} onQuick={openQuick} />
                <Challenge />
                <WhatIDo />
                <Experience />
                <Projects />
                <Story />
                <Finale onOpenCv={openCv} onQuick={openQuick} />
            </main>
            <ChatDock />
            <CvModal open={cvOpen} onClose={closeCv} />
            <QuickRead open={quick} onClose={closeQuick} onOpenCv={openCv} />
        </>
    );
}
