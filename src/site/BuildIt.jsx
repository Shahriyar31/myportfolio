import { useEffect, useState } from "react";
import Stop from "./Stop";
import { J } from "./journey";
import { scrollToId } from "./hooks";

/*
 * Incident 1 — "Build it". A new AI agent knows nothing. The visitor connects documents
 * from the data lake and watches retrieval work: guesses without sources, wrong answers
 * from outdated ones, conflicts, and finally a correct, cited answer once only approved
 * sources are used. Fictional company; runs fully in the browser.
 */

const Q = "When is turbine T-07's next gearbox inspection due?";
// dates relative to today, so the story always reads true: last inspection ~6 months ago, next due in 5 days
const fmt = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const addM = (d, m, days = 0) => { const x = new Date(d); x.setMonth(x.getMonth() + m); x.setDate(x.getDate() + days); return x; };
const LAST = addM(new Date(), -6, 5), DUE = addM(LAST, 6), WRONG = addM(LAST, 12);
const DOCS = [
    { id: "m3", name: "Maintenance manual v3", kind: "PDF · gold", ok: true, score: 0.91, chunk: "Gearbox oil: inspect every 6 months; full service every 24 months." },
    { id: "m1", name: "Maintenance manual v1", kind: "PDF · bronze", ok: false, score: 0.88, chunk: "Gearbox oil: inspect every 12 months." },
    { id: "log", name: "T-07 sensor log", kind: "Delta table · gold", ok: true, score: 0.84, chunk: `T-07 last gearbox inspection: ${fmt(LAST)}. Bearing temp 41 °C (normal).` },
    { id: "hr", name: "HR handbook", kind: "PDF · silver", ok: true, score: 0.12, chunk: "Holiday requests must be submitted two weeks in advance." },
];
const TOPK = 2, MIN = 0.5;

function answer(on, filter) {
    const pool = DOCS.filter(d => on.includes(d.id));
    const ranked = pool.map(d => ({ ...d, cut: filter && !d.ok })).sort((a, b) => b.score - a.score);
    const used = ranked.filter(d => !d.cut && d.score >= MIN).slice(0, TOPK);
    const has = id => used.some(d => d.id === id), n = id => used.findIndex(d => d.id === id) + 1;
    let v;
    if (!pool.length) v = ["guess", "Every 12 months, so probably sometime next year.", "No sources connected, so the model guessed. It sounds confident, and it's wrong.", "Connect documents from the data lake."];
    else if (!used.length) v = ["honest", "I couldn't find this in the connected sources.", "Good behaviour: with nothing relevant, the agent says so instead of guessing.", "The HR handbook doesn't know about turbines. Connect the maintenance documents."];
    else if (has("m3") && has("m1")) v = ["conflict", `Sources disagree: every 6 months [${n("m3")}] or every 12 months [${n("m1")}].`, "Two manuals, two answers. The agent can't tell which one is current.", "Only let the agent use approved sources (the catalogue marks v1 as deprecated)."];
    else if (has("m1")) v = ["wrong", `Every 12 months [${n("m1")}], so next due ${fmt(WRONG)}.`, "Wrong, and cited. v1 of the manual is outdated. A source isn't proof if nobody governs it.", "Turn on “approved sources only”, and connect v3."];
    else if (has("m3") && has("log")) v = ["right", `Due ${fmt(DUE)}, in 5 days: gearbox oil is inspected every 6 months [${n("m3")}], and T-07 was last inspected on ${fmt(LAST)} [${n("log")}].`, "Correct, current and cited. Every claim points to an approved source you can check.", ""];
    else if (has("m3")) v = ["partial", `Every 6 months [${n("m3")}], but I can't see when T-07 was last inspected.`, "Right rule, missing facts. It needs the turbine's own data too.", "Connect the T-07 sensor log."];
    else v = ["partial", `T-07 was last inspected on ${fmt(LAST)} [${n("log")}], but I don't know the inspection interval.`, "Right facts, missing rule.", "Connect the current maintenance manual."];
    return { ranked, used, kind: v[0], text: v[1], why: v[2], hint: v[3] };
}

