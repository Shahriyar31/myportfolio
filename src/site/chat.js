import { useSyncExternalStore } from "react";
import { scrollToId } from "./hooks";

/*
 * "Ask my AI": the browser side of a grounded agent.
 *
 *   server (api/chat.js → api/_agent.js, a LangGraph agent with LangChain tools):
 *     guard → agent ⇄ tools (search_notes, match_job, show_section, open_project, open_resume,
 *     open_quick_read, draft_letter) → verify; the RAG pipeline in api/_rag.js is the fallback
 *   browser: shows that trace, keeps a short history for follow-ups, re-checks the answer
 *   against a public-safety policy, appends it to a SHA-256 hash-chained audit ledger,
 *   then performs the page actions the agent asked for. Nothing is ever sent for the visitor.
 */

const EMAIL = "shahriyarfarhan3101@gmail.com";

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
    msgs: [{ r: "b", t: "Hi, I'm Farhan's AI assistant! I answer from his own notes: ask about his work, projects or research, paste a job description to see how he fits, or ask me to show you something on the site." }],
    busy: false,
    typing: "",
    draft: "",
    open: false,
    trace: freshTrace(),
    ledger: [],
    tools: [], // the agent tools used for the latest answer, from the server's real trace
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

async function typeOut(text, src = []) {
    const n = text.length > 280 ? 4 : 2;
    for (let i = 1; i <= text.length; i += n) { set({ typing: text.slice(0, i) }); await sleep(12); }
    set({ typing: "", msgs: [...state.msgs, { r: "b", t: text, src }] });
}

const SERVER_STEP = { guard: "intent", rewrite: "intent", agent: "intent", retrieve: "retrieve", tools: "retrieve", generate: "generate", refuse: "generate", verify: "policy" };

/* page actions the agent may request; each one only scrolls, opens or pre-fills, never sends */
const ACTIONS = {
    section: a => typeof a.id === "string" && /^[a-z]+$/.test(a.id) && scrollToId(a.id),
    project: a => Number.isInteger(a.id) && dispatchEvent(new CustomEvent("open-project", { detail: a.id })),
    resume: () => dispatchEvent(new Event("open-cv")),
    quick_read: () => dispatchEvent(new Event("quick-read")),
    letter: a => typeof a.message === "string" && dispatchEvent(new CustomEvent("draft-letter", { detail: { message: a.message.slice(0, 1200), name: String(a.name || "").slice(0, 80), email: String(a.email || "").slice(0, 120) } })),
};
function perform(actions) {
    const list = (Array.isArray(actions) ? actions : []).filter(a => ACTIONS[a?.type]).slice(0, 2);
    if (!list.length) return;
    if (innerWidth < 760 && list.some(a => a.type !== "quick_read" && a.type !== "resume")) openChat(false); // on a phone the panel would hide what we scroll to
    list.forEach((a, i) => setTimeout(() => ACTIONS[a.type](a), 350 + i * 900));
}
export async function ask(text) {
    text = text.trim();
    if (!text || state.busy) return;
    set({ busy: true, draft: "", msgs: [...state.msgs, { r: "u", t: text }], trace: freshTrace(), tools: [] });
    history = [...history, { role: "user", content: text }].slice(-12);
    ["intent", "retrieve", "generate"].forEach(id => step(id, "run"));

    let reply = null, sources = [], server = [], actions = [], via = "fallback";
    try {
        const ac = new AbortController(), t = setTimeout(() => ac.abort(), 25000);
        const res = await fetch("/api/chat", { method: "POST", signal: ac.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) });
        clearTimeout(t);
        const j = await res.json().catch(() => ({}));
        if (res.ok && j.answer) { reply = j.answer; sources = j.sources || []; server = j.trace || []; actions = j.actions || []; via = j.model || "model"; }
        else if (j.error) reply = j.error;
    } catch { /* offline: handled below */ }
    if (!reply) reply = `I can't reach my notes right now. Please try again in a moment, or email ${EMAIL} and the real Farhan will answer.`;

    set({ tools: [...new Set(server.filter(s => s.step === "tools").flatMap(s => [...String(s.detail).matchAll(/\b([a-z_]+)\(/g)].map(m => m[1])))] });
    // replay the server's real trace, one step at a time
    const detail = { intent: [], retrieve: [], generate: [], policy: [] };
    server.forEach(s => SERVER_STEP[s.step] && detail[SERVER_STEP[s.step]].push(s.detail));
    for (const id of ["intent", "retrieve", "generate"]) { step(id, "ok", detail[id].filter(Boolean).join(" · ") || (id === "generate" ? via : "—")); await sleep(140); }

    step("policy", "run"); await sleep(160);
    const failed = POLICY.filter(([, test]) => !test(reply)).map(([name]) => name);
    if (failed.length) reply = `I'd rather not answer that one here. Please ask me directly at ${EMAIL}.`;
    step("policy", failed.length ? "warn" : "ok", failed.length ? `blocked: ${failed[0]}` : [detail.policy[0] ? `server ${detail.policy[0]}` : "", `${POLICY.length}/${POLICY.length} browser checks`].filter(Boolean).join(" · "));

    step("ledger", "run");
    const prev = state.ledger[0]?.hash ?? "0".repeat(64);
    const at = new Date().toISOString();
    const hash = await sha256(`${prev}|${at}|${text}|${reply}`);
    set({ ledger: [{ n: state.ledger.length + 1, hash, prev, at, q: text }, ...state.ledger].slice(0, 12) });
    step("ledger", "ok", `#${state.ledger[0].n} · ${hash.slice(0, 10)}…`);

    history = [...history, { role: "assistant", content: reply }].slice(-12);
    await typeOut(reply, failed.length ? [] : sources);
    set({ busy: false });
    if (!failed.length) perform(actions);
}

/* "Paste a job ad": open the assistant ready for a job description */
export function startJobFit() {
    cancelDemo();
    const hint = "Paste the job description below and press send. I'll compare it with my notes and tell you honestly what matches, and what my notes don't mention.";
    if (state.msgs.at(-1)?.t !== hint) set({ msgs: [...state.msgs, { r: "b", t: hint }] });
    openChat(true);
    setTimeout(() => dispatchEvent(new Event("focus-dock")), 320);
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
    for (const q of ["What does Farhan do?", "What value can he bring to my team?"]) {
        for (let i = 1; i <= q.length; i++) { if (!live()) return; set({ draft: q.slice(0, i) }); await sleep(36); }
        await sleep(300);
        if (!live()) return;
        demoPlayed = true;
        await ask(q);
        await sleep(2400);
    }
}
