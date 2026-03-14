# FS.dev - Interactive Developer Portfolio

A "mind-blowing", highly interactive, performance-optimized premium developer portfolio. Built to feel less like a static webpage and more like a spatial UI / WebGL application using pure React and deep HTML5 Canvas integrations. 

![Portfolio Preview](./public/preview.jpg) *(Add a screenshot here later!)*

## 🚀 Features & Technical Highlights

This portfolio avoids standard static templates by building complex 2D and 3D visual paradigms from scratch:

* **Neural / Globe Hero Background (`<NeuralCanvas />`)**: A combined interactive ink ripple effect overlaying floating "neural nodes", an animated 3D wireframe globe, and swarming particles, all reacting to the user's cursor. Built in native Canvas to bypass heavy Three.js dependencies.
* **Spatial UI Journey Timeline (`<JourneyTimeline />`)**: A totally unconventional timeline that abandons traditional layouts for a multi-layered, interactive 3D scene (using CSS `translateZ`). Actively hovered items snap forward while blurring and desaturating surrounding content in physically simulated Depth-of-Field.
* **3D Particle Skills Galaxy (`<SkillsUniverse />`)**: A mathematical mapping of 26 skills into orbiting 3D rings that counter-rotate text so labels automatically face the camera while traversing the orbit.
* **Page-Level Reveal Engineering**: Custom intersection observers tied to staggered CSS keyframe fade-ups (`.rv`, `.rv2`, `.rv3`) create a buttery-smooth narrative experience as users scroll.
* **Premium Glassmorphism**: Extreme usage of `backdrop-filter`, multi-stop radial gradients, and dynamic inner/outer shadows to create a truly deep and layered physical appearance, especially on the `<ContactTerminal />`.
* **Zero Heavy UI Libraries**: No Tailwind, no Framer Motion, no Three.js. 100% written in raw vanilla CSS and `requestAnimationFrame()` canvas loops to prove foundational mastery of frontend browser rendering mechanics.
* **Dynamic Theme Context**: A bespoke, deeply integrated color system handling Light & Dark themes effortlessly by propagating JS constants down through inline styles and global CSS properties seamlessly.

## 🛠️ Built With

* **Core**: React 19, JavaScript (ES6+), HTML5, CSS3
* **Build Tool**: Vite 8
* **Animations**: Native CSS Keyframes & JavaScript `requestAnimationFrame` 
* **Hosting / Deployment**: Designed for GitHub Pages (or Vercel, Netlify)

## 📡 Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shahriyar31/My_Portfolio.git
   cd My_Portfolio
   ```

2. **Install dependencies (it's very lean):**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled assets will be strictly optimized and generated in the `/dist` directory.

## 📁 Architecture Overview

* `/src/components/` - The core logic of the UI.
  * **Canvas Engines**: `NeuralCanvas.jsx`, `SkillsUniverse.jsx`, `SkillsCanvas.jsx`, `AboutCanvas.jsx`.
  * **Interactive Widgets**: `ContactTerminal.jsx`, `JourneyTimeline.jsx`, `EduScrollBook.jsx`, `PhotoGallery.jsx`.
  * **Navigation & Utils**: `SideNav.jsx`, `Cursor.jsx`, `Mag.jsx` (Magnetic buttons).
* `/src/data/constants.js` - Global source of truth. Contains all projects, timeline events, skills objects, facts, and Light/Dark RGB/HEX theme configurations.
* `/src/styles/global.js` - Programmatically injected global CSS that configures typography, scrollbars, and complex 3D keyframe animations.

## 💡 Performance Mechanisms

Given the sheer volume of interactive elements happening concurrently, several limits were engineered:
1. **Device Throttling**: Heavy Canvas objects run cheap checks via `window.matchMedia("(max-width: 768px)")` and `(prefers-reduced-motion)` to scale down node counts and disable hardware-accelerated cursor modifications on mobile phones.
2. **`translate3d` Acceleration**: Floating nodes, scrolling images, and UI manipulations heavily utilize GPU offloading logic. 
3. **Passive Listeners**: Scroll and mouse polling is kept as lightweight as possible. 

## 📝 License & Contact

* Code created by **Farhan Shahriyar**.
* [LinkedIn Profile](https://www.linkedin.com/in/farhanshahriyar) | [GitHub Profile](https://github.com/Shahriyar31)
