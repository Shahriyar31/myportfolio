// ── DATA ──────────────────────────────────────────────────────────────
export const PROJECTS = [
    { id: 1, title: "Argus AI", sub: "EU AI Act Governance Platform", desc: "Open compliance platform that classifies AI systems under the EU AI Act, drafts GDPR DPIAs and checks OWASP LLM Top 10 risks. LangGraph agent with human-in-the-loop review, RAG over the regulation text in pgvector, and a hash-chained audit trail.", tags: ["FastAPI", "LangGraph", "pgvector", "Azure Container Apps", "Terraform"], color: "#3B82F6", glow: "59,130,246", icon: "⚖️", badge: "Live", link: "https://eu-ai-act-governance-platform.vercel.app" },
    { id: 2, title: "Digital Twin Dashboard", sub: "TUHH Research", desc: "Real-time anomaly detection & forecasting for a digital twin simulation. Full CI/CD via GitHub Actions + Docker.", tags: ["Python", "Dash", "Plotly", "Docker", "Scikit-learn"], color: "#8B5CF6", glow: "139,92,246", icon: "🔬", badge: "Research", link: "https://github.com/rkraeuter/DigitalTwinGF3" },
    { id: 3, title: "Poultry Shield", sub: "AI Veterinary Diagnostics", desc: "CNN achieving 97.51% diagnostic accuracy. Flask + OpenCV on AWS EC2, cutting diagnosis time by 40%.", tags: ["TensorFlow", "Flask", "AWS EC2", "OpenCV"], color: "#10B981", glow: "16,185,129", icon: "🐔", badge: "97.51% Acc.", link: "https://github.com/Shahriyar31/Poultry_Shield-Deep-Learning-for-Poultry-Coccidiosis-Diagnosis" },
    { id: 4, title: "Radiation Tracker", sub: "Real-Time Streaming", desc: "GCP streaming platform with Apache Kafka & Flink. Full stack containerised with Docker Compose.", tags: ["Apache Kafka", "Apache Flink", "GCP", "Docker", "Node.js"], color: "#F59E0B", glow: "245,158,11", icon: "☢️", badge: "Real-Time", link: "https://github.com/Shahriyar31/Radiaton_Tracking" },
    { id: 5, title: "StockFlow", sub: "Data Engineering Pipeline", desc: "Real-time stock market pipeline with Apache Kafka, AWS S3, and AWS Glue.", tags: ["Apache Kafka", "AWS S3", "AWS Glue", "Python"], color: "#06B6D4", glow: "6,182,212", icon: "📈", badge: "Data Eng.", link: "https://github.com/Shahriyar31/StockFlow-Real-Time-Stock-Market-Data-Engineering-with-Kafka" },
    { id: 6, title: "Book Analysis", sub: "NLP & Collaborative Filtering", desc: "EDA of Amazon Book Reviews using NLP and collaborative filtering.", tags: ["Python", "Pandas", "NLP", "Jupyter"], color: "#EC4899", glow: "236,72,153", icon: "📚", badge: "NLP", link: "https://github.com/Shahriyar31/Book-Analysis" },
];

// ── EXPERIENCE ────────────────────────────────────────────────────────
// Public-safe wording only: describe responsibilities and technologies,
// never internal metrics, system names, vendors, incidents or decisions.
// Title and scope mirror the CV so the two never disagree.
export const EXPERIENCE = [
    {
        id: "nordex",
        company: "Nordex Group",
        role: "Working Student — Enterprise Data Management & AI Engineering",
        date: "Aug 2025 — Present",
        location: "Hamburg, DE",
        current: true,
        summary: "Part of the enterprise data team at a global wind-turbine manufacturer, working where data governance, the Azure data platform and applied AI meet.",
        focus: [
            { k: "AI & Data Governance", d: "Data governance and cataloguing, plus AI governance work that maps use cases to EU AI Act and GDPR requirements." },
            { k: "Azure Databricks", d: "Building and maintaining data pipelines and analytics workflows on Azure Databricks." },
            { k: "Azure Cloud", d: "Working with the Azure services and DevOps practices the data and AI platform runs on." },
            { k: "Applied AI", d: "Supporting AI model development and deployment with the data engineering team, including LLM and retrieval (RAG) prototypes and their evaluation." },
        ],
        tech: ["Azure Databricks", "Azure", "Azure DevOps", "Apache Spark", "Python", "SQL", "EU AI Act", "GDPR"],
    },
    {
        id: "tuhh",
        company: "Hamburg University of Technology",
        role: "Research Project — Digital Twin Dashboard & MLOps",
        date: "Mar 2025 — Present",
        location: "Hamburg, DE",
        current: false,
        summary: "Monitoring dashboard for a digital-twin simulation, with ML for anomaly detection and forecasting shipped through a containerised CI/CD pipeline.",
        focus: [
            { k: "Monitoring", d: "Interactive Dash + Plotly dashboard visualising real-time simulation data." },
            { k: "ML", d: "Anomaly detection and time-series forecasting for predictive insight into particle behaviour." },
            { k: "MLOps", d: "GitHub Actions CI/CD for testing and deployment, fully containerised with Docker." },
        ],
        tech: ["Python", "Dash", "Plotly", "Scikit-learn", "Docker", "GitHub Actions"],
    },
];

// What I'm focused on right now (landing page "Now" panel)
export const NOW = [
    ["AI Governance", "EU AI Act · GDPR · lineage"],
    ["Data Platform", "Azure Databricks · Spark"],
    ["Cloud", "Azure · DevOps · Terraform"],
    ["Building", "Argus AI — compliance as code"],
];

