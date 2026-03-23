// ── DATA ──────────────────────────────────────────────────────────────
export const PROJECTS = [
    { id: 1, title: "Internal AI Assistant", sub: "Nordex SE · Production", desc: "End-to-end RAG pipeline over 1,690 documents. Custom rapidfuzz tool router solving a core Azure AI Foundry limitation. 11× lower cost, 4× faster inference.", tags: ["Azure AI Foundry", "RAG", "GPT-4o", "Python", "Docker"], color: "#3B82F6", glow: "59,130,246", icon: "🤖", badge: "Production", link: null },
    { id: 2, title: "Digital Twin Dashboard", sub: "TUHH Research", desc: "Real-time anomaly detection & forecasting for a digital twin simulation. Full CI/CD via GitHub Actions + Docker.", tags: ["Python", "Dash", "Plotly", "Docker", "Scikit-learn"], color: "#3B82F6", glow: "59,130,246", icon: "🔬", badge: "Research", link: "https://github.com/rkraeuter/DigitalTwinGF3" },
    { id: 3, title: "Poultry Shield", sub: "AI Veterinary Diagnostics", desc: "CNN achieving 97.51% diagnostic accuracy. Flask + OpenCV on AWS EC2, cutting diagnosis time by 40%.", tags: ["TensorFlow", "Flask", "AWS EC2", "OpenCV"], color: "#3B82F6", glow: "59,130,246", icon: "🐔", badge: "97.51% Acc.", link: "https://github.com/Shahriyar31/Poultry_Shield-Deep-Learning-for-Poultry-Coccidiosis-Diagnosis" },
    { id: 4, title: "Radiation Tracker", sub: "Real-Time Streaming", desc: "GCP streaming platform with Apache Kafka & Flink. Full stack containerised with Docker Compose.", tags: ["Apache Kafka", "Apache Flink", "GCP", "Docker", "Node.js"], color: "#3B82F6", glow: "59,130,246", icon: "☢️", badge: "Real-Time", link: "https://github.com/Shahriyar31/Radiaton_Tracking" },
    { id: 5, title: "StockFlow", sub: "Data Engineering Pipeline", desc: "Real-time stock market pipeline with Apache Kafka, AWS S3, and AWS Glue.", tags: ["Apache Kafka", "AWS S3", "AWS Glue", "Python"], color: "#3B82F6", glow: "59,130,246", icon: "📈", badge: "Data Eng.", link: "https://github.com/Shahriyar31/StockFlow-Real-Time-Stock-Market-Data-Engineering-with-Kafka" },
    { id: 6, title: "Book Analysis", sub: "NLP & Collaborative Filtering", desc: "EDA of Amazon Book Reviews using NLP and collaborative filtering.", tags: ["Python", "Pandas", "NLP", "Jupyter"], color: "#3B82F6", glow: "59,130,246", icon: "📚", badge: "NLP", link: "https://github.com/Shahriyar31/Book-Analysis" },
];

export const SKILLS = {
    "AI & MLOps": ["Azure AI Foundry", "RAG Pipelines", "LLM Evaluation", "MLflow", "TensorFlow", "Scikit-learn", "GPT-4o / GPT-5"],
    "Data Engineering": ["Azure Databricks", "Apache Kafka", "Apache Spark", "Apache Flink", "ETL Pipelines", "Azure Purview"],
    "Cloud & DevOps": ["Azure", "AWS", "GCP", "Docker", "Kubernetes", "GitHub Actions", "Terraform"],
    "Languages & DBs": ["Python", "SQL", "Bash", "PostgreSQL", "MongoDB", "MySQL"],
};

export const ROLES = ["AI & Data Engineer", "MLOps Practitioner", "MSc @ TUHH", "RAG Systems Builder", "Cloud Data Engineer"];
export const SUGGS = ["What did you build at Nordex?", "Your strongest skill?", "Open to work?", "Research at TUHH?"];

export const FACTS = [
    "I moved from India to Hamburg alone at 22 🇮🇳→🇩🇪",
    "I built a RAG pipeline over 1,690 documents at Nordex ⚡",
    "My LLM eval saved 11× in cost vs GPT-5 💸",
    "I shoot landscape & street photography 📷",
    "I speak Bengali, English & basic German 🗣️",
    "My B.Tech CGPA was 8.73 / 10 🎓",
    "I containerised my first app with Docker at 21 🐳",
    "I'm currently open to full-time & Werkstudent roles 🚀",
];

// ── THEMES ────────────────────────────────────────────────────────────
export const DARK = {
    bg: "#0F1115",
    t: "#E5E7EB", m: "#9CA3AF", dim: "#9CA3AF",
    a: "#3B82F6", a2: "#64748B", a3: "#3B82F6",
    card: "#1A1D24",
    border: "#2A2F3A",
    nav: "#0F1115",
};
export const LIGHT = {
    bg: "#F5F7FA",
    t: "#111827", m: "#6B7280", dim: "#6B7280",
    a: "#2563EB", a2: "#94A3B8", a3: "#2563EB",
    card: "#FFFFFF",
    border: "#E5E7EB",
    nav: "#F5F7FA",
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
        body: "Left India alone at 22. Enrolled at TUHH and landed a Werkstudent role at Nordex SE within months — building production AI from scratch. Advanced ML and big data in the classroom. RAG pipelines and LLM evaluation in the real world.",
        stats: [["1,690", "RAG docs"], ["11×", "Cost saved"], ["29", "Eval Q's"]],
        pills: ["Machine Learning", "Big Data", "MLOps", "Statistics", "Digital Twins", "Deep Learning", "Data Eng."],
        accent: "a", icon: "🎓", live: true,
    },
];
