// World-map landmarks → site sections. Kept free of three.js so the page can
// render the labels and quick-travel buttons before the 3D scene loads.
export const LANDMARKS = [
    { id: "chest", kind: "chest", icon: "🎁", name: "What I bring", hint: "Four ways I help teams", section: "bring" },
    { id: "shield", kind: "shield", icon: "🛡️", name: "Boss fight", hint: "Break the AI, then fix it", section: "how" },
    { id: "tower", kind: "tower", icon: "🏢", name: "Experience", hint: "Nordex Group & research", section: "work", top: 2.9 },
    { id: "coins", kind: "coins", icon: "🪙", name: "Skills", hint: "My toolkit", section: "skills" },
    { id: "lab", kind: "lab", icon: "🧪", name: "Projects", hint: "Argus AI & more", section: "built" },
    { id: "home", kind: "home", icon: "🏡", name: "My story", hint: "From West Bengal", section: "quest" },
    { id: "uni", kind: "uni", icon: "🎓", name: "Education", hint: "TUHH & B.Tech", section: "education" },
    { id: "robot", kind: "robot", icon: "🤖", name: "Ask my AI", hint: "Chat with my agent", section: "agent", top: 1.9 },
    { id: "camera", kind: "camera", icon: "📷", name: "Photography", hint: "Through my lens", section: "lens" },
    { id: "mailbox", kind: "mailbox", icon: "✉️", name: "Contact", hint: "Let's work together", section: "hello" },
    { id: "plane", kind: "plane", icon: "✈️", name: "The flight", hint: "7,004 km", section: "quest" },
];
