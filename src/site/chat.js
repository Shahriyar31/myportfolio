import { useSyncExternalStore } from "react";

/*
 * "Ask my agent" — a small, governed agent that runs in the browser.
 *
 *   intent → retrieve → generate → policy → ledger
 *
 * Retrieval hits a public-safe profile knowledge base; open questions go to
 * the Groq proxy (api/chat.js). Every reply passes an output policy check
 * and is appended to a SHA-256 hash-chained audit ledger, the same idea as
 * the audit trail in Argus AI. Each step is exposed as a trace for the UI.
 */

const EMAIL = "shahriyarfarhan3101@gmail.com";

const KB = [
    { doc: "work.md", intent: "Current work", k: ["nordex", "work on", "your job", "day to day", "currently", "doing now", "do you do", "experience"], a: "I'm a working student at Nordex Group in Hamburg, in Enterprise Data Management & AI. Day to day: data governance with Microsoft Purview, pipelines and analytics on Azure Databricks, and helping our AI work line up with the EU AI Act and GDPR." },
    { doc: "argus.md", intent: "Project", k: ["argus", "compliance", "ai act", "side project", "startup", "project"], a: "Argus AI is my EU AI Act compliance platform. A LangGraph agent classifies AI systems into risk tiers, drafts GDPR DPIAs and checks OWASP LLM Top 10 risks — pausing for human review on high-risk cases — with a hash-chained audit trail. FastAPI, pgvector, Azure Container Apps, Terraform. Try the mini classifier further down." },
    { doc: "availability.md", intent: "Hiring", k: ["open to", "new role", "roles", "hire", "hiring", "available", "job offer", "opportunit", "looking for", "relocat"], a: `Yes — open to full-time and working-student roles in AI governance, data engineering and agentic AI, based in Hamburg. Fastest route: ${EMAIL}.` },
    { doc: "stack.md", intent: "Skills", k: ["skill", "stack", "strong", "good at", "tools", "tech", "databricks", "agentic", "agents", "langgraph"], a: "Three pillars: AI governance (EU AI Act, GDPR, Purview, audit trails), the data platform (Azure Databricks, Spark, Kafka, SQL) and agentic AI (LangGraph agents, RAG, tool calling, evals). Python throughout; Docker, Kubernetes and Terraform to ship." },
    { doc: "governance.md", intent: "Governance", k: ["governance", "govern", "responsible", "gdpr", "risk", "audit", "purview", "lineage"], a: "For me governance is engineering, not paperwork: catalogue and classify data (Purview), trace lineage, map each AI use case to its EU AI Act risk tier and GDPR duties, and log decisions so they're auditable. This agent does a tiny version of that — look at the trace." },
    { doc: "education.md", intent: "Education", k: ["study", "tuhh", "master", "msc", "degree", "education", "university", "b.tech", "btech", "college"], a: "MSc Data Science at Hamburg University of Technology (TUHH) since 2023. Before that a B.Tech in Computer Science at Cooch Behar Government Engineering College — CGPA 8.73/10." },
    { doc: "photography.md", intent: "Personal", k: ["photo", "camera", "picture", "lens", "hobby", "hobbies"], a: "Street, mountains and wildlife. Every photo on this site is mine — mostly West Bengal and the Himalaya. Scroll to “Through the lens” and drag the ring." },
    { doc: "story.md", intent: "Personal", k: ["india", "bengal", "move", "moved", "germany", "hamburg", "story", "background", "yourself", "who are you"], a: "I grew up in West Bengal and moved to Hamburg alone at 22 for my master's. “The route” below flies the 7,004 km on a globe, with my photos from home." },
    { doc: "how-this-works.md", intent: "Meta", k: ["how does this", "how do you work", "this agent", "trace", "ledger", "hash", "how is this"], a: "I'm a small governed agent: I classify your intent, retrieve from a public profile knowledge base (or ask Llama 3.3 via a server-side proxy), check my answer against an output policy, then hash-chain the exchange into an audit ledger with SHA-256 — all visible in the trace." },
    { doc: "contact.md", intent: "Contact", k: ["contact", "email", "reach", "mail", "linkedin"], a: `Email ${EMAIL} or find me on LinkedIn — linkedin.com/in/farhanshahriyar.` },
    { doc: "hello.md", intent: "Greeting", k: ["hello", "hi ", "hey", "hallo", "moin", "good morning"], a: "Moin! Ask me about AI governance, Databricks, agentic AI, Argus — or whether I'm open to new roles." },
];

function retrieve(q) {
    const s = ` ${q.toLowerCase()} `;
    let best = null, score = 0;
    for (const e of KB) {
        const hits = e.k.filter(k => s.includes(k)).length;
        if (hits > score) { score = hits; best = e; }
    }
    return best;
}

