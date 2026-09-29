/*
 * "Ask my AI" as a real agent: the model decides which tools to use, looks at the results and decides again,
 * until it can answer. LangChain gives the model (ChatGroq) and the tool definitions (zod schemas);
 * LangGraph runs the loop:
 *
 *   START → guard ─┬─ attack ─────────────────────────────→ refuse → END
 *                  └─ ok → agent ⇄ tools (at most MAX_TURNS) → verify → END
 *
 * Tools
 *   search_notes    retrieval over my knowledge base (data/knowledge)          runs on the server
 *   match_job       compares a pasted job description with my notes, honestly  runs on the server
 *   show_section    scrolls the site to a section                              runs in the visitor's browser
 *   open_project    opens a project card                                       runs in the visitor's browser
 *   open_resume     opens my résumé                                            runs in the visitor's browser
 *   open_quick_read opens the one-minute summary                               runs in the visitor's browser
 *   draft_letter    fills in the contact letter; the visitor reviews and sends  runs in the visitor's browser
 *
 * Browser tools never act on their own: the server only returns them as "actions" for the page to perform.
 * Nothing is ever sent on the visitor's behalf. If the agent can't run (no key, model error), the
 * grounded RAG pipeline in _rag.js answers instead.
 */
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { Annotation, MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { KB } from "./_kb.js";
import { retrieve, answer as ragAnswer, checkAnswer, PERSONA, REFUSAL, EMAIL, MODELS, groqKey, ready, modelOpts, budget } from "./_rag.js";
import { inputShield } from "./_guard.js";

const MAX_TURNS = 4, MAX_INPUT = 4000;
export const SECTIONS = ["home", "what", "break", "experience", "research", "projects", "journey", "skills", "lens", "contact"];
export const PROJECTS = { argus: 1, "radiation-tracker": 4, stockflow: 5, "poultry-shield": 3, "book-analysis": 6 };

/* ── tools (LangChain) ── */
const notes = docs => docs.map((d, i) => `[${i + 1}] ${d.title} — ${d.section}\n${d.text}`).join("\n\n");

// skills and requirements a job ad may ask for; each is checked against my notes, never guessed
const VOCAB = ["Python", "SQL", "Bash", "Java", "Scala", "Go", "TypeScript", "JavaScript", "React", "FastAPI", "Flask", "Django", "Azure", "AWS", "GCP", "Google Cloud", "Kubernetes", "Docker", "Terraform", "CI/CD", "GitHub Actions", "Azure DevOps", "Databricks", "Spark", "Kafka", "Flink", "Airflow", "dbt", "Snowflake", "PostgreSQL", "pgvector", "InfluxDB", "MongoDB", "RAG", "LLM", "LangChain", "LangGraph", "agents", "MCP", "OpenAI", "Azure OpenAI", "Azure AI Foundry", "Hugging Face", "PyTorch", "TensorFlow", "scikit-learn", "Pandas", "NumPy", "MLOps", "DVC", "evaluation", "RAGAS", "prompt engineering", "fine-tuning", "computer vision", "NLP", "EU AI Act", "GDPR", "NIST AI RMF", "ISO 42001", "ISO 27001", "NIS2", "DPIA", "OWASP", "AI governance", "AI security", "DevSecOps", "SBOM", "Trivy", "IAM", "RBAC", "Prometheus", "Grafana", "Sentry", "Linux", "Git", "German", "English", "project management", "stakeholder", "Power BI", "Tableau"];
const esc = s => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const has = (text, term) => new RegExp(`(^|[^a-z0-9])${esc(term.toLowerCase())}([^a-z0-9]|$)`).test(text);
const ALL_NOTES = KB.chunks.map(c => `${c.title} ${c.section} ${c.text}`).join(" ").toLowerCase();

// a name or email goes into the letter only if the visitor really wrote it: never an invented "John Doe"
const saidBy = (sink, v) => { const words = String(v || "").toLowerCase().split(/[\s,;()]+/).filter(w => w.length > 1 && !["from", "at", "of", "and"].includes(w)); return words.length > 0 && words.every(w => sink.said.includes(w)); };

function makeTools(sink) {
    const search_notes = tool(async ({ query }) => {
        const docs = retrieve(query, 4);
        sink.sources.push(...docs);
        return docs.length ? notes(docs) : "No notes matched. If the question is about Farhan, say it isn't in the notes and offer his email.";
    }, { name: "search_notes", description: "Search Farhan's knowledge base (work at Nordex, Argus AI, research, projects, education, skills, languages, availability, contact, this site). Call this before stating any fact about Farhan.", schema: z.object({ query: z.string().min(2).max(300).describe("what to look up, e.g. 'Argus AI tech stack'") }) });

    const match_job = tool(async ({ job_description }) => {
        const job = job_description.toLowerCase();
        const asked = VOCAB.filter(t => has(job, t));
        const inNotes = asked.filter(t => has(ALL_NOTES, t)), notInNotes = asked.filter(t => !has(ALL_NOTES, t));
        const docs = retrieve(job_description.slice(0, 1500), 5);
        sink.sources.push(...docs);
        return [
            `Requirements found in the job ad that ARE in Farhan's notes: ${inNotes.join(", ") || "none detected"}.`,
            `Requirements found in the job ad that are NOT mentioned in his notes: ${notInNotes.join(", ") || "none detected"}. (Say "not mentioned in my notes", never "I can't".)`,
            `Most relevant notes:\n${notes(docs)}`,
        ].join("\n");
    }, { name: "match_job", description: "Compare a job description the visitor pasted with Farhan's notes. Returns requirements that are covered, requirements not mentioned, and the most relevant notes.", schema: z.object({ job_description: z.string().min(20).max(MAX_INPUT).describe("the full job description text") }) });

    const act = (name, description, schema, make) => tool(async args => {
        if (sink.actions.length >= 2) return "Only two page actions per answer; skipped.";
        const a = make(args); if (!sink.actions.some(x => JSON.stringify(x) === JSON.stringify(a))) sink.actions.push(a);
        return `Done: the page will ${a.label}. Tell the visitor in one short sentence.`;
    }, { name, description, schema });

    const show_section = act("show_section", "Scroll the visitor's page to a section of the portfolio. Use when they ask to see or go to something.",
        z.object({ section: z.enum(SECTIONS).describe("home, what (what I do), break (break my AI), experience (Nordex), research (TUHH digital twin), projects, journey (education), skills, lens (photography), contact") }),
        ({ section }) => ({ type: "section", id: section, label: `scroll to the ${section} section` }));
    const open_project = act("open_project", "Open a specific project card in the projects section. For the TUHH digital twin research, use show_section with 'research' instead.",
        z.object({ project: z.enum(Object.keys(PROJECTS)) }),
        ({ project }) => ({ type: "project", id: PROJECTS[project], label: `open the ${project.replace(/-/g, " ")} project` }));
    const open_resume = act("open_resume", "Open Farhan's résumé (CV) for the visitor.", z.object({}), () => ({ type: "resume", label: "open the résumé" }));
    const open_quick_read = act("open_quick_read", "Open the one-minute quick read summary of Farhan's profile.", z.object({}), () => ({ type: "quick_read", label: "open the quick read" }));
    const draft_letter = act("draft_letter", "Fill in the contact letter on the page with a short, friendly message written in the VISITOR's voice to Farhan. The letter already starts with 'Dear Farhan,', so do not add a greeting; end with the visitor's name if they gave it. The visitor reviews it and sends it themselves; nothing is sent automatically.",
        z.object({ message: z.string().min(10).max(1200), name: z.string().max(80).optional().describe("the visitor's name and company, ONLY if they wrote it in this chat; otherwise omit"), email: z.string().max(120).optional().describe("the visitor's email, ONLY if they wrote it in this chat; otherwise omit") }),
        // the letter already begins "Dear Farhan,": drop a second greeting the model may add
        ({ message, name, email }) => ({ type: "letter", message: message.replace(/^\s*(?:hi|hello|hey|dear)\b[^\n,!]{0,30}farhan\s*[,!.:]?\s*/i, "").trim().slice(0, 1200), name: saidBy(sink, name) ? name.trim().slice(0, 80) : "", email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "") && saidBy(sink, email) ? email.trim() : "", label: "fill in the letter on the contact desk for you to review and send" }));

    return [search_notes, match_job, show_section, open_project, open_resume, open_quick_read, draft_letter];
}

