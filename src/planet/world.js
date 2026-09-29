/*
 * The planet's map. theta = degrees along the path around the planet (0 = where I start).
 * Walking order = story order: me → what I do → break my AI → Nordex → projects →
 * home in West Bengal → flight over the ocean → Hamburg / TUHH → skills → photos → my desk.
 */
export const R = 12;

export const PLACES = {
    home: { theta: 0 },
    what: { theta: 34 },
    break: { theta: 66 },
    experience: { theta: 100 },
    projects: { theta: 140, items: [
        { id: 1, theta: 128 }, { id: 4, theta: 136 }, { id: 5, theta: 146 }, { id: 3, theta: 152 }, { id: 6, theta: 158 },
    ] },
    lab: { theta: 116 },               // my TUHH research, next to Nordex
    journey: { from: 176, cgec: 176, home: 192, runway: 199, to: 262 },   // college → home, getting ready → take-off → ocean → Hamburg
    tuhh: { theta: 272 },
    skills: { theta: 300 },
    lens: { theta: 318 },
    contact: { theta: 334 },
    oceanFrom: 204, oceanTo: 256,
};

/* the sky for each chapter, in page order (colours are the look of that moment) */
const S = (top, bottom, sun, sunI, hemi, ground, stars = 0, rain = 0, fire = 0, lamp = 0) => ({ top, bottom, sun, sunI, hemi, ground, stars, rain, fire, lamp });
export const SKIES = [  // calm Nord / Catppuccin moods: no hot reds, neon greens or strong yellows
    S("#353c4d", "#a894b4", "#e5dcef", 1.9, "#e7e0f0", "#46553f", 0.15, 0, 0, 0.6), // 0 me, a lavender dusk
    S("#272c38", "#5e6f8f", "#c7d2e6", 1.3, "#cdd6f4", "#34403a", 0.55, 0, 0, 1),    // 1 what I do, blue hour
    S("#1f232b", "#363e50", "#9fb0cf", 0.9, "#a9b6d3", "#27302e", 1, 0, 0, 1),        // 2 break my AI, night
    S("#7f95b5", "#dde3ec", "#ffffff", 2.3, "#e5e9f0", "#4d5c45", 0, 0, 0, 0),        // 3 Nordex, misty morning
    S("#6f8fb8", "#d8e1ec", "#f3f1ea", 2.4, "#eceff4", "#56694a", 0, 0, 0, 0),        // 4 projects, soft day
    S("#6b7894", "#d9c3b3", "#eedfd2", 2.0, "#ece2da", "#5a5646", 0, 0, 0, 0.3),      // 5 West Bengal, a gentle golden hour
    S("#5d6878", "#aeb8c5", "#dfe4ea", 1.4, "#d8dee9", "#3e4a40", 0, 1, 0, 0.4),      // 6 Hamburg, rain
    S("#161a26", "#2e3650", "#a9b6d3", 0.8, "#b4befe", "#1e2330", 1, 0, 0.4, 1),     // 7 skills, a clear starry night
    S("#1e2230", "#3b3f58", "#b4befe", 0.8, "#b4befe", "#20232e", 1, 0, 1, 1),        // 8 photography, night
    S("#2f3446", "#8a7f9e", "#e0d4e6", 1.6, "#ddd3e4", "#3a3d34", 0.3, 0, 0.3, 1),    // 9 my desk, a quiet evening
];
export const WB = S("#7391b8", "#e9e1d6", "#f4ede4", 2.4, "#eee9e2", "#5a6c47", 0, 0, 0, 0);             // a bright day in West Bengal
export const DAY = S("#6fb8f0", "#eef7ff", "#fff4dc", 2.6, "#f4f8ff", "#5a7a44", 0, 0, 0, 0);          // light theme leans towards this
export const NIGHT = S("#1a1d25", "#2e3445", "#a9b6d3", 0.6, "#a9b6d3", "#1c2028", 1, 0, 0, 0.6); // the flight

/* five skills hidden around the planet: find them all */
export const ORBS = [
    { id: "azure", name: "Azure", color: "#81a1c1", theta: 40, back: -1 },
    { id: "databricks", name: "Databricks", color: "#d08770", theta: 108, back: -1 },
    { id: "rag", name: "RAG & agents", color: "#b48ead", theta: 162, back: -1 },
    { id: "euaiact", name: "EU AI Act", color: "#ebcb8b", theta: 278, back: -1 },
    { id: "python", name: "Python", color: "#a3be8c", theta: 330, back: -1 },
];

/* chapters in page order: section id, name for the navigation, icon */
export const CHAPTERS = [
    ["home", "Meet me", "home"],
    ["what", "What I do", "layers"],
    ["break", "Break my AI", "shield"],
    ["experience", "Work experience", "work"],
    ["research", "Research", "flask"],
    ["projects", "Projects", "built"],
    ["journey", "Education", "grad"],
    ["skills", "Skills", "keys"],
    ["lens", "Photography", "lens"],
    ["contact", "Contact", "hello"],
];
