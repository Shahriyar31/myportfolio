/*
 * Text helpers shared by the knowledge-base builder (scripts/build-kb.mjs) and the
 * retriever (api/_rag.js), so indexing and searching always tokenise the same way.
 */
const STOP = new Set("a an and are as at be but by can could did do does for from had has have he her his how i if in into is it its just me my of on or our she so than that the their them then there these they this to up was we were what when where which who why will with would you your yours about also any been being both each more most other some such only own same too very s t don now farhan farhans shahriyar tell please much many".split(" "));
// a light stemmer: good enough to match "projects"/"project", "working"/"work", "studied"/"study"
const stem = w => w.length > 4 ? w.replace(/(ies)$/, "y").replace(/(ing|ed|es|s)$/, "") : w;
// a few words people use for the same thing
const SYN = { job: "work", career: "work", employer: "nordex", company: "nordex", hire: "hiring", hired: "hiring", recruit: "hiring", available: "availability", availab: "availability", reach: "contact", email: "contact", mail: "contact", degree: "education", university: "education", uni: "education", college: "education", studie: "education", study: "education", master: "msc", bachelor: "btech", paper: "preprint", publication: "preprint", publish: "preprint", hobby: "personal", hobbie: "personal", speak: "language", german: "language", photo: "photography", picture: "photography", tech: "skill", tool: "skill", stack: "skill", strength: "skill", strong: "skill" };
export function tokens(text) {
    return String(text || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
        .split(/[^a-z0-9]+/).filter(w => w && !STOP.has(w)).map(stem).map(w => SYN[w] || w);
}
