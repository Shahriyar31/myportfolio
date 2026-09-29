// ── DATA ──────────────────────────────────────────────────────────────
export const PROJECTS = [
    { id: 1, title: "Argus AI", sub: "EU AI Act Governance Platform", color: "#89b4fa", icon: "⚖️", badge: "Live",
        desc: "An open platform that automates EU AI Act, GDPR and NIST AI RMF compliance end to end. Describe an AI system and get a full compliance report in seconds, with a tamper-evident audit record.",
        points: ["LangGraph agent (classify → route → DPIA → OWASP → summary) that pauses for a human on high- and limited-risk systems", "RAG assistant over 665+ EU AI Act chunks in pgvector that answers with citations, evaluated with RAGAS", "DevSecOps gates (SAST, SCA, Trivy) block builds on critical findings; runs on Azure Container Apps, built with Terraform"],
        stats: [["41", "live risk rules"], ["665+", "regulation chunks"], ["114+", "CI builds"]],
        tags: ["LangGraph", "FastAPI", "pgvector", "Groq Llama 3.3", "Terraform", "Azure Container Apps", "Sentry"],
        link: "https://eu-ai-act-governance-platform.vercel.app",
        links: [["Open Argus AI ↗", "https://eu-ai-act-governance-platform.vercel.app"], ["Live app ↗", "https://eu-ai-governance.salmonocean-15ddaf55.germanywestcentral.azurecontainerapps.io"], ["Code ↗", "https://github.com/Shahriyar31/eu-ai-act-governance-platform"]] },
    { id: 2, title: "Digital Twin Frontend", sub: "TUHH Research · Granulation Process Monitoring", color: "#cba6f7", icon: "🔬", badge: "Research",
        desc: "A containerised, real-time monitoring dashboard for an industrial digital twin of a fluidised-bed granulation process.",
        points: ["Vectorised Pandas preprocessing with auto delimiter detection and BOM stripping, feeding InfluxDB", "Orchestrated the microservices stack: Kafka, Flink and Docker Compose", "Cut the frontend image from ~900 MB to 150 MB with multi-stage builds and layer caching"],
        stats: [["900 → 150", "MB image"], ["12", "ECTS"]],
        tags: ["Python", "Pandas", "Plotly Dash", "InfluxDB", "Apache Kafka", "Apache Flink", "Docker Compose"],
        link: "https://github.com/rkraeuter/DigitalTwinGF3", links: [["View code ↗", "https://github.com/rkraeuter/DigitalTwinGF3"]] },
    { id: 3, title: "Poultry Shield", sub: "Deep Learning for Disease Diagnosis", color: "#a6e3a1", icon: "🐔", badge: "97.51% val. acc.",
        desc: "Early diagnosis of coccidiosis in poultry from images, with a clean, reproducible ML pipeline.",
        points: ["Fine-tuned a VGG16 CNN (ImageNet pre-trained) for poultry disease classification", "4-stage DVC pipeline: ingestion → base model → training → evaluation", "Flask REST API and a small web page for live predictions"],
        stats: [["97.51%", "val. accuracy"], ["0.058", "val. loss"], ["4", "DVC stages"]],
        tags: ["TensorFlow", "VGG16", "DVC", "Flask", "Python"],
        link: "https://github.com/Shahriyar31/Poultry_Shield-Deep-Learning-for-Poultry-Coccidiosis-Diagnosis", links: [["View code ↗", "https://github.com/Shahriyar31/Poultry_Shield-Deep-Learning-for-Poultry-Coccidiosis-Diagnosis"]] },
    { id: 4, title: "Radiation Tracker", sub: "TUHH Big Data project · team of 4", color: "#fab387", icon: "☢️", badge: "Real-time",
        desc: "Real-time monitoring and a live map of radiation levels: Kafka producers stream sensor data, Flink processes it, and a WebSocket-fed web map shows it. Deployed with Docker on a Google Cloud VM.",
        points: ["Project coordinator for a team of four", "Improved the frontend: UI/UX, layout, bug fixes and components", "Added WebSocket integration for real-time updates on the map"],
        stats: [["4", "people"], ["Live", "map"]],
        tags: ["Apache Kafka", "Apache Flink", "WebSocket", "Docker", "GCP"],
        link: "https://github.com/Shahriyar31/Radiaton_Tracking", links: [["View code ↗", "https://github.com/Shahriyar31/Radiaton_Tracking"]] },
    { id: 5, title: "StockFlow", sub: "Real-Time Stock Market Data Pipeline", color: "#74c7ec", icon: "📈", badge: "Data Eng.",
        desc: "An end-to-end streaming pipeline for stock market data, from producer to SQL, without a traditional warehouse.",
        points: ["Apache Kafka 3.8 on EC2 publishes OHLCV stock records every second", "Consumers land the data in an S3 data lake; Glue crawlers catalogue the schema", "Athena runs serverless SQL on it; Jupyter for exploration"],
        stats: [["1 s", "publish interval"], ["0", "warehouses"]],
        tags: ["Python", "Apache Kafka", "AWS EC2", "S3", "Glue", "Athena", "SQL"],
        link: "https://github.com/Shahriyar31/StockFlow-Real-Time-Stock-Market-Data-Engineering-with-Kafka", links: [["View code ↗", "https://github.com/Shahriyar31/StockFlow-Real-Time-Stock-Market-Data-Engineering-with-Kafka"]] },
    { id: 6, title: "Book Analysis", sub: "NLP · Miracle in the Andes", color: "#f5c2e7", icon: "📚", badge: "NLP",
        desc: "Text analysis of the book Miracle in the Andes with Python and NLTK.",
        points: ["Chapter counting with string methods and regular expressions", "Most used words with stopwords filtered out", "Sentiment of the whole book and of each chapter, to find the most positive and negative ones"],
        stats: [["NLTK", "VADER sentiment"]],
        tags: ["Python", "NLTK", "Regex", "Jupyter"],
        link: "https://github.com/Shahriyar31/Book-Analysis", links: [["View code ↗", "https://github.com/Shahriyar31/Book-Analysis"]] },
];

