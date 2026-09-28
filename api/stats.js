import { stats } from "./_store.js";

/* Everyone's "Break my AI" totals, for the counter on the front door. */
export default async function handler(req, res) {
    const s = await stats();
    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=60");
    if (!s) return res.status(200).json({ available: false });
    return res.status(200).json({ available: true, tries: s.tries || 0, blocked: s.blocked || 0 });
}
