import { useEffect, useRef, useState } from "react";

/*
 * Small hands-on previews for the evidence room — one per project. They are
 * simulations in the browser that show what each project does; the real code
 * is linked next to them.
 */

const useTick = (ms, on = true) => { const [t, setT] = useState(0); useEffect(() => { if (!on) return; const id = setInterval(() => setT(v => v + 1), ms); return () => clearInterval(id); }, [ms, on]); return t; };
const Note = () => <p className="pv-note mono">Simulated preview · real code in the repo</p>;
const path = (ys, w, h, lo, hi) => ys.map((y, i) => `${i ? "L" : "M"}${(i / (ys.length - 1)) * w} ${h - ((y - lo) / (hi - lo || 1)) * h}`).join(" ");

/* Digital Twin — live sensor, rolling z-score anomaly detection */
function Twin() {
    const t = useTick(120), data = useRef(Array.from({ length: 60 }, (_, i) => Math.sin(i / 5) * 2 + 20)), fault = useRef(0), [flag, setFlag] = useState(null);
    useEffect(() => {
        const d = data.current, n = d.length, base = Math.sin((t + n) / 5) * 2 + 20 + (Math.random() - 0.5) * 0.6;
        const v = fault.current > 0 ? base + 7 * (fault.current-- / 3) : base;
        d.push(v); d.shift();
        const win = d.slice(-30, -1), m = win.reduce((a, b) => a + b, 0) / win.length, sd = Math.sqrt(win.reduce((a, b) => a + (b - m) ** 2, 0) / win.length) || 1, z = (v - m) / sd;
        if (Math.abs(z) > 3) setFlag({ z: z.toFixed(1), at: t });
    }, [t]);
    const d = data.current, hot = flag && t - flag.at < 25;
    return (
        <div className="pv">
            <div className="pv-head"><span className="mono">process sensor · live</span><b className={hot ? "pv-bad" : "pv-ok"}>{hot ? `Spike: z = ${flag.z}` : "Normal"}</b></div>
            <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="pv-chart" aria-hidden="true"><path d={path(d, 300, 70, 12, 32)} className={hot ? "is-bad" : ""} /></svg>
            <button className="pv-btn" onClick={() => { fault.current = 3; }}>Simulate a spike</button>
            <Note />
        </div>
    );
}

/* Radiation Tracker — streaming readings, tumbling-window average per station */
function Radiation() {
    const t = useTick(400), [spike, setSpike] = useState(null);
    const st = ["Hamburg", "Berlin", "Munich", "Cologne"];
    const val = (i) => (0.09 + ((Math.sin(t * 0.7 + i * 2) + 1) / 2) * 0.05 + (spike === i ? 0.35 : 0)).toFixed(3);
    useEffect(() => { if (spike === null) return; const id = setTimeout(() => setSpike(null), 4000); return () => clearTimeout(id); }, [spike]);
    return (
        <div className="pv">
            <div className="pv-head"><span className="mono">Kafka topic · readings · {(8 + (t % 5)).toString()} msg/s</span><b className={spike !== null ? "pv-bad" : "pv-ok"}>{spike !== null ? `Alert: ${st[spike]}` : "All normal"}</b></div>
            <ul className="pv-rows">{st.map((s, i) => <li key={s} className={spike === i ? "is-bad" : ""}><span>{s}</span><i style={{ "--w": Math.min(1, val(i) / 0.5) }} /><b className="mono">{val(i)} µSv/h</b></li>)}</ul>
            <button className="pv-btn" onClick={() => setSpike(Math.floor(Math.random() * 4))}>Simulate a spike</button>
            <Note />
        </div>
    );
}