// ── EXPERIENCE ────────────────────────────────────────────────────────
// Public-safe wording only: describe responsibilities and technologies,
// never internal metrics, system names, vendors, incidents or decisions.
// Title and scope mirror the CV so the two never disagree.
export const EXPERIENCE = [
    {
        id: "nordex",
        company: "Nordex Group",
        role: "Working Student (Werkstudent) — Enterprise Data Management & AI",
        date: "Aug 2025 — Present",
        location: "Hamburg, DE",
        current: true,
        summary: "Part of the enterprise data and AI team at a global wind-turbine manufacturer, working where AI governance, AI security and applied AI on Azure meet.",
        focus: [
            { k: "AI Governance Policy", when: "Aug 2025 – now", d: "Authored the AI lifecycle framework for the company's AI governance policy: approval gates from idea to retirement, clear roles, and what happens when a model changes or something goes wrong. Aligned with GDPR, the EU AI Act and NIST AI RMF. Also wrote the LLM security and guardrails part: prompt injection, least-privilege tools and API controls." },
            { k: "AI Security Analysis", when: "Feb 2026 – now", d: "Mapped the OWASP LLM Top 10 to Azure-native mitigations for a RAG system, designed security controls for MCP tool access (delegated sign-in, confused-deputy prevention), compared supply-chain security tools (SBOMs, signing, scanning) and delivered a CI/CD security pipeline, aligned with EU AI Act Art. 15, ISO 27001 and IEC 62443." },
            { k: "AI Knowledge Agent", when: "Jan – Mar 2026", d: "Built a RAG knowledge agent on Azure AI Foundry with hybrid vector search, custom function tools and a fast pre-routing layer, and ran an LLM-as-judge evaluation comparing Azure OpenAI models on quality, speed and cost to guide the model choice." },
            { k: "AI Project Management", when: "Feb 2026 – now", d: "Coordinated delivery across several internal and partner teams to unblock infrastructure work: weekly alignment, blocker and timeline tracking, meeting minutes, and network and API-gateway integration through to resolution." },
        ],
        tech: ["Azure AI Foundry", "Azure OpenAI", "Azure APIM", "Azure DevOps", "Python", "OWASP LLM Top 10", "EU AI Act", "GDPR", "NIST AI RMF"],
    },
    {
        id: "tuhh",
        company: "Hamburg University of Technology",
        role: "Research Project — Digital Twin Frontend for Granulation Process Monitoring",
        date: "TUHH research project · 12 ECTS",
        location: "Hamburg, DE",
        current: false,
        summary: "A containerised, real-time monitoring dashboard for an industrial digital twin of a fluidised-bed granulation process (Glatt ProCell).",
        focus: [
            { k: "Data pipeline", d: "Vectorised Pandas preprocessing with automatic delimiter detection and BOM stripping, feeding InfluxDB." },
            { k: "Microservices", d: "Orchestrated the full stack (Kafka, Flink, Docker Compose) for real-time process data." },
            { k: "Lean images", d: "Cut the frontend image from ~900 MB to 150 MB with multi-stage builds and layer caching." },
        ],
        tech: ["Python", "Pandas", "Plotly Dash", "InfluxDB", "Apache Kafka", "Apache Flink", "Docker Compose"],
    },
];

