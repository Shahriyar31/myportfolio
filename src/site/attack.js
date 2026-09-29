import { useSyncExternalStore } from "react";
import { inputShield, outputScan } from "../../api/_guard.js";

/* "Break my AI" — client state. The server runs the real defence layers (api/attack.js);
   if it can't be reached, the rule layer runs here so the demo still works offline. */

export const LAYERS = [
    ["input", "Input shield", "rules · PII masking"],
    ["judge", "AI judge", "small model checks intent"],
    ["model", "My AI", "answers from my profile"],
    ["output", "Output scan", "catches leaks"],
];
const load = () => { try { return JSON.parse(localStorage.getItem("bma") || "") || { tries: 0, blocked: 0 }; } catch { return { tries: 0, blocked: 0 }; } };
let state = { busy: false, result: null, text: "", ...load() };
const subs = new Set();
const set = p => { state = { ...state, ...p }; subs.forEach(f => f()); };
export const useAttack = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => state);

async function offline(text) {
    const shield = inputShield(text), layers = [{ id: "input", ...shield }];
    if (shield.status === "block") return { verdict: "blocked", at: "input", layers, offline: true };
    layers.push({ id: "judge", status: "skip", detail: "Offline — judge skipped" });
    const reply = "My live model is offline right now — but your message got past the rule layer. Try a sneakier one when I'm back, or email Farhan.";
    layers.push({ id: "model", status: "pass", detail: "Offline reply" }, { id: "output", ...outputScan(reply) });
    return { verdict: "answered", at: null, layers, reply, offline: true };
}

/** Sends one attempt. The scene animates while this runs; `result` resolves the animation. */
export async function attack(text) {
    text = text.trim();
    if (!text || state.busy) return null;
    set({ busy: true, text, result: null });
    let r = null;
    try {
        const res = await fetch("/api/attack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
        const j = await res.json().catch(() => null);
        if (j?.layers && (res.ok || res.status === 429)) r = j;
    } catch { /* offline below */ }
    if (!r) r = await offline(text);
    return r;
}
/** Everyone's totals (needs the Redis store on Vercel; silently absent otherwise). */
export async function loadStats() {
    try { const j = await (await fetch("/api/stats")).json(); if (j?.available) set({ global: j }); } catch { /* no stats */ }
}
/** Called when the animation has shown the outcome. */
export function settle(r) {
    const tries = state.tries + 1, blocked = state.blocked + (r.verdict === "blocked" ? 1 : 0);
    try { localStorage.setItem("bma", JSON.stringify({ tries, blocked })); } catch { /* private mode */ }
    set({ busy: false, result: r, tries, blocked });
    if (!r.offline) setTimeout(loadStats, 1500);
}