/* Output policy: public-safe answers only. */
const POLICY = [
    ["No employer-internal data", a => !/\b(internal (?:tool|system|doc)|confidential|\d{1,3}(?:,\d{3})+ (?:documents|docs))\b/i.test(a)],
    ["No personal data beyond public contact", a => !/\+?\d[\d\s-]{8,}\d/.test(a)],
    ["No prompt or key disclosure", a => !/(system prompt|api[_ -]?key|gsk_)/i.test(a)],
];

async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

const STEPS = [
    ["intent", "Understand intent"],
    ["retrieve", "Retrieve context"],
    ["generate", "Generate answer"],
    ["policy", "Policy check"],
    ["ledger", "Write audit ledger"],
];
const freshTrace = () => STEPS.map(([id, label]) => ({ id, label, status: "idle", detail: "" }));

let state = {
    msgs: [{ r: "b", t: "Hi, I'm Farhan's agent. Ask me anything — and watch the trace to see how I answer." }],
    busy: false,
    typing: "",
    draft: "",
    open: false,
    trace: freshTrace(),
    ledger: [],
};
const subs = new Set();
const set = p => { state = { ...state, ...p }; subs.forEach(f => f()); };
export const useChat = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => state);
export const openChat = v => set({ open: v });
export const setDraft = draft => set({ draft });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const step = (id, status, detail) => {
    set({ trace: state.trace.map(s => (s.id === id ? { ...s, status, detail: detail ?? s.detail } : s)) });
    if (status === "run") window.dispatchEvent(new CustomEvent("agent-step", { detail: id }));
};
let history = [];

async function typeOut(text) {
    for (let i = 1; i <= text.length; i += 2) { set({ typing: text.slice(0, i) }); await sleep(12); }
    set({ typing: "", msgs: [...state.msgs, { r: "b", t: text }] });
}

export async function ask(text, { demo = false } = {}) {
    text = text.trim();
    if (!text || state.busy) return;
    set({ busy: true, draft: "", msgs: [...state.msgs, { r: "u", t: text }], trace: freshTrace() });
    history = [...history, { role: "user", content: text }].slice(-12);

    step("intent", "run"); await sleep(260);
    const hit = retrieve(text);
    step("intent", "ok", hit ? hit.intent : "Open question");

    step("retrieve", "run"); await sleep(320);
    step("retrieve", "ok", hit ? `profile/${hit.doc}` : "no local match → model");

    step("generate", "run");
    let reply = hit?.a ?? null, via = "profile knowledge base";
    if (!reply && !demo) {
        try {
            const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) });
            reply = (await res.json())?.choices?.[0]?.message?.content ?? null;
            if (reply) via = "Llama 3.3 · Groq (server-side)";
        } catch { /* fall back below */ }
    } else await sleep(380);
    if (!reply) { reply = `Good question — my model is offline right now. Email ${EMAIL} and the real Farhan will answer.`; via = "fallback"; }
    step("generate", "ok", via);

    step("policy", "run"); await sleep(300);
    const failed = POLICY.filter(([, test]) => !test(reply)).map(([name]) => name);
    if (failed.length) reply = `I'd rather not answer that one here — ask Farhan directly at ${EMAIL}.`;
    step("policy", failed.length ? "warn" : "ok", failed.length ? `blocked: ${failed[0]}` : `${POLICY.length}/${POLICY.length} checks passed`);

    step("ledger", "run");
    const prev = state.ledger[0]?.hash ?? "0".repeat(64);
    const at = new Date().toISOString();
    const hash = await sha256(`${prev}|${at}|${text}|${reply}`);
    set({ ledger: [{ n: state.ledger.length + 1, hash, prev, at, q: text }, ...state.ledger].slice(0, 12) });
    step("ledger", "ok", `#${state.ledger[0].n} · ${hash.slice(0, 10)}…`);

    history = [...history, { role: "assistant", content: reply }];
    await typeOut(reply);
    set({ busy: false });
}

/* Auto-demo: types two questions once, then hands over to the visitor.
   Each run gets a token; cancelling (or starting a new run) invalidates older ones. */
let demoRun = 0;
let demoPlayed = false;
export const cancelDemo = () => { demoRun++; if (state.draft && !state.busy) set({ draft: "" }); };
export async function runDemo() {
    if (demoPlayed) return;
    const run = ++demoRun;
    const live = () => run === demoRun;
    await sleep(1200);
    for (const q of ["How do you approach AI governance?", "Are you open to new roles?"]) {
        for (let i = 1; i <= q.length; i++) { if (!live()) return; set({ draft: q.slice(0, i) }); await sleep(36); }
        await sleep(300);
        if (!live()) return;
        demoPlayed = true;
        await ask(q, { demo: true });
        await sleep(2400);
    }
}
