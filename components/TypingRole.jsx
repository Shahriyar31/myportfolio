import { useState, useEffect } from "react";
import { ROLES } from "../data/constants";

export default function TypingRole({ T }) {
    const [idx, setIdx] = useState(0); const [sub, setSub] = useState(""); const [del, setDel] = useState(false);
    useEffect(() => {
        const full = ROLES[idx];
        const t = setTimeout(() => {
            if (!del) { const n = full.slice(0, sub.length + 1); setSub(n); if (n.length === full.length) setTimeout(() => setDel(true), 1900); return; }
            const n = full.slice(0, sub.length - 1); setSub(n); if (n.length === 0) { setDel(false); setIdx(i => (i + 1) % ROLES.length); }
        }, del ? 44 : 84);
        return () => clearTimeout(t);
    }, [sub, del, idx]);
    return <span style={{ color: T.a3, fontWeight: 500 }}>{sub}<span style={{ animation: "blink 1.1s step-end infinite", color: T.a2 }}>|</span></span>;
}
