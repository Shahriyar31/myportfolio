import { useState, useEffect } from "react";
import { FACTS } from "../data/constants";

export default function CyclingFact({ T }) {
    const [idx, setIdx] = useState(0); const [text, setText] = useState(""); const [del, setDel] = useState(false);
    const fm = { fontFamily: "'Inter', sans-serif" };
    useEffect(() => {
        const full = FACTS[idx];
        const t = setTimeout(() => {
            if (!del) { const n = full.slice(0, text.length + 1); setText(n); if (n.length === full.length) setTimeout(() => setDel(true), 2200); return; }
            const n = full.slice(0, text.length - 1); setText(n); if (n.length === 0) { setDel(false); setIdx(i => (i + 1) % FACTS.length); }
        }, del ? 28 : 52);
        return () => clearTimeout(t);
    }, [text, del, idx]);
    return (
        <div style={{ padding: "16px 22px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, backdropFilter: "blur(8px)", minHeight: 56, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.a, flexShrink: 0, animation: "blink 1.5s ease-in-out infinite" }} />
            <span style={{ ...fm, fontSize: 13, color: T.t, lineHeight: 1.5 }}>{text}<span style={{ color: T.a, animation: "blink 1s step-end infinite" }}>|</span></span>
        </div>
    );
}
