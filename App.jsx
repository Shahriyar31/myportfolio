import { useState, useEffect, useCallback } from "react";
import "./styles/global.js";
import { PROJECTS, SKILLS, DARK, LIGHT } from "./data/constants";

import Cursor from "./components/Cursor";
import NeuralCanvas from "./components/NeuralCanvas";
import GlitchName from "./components/GlitchName";
import AboutCanvas from "./components/AboutCanvas";
import ProfileCard from "./components/ProfileCard";
import InterestCards from "./components/InterestCards";
import StackPills from "./components/StackPills";
import HeroProfile from "./components/HeroProfile";
import TypingRole from "./components/TypingRole";
import Mag from "./components/Mag";
import SideNav from "./components/SideNav";
import SH from "./components/SectionHeading";
import PCard from "./components/ProjectCard";
import SPill from "./components/SkillPill";
import PhotoGallery from "./components/PhotoGallery";
import SkillsCanvas from "./components/SkillsCanvas";
import SkillRadar from "./components/SkillRadar";
import SkillCategoryCard from "./components/SkillCategoryCard";
import CyclingFact from "./components/CyclingFact";
import JourneyTimeline from "./components/JourneyTimeline";
import HeroChat from "./components/HeroChat";
import ChatFloat from "./components/ChatFloat";
import EduScrollBook from "./components/EduScrollBook";
import { AboutBG, ExperienceBG, ProjectsBG, EducationBG, SkillsBG, ContactBG, PhotographyBG } from "./components/SectionBgs";

function useReveal() {
    useEffect(() => {
        const go = () => document.querySelectorAll(".rv,.rv2,.rv3").forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight * .9) el.classList.add("vi"); });
        go(); window.addEventListener("scroll", go, { passive: true });
        return () => window.removeEventListener("scroll", go);
    }, []);
}

