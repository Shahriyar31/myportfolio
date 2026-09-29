/*
 * Tiny Redis client over Upstash's REST API (no dependency). Works once an Upstash Redis
 * store is connected to the Vercel project (it sets KV_REST_API_URL / KV_REST_API_TOKEN).
 * Without it, rate limiting falls back to per-instance memory and stats return null.
 */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const hasStore = Boolean(URL_ && TOKEN);

async function pipeline(cmds) {
    const r = await fetch(`${URL_}/pipeline`, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(cmds) });
    if (!r.ok) throw new Error(`store ${r.status}`);
    return (await r.json()).map(x => x.result);
}

const mem = new Map();
/** true when this ip has used up `limit` requests in the current window */
export async function limited(scope, ip, limit, windowSec = 600) {
    const bucket = Math.floor(Date.now() / 1000 / windowSec), key = `rl:${scope}:${ip}:${bucket}`;
    if (hasStore) {
        try { const [n] = await pipeline([["INCR", key], ["EXPIRE", key, String(windowSec)]]); return n > limit; } catch { /* fall back to memory */ }
    }
    const n = (mem.get(key) || 0) + 1; mem.set(key, n);
    if (mem.size > 5000) mem.clear();
    return n > limit;
}

/** shared "Break my AI" counters */
export async function record(verdict, at) {
    if (!hasStore) return;
    const cmds = [["HINCRBY", "bma", "tries", "1"]];
    if (verdict === "blocked") cmds.push(["HINCRBY", "bma", "blocked", "1"], ["HINCRBY", "bma", `at:${at}`, "1"]);
    try { await pipeline(cmds); } catch { /* counters are best-effort */ }
}
export async function stats() {
    if (!hasStore) return null;
    try {
        const [flat] = await pipeline([["HGETALL", "bma"]]), o = {};
        for (let i = 0; i < (flat || []).length; i += 2) o[flat[i]] = Number(flat[i + 1]);
        return o;
    } catch { return null; }
}

export const ipOf = req => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
