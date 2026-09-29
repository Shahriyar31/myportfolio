/*
 * "You are the data." The visitor rides one data packet along a single route
 * through the valley. Scroll drives the packet: it travels to a stop, dwells
 * there while that stop's panel is on screen, then moves on.
 *
 * Shared between the 3D scene (packet + camera) and the page (panels).
 */

// Where the packet rests at each stop, the camera offset from it, and which side the panel sits on.
// color: the packet's state — raw (untrusted) → refined → governed → reasoned.
export const STAGES = [
    { id: "hero", at: [-7, 10.5, -3], cam: null, color: "#ff8a4c", w: 0.7 },
    { id: "ingest", at: [-9, 3.4, -5], cam: [7, 3, -2.2], color: "#ff8a4c", focus: null, side: 1, w: 1 },
    { id: "refine", at: [-4, 2.3, 1], cam: [-7.5, 4.8, 4.2], color: "#f5c542", focus: "lake", side: -1, w: 1 },
    { id: "govern", at: [3, 1.8, -1], cam: [7, 3.2, 7], color: "#3ee08f", focus: "gate", side: 1, w: 1.15 },
    { id: "reason", at: [9.5, 7.4, -2.8], cam: [7.5, 1.2, 9], color: "#b69cff", focus: "tower", side: -1, w: 1.1 },
];
// the path between the stops (passes the bronze → silver → gold terraces of the lake)
export const ROUTE = [
    [-7, 10.5, -3], [-9.6, 6.5, -6.4], [-9, 3.4, -5], [-7.6, 2.6, -2.4], [-6.3, 1.5, 0.3], [-5, 1.9, 0.8], [-4, 2.3, 1],
    [-1, 3.1, 0.5], [1.5, 2.4, -0.5], [3, 1.8, -1], [5.5, 3.2, -2], [8, 5.6, -3], [9.5, 7.4, -2.8],
];
const HERO_POSE = { p: [0, 25, 60], l: [0, 10, 0] };
const TRAVEL = 0.42; // share of each stop's scroll spent travelling; the rest is dwelling

// live state: the page writes p (0..1 through the runway), the world writes scene
export const J = { p: 0, scene: null, active: false };

const W = STAGES.reduce((s, x) => s + x.w, 0);
const START = STAGES.reduce((a, x, i) => (a.push(i ? a[i - 1] + STAGES[i - 1].w / W : 0), a), []);
const smooth = x => x * x * (3 - 2 * x);
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

/** Where are we? i = current stop, e = travel progress into it (1 = arrived), dwell = 0..1 while resting. */
export function frame(p) {
    let i = STAGES.length - 1;
    while (i > 0 && p < START[i]) i--;
    const local = Math.min(1, (p - START[i]) / (STAGES[i].w / W));
    const e = i === 0 ? 1 : local < TRAVEL ? smooth(local / TRAVEL) : 1;
    const dwell = i === 0 ? local : local < TRAVEL ? 0 : (local - TRAVEL) / (1 - TRAVEL);
    const a = STAGES[Math.max(0, i - 1)], b = STAGES[i];
    const [r1, g1, b1] = hex(a.color), [r2, g2, b2] = hex(b.color);
    const color = `rgb(${Math.round(r1 + (r2 - r1) * e)},${Math.round(g1 + (g2 - g1) * e)},${Math.round(b1 + (b2 - b1) * e)})`;
    return { i, e, dwell, color, side: i === 0 ? 0 : (a.side || 0) + ((b.side || 0) - (a.side || 0)) * e };
}

/** Scroll position (0..1) where stop i's panel is fully settled — used by "jump to" buttons. */
export const settleAt = i => START[i] + (STAGES[i].w / W) * (i === 0 ? 0 : TRAVEL + 0.08);

const poseOf = s => (s.cam ? { p: s.at.map((v, k) => v + s.cam[k]), l: s.at } : HERO_POSE);

/** Camera pose for scroll p. The packet position comes from the scene (u along the route). */
export function pose(p, packet) {
    const f = frame(p), a = STAGES[Math.max(0, f.i - 1)], b = STAGES[f.i];
    const A = poseOf(a), B = poseOf(b);
    // follow the packet between stops: offset both ends by how far it strays from the straight line
    const d = packet ? packet.map((v, k) => v - mix(a.at, b.at, f.e)[k]) : [0, 0, 0];
    const swoop = Math.sin(Math.PI * f.e) * (f.i === 1 ? 0 : 2.4);
    const l = mix(A.l, B.l, f.e).map((v, k) => v + d[k] * 0.8);
    const q = mix(A.p, B.p, f.e).map((v, k) => v + d[k] * 0.8 + (k === 1 ? swoop : 0));
    return { p: q, l, focus: f.e > 0.6 ? b.focus || null : a.focus || null, side: f.side, orbit: f.i === 0 ? 1 - f.dwell : 0 };
}

/** Route parameter (0..1 along the path) for each stop, filled in by the scene once the curve exists. */
export const STOP_U = [];
export const packetU = p => { const f = frame(p); return STOP_U.length ? STOP_U[Math.max(0, f.i - 1)] + (STOP_U[f.i] - STOP_U[Math.max(0, f.i - 1)]) * f.e : 0; };
