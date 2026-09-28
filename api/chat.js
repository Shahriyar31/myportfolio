import { SYSTEM_PROMPT } from "./_prompt.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { messages } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid request" });
    }

    // Guard: max 20 messages to prevent abuse
    const capped = messages
        .slice(-20)
        .filter(m => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
        .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (capped.length === 0) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ error: "Chat not configured" });
    }

    try {
        const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: SYSTEM_PROMPT }, ...capped],
                max_tokens: 220,
                temperature: 0.72,
            }),
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch {
        return res.status(500).json({ error: "Failed to reach AI" });
    }
}
