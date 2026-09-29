import { useSyncExternalStore } from "react";
import { scrollToId } from "./hooks";
import { PROJECTS } from "../data/constants";

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
    status: "", steps: [], // what the agent is doing right now, streamed from the server
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

async function typeOut(text, src = [], extra = {}) {
    const n = text.length > 280 ? 6 : 3;
    for (let i = 1; i <= text.length; i += n) { set({ typing: text.slice(0, i) }); await sleep(14); }
    set({ typing: "", msgs: [...state.msgs, { r: "b", t: text, src, ...extra }] });
}

/* the agent's real steps, in plain words: what the visitor sees while it works (never a canned "let me think") */
const VERB = { search_notes: "search my notes", match_job: "compare the job ad with my notes", show_section: "show you part of the site", open_project: "open a project", open_resume: "open my résumé", open_quick_read: "open the quick read", draft_letter: "write your letter" };
const argsOf = d => [...String(d || "").matchAll(/([a-z_]+)\(([^)]*)\)/g)].map(m => [m[1], m[2]]);
const DOING = { search_notes: a => `Searching my notes for “${a}”`, match_job: () => "Comparing the job ad with my notes", draft_letter: () => "Writing your letter", show_section: a => `Getting ${a} ready for you`, open_project: a => `Getting the ${a.replace(/-/g, " ")} project ready`, open_resume: () => "Getting my résumé", open_quick_read: () => "Getting the quick read" };
export function humanStep(s) {
    const d = String(s.detail || "");
    switch (s.step) {
        case "start": return "Reading your message";
        case "guard": return /^blocked/.test(d) ? "That looks like an attack on my instructions, so I'll decline" : "Message checked: safe to answer";
        case "agent-start": return s.turn > 1 ? "Reading what I found" : "Deciding which tools I need";
        case "agent": if (/^decided:/.test(d)) { const n = d.slice(9).split(",").map(x => VERB[x.trim()] || x.trim()); return `Decided to ${n.join(" and ")}`; } if (/unavailable|no model key/.test(d)) return "Switching to my backup pipeline"; return "Writing the answer";
        case "tools": return argsOf(d).map(([n, a]) => (DOING[n] || (() => n))(a.split(",")[0].trim())).join(" · ") || "Using my tools";
        case "rewrite": return "Understanding your follow-up";
        case "retrieve": return "Searching my notes";
        case "generate": return "Writing the answer";
        case "verify": return "Checking the answer against my safety policy";
        case "refuse": return "Declining politely";
        default: return "";
    }
}
function live(s) {
    const text = humanStep(s); if (!text) return;
    set({ status: text, steps: [...state.steps, text].slice(-6) });
    const id = SERVER_STEP[s.step]; if (id) step(id, "run", String(s.detail || "").slice(0, 80));
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
const SECTION_NAME = { home: "the start", what: "What I do", break: "Break my AI", experience: "my work at Nordex", research: "my research", projects: "my projects", journey: "my journey", skills: "my skills", lens: "my photography", contact: "the contact desk" };
/** what the agent is doing, in words: shown on the page while it happens and kept as a receipt under the answer */
export const describe = a => ({
    section: `scrolled to ${SECTION_NAME[a.id] || a.id}`,
    project: `opened ${PROJECTS.find(p => p.id === a.id)?.title || "a project"}`,
    resume: "opened my résumé",
    quick_read: "opened the quick read",
    letter: "drafted a letter for you to review",
})[a.type] || a.type;
const TARGET = { section: a => a.id, project: () => "projects", letter: () => "contact" };
function perform(list) {
    if (!list.length) return;
    if (innerWidth < 760 && list.some(a => a.type !== "quick_read" && a.type !== "resume")) openChat(false); // on a phone the panel would hide what we scroll to
    list.forEach((a, i) => setTimeout(() => {
        dispatchEvent(new CustomEvent("agent-act", { detail: { text: describe(a), target: TARGET[a.type]?.(a) } }));
        ACTIONS[a.type](a);
    }, 350 + i * 1100));
}
const validActions = actions => (Array.isArray(actions) ? actions : []).filter(a => ACTIONS[a?.type]).slice(0, 2);

/** redo one page action from a receipt under an answer */
export const redo = a => ACTIONS[a?.type] && perform([a]);

export async function ask(text) {
    text = text.trim();
    if (!text || state.busy) return;
    set({ busy: true, draft: "", msgs: [...state.msgs, { r: "u", t: text }], trace: freshTrace(), tools: [], status: "Reading your message", steps: ["Reading your message"] });
    history = [...history, { role: "user", content: text }].slice(-12);
    ["intent", "retrieve", "generate"].forEach(id => step(id, "run"));

    let reply = null, sources = [], server = [], actions = [], via = "fallback", why = "no connection";
    try {
        const ac = new AbortController(), t = setTimeout(() => ac.abort(), 30000);
        const res = await fetch("/api/chat", { method: "POST", signal: ac.signal, headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" }, body: JSON.stringify({ messages: history, stream: true }) });
        why = `server answered ${res.status}`;
        let j = {};
        if (res.ok && res.body && /ndjson/.test(res.headers.get("content-type") || "")) {
            // the agent's real steps arrive one line at a time while it works
            const rd = res.body.getReader(), dec = new TextDecoder(); let buf = "";
            for (;;) {
                const { value, done } = await rd.read(); if (done) break;
                buf += dec.decode(value, { stream: true });
                for (let i; (i = buf.indexOf("\n")) >= 0;) {
                    const ln = buf.slice(0, i); buf = buf.slice(i + 1);
                    let o; try { o = JSON.parse(ln); } catch { continue; }
                    if (o.type === "step") live(o); else if (o.type === "done") j = o; else if (o.type === "error") j = { error: o.error };
                }
            }
        } else j = await res.json().catch(() => ({}));
        clearTimeout(t);
        if (j.answer) { reply = j.answer; sources = j.sources || []; server = j.trace || []; actions = j.actions || []; via = j.model || "model"; }
        else if (j.error) reply = j.error;
    } catch (e) { why = e?.name === "AbortError" ? "timed out" : "no connection"; }
    set({ status: "", steps: [] });
    if (!reply) { console.warn("Ask my AI:", why); server = [{ step: "agent", detail: why }]; reply = `I can't reach my notes right now. Please try again in a moment, or email ${EMAIL} and the real Farhan will answer.`; }

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
    const acts = failed.length ? [] : validActions(actions);
    await typeOut(reply, failed.length ? [] : sources, { tools: state.tools, acts });
    set({ busy: false });
    perform(acts);
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
