import { limited, ipOf } from "./_store.js";

/*
 * POST /api/chat  { messages: [{ role: "user" | "assistant", content }] }
 * → { answer, sources: [{ title, section, file }], actions: [{ type, … }], model, trace: [{ step, ms, detail }] }
 * A LangGraph agent with LangChain tools, grounded in data/knowledge; see api/_agent.js.
 * "actions" are page actions (scroll, open, fill the letter) that the visitor's browser performs; nothing is ever sent.
 *
 * GET /api/chat → a health check: is the model key set, do the agent and the RAG pipeline load (never shows the key).
 * The modules are loaded lazily, so if the agent can't load the grounded RAG pipeline still answers.
 */
const load = async () => {
    try { return { run: (await import("./_agent.js")).runAgent, via: "agent" }; }
    catch (e) {
        console.error("chat: agent failed to load:", e?.stack || e);
        const { answer } = await import("./_rag.js");
        return { run: clean => answer(clean.at(-1).content.slice(0, 600), clean.slice(0, -1)).then(r => ({ ...r, actions: [] })), via: "rag", error: String(e?.message || e).slice(0, 200) };
    }
};

export default async function handler(req, res) {
    if (req.method === "GET") {
        const m = await load().catch(e => ({ via: "none", error: String(e?.message || e).slice(0, 200) }));
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ ok: m.via !== "none", groqKey: Boolean(process.env.GROQ_API_KEY), pipeline: m.via, ...(m.error ? { error: m.error } : {}), node: process.version });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (await limited("chat", ipOf(req), 30)) return res.status(429).json({ error: "You're asking a lot of great questions! Please wait a few minutes and try again." });

    const msgs = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const clean = msgs.slice(-12)
        .filter(m => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
        .map((m, i, all) => ({ role: m.role, content: m.content.trim().slice(0, i === all.length - 1 ? 4000 : 1500) })); // the latest may be a pasted job ad
    const last = clean[clean.length - 1];
    if (!last || last.role !== "user") return res.status(400).json({ error: "Please send a question." });

    try {
        const { run } = await load();
        const out = await run(clean);
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json(out);
    } catch (e) {
        console.error("chat:", e?.stack || e);
        return res.status(500).json({ error: "Something went wrong on my side. Please try again, or email shahriyarfarhan3101@gmail.com." });
    }
}