const SYSTEM = `${PERSONA}

You are also an agent with tools. How to use them:
- Before stating any fact about Farhan, call search_notes (unless the facts are already in this conversation's tool results). The notes you receive are the ONLY facts you may use.
- When the visitor asks to see, show, open or go to something, call show_section, open_project, open_resume or open_quick_read, then tell them in one short sentence what you opened. Don't open things they didn't ask for, except that showing a relevant project while answering about it is welcome.
- When the visitor pastes a job description or asks whether Farhan fits a role, call match_job with the full text. Then give an honest fit summary under 150 words: strong matches with evidence, then anything "not mentioned in my notes" (never claim a skill that isn't in the notes, never say "I can't"). Close by offering to draft a letter.
- When the visitor wants to contact Farhan, call draft_letter with a short, friendly message in their voice. Say it is ready on the contact desk for them to review and send. Never say it was sent.
- Use at most a few tool calls, then answer. Rule 2 above about length applies to normal answers; job-fit answers may use up to 150 words.`;

/* ── the graph (LangGraph) ── */
const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    turns: Annotation({ reducer: (a, z) => z, default: () => 0 }),
    blocked: Annotation(), answer: Annotation(), model: Annotation(),
    trace: Annotation({ reducer: (a, z) => a.concat(z), default: () => [] }),
});

