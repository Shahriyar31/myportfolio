// Node copy for the hero diagram — kept separate so the main bundle
// can show tooltips without pulling in three.js.
export const NODES = [
    { id: "sources", label: "Sources", pos: [-3.1, 3.3, 0], kind: "sources", section: "work", title: "Docs, tables & streams", text: "Raw material: documents, relational tables and event streams — Kafka and Flink in my streaming projects." },
    { id: "lakehouse", label: "Lakehouse", sub: "Databricks", pos: [-3.0, 0.2, 0], kind: "lakehouse", section: "work", title: "Medallion lakehouse", text: "The medallion pattern — raw, cleaned, business-ready — on Azure Databricks with Spark. Databricks pipelines and analytics workflows are what I build and maintain at work." },
    { id: "catalog", label: "Catalog & lineage", sub: "Purview", pos: [0.2, 3.6, -1.0], kind: "catalog", section: "work", title: "Governance catalogue", text: "Microsoft Purview: catalogue, classify and trace lineage so every dataset has an owner, a sensitivity label and a history." },
    { id: "agent", label: "Agent", sub: "LangGraph", pos: [0.5, -0.4, 0], kind: "agent", section: "agent", title: "Tool-using agent", text: "An LLM that plans and calls tools — retrieval, SQL, checks — with human-in-the-loop on risky decisions, as in Argus AI." },
    { id: "policy", label: "Policy gate", sub: "EU AI Act · GDPR", pos: [3.4, 0.6, 0.2], kind: "policy", section: "built", title: "Guardrails before anything ships", text: "Risk-tier the use case under the EU AI Act, check GDPR duties and OWASP LLM Top 10 risks — then let it through." },
    { id: "answer", label: "Answer", pos: [3.9, 3.4, 0.4], kind: "answer", section: "agent", title: "Grounded output", text: "Cited, policy-checked answers — the only thing the user ever sees." },
    { id: "ledger", label: "Audit ledger", pos: [3.6, -2.5, 0.3], kind: "ledger", section: "built", title: "Tamper-evident trail", text: "Every decision hash-chained with SHA-256, so any change to history is detectable. Ask my agent something and watch it write one." },
];
