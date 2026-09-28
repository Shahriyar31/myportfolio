import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import "./styles/global.css";
import { Preloader, TopBar, Rail, Menu, CvModal } from "./site/Chrome";
import { ChatDock, AgentSection } from "./site/Chat";
import DataJourney from "./site/DataJourney";
import BuildIt from "./site/BuildIt";
import KeepLegal from "./site/KeepLegal";
import ShipSafe from "./site/ShipSafe";
import Verdict from "./site/Verdict";
import World from "./site/World";
import Journey from "./site/Journey";
import Work from "./site/Work";
import Skills from "./site/Skills";
import Built from "./site/Built";
import Lens from "./site/Lens";
import Hello from "./site/Hello";
import { reducedMotion } from "./site/hooks";
import Stop from "./site/Stop";
import { openChat, ask } from "./site/chat";
import QuickRead from "./site/QuickRead";

export default function App() {
    const [ready, setReady] = useState(false);
    const [cvOpen, setCvOpen] = useState(false), [quick, setQuick] = useState(false);
    const openQuick = useCallback(() => setQuick(true), []), closeQuick = useCallback(() => setQuick(false), []);
    const [menu, setMenu] = useState(false);
    const reveal = useCallback(() => setReady(true), []);
    const openCv = useCallback(() => setCvOpen(true), []);
    const closeCv = useCallback(() => setCvOpen(false), []);

    useEffect(() => { window.addEventListener("quick-read", openQuick); return () => window.removeEventListener("quick-read", openQuick); }, [openQuick]);

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
            <a href="#work" className="sr-only">Skip to content</a>
            <World />
            <Preloader onReveal={reveal} />
            <TopBar onOpenCv={openCv} onQuick={openQuick} onMenu={() => setMenu(m => !m)} menu={menu} />
            <Rail />
            <Menu open={menu} onClose={() => setMenu(false)} onOpenCv={openCv} onQuick={openQuick} />
            <main>
                <DataJourney ready={ready} onOpenCv={openCv} />
                <BuildIt />
                <KeepLegal />
                <ShipSafe />
                <Verdict onOpenCv={openCv} />
                <Work />
                <Built />
                <Journey />
                <Skills />
                <Stop id="desk" station="chat" side="left">
                    <div className="pane-kicker"><span className="chip mono is-live"><span className="dot-live" />Online</span><span className="pane-where mono">📍 My desk</span></div>
                    <h3 className="pane-title">This is where I build</h3>
                    <p className="pane-lede">Most days: an AI agent in one window, a data pipeline in the other. I built an AI that answers questions about my work — ask it anything.</p>
                    <div className="hx-picks" style={{ justifyContent: "flex-start" }}>
                        {["What does Farhan do?", "Is he open to work?"].map(q => <button key={q} className="key key-sm" onClick={() => { openChat(true); ask(q); }}>{q}</button>)}
                    </div>
                </Stop>
                <AgentSection />
                <Lens />
                <Hello onOpenCv={openCv} />
            </main>
            <ChatDock />
            <CvModal open={cvOpen} onClose={closeCv} />
            <QuickRead open={quick} onClose={closeQuick} onOpenCv={openCv} />
        </>
    );
}