/* StockFlow — ticks into Kafka, batched to S3 */
function Stock() {
    const t = useTick(300), ticks = useRef(Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 4) * 3));
    useEffect(() => { const d = ticks.current; d.push(d[d.length - 1] + (Math.random() - 0.48) * 1.6); d.shift(); }, [t]);
    const d = ticks.current, last = d[d.length - 1], batch = Math.floor(t / 16), inBatch = (t % 16) * 3;
    return (
        <div className="pv">
            <div className="pv-head"><span className="mono">ticker · ACME</span><b className={last >= d[0] ? "pv-ok" : "pv-bad"}>{last.toFixed(2)}</b></div>
            <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="pv-chart" aria-hidden="true"><path d={path(d, 300, 70, Math.min(...d) - 1, Math.max(...d) + 1)} /></svg>
            <p className="pv-flow mono">producer → <b>kafka</b> ({inBatch} buffered) → <b>S3</b> batch #{batch} → <b>Glue</b> catalogue</p>
            <Note />
        </div>
    );
}

/* Poultry Shield — CNN classification of a sample (probabilities are illustrative) */
const SAMPLES = [["Sample A", [0.95, 0.05]], ["Sample B", [0.07, 0.93]], ["Sample C", [0.56, 0.44]]];
function Poultry() {
    const [s, setS] = useState(null), [busy, setBusy] = useState(false);
    const pick = i => { setBusy(true); setS(null); setTimeout(() => { setS(i); setBusy(false); }, 700); };
    const labels = ["Healthy", "Coccidiosis"];
    const verdict = p => (Math.max(...p) < 0.75 ? "Unsure: send to a vet" : labels[p.indexOf(Math.max(...p))]);
    return (
        <div className="pv">
            <div className="pv-head"><span className="mono">VGG16 · 97.51% validation accuracy</span><b className={s !== null && !busy && Math.max(...SAMPLES[s][1]) < 0.75 ? "pv-warn" : "pv-ok"}>{busy ? "Classifying…" : s === null ? "Pick a sample" : verdict(SAMPLES[s][1])}</b></div>
            <div className="pv-picks">{SAMPLES.map(([n], i) => <button key={n} className={`pv-btn ${s === i ? "is-on" : ""}`} onClick={() => pick(i)}>{n}</button>)}</div>
            <ul className="pv-rows">{labels.map((l, k) => <li key={l}><span>{l}</span><i style={{ "--w": s === null ? 0 : SAMPLES[s][1][k] }} /><b className="mono">{s === null ? "—" : `${Math.round(SAMPLES[s][1][k] * 100)}%`}</b></li>)}</ul>
            <Note />
        </div>
    );
}

/* Book Analysis — word-level sentiment on a review */
const POS = ["love", "loved", "great", "brilliant", "beautiful", "gripping", "wonderful", "best", "good", "enjoyed", "moving"];
const NEG = ["boring", "bad", "slow", "worst", "hate", "hated", "dull", "weak", "confusing", "long", "predictable"];
function Books() {
    const [txt, setTxt] = useState("A gripping start, but the middle was slow and predictable.");
    const words = txt.split(/(\s+)/), score = words.reduce((a, w) => { const k = w.toLowerCase().replace(/[^a-z]/g, ""); return a + (POS.includes(k) ? 1 : NEG.includes(k) ? -1 : 0); }, 0);
    return (
        <div className="pv">
            <div className="pv-head"><span className="mono">sentence sentiment · try it</span><b className={score > 0 ? "pv-ok" : score < 0 ? "pv-bad" : ""}>{score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral"} ({score > 0 ? "+" : ""}{score})</b></div>
            <input className="pv-input" value={txt} onChange={e => setTxt(e.target.value.slice(0, 160))} aria-label="Write a sentence" />
            <p className="pv-words">{words.map((w, i) => { const k = w.toLowerCase().replace(/[^a-z]/g, ""); return <span key={i} className={POS.includes(k) ? "is-pos" : NEG.includes(k) ? "is-neg" : ""}>{w}</span>; })}</p>
            <Note />
        </div>
    );
}

export const PREVIEW = { 2: Twin, 3: Poultry, 4: Radiation, 5: Stock, 6: Books };
export default function Preview({ id }) { const C = PREVIEW[id]; return C ? <C /> : null; }
