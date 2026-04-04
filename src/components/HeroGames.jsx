import { useState } from "react";

const fm = { fontFamily: "'Inter', sans-serif" };

// ── PIPELINE DATA ─────────────────────────────────────────────────────────────
const STAGES = [
    { id: "raw",    label: "Raw Data",  icon: "📦", color: "#64748b" },
    { id: "kafka",  label: "Kafka",     icon: "⚡", color: "#f59e0b" },
    { id: "spark",  label: "Spark",     icon: "🔥", color: "#ef4444" },
    { id: "docker", label: "Docker",    icon: "🐳", color: "#3b82f6" },
    { id: "azure",  label: "Azure AI",  icon: "🤖", color: "#8b5cf6" },
    { id: "dash",   label: "Dashboard", icon: "📊", color: "#10b981" },
];
const CORRECT = ["raw", "kafka", "spark", "docker", "azure", "dash"];

// ── HIRE / PASS CARDS ─────────────────────────────────────────────────────────
const CARDS = [
    { id: 1, tag: "Impact",      emoji: "🚀", text: "Built production AI at a Fortune 500 company within 3 months of joining" },
    { id: 2, tag: "ROI",         emoji: "💰", text: "Reduced LLM infrastructure costs by 11× through custom tool routing" },
    { id: 3, tag: "ML",          emoji: "🧠", text: "Achieved 97.51% CNN accuracy on a medical AI project from scratch" },
    { id: 4, tag: "Drive",       emoji: "🌍", text: "Moved from India to Germany alone at 22 — zero contacts, full ambition" },
    { id: 5, tag: "Ownership",   emoji: "🔧", text: "End-to-end ownership: architecture, code, deployment, monitoring" },
    { id: 6, tag: "Education",   emoji: "🎓", text: "MSc Data Science @ TUHH Hamburg — theory meets real industry work" },
    { id: 7, tag: "Performance", emoji: "⚡", text: "4× faster inference after optimising Azure AI Foundry pipelines" },
    { id: 8, tag: "Available",   emoji: "✅", text: "Available NOW — open to full-time & Werkstudent roles in Germany" },
];

