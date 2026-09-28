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
        { id: 1, theta: 128 }, { id: 2, theta: 134 }, { id: 4, theta: 140 }, { id: 5, theta: 146 }, { id: 3, theta: 152 }, { id: 6, theta: 158 },
    ] },
    lab: { theta: 116 },               // my TUHH research, next to Nordex
    journey: { from: 176, cgec: 176, home: 192, runway: 199, to: 262 },   // college → home, getting ready → take-off → ocean → Hamburg
    tuhh: { theta: 272 },
    skills: { theta: 300 },
    lens: { theta: 324 },
    contact: { theta: 346 },
    oceanFrom: 204, oceanTo: 256,
};

/* the sky for each chapter, in page order (colours are the look of that moment) */
const S = (top, bottom, sun, sunI, hemi, ground, stars = 0, rain = 0, fire = 0, lamp = 0) => ({ top, bottom, sun, sunI, hemi, ground, stars, rain, fire, lamp });
export const SKIES = [
    S("#27356f", "#f3a47e", "#ffc59a", 1.9, "#ffd9c2", "#3b4a2c", 0.15, 0, 0, 0.6), // 0 me, at dusk
    S("#101c44", "#4e6fbd", "#b9c8ff", 1.3, "#c8d4ff", "#2a3a2a", 0.55, 0, 0, 1),    // 1 what I do, blue hour
    S("#060a1a", "#1d2b52", "#8fa8ff", 0.9, "#9fb2ff", "#1c2a24", 1, 0, 0, 1),        // 2 break my AI, night
    S("#86b9e8", "#eaf3f9", "#ffffff", 2.4, "#eaf2ff", "#4a5c3a", 0, 0, 0, 0),        // 3 Nordex, morning
    S("#4a9de9", "#d3ebff", "#fff6e0", 2.6, "#f2f7ff", "#55703f", 0, 0, 0, 0),        // 4 projects, bright day
    S("#f08a4b", "#ffe1b3", "#ffb36b", 2.2, "#ffe0c0", "#5a4a2a", 0, 0, 0, 0.3),      // 5 West Bengal, golden hour → flight at night
    S("#6f7d8d", "#c7d0d9", "#e8eef5", 1.4, "#dfe6ee", "#3e4a40", 0, 1, 0, 0.4),      // 6 Hamburg, rain
    S("#58a7ee", "#e0f1ff", "#ffffff", 2.5, "#f4f8ff", "#56713f", 0, 0, 0, 0),        // 7 skills, noon
    S("#120a2c", "#3b2a6d", "#b8a8ff", 0.8, "#b6a8ff", "#1e2030", 1, 0, 1, 1),        // 8 photography, night
    S("#2b1e52", "#ff9b6c", "#ffb58a", 1.7, "#ffd2bf", "#3a3a2a", 0.3, 0, 0.3, 1),    // 9 my desk, sunset
];
export const WB = S("#5aa9e6", "#fff0d2", "#fff1cf", 2.5, "#fff3e0", "#5f7a3a", 0, 0, 0, 0);             // a bright day in West Bengal
export const DAY = S("#6fb8f0", "#eef7ff", "#fff4dc", 2.6, "#f4f8ff", "#5a7a44", 0, 0, 0, 0);          // light theme leans towards this
export const NIGHT = S("#03050d", "#101a3a", "#8fa8ff", 0.6, "#8fa0ff", "#10161e", 1, 0, 0, 0.6); // the flight

/* five skills hidden around the planet: find them all */
export const ORBS = [
    { id: "azure", name: "Azure", color: "#3b9cff", theta: 40, back: -1 },
    { id: "databricks", name: "Databricks", color: "#ff5b3a", theta: 108, back: -1 },
    { id: "rag", name: "RAG & agents", color: "#a58cff", theta: 162, back: -1 },
    { id: "euaiact", name: "EU AI Act", color: "#f2c14e", theta: 278, back: -1 },
    { id: "python", name: "Python", color: "#3ee08f", theta: 330, back: -1 },
];

/* chapters in page order: section id, name for the navigation, icon */
export const CHAPTERS = [
    ["home", "Meet me", "home"],
    ["what", "What I do", "layers"],
    ["break", "Break my AI", "shield"],
    ["experience", "Experience", "work"],
    ["projects", "Projects", "built"],
    ["journey", "My journey", "route"],
    ["skills", "Skills", "keys"],
    ["lens", "Photography", "lens"],
    ["contact", "Contact", "hello"],
];
