// Hero diagram content, in plain English first and technology second, so it
// reads for recruiters as well as engineers. Kept apart from AgentScene so the
// main bundle can render labels without pulling in three.js.
export const NODES = [
    { id: "sources", n: 1, title: "Company data", tech: "Docs · databases · streams", logos: ["docs", "postgres", "kafka"], pos: [-3.1, 3.3, 0], kind: "sources", section: "work", text: "It starts with raw company data — documents, databases and live event streams." },
    { id: "lakehouse", n: 2, title: "Clean & organise", tech: "Databricks · Spark", logos: ["databricks", "spark"], pos: [-3.0, 0.2, 0], kind: "lakehouse", section: "work", text: "Raw data becomes reliable, analysis-ready tables in a lakehouse on Azure Databricks." },
    { id: "catalog", n: 3, title: "Govern", tech: "Catalogue · lineage · labels", logos: ["catalog", "lineage"], pos: [0.2, 3.6, -1.0], kind: "catalog", section: "work", text: "Every dataset gets an owner, a sensitivity label and a history you can trace." },
    { id: "agent", n: 4, title: "AI agent", tech: "LangGraph · Python", logos: ["langchain", "python"], pos: [0.5, -0.4, 0], kind: "agent", section: "agent", text: "An AI agent reads that governed data, plans, and uses tools to find an answer." },
    { id: "policy", n: 5, title: "Compliance check", tech: "EU AI Act · GDPR", logos: ["eu", "gdpr"], pos: [3.4, 0.6, 0.2], kind: "policy", section: "built", text: "Before anything goes out, it's checked for risk, privacy and security." },
    { id: "answer", n: 6, title: "Trusted answer", tech: "Grounded · cited", logos: ["answer"], pos: [3.9, 3.4, 0.4], kind: "answer", section: "agent", text: "People get an answer they can trust, backed by sources." },
    { id: "ledger", n: 7, title: "Audit log", tech: "Tamper-evident", logos: ["ledger"], pos: [3.6, -2.5, 0.3], kind: "ledger", section: "built", text: "Every step is recorded, so any decision can be explained later." },
];
