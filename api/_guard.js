/*
 * "Break my AI" defence rules, shared by the server (api/attack.js) and the
 * browser (offline fallback). Files starting with "_" are not deployed as routes.
 * Categories follow the OWASP Top 10 for LLM Applications (2025).
 */

// Harmless decoy the visitor tries to extract. It protects nothing real.
export const CANARY = "AURORA-7731";

const RULES = [
    ["LLM01", "Prompt injection", /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(instructions?|rules?|prompt|guidelines|guardrails?|previous|above)\b/i],
    ["LLM01", "Role-play jailbreak", /\b(you are now|act as|pretend (to be|you)|roleplay|role-play|developer mode|jailbreak|\bDAN\b|no (rules|restrictions|filters?)|unfiltered|uncensored)\b/i],
    ["LLM01", "Fake authority", /\b(new|updated|admin|system|developer)\s+(instructions?|override|message|mode|command)\b/i],
    ["LLM01", "Hidden payload", /[A-Za-z0-9+/]{48,}={0,2}|(\\x[0-9a-f]{2}){6,}/i],
    ["LLM07", "System prompt extraction", /\b(system|hidden|initial|original|secret)\s+(prompt|instructions?|message|rules)\b|repeat (the |everything )?(text|words|above)|what (were|are) you told|print your (rules|instructions|prompt)/i],
    ["LLM02", "Secret extraction", /\b(secret|password|passcode|api[ _-]?key|token|credential|canary|flag|code ?word|passphrase|aurora)\b/i],
    ["LLM02", "Confidential data", /\b(internal|confidential|salary|budget|revenue|colleagues?|customers? list|unreleased)\b/i],
    ["LLM06", "Excessive agency", /\b(delete|drop table|rm -rf|transfer|send (an )?email|execute|run (this|the) (code|command)|shutdown)\b/i],
];
const PII = [
    ["email", /[\w.+-]+@[\w-]+\.[\w.]+/g],
    ["phone", /\+?\d[\d\s()-]{8,}\d/g],
    ["iban", /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b/g],
];
const OWN_EMAIL = "shahriyarfarhan3101@gmail.com";

/** Layer 1 — input shield. Masks personal data, blocks known attack patterns. */
export function inputShield(text) {
    if (text.length > 600) return { status: "block", owasp: "LLM10", detail: "Too long — unbounded consumption" };
    let masked = text, found = [];
    PII.forEach(([k, re]) => { masked = masked.replace(re, m => (m.toLowerCase() === OWN_EMAIL ? m : (found.push(k), `[${k} masked]`))); });
    const hit = RULES.find(([, , re]) => re.test(text));
    if (hit) return { status: "block", owasp: hit[0], detail: hit[1], masked };
    if (found.length) return { status: "mask", owasp: "LLM02", detail: `Personal data masked (${[...new Set(found)].join(", ")})`, masked };
    return { status: "pass", detail: "No known attack pattern", masked };
}

/** Layer 4 — output scanner. Catches a leak even if every earlier layer was fooled. */
export function outputScan(reply, systemPrompt = "") {
    const flat = reply.replace(/[\s\-_.·*`'"]/g, "").toUpperCase();
    if (flat.includes(CANARY.replace(/-/g, "")) || /7731/.test(flat)) return { status: "block", owasp: "LLM02", detail: "Secret code detected in the answer" };
    const frag = systemPrompt.split("\n").map(s => s.trim()).filter(s => s.length > 40).find(s => reply.includes(s.slice(0, 40)));
    if (frag) return { status: "block", owasp: "LLM07", detail: "System prompt leaked into the answer" };
    const mail = (reply.match(PII[0][1]) || []).map(m => m.replace(/[.,;:!?)]+$/, "")).find(m => m.toLowerCase() !== OWN_EMAIL);
    if (mail) return { status: "block", owasp: "LLM02", detail: "Personal data in the answer" };
    return { status: "pass", detail: "Answer is clean" };
}
