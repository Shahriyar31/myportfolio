// What the Model becomes at each stop. Page elements reference these with data-station="id".
// name = label in the tour HUD, shape = key in ModelScene's shape library, warm = page colour temperature.
export const STATIONS = {
    hero: { name: "The Model", shape: "core" },
    overview: { name: "Follow the data", shape: "flow" },
    lake: { name: "The data lake", shape: "lake" },
    gate: { name: "The governance gate", shape: "gate" },
    tower: { name: "The AI tower", shape: "tower" },
    game: { name: "The security gate", shape: "shield" },
    nordex: { name: "Nordex HQ", shape: "hq" },
    "floor-1": { name: "Nordex HQ · floor 1", shape: "hq1" },
    "floor-2": { name: "Nordex HQ · floor 2", shape: "hq2" },
    "floor-3": { name: "Nordex HQ · floor 3", shape: "hq3" },
    uni: { name: "TUHH · research", shape: "twin" },
    district: { name: "Six things I built", shape: "district" },
    "p-argus": { name: "Argus AI", shape: "shield" },
    "p-radiation": { name: "Radiation Tracker", shape: "radar" },
    "p-stock": { name: "StockFlow", shape: "stock" },
    "p-twin": { name: "Digital Twin", shape: "twin" },
    "p-poultry": { name: "Poultry Shield", shape: "egg" },
    "p-books": { name: "Book Analysis", shape: "books" },
    photos: { name: "West Bengal → Hamburg", shape: "globe", warm: 0.7 },
    "home-college": { name: "West Bengal · my college", shape: "college", warm: 1 },
    "home-house": { name: "West Bengal · home", shape: "house", warm: 1 },
    flight: { name: "CCU → HAM", shape: "plane", warm: 0.5, flight: true },
    tuhh: { name: "TUHH · Hamburg", shape: "cap" },
    sky: { name: "My toolkit", shape: "atom" },
    chat: { name: "Ask my AI", shape: "bubble" },
    lens: { name: "Through my lens", shape: "camera" },
    finale: { name: "Let's talk", shape: "text" },
};

/* The tour, in order — shown in the chapter HUD. id = section id on the page. */
export const CHAPTERS = [
    ["bring", "What I do"],
    ["game", "Bonus level"],
    ["work", "Experience"],
    ["built", "Projects"],
    ["story", "Education"],
    ["skills", "Toolkit"],
    ["agent", "Ask my AI"],
    ["lens", "Photography"],
    ["hello", "Contact"],
];