export default function BuildIt() {
    const [on, setOn] = useState([]), [filter, setFilter] = useState(false);
    const [res, setRes] = useState(null), [busy, setBusy] = useState(false), [tries, setTries] = useState(0), [skip, setSkip] = useState(false);
    const solved = res?.kind === "right" || skip;

    // connected sources light up the data streams from the lake to the AI tower
    useEffect(() => { if (J.scene) J.scene.ragGlow = on.filter(id => id !== "hr").length; }, [on]);
    useEffect(() => () => { if (J.scene) J.scene.ragGlow = 0; }, []);

    const toggle = id => { setOn(o => (o.includes(id) ? o.filter(x => x !== id) : [...o, id])); setRes(null); };
    const ask = () => { if (busy) return; setBusy(true); setRes(null); setTimeout(() => { setRes(answer(on, filter)); setBusy(false); setTries(t => t + 1); }, 900); };

    return (
        <section id="incident-build" aria-label="Incident 1: build it">
            <Stop station="tower" side="left" wide>
                <div className="inc-kick mono"><span className="inc-clock">06:00</span><span>Incident 1 / 3 · Build it</span><span className="inc-tag">RAG · Databricks · governance</span></div>
                <h3 className="pane-title">The company's new AI agent knows nothing.</h3>
                <p className="pane-lede sm">A technician asks it a question. Give it the right documents from the data lake, then ask again, and watch it stop guessing.</p>

                <div className="bi-q"><span className="mono">Technician asks</span>{Q}</div>

                <div className="bi-docs" role="group" aria-label="Documents in the data lake">
                    {DOCS.map(d => (
                        <button key={d.id} className={`bi-doc ${on.includes(d.id) ? "is-on" : ""} ${!d.ok ? "is-old" : ""}`} aria-pressed={on.includes(d.id)} onClick={() => toggle(d.id)}>
                            <span className="bi-plug" aria-hidden="true" />
                            <b>{d.name}</b>
                            <small className="mono">{d.kind}{!d.ok && " · deprecated"}</small>
                        </button>
                    ))}
                </div>
                <label className="bi-filter"><input type="checkbox" checked={filter} onChange={e => { setFilter(e.target.checked); setRes(null); }} /><span className="bi-sw" aria-hidden="true" />Approved sources only <small className="mono">catalogue filter</small></label>

                <div className="bi-row">
                    <button className="bi-ask" onClick={ask} disabled={busy}>{busy ? "Retrieving…" : tries ? "Ask again" : "Ask the agent"}</button>
                    {!solved && <button className="bi-skip mono" onClick={() => setSkip(true)}>Skip — show what this proves</button>}
                </div>

                {(busy || res) && (
                    <div className="bi-out" aria-live="polite">
                        <div className="bi-rank">
                            <span className="mono">1 · Retrieve &amp; rank (top {TOPK})</span>
                            {!on.length && <p className="bi-empty mono">no sources connected</p>}
                            {(res?.ranked || DOCS.filter(d => on.includes(d.id))).map(d => {
                                const used = res?.used.some(u => u.id === d.id);
                                return <div key={d.id} className={`bi-bar ${used ? "is-used" : ""} ${d.cut ? "is-cut" : ""}`}><span>{d.name}</span><i style={{ "--w": busy ? 0 : d.score }} /><b className="mono">{busy ? "…" : d.cut ? "filtered" : d.score.toFixed(2)}</b></div>;
                            })}
                        </div>
                        {res && <div className={`bi-ans is-${res.kind}`}>
                            <span className="mono">2 · Agent answers</span>
                            <p className="bi-text">{res.text}</p>
                            {res.used.length > 0 && <ol className="bi-cites">{res.used.map(u => <li key={u.id}><b>{u.name}</b> — “{u.chunk}”</li>)}</ol>}
                            <p className="bi-why">{res.why}</p>
                            {res.hint && <p className="bi-hint mono">Hint: {res.hint}</p>}
                        </div>}
                    </div>
                )}

                {solved && (
                    <div className="inc-proof">
                        <b>✓ Incident resolved{res?.kind === "right" ? ` in ${tries} ${tries === 1 ? "try" : "tries"}` : ""}.</b>
                        <p><span className="mono">In plain words</span>I build AI assistants that answer from your own documents, only the approved ones, and show sources you can check.</p>
                        <p><span className="mono">Under the hood</span>RAG: chunking and embeddings on Databricks, vector search, catalogue metadata filters (approved / deprecated), top-k retrieval with citations, and answer quality measured with evals (RAGAS).</p>
                        <div className="dj-proof"><span className="mono">Proof</span><button onClick={() => scrollToId("built")}>Argus AI · RAG over the EU AI Act</button><button onClick={() => scrollToId("work")}>RAG prototypes at Nordex</button></div>
                    </div>
                )}
            </Stop>
        </section>
    );
}
