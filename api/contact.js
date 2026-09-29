import { limited, ipOf } from "./_store.js";

/*
 * The letter on my desk: delivers a visitor's message straight to my inbox.
 * With RESEND_API_KEY set it sends through Resend; otherwise it relays through
 * FormSubmit (no key needed; the first message asks me to confirm once by email).
 * CONTACT_TO overrides the address it goes to.
 */
const TO = process.env.CONTACT_TO || "shahriyarfarhan3101@gmail.com";
const clean = (v, n) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, n);

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (await limited("contact", ipOf(req), 5, 3600)) return res.status(429).json({ error: "Too many letters, please try again later" });

    const b = req.body ?? {};
    if (b.website) return res.status(200).json({ ok: true }); // a bot filled the hidden field
    const name = clean(b.name, 80), email = clean(b.email, 120), message = String(b.message ?? "").trim().slice(0, 2000);
    if (!message || message.length < 3) return res.status(400).json({ error: "Please write a message" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please add an email I can reply to" });
    const subject = `Portfolio letter from ${name || email}`;
    const text = `${message}\n\n— ${name || "(no name)"} · ${email}\nSent from the letter on farhanshahriyar.vercel.app`;

    try {
        if (process.env.RESEND_API_KEY) {
            const r = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({ from: process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>", to: [TO], reply_to: email, subject, text }),
            });
            if (!r.ok) throw new Error(`resend ${r.status}`);
        } else {
            const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json", Referer: "https://farhanshahriyar.vercel.app/", Origin: "https://farhanshahriyar.vercel.app" },
                body: JSON.stringify({ name: name || "(no name)", email, message, _subject: subject, _replyto: email, _template: "table", _captcha: "false" }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok || String(j.success) === "false") throw new Error(`relay ${r.status} ${j.message || ""}`);
        }
        return res.status(200).json({ ok: true });
    } catch (e) {
        console.error("contact:", e?.message);
        return res.status(502).json({ error: "Could not deliver right now" });
    }
}