// ── PIPELINE GAME ─────────────────────────────────────────────────────────────
function PipelineGame({ T }) {
    const [pool, setPool]       = useState(() => [...STAGES].sort(() => Math.random() - 0.5));
    const [slots, setSlots]     = useState(Array(6).fill(null));
    const [dragging, setDrag]   = useState(null); // { id, from: "pool"|slot_index }
    const [running, setRunning] = useState(false);
    const [litIdx, setLitIdx]   = useState(-1);
    const [won, setWon]         = useState(false);
    const [wrong, setWrong]     = useState([]);

    const onDragStart = (e, id, from) => {
        setDrag({ id, from });
        e.dataTransfer.effectAllowed = "move";
    };
    const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

    const dropOnSlot = (e, idx) => {
        e.preventDefault();
        if (!dragging) return;
        const stage = STAGES.find(s => s.id === dragging.id);
        const newSlots = [...slots];
        const newPool  = [...pool];

        if (dragging.from === "pool") {
            if (newSlots[idx]) newPool.push(newSlots[idx]);
            newSlots[idx] = stage;
            setPool(newPool.filter(p => p.id !== dragging.id));
        } else {
            const prev = newSlots[dragging.from];
            if (newSlots[idx]) newSlots[dragging.from] = newSlots[idx];
            else               newSlots[dragging.from] = null;
            newSlots[idx] = prev;
        }
        setSlots(newSlots);
        setDrag(null);
    };

    const dropOnPool = (e) => {
        e.preventDefault();
        if (!dragging || dragging.from === "pool") return;
        const newSlots = [...slots];
        setPool(p => [...p, newSlots[dragging.from]]);
        newSlots[dragging.from] = null;
        setSlots(newSlots);
        setDrag(null);
    };

    const run = async () => {
        if (running || slots.some(s => !s)) return;
        const correct = slots.every((s, i) => s?.id === CORRECT[i]);
        if (!correct) {
            const w = slots.map((s, i) => s?.id !== CORRECT[i] ? i : -1).filter(i => i >= 0);
            setWrong(w);
            setTimeout(() => setWrong([]), 700);
            return;
        }
        setRunning(true);
        for (let i = 0; i < 6; i++) {
            setLitIdx(i);
            await new Promise(r => setTimeout(r, 340));
        }
        setWon(true);
    };

    const reset = () => {
        setPool([...STAGES].sort(() => Math.random() - 0.5));
        setSlots(Array(6).fill(null));
        setRunning(false); setLitIdx(-1); setWon(false); setWrong([]);
    };

    if (won) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14, textAlign: "center", padding: 28 }}>
            <div style={{ fontSize: 44 }}>⚡</div>
            <div style={{ ...fm, fontWeight: 800, fontSize: 18, color: "#4ade80" }}>Pipeline Deployed!</div>
            <div style={{ ...fm, fontSize: 13, color: T.m, lineHeight: 1.7, maxWidth: 300 }}>
                This is exactly how Farhan built the <strong style={{ color: T.a }}>Nordex AI Assistant</strong> —
                RAG over 1,690 docs at <strong style={{ color: T.a }}>11× lower cost</strong>.
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={reset} style={{ ...fm, background: "transparent", border: `1px solid rgba(255,255,255,0.15)`, color: T.m, padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                    Play Again
                </button>
                <a href="https://github.com/Shahriyar31" target="_blank" rel="noreferrer"
                    style={{ ...fm, background: T.a, color: "#fff", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    See Projects →
                </a>
            </div>
        </div>
    );

    return (
        <div style={{ padding: "14px 18px 16px", display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
            <p style={{ ...fm, fontSize: 12, color: T.m, textAlign: "center", margin: 0 }}>
                Drag the blocks into the correct pipeline order, then hit <strong style={{ color: T.a }}>Run</strong>
            </p>

            {/* Drop slots */}
            <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                {slots.map((stage, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <div
                            onDragOver={onDragOver}
                            onDrop={e => dropOnSlot(e, i)}
                            draggable={!!stage && !running}
                            onDragStart={stage && !running ? e => onDragStart(e, stage.id, i) : undefined}
                            style={{
                                width: 76, height: 68, borderRadius: 10,
                                border: `2px ${stage ? "solid" : "dashed"} ${wrong.includes(i) ? "#f87171" : litIdx >= i ? (stage?.color || T.a) : stage ? stage.color + "70" : "rgba(255,255,255,0.12)"}`,
                                background: litIdx >= i ? (stage?.color + "20") : stage ? stage.color + "14" : "rgba(255,255,255,0.02)",
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                                cursor: stage && !running ? "grab" : "default",
                                transition: "all 0.3s",
                                boxShadow: litIdx >= i ? `0 0 18px ${stage?.color}55` : "none",
                                animation: wrong.includes(i) ? "shake .4s ease" : "none",
                                userSelect: "none",
                            }}
                        >
                            {stage ? (
                                <>
                                    <span style={{ fontSize: 20 }}>{stage.icon}</span>
                                    <span style={{ ...fm, fontSize: 9, color: T.t, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{stage.label}</span>
                                </>
                            ) : (
                                <span style={{ ...fm, fontSize: 16, color: "rgba(255,255,255,0.15)", fontWeight: 300 }}>{i + 1}</span>
                            )}
                        </div>
                        {i < 5 && (
                            <span style={{ color: litIdx > i ? T.a : "rgba(255,255,255,0.15)", fontSize: 14, transition: "color .3s", fontWeight: litIdx > i ? 700 : 400 }}>→</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Pool */}
            <div
                onDragOver={onDragOver}
                onDrop={dropOnPool}
                style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 58, border: `1px dashed rgba(255,255,255,0.1)`, borderRadius: 12, padding: "10px 14px", alignItems: "center", justifyContent: "center", flex: 1 }}
            >
                {pool.length === 0
                    ? <span style={{ ...fm, fontSize: 12, color: T.m }}>All placed ↑ — hit Run to test</span>
                    : pool.map(s => (
                        <div
                            key={s.id}
                            draggable
                            onDragStart={e => onDragStart(e, s.id, "pool")}
                            style={{ padding: "7px 13px", borderRadius: 8, border: `1.5px solid ${s.color}55`, background: s.color + "18", cursor: "grab", display: "flex", alignItems: "center", gap: 6, userSelect: "none", transition: "transform .15s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        >
                            <span style={{ fontSize: 15 }}>{s.icon}</span>
                            <span style={{ ...fm, fontSize: 11, color: T.t, fontWeight: 600 }}>{s.label}</span>
                        </div>
                    ))
                }
            </div>

            {/* Run */}
            <button
                onClick={run}
                disabled={slots.some(s => !s) || running}
                style={{ ...fm, background: slots.every(s => s) && !running ? T.a : "transparent", border: `1.5px solid ${slots.every(s => s) && !running ? T.a : "rgba(255,255,255,0.1)"}`, color: slots.every(s => s) && !running ? "#fff" : T.m, padding: "11px", borderRadius: 10, cursor: slots.every(s => s) && !running ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", transition: "all .3s", boxShadow: slots.every(s => s) && !running ? `0 0 20px ${T.a}40` : "none" }}
            >
                {running ? "⚡ Running pipeline…" : "▶  Run Pipeline"}
            </button>

            <style>{`
                @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
            `}</style>
        </div>
    );
}

// ── HIRE OR PASS GAME ─────────────────────────────────────────────────────────
function HireOrPassGame({ T, onOpenResume }) {
    const [idx, setIdx]       = useState(0);
    const [decisions, setDec] = useState([]);
    const [exiting, setExit]  = useState(null); // "left" | "right"
    const [done, setDone]     = useState(false);

    const decide = (choice) => {
        if (exiting) return;
        setExit(choice === "hire" ? "right" : "left");
        setTimeout(() => {
            const next = [...decisions, choice];
            setDec(next);
            if (idx + 1 >= CARDS.length) setDone(true);
            else setIdx(i => i + 1);
            setExit(null);
        }, 360);
    };

    const reset = () => { setIdx(0); setDec([]); setDone(false); setExit(null); };
    const hired = decisions.filter(d => d === "hire").length;

    if (done) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14, textAlign: "center", padding: 28 }}>
            {hired >= 4 ? (
                <>
                    <div style={{ fontSize: 44 }}>🎉</div>
                    <div style={{ ...fm, fontWeight: 800, fontSize: 18, color: "#4ade80" }}>You hired Farhan!</div>
                    <div style={{ ...fm, fontSize: 13, color: T.m, lineHeight: 1.7 }}>Great instincts. He's ready to start immediately.</div>
                </>
            ) : (
                <>
                    <div style={{ fontSize: 44 }}>🤔</div>
                    <div style={{ ...fm, fontWeight: 800, fontSize: 18, color: "#f59e0b" }}>Really?</div>
                    <div style={{ ...fm, fontSize: 13, color: T.m, lineHeight: 1.7, maxWidth: 280 }}>
                        You just passed on 11× cost reduction, 97.5% accuracy, and production AI at a Fortune 500. Reconsider?
                    </div>
                </>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={reset} style={{ ...fm, background: "transparent", border: `1px solid rgba(255,255,255,0.15)`, color: T.m, padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                    Try Again
                </button>
                <button onClick={onOpenResume} style={{ ...fm, background: T.a, color: "#fff", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                    View Resume →
                </button>
            </div>
        </div>
    );

    const card = CARDS[idx];
    return (
        <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 12, height: "100%", alignItems: "center" }}>
            {/* Progress bar */}
            <div style={{ display: "flex", gap: 5, alignSelf: "stretch" }}>
                {CARDS.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < idx ? T.a : i === idx ? T.a + "55" : "rgba(255,255,255,0.08)", transition: "background .3s" }} />
                ))}
            </div>

            {/* Card stack */}
            <div style={{ position: "relative", width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {[2, 1].map(off => idx + off < CARDS.length && (
                    <div key={off} style={{ position: "absolute", width: "88%", height: "88%", borderRadius: 18, background: `rgba(255,255,255,${0.025 * off})`, border: `1px solid rgba(255,255,255,${0.05 * off})`, transform: `translateY(${off * 9}px) scale(${1 - off * 0.04})` }} />
                ))}
                <div style={{
                    position: "relative", zIndex: 10, width: "88%", height: "88%",
                    borderRadius: 18,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center",
                    transform: exiting === "right" ? "translateX(130%) rotate(22deg)" : exiting === "left" ? "translateX(-130%) rotate(-22deg)" : "none",
                    opacity: exiting ? 0 : 1,
                    transition: "transform .36s cubic-bezier(.2,.8,.2,1), opacity .36s ease",
                }}>
                    <div style={{ ...fm, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: T.a, padding: "3px 12px", border: `1px solid ${T.a}40`, borderRadius: 20 }}>{card.tag}</div>
                    <div style={{ fontSize: 38 }}>{card.emoji}</div>
                    <div style={{ ...fm, fontSize: 14, color: T.t, lineHeight: 1.7, fontWeight: 500 }}>{card.text}</div>
                    <div style={{ ...fm, fontSize: 11, color: T.m }}>{idx + 1} / {CARDS.length}</div>
                </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, width: "88%" }}>
                {[
                    { label: "👎  Pass", choice: "pass", base: "rgba(248,113,113,0.08)", hover: "rgba(248,113,113,0.18)", border: "rgba(248,113,113,0.28)", color: "#f87171" },
                    { label: "👍  Hire", choice: "hire", base: "rgba(74,222,128,0.08)",  hover: "rgba(74,222,128,0.18)",  border: "rgba(74,222,128,0.28)",  color: "#4ade80" },
                ].map(({ label, choice, base, hover, border, color }) => (
                    <button
                        key={choice}
                        onClick={() => decide(choice)}
                        style={{ flex: 1, ...fm, background: base, border: `1.5px solid ${border}`, color, padding: "13px", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = hover; e.currentTarget.style.transform = "scale(1.04)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = base; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function HeroGames({ T, onOpenResume }) {
    const [tab, setTab] = useState("pipeline");

    const TABS = [
        { id: "pipeline", label: "🔧 Build Pipeline" },
        { id: "hire",     label: "💼 Hire or Pass"  },
    ];

    return (
        <div style={{ width: "100%", maxWidth: 680, position: "relative", animation: "fadeUp 1.2s cubic-bezier(.2,.8,.2,1) both" }}>
            <div style={{ background: "linear-gradient(145deg,rgba(13,13,20,.98),rgba(8,8,13,.99))", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.06)", height: 520, display: "flex", flexDirection: "column" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", padding: "13px 18px", background: "rgba(0,0,0,.35)", borderBottom: "1px solid rgba(255,255,255,.06)", gap: 10 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
                    </div>
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6 }}>
                        {TABS.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                style={{ ...fm, background: tab === id ? T.a + "22" : "transparent", border: `1px solid ${tab === id ? T.a + "55" : "rgba(255,255,255,.08)"}`, color: tab === id ? T.a : "rgba(255,255,255,.38)", padding: "5px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: tab === id ? 700 : 400, transition: "all .2s", letterSpacing: ".02em" }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Game area */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                    {tab === "pipeline"
                        ? <PipelineGame T={T} key="pipeline" />
                        : <HireOrPassGame T={T} onOpenResume={onOpenResume} key="hire" />
                    }
                </div>
            </div>

            {/* Ambient glow */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "85%", height: "85%", background: `linear-gradient(135deg,${T.a}25,#8b5cf622)`, filter: "blur(100px)", opacity: .55, pointerEvents: "none", zIndex: -1 }} />
        </div>
    );
}