export default function App() {
    const [dark, setDark] = useState(true); const [active, setActive] = useState("home");
    const [lightbox, setLightbox] = useState(false); const [lbIdx, setLbIdx] = useState(0);
    const T = dark ? DARK : LIGHT;
    useReveal();

    useEffect(() => {
        const r = document.documentElement;
        r.style.setProperty("--ca", T.a); r.style.setProperty("--ca2", T.a2); r.style.setProperty("--ct", T.t);
        r.style.setProperty("--cm", T.m); r.style.setProperty("--cbg", T.bg); r.style.setProperty("--cbr", T.border);
        document.body.style.background = T.bg; document.body.style.color = T.t;
    }, [T]);

    useEffect(() => {
        const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { threshold: .35 });
        document.querySelectorAll(".section").forEach(s => obs.observe(s));
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!lightbox) return;
        const handler = e => {
            if (e.key === "ArrowRight") setLbIdx(i => (i + 1) % 20);
            if (e.key === "ArrowLeft") setLbIdx(i => (i - 1 + 20) % 20);
            if (e.key === "Escape") setLightbox(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [lightbox]);

    const scrollTo = useCallback((id, e) => { e?.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }, []);
    const fm = { fontFamily: "'JetBrains Mono',monospace" };
    const sf = { fontFamily: "'Playfair Display',serif" };
    const sp = { padding: "100px clamp(20px,6vw,120px)", width: "100%" };

    return (
        <div style={{ background: "transparent" }}>
            <Cursor />
            <SideNav active={active} T={T} />

            {/* NAV */}
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.nav, backdropFilter: "blur(24px)", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ ...fm, fontSize: 14, color: T.a, fontWeight: 700, letterSpacing: ".1em" }}>FS<span style={{ color: T.m }}>.</span>dev</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {[["about", "About"], ["experience", "Exp"], ["projects", "Projects"], ["skills", "Skills"], ["contact", "Contact"]].map(([id, label]) => (
                        <a key={id} href={`#${id}`} onClick={e => scrollTo(id, e)}
                            className={`nav-link${active === id ? " active-link" : ""}`}
                            style={{ color: active === id ? "#fff" : T.m, "--ca": T.a, "--ca2": T.a2 }}>
                            {label}
                        </a>
                    ))}
                    <Mag as="a" href="https://shahriyar31.github.io/Farhan-Shahriyar.github.io/Farhan_Shahriyar_Resume.pdf" target="_blank" rel="noreferrer"
                        style={{ ...fm, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", color: T.bg, background: T.a, padding: "9px 22px", borderRadius: 24, fontWeight: 700, transition: "opacity .2s" }}>
                        Download CV
                    </Mag>
                    <Mag as="button" onClick={() => setDark(d => !d)}
                        style={{ width: 38, height: 38, borderRadius: "50%", background: dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all .2s" }}>
                        {dark ? "☀" : "🌙"}
                    </Mag>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section id="home" className="section hero-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "96px 24px 40px", position: "relative", overflow: "hidden" }}>
                <NeuralCanvas T={T} />
                <div style={{ position: "absolute", top: "10%", right: "15%", width: 600, height: 600, borderRadius: "50%", background: dark ? "rgba(0,212,255,.04)" : "rgba(91,33,182,.04)", filter: "blur(100px)", pointerEvents: "none", animation: "pulse 7s ease-in-out infinite" }} />
                <div style={{ position: "absolute", bottom: "15%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: dark ? "rgba(73,77,95,.04)" : "rgba(9,124,135,.03)", filter: "blur(80px)", pointerEvents: "none", animation: "pulse 8s 2s ease-in-out infinite" }} />

                <div className="hero-cols" style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", gap: 48, alignItems: "flex-start", justifyContent: "center", flex: 1, paddingBottom: 32 }}>
                    {/* Profile */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, flexShrink: 0, animation: "fadeUp .8s .1s both" }}>
                        <HeroProfile T={T} dark={dark} />
                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                            {[
                                { label: "GitHub", href: "https://github.com/Shahriyar31", c: "#58a6ff", svg: <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></> },
                                { label: "LinkedIn", href: "https://www.linkedin.com/in/farhanshahriyar", c: "#0a66c2", svg: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></> },
                                { label: "Email", href: "mailto:shahriyarfarhan3101@gmail.com", c: "#ea4335", svg: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></> },
                            ].map(({ label, href, c, svg }) => (
                                <Mag key={label} as="a" href={href} target="_blank" rel="noreferrer"
                                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "12px 18px", border: `1px solid ${T.border}`, background: dark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.6)", textDecoration: "none", transition: "all .22s", borderRadius: 16, cursor: "none", minWidth: 72, backdropFilter: "blur(8px)" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.background = `${c}1a`; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${c}40`; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = dark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.6)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{svg}</svg>
                                    <span style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".06em" }}>{label}</span>
                                </Mag>
                            ))}
                        </div>
                    </div>

                    {/* Text content */}
                    <div style={{ flex: "1 1 300px", maxWidth: 600 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, ...fm, fontSize: 10, color: T.a, letterSpacing: ".14em", textTransform: "uppercase", padding: "6px 16px", border: `1px solid ${T.a}30`, background: `${T.a}08`, borderRadius: 24, animation: "fadeUp .7s .15s both" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.a3, boxShadow: `0 0 8px ${T.a3}`, animation: "blink 2s ease-in-out infinite" }} />
                            Available · Hamburg, Germany
                        </div>
                        <h1 className="hero-name" style={{ ...sf, fontSize: "clamp(44px,7vw,90px)", fontWeight: 700, lineHeight: .92, letterSpacing: "-.02em", marginBottom: 20, animation: "fadeUp .8s .28s both" }}>
                            Farhan<br />
                            <GlitchName text="SHAHRIYAR" T={T} />
                        </h1>
                        <div style={{ ...fm, fontSize: "clamp(12px,1.5vw,16px)", color: T.m, marginBottom: 16, minHeight: "1.7rem", animation: "fadeUp .8s .42s both" }}>
                            <TypingRole T={T} />
                        </div>
                        <div className="hero-chips" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, animation: "fadeUp .8s .52s both" }}>
                            {[["AI & Data Engineer", T.a], ["MLOps Practitioner", T.a2], ["RAG Systems Builder", T.a3], ["MSc @ TUHH", "#f59e0b"]].map(([r, c]) => (
                                <span key={r} style={{ ...fm, fontSize: 10, letterSpacing: ".08em", padding: "5px 14px", border: `1px solid ${c}50`, color: c, background: `${c}0e`, borderRadius: 20, whiteSpace: "nowrap" }}>{r}</span>
                            ))}
                        </div>
                        <p style={{ fontSize: 14, color: T.m, lineHeight: 1.9, maxWidth: 480, marginBottom: 24, animation: "fadeUp .8s .62s both" }}>
                            MSc Data Science at TUHH, building production AI systems at Nordex SE — RAG pipelines, LLM evaluation, and real-time data engineering.
                        </p>
                        <div className="hero-stats" style={{ display: "flex", gap: 36, marginBottom: 28, animation: "fadeUp .8s .74s both" }}>
                            {[["1,690", "+", "Docs ingested"], ["97", ".51%", "ML accuracy"], ["11", "×", "Cost reduction"]].map(([n, s, l]) => (
                                <div key={l}>
                                    <div style={{ ...sf, fontSize: "clamp(20px,2.8vw,28px)", fontWeight: 700, lineHeight: 1, color: T.t }}>{n}<span style={{ color: T.a2 }}>{s}</span></div>
                                    <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 4 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="hero-cta" style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp .8s .86s both" }}>
                            <Mag as="a" href="#projects" onClick={e => scrollTo("projects", e)}
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.a, color: "white", padding: "12px 28px", ...fm, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", fontWeight: 700, borderRadius: 26, transition: "opacity .2s" }}>
                                View Projects →
                            </Mag>
                            <Mag as="a" href="https://shahriyar31.github.io/Farhan-Shahriyar.github.io/Farhan_Shahriyar_Resume.pdf" target="_blank" rel="noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: T.t, padding: "12px 28px", ...fm, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", border: `1px solid ${T.border}`, borderRadius: 26, transition: "border-color .2s" }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = T.a} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                                Download CV
                            </Mag>
                        </div>
                    </div>
                </div>

                <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
                    <h3 style={{ ...sf, fontSize: "clamp(16px,2vw,22px)", fontWeight: 700, color: T.t, marginBottom: 4, textAlign: "center" }}>
                        Query my portfolio <span style={{ color: T.a, animation: "blink 2s ease-in-out infinite", display: "inline-block" }}>✦</span>
                    </h3>
                    <p style={{ ...fm, fontSize: 10, color: T.m, marginBottom: 16, textAlign: "center", letterSpacing: ".06em" }}>Ask about my projects, skills, or experience</p>
                    <HeroChat T={T} />
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section id="about" className="section" style={{ background: "transparent", overflow: "hidden", position: "relative" }}>
                <AboutCanvas T={T} />
                <div className="sec-inner" style={{ ...sp, position: "relative", zIndex: 1 }}>
                    <SH n="01" title="About" T={T} />
                    <div className="about-grid rv" style={{ marginBottom: 56 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <ProfileCard T={T} dark={dark} />
                            <InterestCards T={T} dark={dark} />
                        </div>
                        <div>
                            <p className="rv" style={{ ...sf, fontSize: "clamp(22px,3vw,36px)", fontWeight: 700, lineHeight: 1.25, color: T.t, marginBottom: 24, letterSpacing: "-.01em" }}>
                                I build <span style={{ color: T.a2 }}>AI systems</span> that<br />
                                <span style={{ color: T.a, fontStyle: "italic", position: "relative", display: "inline-block" }}>
                                    actually work
                                    <span style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${T.a},${T.a2})`, borderRadius: 1, opacity: .6 }} />
                                </span><br />
                                in <span style={{ color: T.a3 }}>production</span>.
                            </p>
                            <p className="rv2" style={{ fontSize: 14, color: T.m, lineHeight: 1.9, marginBottom: 28 }}>
                                MSc Data Science at <span style={{ color: T.t, fontWeight: 500 }}>TUHH</span>. Currently at{" "}
                                <span style={{ color: T.a, fontWeight: 500 }}>Nordex SE</span> building a production{" "}
                                <span style={{ color: T.a2, fontWeight: 500, borderBottom: `1px dashed ${T.a2}40`, paddingBottom: 1 }}>RAG pipeline</span> over{" "}
                                <span style={{ color: T.t, fontWeight: 600 }}>1,690 documents</span>, a custom{" "}
                                <span style={{ color: T.a3, fontWeight: 500, borderBottom: `1px dashed ${T.a3}40`, paddingBottom: 1 }}>LLM evaluation</span> framework, and a{" "}
                                <span style={{ color: T.t, fontWeight: 500 }}>Streamlit-based AI assistant</span>. I moved from West Bengal, India to Hamburg in 2023 — and I'm not done building things yet.
                            </p>
                            <div className="rv2" style={{ marginBottom: 28 }}>
                                <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.a3, animation: "pulse 3s ease-in-out infinite", display: "inline-block" }} />
                                    Random fact about me
                                </div>
                                <CyclingFact T={T} />
                            </div>
                            <div className="rv3">
                                <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 14, height: 1, background: `linear-gradient(90deg,${T.a},${T.a2})`, display: "inline-block" }} />
                                    Current stack
                                </div>
                                <StackPills T={T} dark={dark} />
                            </div>
                        </div>
                    </div>
                    <div className="rv2">
                        <div style={{ ...fm, fontSize: 9, color: T.a, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 20, height: 1, background: T.a, display: "inline-block" }} />My Journey
                        </div>
                        <JourneyTimeline T={T} />
                    </div>
                </div>
            </section>

            {/* ── EXPERIENCE ── */}
            <section id="experience" className="section" style={{ background: "transparent", position: "relative" }}>
                <ExperienceBG T={T} />
                <div className="sec-inner" style={{ ...sp }}>
                    <SH n="02" title="Experience" T={T} />
                    <div className="rv" style={{ position: "relative", padding: 40, borderRadius: 20, background: T.card, backdropFilter: "blur(16px)", border: `1px solid ${T.border}`, overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(to bottom,${T.a},${T.a2})`, borderRadius: "0 2px 2px 0" }} />
                        {["🤖", "☁️", "🗄️"].map((ic, i) => <div key={i} style={{ position: "absolute", fontSize: 72, opacity: .04, animation: `float ${18 + i * 5}s ease-in-out infinite`, animationDelay: `${-i * 6}s`, top: `${12 + i * 32}%`, left: `${60 + i * 12}%`, pointerEvents: "none" }}>{ic}</div>)}
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                <span style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: ".1em" }}>Aug 2025 → Present</span>
                                <span style={{ ...fm, fontSize: 9, color: T.a3, border: `1px solid ${T.a3}40`, padding: "2px 10px", borderRadius: 10, background: `${T.a3}10` }}>● CURRENT</span>
                            </div>
                            <h3 style={{ ...sf, fontSize: 24, fontWeight: 700, marginBottom: 5, color: T.t }}>Nordex SE</h3>
                            <div style={{ ...fm, fontSize: 10, color: T.a, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 20 }}>Werkstudent · AI & Data Engineering · Hamburg</div>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                                {["Built an end-to-end internal AI assistant using Azure AI Foundry — RAG pipeline over 1,690 documents with GPT-4o / GPT-5 and text-embedding-3-large",
                                    "Engineered a custom tool router using rapidfuzz (3 algorithms, threshold 70/100) solving a core Azure AI Foundry autonomous tool-calling limitation",
                                    "Ran a 29-question LLM evaluation pipeline (GPT-4o as judge) — recommended GPT-4o at 11× lower cost, 4× faster inference with only 0.2 quality delta",
                                    "Delivered Streamlit chat UI, incremental vector store sync, 9 integrated tools, full technical docs & architecture diagrams"
                                ].map((b, i) => <li key={i} style={{ ...fm, fontSize: 13, color: T.m, lineHeight: 1.8, paddingLeft: 20, position: "relative" }}><span style={{ position: "absolute", left: 0, color: T.a, fontSize: 11 }}>→</span>{b}</li>)}
                            </ul>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                                {["Azure AI Foundry", "GPT-4o/GPT-5", "RAG", "Python 3.11", "Docker", "Streamlit", "Azure Databricks", "Azure DevOps"].map(t => (
                                    <span key={t} style={{ ...fm, fontSize: 9, color: T.a, background: `${T.a}0e`, border: `1px solid ${T.a}25`, padding: "3px 10px", borderRadius: 8 }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PROJECTS ── */}
            <section id="projects" className="section" style={{ background: "transparent", position: "relative" }}>
                <ProjectsBG T={T} />
                <div className="sec-inner" style={{ ...sp }}>
                    <SH n="03" title="Projects" T={T} />
                    <div className="proj-grid">
                        {PROJECTS.map((p, i) => <PCard key={p.id} p={p} T={T} i={i} />)}
                    </div>
                </div>
            </section>

            {/* ── SKILLS ── */}
            <section id="skills" className="section" style={{ background: "transparent", position: "relative", overflow: "hidden", minHeight: "100vh" }}>
                <SkillsCanvas T={T} />
                <div className="sec-inner" style={{ ...sp, position: "relative", zIndex: 1 }}>
                    <SH n="04" title="Skills" T={T} />

                    {/* ── Subtitle ── */}
                    <div className="rv" style={{ textAlign: "center", marginBottom: 48 }}>
                        <p style={{ ...sf, fontSize: "clamp(18px,2.5vw,28px)", fontWeight: 600, color: T.t, marginBottom: 8, lineHeight: 1.3 }}>
                            A constellation of <span style={{ color: T.a, fontStyle: "italic" }}>26 skills</span> across 4 domains
                        </p>
                        <p style={{ ...fm, fontSize: 11, color: T.m, letterSpacing: ".06em" }}>
                            Hover the radar vertices · Move your mouse through the galaxy
                        </p>
                    </div>

                    {/* ── Radar Chart ── */}
                    <div className="rv">
                        <SkillRadar T={T} />
                    </div>

                    {/* ── Category Cards with Skill Nodes ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, width: "100%" }}>
                        {(() => {
                            const catColors = [T.a, T.a2, T.a3, "#f59e0b"];
                            const ics = ["🧠", "🗄️", "☁️", "💻"];
                            const profMap = {
                                "Azure AI Foundry": .92, "RAG Pipelines": .9, "LLM Evaluation": .85, "MLflow": .78, "TensorFlow": .8, "Scikit-learn": .84, "GPT-4o / GPT-5": .88,
                                "Azure Databricks": .82, "Apache Kafka": .8, "Apache Spark": .76, "Apache Flink": .74, "ETL Pipelines": .86, "Azure Purview": .72,
                                "Azure": .88, "AWS": .8, "GCP": .78, "Docker": .9, "Kubernetes": .74, "GitHub Actions": .82, "Terraform": .7,
                                "Python": .94, "SQL": .86, "Bash": .78, "PostgreSQL": .82, "MongoDB": .74, "MySQL": .8,
                            };
                            return Object.entries(SKILLS).map(([g, sk], i) => (
                                <SkillCategoryCard key={g} name={g} skills={sk} color={catColors[i]} icon={ics[i]}
                                    profMap={profMap} T={T} dark={dark} index={i} />
                            ));
                        })()}
                    </div>

                    {/* ── Summary stats ── */}
                    <div className="rv3" style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
                        {[["26", "Total Skills"], ["4", "Domains"], ["83%", "Avg Proficiency"], ["2+", "Years Production"]].map(([n, l]) => (
                            <div key={l} style={{ textAlign: "center" }}>
                                <div style={{ ...sf, fontSize: 28, fontWeight: 700, color: T.t, lineHeight: 1 }}>{n}</div>
                                <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 6 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── EDUCATION ── */}
            <section id="education" className="section" style={{ background: "transparent", position: "relative", overflow: "visible", padding: 0 }}>
                <EducationBG T={T} />
                <div style={{ ...sp, position: "relative", zIndex: 1, paddingBottom: 40 }}>
                    <SH n="05" title="Education" T={T} />
                </div>
                <EduScrollBook T={T} />
            </section>

            {/* ── PHOTOGRAPHY ── */}
            <section id="photography" className="section" style={{ background: "transparent", overflow: "hidden", position: "relative" }}>
                <PhotographyBG T={T} />
                <div className="sec-inner" style={{ ...sp }}>
                    <SH n="06" title="Photography" T={T} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
                        <p className="rv" style={{ fontSize: 15, color: T.m, maxWidth: 480, lineHeight: 1.8, fontStyle: "italic", fontFamily: "'Playfair Display',serif", margin: 0 }}>
                            Beyond the code — landscape and street photography from Hamburg and beyond.
                        </p>
                        <div className="rv2" style={{ display: "flex", gap: 16, ...fm, fontSize: 10, color: T.m }}>
                            <span>58 photographs</span><span style={{ color: T.dim }}>·</span><span>Click to open</span>
                        </div>
                    </div>
                </div>

                <div style={{ overflow: "hidden", marginBottom: 32, position: "relative", maskImage: "linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%)", WebkitMaskImage: "linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%)" }}>
                    <div style={{ display: "flex", gap: 10, width: "max-content", animation: "marqueeScroll 50s linear infinite" }}
                        id="mq" onMouseEnter={() => document.getElementById("mq").style.animationPlayState = "paused"}
                        onMouseLeave={() => document.getElementById("mq").style.animationPlayState = "running"}>
                        {[...Array.from({ length: 20 }, (_, i) => i + 1), ...Array.from({ length: 20 }, (_, i) => i + 1)].map((n, i) => (
                            <div key={i} onClick={() => { setLbIdx((n - 1) % 20); setLightbox(true); }}
                                style={{ width: 220, height: 150, flexShrink: 0, overflow: "hidden", borderRadius: 10, cursor: "none", position: "relative", background: T.card }}>
                                <img src={`https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/photo${n}.jpg`} alt="" loading="lazy"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .5s ease,filter .4s ease", filter: "saturate(.85)" }}
                                    onMouseEnter={e => { e.target.style.transform = "scale(1.08)"; e.target.style.filter = "saturate(1.1)"; }}
                                    onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.filter = "saturate(.85)"; }}
                                    onError={e => { e.target.style.display = "none"; }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sec-inner" style={{ ...sp, paddingTop: 0 }}>
                    <PhotoGallery T={T} photos={Array.from({ length: 20 }, (_, i) => i + 1)} onOpen={(idx) => { setLbIdx(idx); setLightbox(true); }} />
                    <div className="rv" style={{ marginTop: 36, textAlign: "center" }}>
                        <Mag as="a" href="https://shahriyar31.github.io/Farhan-Shahriyar.github.io/#photography" target="_blank" rel="noreferrer"
                            style={{ ...fm, fontSize: 10, color: T.a, border: `1px solid ${T.a}`, padding: "12px 28px", textDecoration: "none", letterSpacing: ".12em", textTransform: "uppercase", display: "inline-block", borderRadius: 24, transition: "all .3s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.a; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.a; }}>
                            View All 58 Photos ↗
                        </Mag>
                    </div>
                </div>

                {lightbox && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(0,0,0,.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "none", backdropFilter: "blur(12px)", animation: "fadeUp .2s ease" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom,rgba(0,0,0,.6),transparent)" }}>
                            <span style={{ ...fm, fontSize: 10, color: "rgba(255,255,255,.5)", letterSpacing: ".12em" }}>{lbIdx + 1} / 20</span>
                            <button onClick={() => setLightbox(false)} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "white", cursor: "none", padding: "8px 16px", borderRadius: 20, ...fm, fontSize: 11, letterSpacing: ".08em", backdropFilter: "blur(8px)" }}>✕ CLOSE</button>
                        </div>
                        <img key={lbIdx} src={`https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/photo${lbIdx + 1}.jpg`} alt="" style={{ maxWidth: "80vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 6, boxShadow: "0 40px 100px rgba(0,0,0,.9)", animation: "lbEnter .35s cubic-bezier(.16,1,.3,1)" }} />
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "20%", display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 24, cursor: "none" }} onClick={() => setLbIdx(i => (i - 1 + 20) % 20)}>
                            <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all .2s", fontSize: 18, color: "rgba(255,255,255,.7)" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}>←</div>
                        </div>
                        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "20%", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 24, cursor: "none" }} onClick={() => setLbIdx(i => (i + 1) % 20)}>
                            <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all .2s", fontSize: 18, color: "rgba(255,255,255,.7)" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}>→</div>
                        </div>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 24px", background: "linear-gradient(to top,rgba(0,0,0,.7),transparent)", display: "flex", gap: 8, justifyContent: "center", overflowX: "auto", scrollbarWidth: "none" }}>
                            {Array.from({ length: 20 }, (_, i) => (
                                <div key={i} onClick={e => { e.stopPropagation(); setLbIdx(i); }}
                                    style={{ width: 56, height: 40, flexShrink: 0, borderRadius: 4, overflow: "hidden", border: lbIdx === i ? "2px solid white" : "2px solid rgba(255,255,255,.2)", opacity: lbIdx === i ? 1 : .55, transition: "all .2s", cursor: "none" }}>
                                    <img src={`https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/photo${i + 1}.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* ── CONTACT ── */}
            <section id="contact" className="section" style={{ background: "transparent", position: "relative" }}>
                <ContactBG T={T} />
                <div className="sec-inner" style={{ ...sp }}>
                    <div className="contact-grid rv">
                        <div>
                            <h2 style={{ ...sf, fontSize: "clamp(30px,5vw,58px)", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.05, marginBottom: 20, color: T.t }}>
                                Let's build<br />something<br /><span style={{ color: T.a }}>remarkable.</span>
                            </h2>
                            <p style={{ fontSize: 14, color: T.m, lineHeight: 1.85, marginBottom: 32 }}>Open to Werkstudent, internship, and full-time roles in Data Engineering, AI/ML Engineering, and Software Development. Hamburg-based.</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[["✉", "mailto:shahriyarfarhan3101@gmail.com", "shahriyarfarhan3101@gmail.com"], ["⌥", "https://github.com/Shahriyar31", "github.com/Shahriyar31"], ["in", "https://www.linkedin.com/in/farhanshahriyar", "LinkedIn Profile"]].map(([ic, href, label]) => (
                                    <a key={label} href={href} target="_blank" rel="noreferrer"
                                        style={{ display: "flex", alignItems: "center", gap: 14, ...fm, fontSize: 12, color: T.m, textDecoration: "none", transition: "color .2s", cursor: "none" }}
                                        onMouseEnter={e => e.currentTarget.style.color = T.t} onMouseLeave={e => e.currentTarget.style.color = T.m}>
                                        <div style={{ width: 40, height: 40, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all .2s" }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.a; e.currentTarget.style.background = `${T.a}12`; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "transparent"; }}>{ic}</div>
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className="rv2">
                            <div style={{ border: `1px solid ${T.border}`, borderRadius: 20, padding: 28, background: T.card, backdropFilter: "blur(12px)", marginBottom: 16, position: "relative", overflow: "hidden", transition: "border-color .3s" }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = T.a} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${T.a},${T.a2},${T.a3})` }} />
                                <div style={{ ...fm, fontSize: 9, color: T.a3, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.a3, display: "inline-block", animation: "blink 2s ease-in-out infinite" }} />Status — Open to Work
                                </div>
                                <div style={{ ...sf, fontSize: 26, fontWeight: 700, marginBottom: 8, color: T.t }}>Available Now</div>
                                <div style={{ fontSize: 13, color: T.m, lineHeight: 1.7 }}>Looking for challenging roles to build production AI and data infrastructure. Open to hybrid or remote.</div>
                            </div>
                            <div style={{ border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, display: "flex", gap: 16, background: T.card }}>
                                {[["🤖", "AI Engineering"], ["🗄️", "Data Pipelines"], ["☁️", "Cloud & DevOps"]].map(([ic, lb]) => (
                                    <div key={lb} style={{ textAlign: "center", flex: 1 }}>
                                        <div style={{ fontSize: 24, marginBottom: 6, animation: `float ${4 + lb.length * .15}s ease-in-out infinite` }}>{ic}</div>
                                        <div style={{ ...fm, fontSize: 9, color: T.m, letterSpacing: ".05em" }}>{lb}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ padding: "28px 56px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", ...fm, fontSize: 10, color: T.m, flexWrap: "wrap", gap: 12 }}>
                <span>© 2025 <span style={{ color: T.a }}>Farhan Shahriyar</span></span>
                <span>Designed & engineered in Hamburg 🇩🇪</span>
                <span>MSc Data Science · TUHH</span>
            </footer>

            <ChatFloat T={T} />
        </div>
    );
}
