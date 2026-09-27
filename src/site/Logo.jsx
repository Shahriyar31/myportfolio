import BRANDS from "../data/brands.json";

/*
 * Brand marks: simple-icons (CC0) + devicon (MIT) for Azure / Azure DevOps / AWS.
 * Concept icons (no brand exists) are drawn here in the same weight.
 */
const CONCEPTS = {
    eu: <>{Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <circle key={i} cx={12 + Math.cos(a) * 8} cy={12 + Math.sin(a) * 8} r="1.25" fill="currentColor" stroke="none" />; })}</>,
    gdpr: <><path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6z" /><rect x="9" y="11" width="6" height="5" rx="1" /><path d="M10 11V9.5a2 2 0 0 1 4 0V11" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6z" /><path d="m9 12 2 2 4-4" /></>,
    risk: <><path d="M12 3.5 21 19H3z" /><path d="M12 9.5v4.5M12 16.5h.01" /></>,
    lineage: <><circle cx="5" cy="6" r="2.2" /><circle cx="5" cy="18" r="2.2" /><circle cx="19" cy="12" r="2.2" /><path d="M7.2 6.6c4 .8 5 4.2 9.6 5M7.2 17.4c4-.8 5-4.2 9.6-5" /></>,
    ledger: <><rect x="3" y="8" width="5" height="8" rx="1.2" /><rect x="10" y="8" width="5" height="8" rx="1.2" /><rect x="17" y="8" width="4" height="8" rx="1.2" /><path d="M8 12h2M15 12h2" /></>,
    tag: <><path d="M3 12V4h8l10 10-8 7z" /><circle cx="7.5" cy="8" r="1.4" /></>,
    human: <><circle cx="12" cy="7" r="3" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /><path d="M19 4.5a4 4 0 0 1 0 5M5 4.5a4 4 0 0 0 0 5" /></>,
    eval: <><path d="M4 16a8 8 0 1 1 16 0" /><path d="M12 16l4-5" /><path d="M4 20h16" /></>,
    tool: <path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l-9 9a2 2 0 0 1-2.8-2.8l9-9a4 4 0 0 1-2.1-2.1z" />,
    rag: <><path d="M6 3h8l4 4v6" /><path d="M6 3v17h6" /><circle cx="16.5" cy="17.5" r="3" /><path d="m18.8 19.8 2.2 2.2" /></>,
    etl: <><path d="M3 5h18l-7 8v6l-4 2v-8z" /></>,
    database: <><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></>,
    vector: <><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13" /><circle cx="9" cy="12" r="1" /><circle cx="14" cy="11" r="1" /><circle cx="12" cy="16" r="1" /></>,
    agent: <><rect x="4" y="7" width="16" height="12" rx="3.5" /><path d="M12 7V4M9 12h.01M15 12h.01M9.5 15.5h5" /><circle cx="12" cy="3.5" r=".9" /></>,
    docs: <><path d="M7 3h7l4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M14 3v4h4M8.5 12h7M8.5 15.5h7" /></>,
    stream: <path d="M3 8c3-3 6 3 9 0s6 3 9 0M3 13c3-3 6 3 9 0s6 3 9 0M3 18c3-3 6 3 9 0s6 3 9 0" />,
    answer: <><path d="M4 5h16v11H9l-5 4z" /><path d="m9 10.5 2 2 4-4" /></>,
    catalog: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6" /></>,
    sql: <><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13" /><path d="M9 12.5h6M9 16h4" /></>,
    grad: <><path d="M2 9.5 12 5l10 4.5-10 4.5z" /><path d="M6 11.5v4.5c3.5 2.7 8.5 2.7 12 0v-4.5M22 9.5v5" /></>,
};

const dark = hex => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.22;
};

export default function Logo({ n, size = 22, mono = false, title }) {
    const b = BRANDS[n];
    if (b) {
        const fill = mono || dark(b.c) ? "currentColor" : b.c;
        return (
            <svg className="logo" width={size} height={size} viewBox={b.vb} role="img" aria-label={title || b.t}>
                {b.d.map((d, i) => <path key={i} d={d} fill={fill} />)}
            </svg>
        );
    }
    const c = CONCEPTS[n];
    if (!c) return null;
    return (
        <svg className="logo" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} aria-label={title}>
            {c}
        </svg>
    );
}