export const SKILLS = {
    "AI & MLOps": ["RAG Pipelines", "LangGraph Agents", "LLM Evaluation", "MLflow", "TensorFlow", "Scikit-learn", "AI Governance"],
    "Data Engineering": ["Azure Databricks", "Apache Spark", "Apache Kafka", "Apache Flink", "ETL Pipelines", "Data Lineage"],
    "Cloud & DevOps": ["Azure", "AWS", "GCP", "Docker", "Kubernetes", "GitHub Actions", "Terraform"],
    "Languages & DBs": ["Python", "SQL", "Bash", "PostgreSQL", "MongoDB", "MySQL"],
};

export const ROLES = ["AI & Data Engineer", "Data Governance on Azure", "Databricks Pipelines", "EU AI Act Tooling", "MSc @ TUHH"];
export const SUGGS = ["What do you work on?", "Your strongest skill?", "Open to work?", "What is Argus AI?"];

export const PHOTO_COUNT = 20;

export const FACTS = [
    "I moved from India to Hamburg alone at 22 🇮🇳→🇩🇪",
    "I work on data governance & Databricks pipelines at Nordex ⚡",
    "I built Argus AI, an EU AI Act compliance platform ⚖️",
    "I shoot landscape & street photography 📷",
    "I speak Bengali, English & basic German 🗣️",
    "My B.Tech CGPA was 8.73 / 10 🎓",
    "I containerised my first app with Docker at 21 🐳",
    "I'm currently open to full-time & Werkstudent roles 🚀",
];

// ── THEMES ────────────────────────────────────────────────────────────
// Catppuccin Mocha
export const DARK = {
    bg:     "#1e1e2e",   // Base
    t:      "#cdd6f4",   // Text
    m:      "#a6adc8",   // Subtext0
    dim:    "#6c7086",   // Overlay0
    a:      "#89b4fa",   // Blue
    a2:     "#cba6f7",   // Mauve
    a3:     "#89b4fa",   // Blue
    card:   "#181825",   // Mantle
    border: "#313244",   // Surface0
    nav:    "#11111b",   // Crust
    // Neumorphism
    neu:      "6px 6px 14px rgba(10,10,18,0.8), -6px -6px 14px rgba(49,50,68,0.6)",
    neuSm:    "3px 3px 8px rgba(10,10,18,0.8), -3px -3px 8px rgba(49,50,68,0.6)",
    neuHover: "8px 8px 20px rgba(10,10,18,0.85), -8px -8px 20px rgba(49,50,68,0.65)",
    neuInset: "inset 3px 3px 8px rgba(10,10,18,0.8), inset -3px -3px 8px rgba(49,50,68,0.6)",
};
// Catppuccin Latte
export const LIGHT = {
    bg:     "#eff1f5",   // Base
    t:      "#4c4f69",   // Text
    m:      "#6c6f85",   // Subtext0
    dim:    "#9ca0b0",   // Overlay0
    a:      "#1e66f5",   // Blue
    a2:     "#8839ef",   // Mauve
    a3:     "#1e66f5",   // Blue
    card:   "#eff1f5",   // Same as bg for neumorphism
    border: "#ccd0da",   // Surface0
    nav:    "#e6e9ef",   // Mantle
    // Neumorphism
    neu:      "6px 6px 14px rgba(163,171,196,0.55), -6px -6px 14px rgba(255,255,255,0.85)",
    neuSm:    "3px 3px 8px rgba(163,171,196,0.55), -3px -3px 8px rgba(255,255,255,0.85)",
    neuHover: "8px 8px 20px rgba(163,171,196,0.65), -8px -8px 20px rgba(255,255,255,0.9)",
    neuInset: "inset 3px 3px 8px rgba(163,171,196,0.55), inset -3px -3px 8px rgba(255,255,255,0.85)",
};

// ── EDUCATION SCROLL BOOK DATA ────────────────────────────────────────
export const EDU_CHAPTERS = [
    {
        num: "01", label: "Chapter One", year: "2018–2022",
        tag: "The Beginning", location: "West Bengal, India 🇮🇳",
        degree: "B.Tech. Computer Science & Engineering",
        school: "Cooch Behar Government Engineering College",
        quote: "Where it all started.",
        body: "Four years of algorithms, data structures, systems programming and late nights. Graduated top 10% with 8.73/10 CGPA. Served as Teaching Assistant and Student Council Member — leading before I knew what that meant.",
        stats: [["8.73", "CGPA / 10"], ["4", "Years"], ["Top", "10%"]],
        pills: ["Algorithms", "Data Structures", "OS", "DBMS", "Software Eng.", "Discrete Math", "Networks"],
        accent: "a2", icon: "📚",
    },
    {
        num: "02", label: "Chapter Two", year: "2023–Now",
        tag: "The Leap", location: "Hamburg, Germany 🇩🇪",
        degree: "M.Sc. Data Science",
        school: "Hamburg University of Technology (TUHH)",
        quote: "Moved countries, changed everything.",
        body: "Left India alone at 22. Enrolled at TUHH and joined Nordex Group as a working student in enterprise data management & AI. Advanced ML and big data in the classroom; data governance, Databricks and applied AI at work.",
        stats: [["M.Sc.", "Data Science"], ["2023", "Started"], ["DE", "Hamburg"]],
        pills: ["Machine Learning", "Big Data", "MLOps", "Statistics", "Digital Twins", "Deep Learning", "Data Eng."],
        accent: "a", icon: "🎓", live: true,
    },
];