export function buildAgent({ apiKey = groqKey(), baseUrl, timeout = 15000, said = "", live } = {}) {
    const sink = { actions: [], sources: [], said: String(said || "").toLowerCase() }, tools = makeTools(sink), byName = Object.fromEntries(tools.map(t => [t.name, t]));
    const llm = new ChatGroq({ apiKey, model: MODELS.answer, temperature: 0.35, maxTokens: budget(MODELS.answer, 450), maxRetries: 1, ...modelOpts(MODELS.answer).lc, ...(baseUrl ? { baseUrl } : {}) });
    const withTools = llm.bindTools(tools), answerOnly = llm.bindTools(tools, { tool_choice: "none" });

    const guard = async s => {
        const q = String(s.messages.at(-1)?.content || "");
        const r = inputShield(q, MAX_INPUT);
        const attack = r.status === "block" && (r.owasp === "LLM01" || r.owasp === "LLM07" || r.owasp === "LLM10" || r.detail === "Secret extraction");
        return { blocked: attack ? r : null, trace: [{ step: "guard", detail: attack ? `blocked · ${r.owasp} ${r.detail}` : r.status === "mask" ? r.detail : "clean" }] };
    };
    const refuse = async s => ({ answer: REFUSAL[s.blocked?.owasp] || REFUSAL[s.blocked?.detail] || "I'll politely pass on that one, since it looks like an attempt to change or reveal my instructions. If you'd like to test my defences, the \"Break my AI\" section is made for exactly that. Otherwise, I'd love to tell you about my work!", model: "guard", trace: [{ step: "refuse", detail: s.blocked?.owasp || "blocked" }] });

    const agent = async s => {
        const t0 = Date.now(), last = s.turns + 1 >= MAX_TURNS;
        live?.({ step: "agent-start", turn: s.turns + 1 }); // the model is being called right now
        // on the last turn the model must answer: no more tools
        const msg = await (last ? answerOnly : withTools).invoke([new SystemMessage(SYSTEM), ...s.messages], { signal: AbortSignal.timeout(timeout) });
        const calls = msg.tool_calls || [];
        return { messages: [msg], turns: s.turns + 1, model: MODELS.answer, trace: [{ step: "agent", ms: Date.now() - t0, detail: calls.length ? `decided: ${calls.map(c => c.name).join(", ")}` : "answering" }] };
    };
    const runTools = async s => {
        const t0 = Date.now(), calls = s.messages.at(-1)?.tool_calls || [], out = [];
        for (const c of calls.slice(0, 3)) {
            const t = byName[c.name];
            let content;
            try { content = t ? String(await t.invoke(c.args ?? {})) : `Unknown tool ${c.name}.`; }
            catch (e) { content = `The tool could not run (${String(e?.message || e).slice(0, 120)}). Answer without it.`; }
            out.push(new ToolMessage({ content, tool_call_id: c.id, name: c.name }));
        }
        return { messages: out, trace: [{ step: "tools", ms: Date.now() - t0, detail: calls.slice(0, 3).map(c => `${c.name}(${Object.values(c.args || {}).map(v => String(v).slice(0, 40)).join(", ")})`).join(" · ") }] };
    };
    const verify = async s => {
        const raw = s.messages.at(-1)?.content;
        const text = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw.map(p => p.text || "").join("") : "").trim();
        if (!text) throw new Error("the agent ended without an answer"); // runAgent falls back to the grounded pipeline
        const { answer, detail } = checkAnswer(text, SYSTEM);
        if (detail !== "passed") sink.actions.length = 0;
        return { answer, trace: [{ step: "verify", detail }] };
    };

    // every node reports its trace step the moment it finishes, so the page can show the agent working live
    const emit = fn => async st => { const out = await fn(st); (out.trace || []).forEach(t => live?.(t)); return out; };
    const graph = new StateGraph(State)
        .addNode("guard", emit(guard)).addNode("refuse", emit(refuse)).addNode("agent", emit(agent)).addNode("tools", emit(runTools)).addNode("verify", emit(verify))
        .addEdge(START, "guard")
        .addConditionalEdges("guard", s => (s.blocked ? "refuse" : "agent"), { refuse: "refuse", agent: "agent" })
        .addConditionalEdges("agent", s => ((s.messages.at(-1)?.tool_calls || []).length && s.turns < MAX_TURNS ? "tools" : "verify"), { tools: "tools", verify: "verify" })
        .addEdge("tools", "agent").addEdge("verify", END).addEdge("refuse", END)
        .compile();
    return { graph, sink };
}

