import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import "./styles/global.css";
import "./planet/planet.css";
import { Preloader, TopBar, Rail, Menu, CvModal } from "./site/Chrome";
import { ChatDock } from "./site/Chat";
import QuickRead from "./site/QuickRead";
import Planet from "./planet/Planet";
import { Hero, What, Break, Experience, Projects, Journey, Skills, Photos, Contact } from "./planet/Chapters";
import { reducedMotion, lockScroll, unlockScroll } from "./site/hooks";

/*
 * Farhan's tiny planet. One small world behind the page; a little 3D me walks around it as you scroll.
 * Chapters, in walking order: meet me → what I do → break my AI → Nordex → projects →
 * West Bengal → flight → Hamburg → skills → photography → my desk.
 */
export default function App() {
    const [ready, setReady] = useState(false);
    const [cvOpen, setCvOpen] = useState(false), [quick, setQuick] = useState(false), [menu, setMenu] = useState(false);
    const reveal = useCallback(() => setReady(true), []);
    const openCv = useCallback(() => setCvOpen(true), []), closeCv = useCallback(() => setCvOpen(false), []);
    const openQuick = useCallback(() => setQuick(true), []), closeQuick = useCallback(() => setQuick(false), []);

    useEffect(() => { addEventListener("quick-read", openQuick); return () => removeEventListener("quick-read", openQuick); }, [openQuick]);
    // smooth scrolling (skipped for reduced-motion users)
    useEffect(() => {
        if (reducedMotion()) return;
        const lenis = new Lenis({ lerp: 0.1 }); window.__lenis = lenis;
        let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
        return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = undefined; };
    }, []);
    useEffect(() => { if (ready) return; lockScroll(); return unlockScroll; }, [ready]);
    // cards lean towards the pointer
    useEffect(() => {
        if (reducedMotion() || matchMedia("(pointer: coarse)").matches) return;
        let last = null;
        const move = e => {
            const c = e.target.closest?.(".pl-card");
            if (last && last !== c) { last.style.removeProperty("--rx"); last.style.removeProperty("--ry"); }
            last = c; if (!c) return;
            const r = c.getBoundingClientRect(); c.style.setProperty("--rx", `${((0.5 - (e.clientY - r.top) / r.height) * 4).toFixed(2)}deg`); c.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2)}deg`);
            c.style.setProperty("--mx", `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`); c.style.setProperty("--my", `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
        };
        addEventListener("pointermove", move, { passive: true }); return () => removeEventListener("pointermove", move);
    }, []);

    return (
        <>
            <a href="#what" className="sr-only">Skip to content</a>
            <Planet />
            <Preloader onReveal={reveal} />
            <TopBar onOpenCv={openCv} onQuick={openQuick} onMenu={() => setMenu(m => !m)} menu={menu} />
            <Rail />
            <Menu open={menu} onClose={() => setMenu(false)} onOpenCv={openCv} onQuick={openQuick} />
            <main className="pl-main">
                <Hero ready={ready} onQuick={openQuick} onCv={openCv} />
                <What />
                <Break />
                <Experience />
                <Projects />
                <Journey />
                <Skills />
                <Photos />
                <Contact onCv={openCv} onQuick={openQuick} />
            </main>
            <ChatDock />
            <CvModal open={cvOpen} onClose={closeCv} />
            <QuickRead open={quick} onClose={closeQuick} onOpenCv={openCv} />
        </>
    );
}
