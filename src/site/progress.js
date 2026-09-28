import { useSyncExternalStore } from "react";

/* The visitor's shift: which incidents they solved (or skipped) and their scores. Survives reloads. */
const KEY = "shift";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; } };
let state = load();
const subs = new Set();
export const useProgress = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => state);
/** status: "solved" | "skipped"; extra: e.g. { score: "4/5" } */
export function mark(id, status, extra = {}) {
    if (state[id]?.status === "solved" && status === "skipped") return;
    state = { ...state, [id]: { status, ...extra } };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ }
    subs.forEach(f => f());
}
