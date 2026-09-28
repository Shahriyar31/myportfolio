// Camera poses for every stop in the world. p = camera position, l = look-at.
// Page elements reference these with data-station="id".
export const STATIONS = {
    hero: { name: "The valley", p: [0, 25, 60], l: [0, 12, 0] },
    overview: { name: "The valley", p: [0, 24, 32], l: [0, 0, 0] },
    lake: { name: "The data lake", p: [-17, 8, 3], l: [-4, 1.5, 1], focus: "lake" },
    tower: { name: "The AI tower", p: [19, 11, 6], l: [9.5, 5.5, -4], focus: "tower" },
    gate: { name: "The governance gate", p: [11, 8, 12], l: [3, 2, -1], focus: "gate" },
    security: { name: "The governance gate", p: [16, 9, 8], l: [4.5, 2.5, -0.5], focus: "gate" },
    game: { name: "The governance gate", p: [9, 9, 12], l: [3, 2, -1], focus: "gate" },
    "floor-1": { name: "Nordex HQ · floor 1", p: [4, 4.5, 20], l: [-3, 3, 10], focus: "floor-1" },
    "floor-2": { name: "Nordex HQ · floor 2", p: [4, 7.5, 20], l: [-3, 6, 10], focus: "floor-2" },
    "floor-3": { name: "Nordex HQ · floor 3", p: [4, 10.5, 20], l: [-3, 9, 10], focus: "floor-3" },
    uni: { name: "TUHH campus", p: [-3, 7, 21], l: [5, 1.5, 11], focus: "uni" },
    sky: { name: "Above the valley", p: [6, 30, 30], l: [0, 22, -20] },
    "p-argus": { name: "The Argus lab", p: [25, 9, 0], l: [13.5, 1.5, -11], focus: "p-argus" },
    "p-poultry": { name: "The barn", p: [-8, 5, 18], l: [-15, 1, 10] },
    "p-radiation": { name: "The radar", p: [22, 6, 7], l: [16, 2.5, 0] },
    "p-stock": { name: "The ticker tower", p: [18, 6, 20], l: [11.5, 1.5, 12.5] },
    "p-twin": { name: "The twin buildings", p: [-3, 5, 21], l: [-9.5, 1.8, 13.5] },
    "p-books": { name: "Campus · the library", p: [7, 4.5, 22], l: [1.5, 1.4, 14.8] },
    "home-college": { name: "Home island · my college", p: [-66, 4, -48], l: [-79.5, -2, -61], warm: 1 },
    "home-house": { name: "Home island · home", p: [-68, 2.5, -52], l: [-75, -2, -58], warm: 1 },
    flight: { name: "CCU → HAM", p: [0, 0, 0], l: [0, 0, 0], warm: 0.5, follow: true },
    "tuhh": { name: "TUHH campus", p: [-3, 7, 21], l: [5, 1.5, 11], focus: "uni" },
    nordex: { name: "Nordex HQ", p: [4, 9, 22], l: [-3, 5, 10], focus: "hq" },
    now: { name: "The Argus lab", p: [21, 6, -4], l: [13.5, 1.5, -11], focus: "p-argus" },
    chat: { name: "My desk", p: [-8, 3.4, 9], l: [-12.5, 1.1, 4.5] },
    photos: { name: "Home island", p: [-56, 10, -34], l: [-78, -2, -60], warm: 0.7 },
    finale: { name: "Both islands", p: [-22, 40, 44], l: [-34, -2, -26] },
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
