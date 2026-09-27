import { useSyncExternalStore } from "react";

/*
 * The game layer: XP for exploring, coins for skills collected, and
 * achievements for doing things. Pure fun on top of normal content —
 * nothing on the site is locked behind it.
 */

export const ACHIEVEMENTS = {
    start: { icon: "🎮", title: "Player one", text: "Started exploring Farhan's world" },
    map: { icon: "🗺️", title: "Cartographer", text: "Travelled using the world map" },
    breaker: { icon: "💥", title: "You broke the AI", text: "Switched a safeguard off" },
    boss: { icon: "🛡️", title: "Boss defeated", text: "Beat the Prompt-Injection monster" },
    chat: { icon: "💬", title: "Curious mind", text: "Asked Farhan's AI a question" },
    coins: { icon: "🪙", title: "Collector", text: "Collected every skill coin on the quest" },
    flip: { icon: "🎓", title: "Scholar", text: "Flipped a degree card" },
    photo: { icon: "📷", title: "Art critic", text: "Opened a photograph" },
    explorer: { icon: "🧭", title: "Explorer", text: "Visited half of the world" },
    complete: { icon: "🏆", title: "Completionist", text: "Visited every section" },
    hello: { icon: "✉️", title: "Let's talk", text: "Reached out to Farhan" },
};
export const SECTION_IDS = ["home", "map", "bring", "how", "work", "skills", "built", "quest", "education", "agent", "lens", "hello"];

const KEY = "fs-game";
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; } };
let state = load() || { xp: 0, coins: [], got: [], seen: [], toast: null };
state = { ...state, toast: null };
const subs = new Set();
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ ...state, toast: null })); } catch { /* private mode */ } };
const set = p => { state = { ...state, ...p }; save(); subs.forEach(f => f()); };
export const useGame = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => state);
export const getGame = () => state;

export const level = xp => Math.floor(xp / 250) + 1;
export const levelProgress = xp => (xp % 250) / 250;

let toastTimer;
export function unlock(id) {
    if (state.got.includes(id) || !ACHIEVEMENTS[id]) return;
    clearTimeout(toastTimer);
    set({ got: [...state.got, id], xp: state.xp + 150, toast: id });
    toastTimer = setTimeout(() => set({ toast: null }), 3600);
}
export function collect(coin, total) {
    if (state.coins.includes(coin)) return;
    const coins = [...state.coins, coin];
    set({ coins, xp: state.xp + 15 });
    if (total && coins.length >= total) unlock("coins");
}
export function visit(id) {
    if (state.seen.includes(id)) return;
    const seen = [...state.seen, id];
    set({ seen, xp: state.xp + 40 });
    if (seen.length === 2) unlock("start");
    if (seen.length >= Math.ceil(SECTION_IDS.length / 2)) unlock("explorer");
    if (SECTION_IDS.every(s => seen.includes(s))) unlock("complete");
}
export const explored = () => Math.round((state.seen.filter(s => SECTION_IDS.includes(s)).length / SECTION_IDS.length) * 100);
