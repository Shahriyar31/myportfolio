/*
 * Colour-temperature theme.
 * The site has two moods — Bengal (warm) and Hamburg (cool) — and the
 * journey section blends between them as the story travels. `warmth`
 * 0 = Hamburg, 1 = Bengal. Everything reads CSS variables, so a single
 * call re-tints the whole page, including neumorphic shadows.
 */

const PALETTES = {
    dark: {
        cool: { bg: "#222a34", fg: "#e9eef3", mute: "#9ba7b4", dim: "#5f6b78", accent: "#73d4ff", sky: "#0e1622", horizon: "#2e4257" },
        warm: { bg: "#2c241f", fg: "#f4eadf", mute: "#bda996", dim: "#7c6b5c", accent: "#ffb547", sky: "#1c120e", horizon: "#5b3a26" },
        // halfway through the flight: dusk, so warm → cool passes through a sunset instead of mud
        mid: { bg: "#2a2230", fg: "#f1e8f0", mute: "#b3a3b6", dim: "#6f6275", accent: "#ff86b6", sky: "#170f1c", horizon: "#4c2c47" },
    },
    light: {
        cool: { bg: "#e2e7ed", fg: "#18212c", mute: "#566474", dim: "#98a4b1", accent: "#0a7fb4", sky: "#9fc3e3", horizon: "#e9eff5" },
        warm: { bg: "#ecdfd3", fg: "#2b1e15", mute: "#7b6453", dim: "#b39c88", accent: "#b85f0c", sky: "#e2b48c", horizon: "#f6e6d4" },
        mid: { bg: "#ebdfe6", fg: "#2a1c28", mute: "#7a6275", dim: "#b09aab", accent: "#c0427a", sky: "#d9a9c4", horizon: "#f5e5ef" },
    },
};

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => "#" + a.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));

let mode = "dark";
let warmth = 0;
let current = { ...PALETTES.dark.cool };
const listeners = new Set();

function apply() {
    const p = PALETTES[mode];
    // cool → mid → warm, piecewise
    const [a, b, t] = warmth < 0.5 ? [p.cool, p.mid, warmth * 2] : [p.mid, p.warm, (warmth - 0.5) * 2];
    current = Object.fromEntries(Object.keys(p.cool).map(k => [k, mix(a[k], b[k], t)]));
    const s = document.documentElement.style;
    s.setProperty("--bg", current.bg);
    s.setProperty("--fg", current.fg);
    s.setProperty("--mute", current.mute);
    s.setProperty("--dim", current.dim);
    s.setProperty("--accent", current.accent);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", current.bg);
    listeners.forEach(fn => fn(current, mode));
}

export function setMode(m) { mode = m; apply(); }
export function setWarmth(w) {
    const next = Math.round(Math.min(1, Math.max(0, w)) * 100) / 100;
    if (next === warmth) return;
    warmth = next;
    apply();
}
export const getPalette = () => current;
export const getMode = () => mode;
export function onPalette(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export const rgb = h => hex(h).map(v => v / 255);