// My paper (public preprint)
export const PAPER = { title: "Mapping OWASP LLM Top 10 to EU AI Act Requirements: A Security Governance Framework for Enterprise RAG Systems", where: "Preprint, Hamburg University of Technology (TUHH)", when: "April 2026" };
export const LANGUAGES = [["Bengali", "native"], ["English", "professional"], ["German", "A2/B1, learning every day"]];

// What I'm focused on right now (landing page "Now" panel)
export const NOW = [
    ["AI Governance", "EU AI Act · GDPR · lineage"],
    ["AI Security", "OWASP LLM Top 10 · MCP · DevSecOps"],
    ["Cloud", "Azure · DevOps · Terraform"],
    ["Building", "Argus AI — compliance as code"],
];

export const SKILLS = {
    "Governance & Compliance": ["EU AI Act", "GDPR", "NIST AI RMF", "DPIA", "NIS2", "ISO 42001", "OWASP LLM Top 10", "IEC 62443", "Data Mesh", "RACI"],
    "AI & Data": ["RAG", "Azure AI Foundry", "Azure OpenAI", "LLM evaluation", "LangGraph", "MCP", "Apache Kafka", "Apache Flink", "InfluxDB", "Plotly Dash", "TensorFlow", "Scikit-learn"],
    "Azure & Cloud": ["Azure Databricks", "Azure Purview", "Azure APIM", "Azure DevOps", "Microsoft 365", "AWS EC2 / S3 / Glue / Athena"],
    "Infrastructure & Security": ["Docker", "Git / GitHub", "CI/CD", "Linux", "WSL2", "IAM / RBAC", "LLM guardrails", "DevSecOps", "SAST", "Syft", "Grype", "Cosign"],
    "Programming": ["Python (NumPy, Pandas, Scikit-learn)", "SQL", "Bash"],
};

export const ROLES = ["AI Engineer", "AI Governance & Security", "RAG on Azure", "EU AI Act Tooling", "MSc @ TUHH"];
export const SUGGS = ["What do you work on?", "Your strongest skill?", "Open to work?", "What is Argus AI?"];

export const PHOTO_COUNT = 20;

export const FACTS = [
    "I moved from India to Hamburg alone at 22 🇮🇳→🇩🇪",
    "I work on AI governance and AI security at Nordex ⚡",
    "I built Argus AI, an EU AI Act compliance platform ⚖️",
    "I shoot landscape & street photography 📷",
    "I speak Bengali, English and German (A2/B1, learning daily) 🗣️",
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
        degree: "B.Tech. Computer Science",
        school: "Cooch Behar Government Engineering College",
        quote: "Where it all started.",
        body: "Four years of algorithms, data structures, systems programming and late nights. Graduated top 10% with 8.73/10 CGPA. Served as Teaching Assistant and Student Council Member — leading before I knew what that meant.",
        stats: [["8.73", "CGPA / 10"], ["4", "Years"], ["Top", "10%"]],
        pills: ["Algorithms", "Data Structures", "OS", "DBMS", "Software Eng.", "Discrete Math", "Networks"],
        accent: "a2", icon: "📚",
    },
    {
        num: "02", label: "Chapter Two", year: "Oct 2023–now",
        tag: "The Leap", location: "Hamburg, Germany 🇩🇪",
        degree: "M.Sc. Data Science",
        school: "Hamburg University of Technology (TUHH)",
        quote: "Moved countries, changed everything.",
        body: "Left India alone at 22. Enrolled at TUHH and joined Nordex Group as a working student in enterprise data management & AI. Advanced ML and big data in the classroom; data governance, Databricks and applied AI at work.",
        stats: [["M.Sc.", "Data Science"], ["2023", "Started"], ["DE", "Hamburg"]],
        pills: ["Machine Learning", "Big Data", "Statistics", "Digital Twins"],
        accent: "a", icon: "🎓", live: true,
    },
];