/**
 * one visitor message in → { answer, sources, actions, model, trace }
 * onStep(step) is called live for every step (guard, each model call, each tool run, verify), for streaming to the page
 */
export async function runAgent(history, opts = {}, onStep) {
    const msgs = history.slice(-10).map(m => (m.role === "assistant" ? new AIMessage(m.content) : new HumanMessage(m.content)));
    const question = history.at(-1)?.content || "";
    const fallback = async why => {
        onStep?.({ step: "agent", detail: why });
        const r = await ragAnswer(question.slice(0, 600), history.slice(0, -1), onStep);
        return { ...r, actions: [], trace: [{ step: "agent", detail: why }, ...r.trace] };
    };
    if (!(opts.apiKey ?? groqKey())) return fallback("no model key: grounded pipeline");
    try {
        if (!opts.baseUrl) await ready();
        const { graph, sink } = buildAgent({ ...opts, live: onStep, said: history.filter(m => m.role === "user").map(m => m.content).join("\n") });
        const s = await graph.invoke({ messages: msgs }, { recursionLimit: 2 * MAX_TURNS + 6 });
        const seen = new Set(), sources = sink.sources.filter(d => !seen.has(d.file) && seen.add(d.file)).map(d => ({ title: d.title, section: d.section, file: d.file }));
        return { answer: s.answer, sources, actions: sink.actions.map(({ label, ...a }) => a), model: s.model || "guard", trace: s.trace };
    } catch (e) {
        // the agent failed (rate limit, malformed tool call, timeout): the grounded pipeline still answers
        const why = String(e?.error?.message || e?.message || e).slice(0, 160);
        console.error("agent:", why);
        return fallback(`agent unavailable (${why}): grounded pipeline`);
    }
}
