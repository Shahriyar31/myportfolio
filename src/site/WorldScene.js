import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getPalette, onPalette, getMode } from "./theme";

/*
 * The world behind the whole site.
 *  - Main island (Hamburg): a data valley. Sources (wind, solar, factory) →
 *    terraced data lake (bronze/silver/gold) → governance gate (blocks red
 *    attack packets) → AI tower → town. Plus the office tower (experience),
 *    the university, and one building per project.
 *  - Home island (West Bengal), far away; a plane flies between them.
 * The page drives the camera between named stations (see stations.js).
 */

const rnd = (s => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646)(11);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export default class WorldScene {
    constructor(canvas, { mobile = false, onHover } = {}) {
        this.canvas = canvas; this.mobile = mobile; this.onHover = onHover;
        const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
        r.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.3 : 1.6));
        r.outputColorSpace = THREE.SRGBColorSpace;
        r.toneMapping = THREE.ACESFilmicToneMapping;
        r.shadowMap.enabled = !mobile;
        r.shadowMap.type = THREE.PCFSoftShadowMap;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 600);
        this.camPos = V(0, 30, 60); this.camLook = V(0, 0, 0);
        this.goalPos = this.camPos.clone(); this.goalLook = this.camLook.clone();
        this.pointer = new THREE.Vector2(); this.smooth = new THREE.Vector2();
        this.clock = new THREE.Clock();
        this.spin = []; this.anim = []; this.windows = []; this.pickables = [];
        this.focusId = null; this.flight = 0;

        this.M = this.materials();
        this.sky(); this.lights();
        this.mainIsland(); this.homeIsland(); this.streams(); this.plane(); this.clouds();
        this.applyPalette(); this.off = onPalette(() => this.applyPalette());
        this.ray = new THREE.Raycaster();
        this.resize = this.resize.bind(this); this.tick = this.tick.bind(this);
        this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas); this.resize();
    }

    /* ── materials & helpers ───────────────────────────────────────── */
    materials() {
        const c = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...o });
        const glow = color => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, roughness: 0.4 });
        return {
            grass: c(0x7fbf73, { flatShading: true }), grass2: c(0x6aab62, { flatShading: true }), rock: c(0xb89a7e, { flatShading: true }), rock2: c(0x96806c, { flatShading: true }),
            sand: c(0xe6d3aa), path: c(0xe9dfca), white: c(0xf3f0ea), cream: c(0xeadcc3), roof: c(0xd9735a), roof2: c(0x6d7fa6), brick: c(0xc66a4a),
            wood: c(0x94664a), leaf: c(0x4f9a5a, { flatShading: true }), leaf2: c(0x66b36a, { flatShading: true }), dark: c(0x39424e), steel: c(0xcfd6df, { roughness: 0.5, metalness: 0.2 }),
            glass: new THREE.MeshStandardMaterial({ color: 0x7fb6d9, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.88 }),
            panel: c(0x2c4f7a, { roughness: 0.3, metalness: 0.4 }), red: c(0xe0524d), gold: c(0xf0c24e, { metalness: 0.3, roughness: 0.4 }),
            bronze: c(0xb97c4d, { metalness: 0.25, roughness: 0.5 }), silver: c(0xc3ccd6, { metalness: 0.35, roughness: 0.4 }),
            accent: glow(0x73d4ff), accent2: glow(0xb69cff), warn: glow(0xff5d5d), ok: glow(0x3ee08f),
            window: new THREE.MeshStandardMaterial({ color: 0x33414f, emissive: 0xffc46b, emissiveIntensity: 0, roughness: 0.4 }),
            cloud: c(0xffffff, { roughness: 1 }),
        };
    }
    mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
        const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !this.mobile; m.receiveShadow = !this.mobile;
        (parent || this.scene).add(m); return m;
    }
    box(w, h, d, mat, x, y, z, p, r = 0.08) { return this.mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat, x, y + h / 2, z, p); }
    cyl(rt, rb, h, mat, x, y, z, p, s = 20) { return this.mesh(new THREE.CylinderGeometry(rt, rb, h, s), mat, x, y + h / 2, z, p); }
    group(x, z, id, label, y = 0, parent) {
        const g = new THREE.Group(); g.position.set(x, y, z); (parent || this.scene).add(g);
        if (id) g.userData = { id, label };
        return g;
    }
    pick(g) { g.traverse(o => { if (o.isMesh) { o.userData.pick = g; this.pickables.push(o); } }); return g; }

    /* ── sky & light ───────────────────────────────────────────────── */
    sky() {
        this.skyU = { top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, stars: { value: 0 }, time: { value: 0 } };
        this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
            side: THREE.BackSide, depthWrite: false, fog: false, uniforms: this.skyU,
            vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
            fragmentShader: `uniform vec3 top, mid, bot; uniform float stars, time; varying vec3 vP;
                float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
                void main(){ float y = vP.y; vec3 c = y > 0. ? mix(mid, top, smoothstep(0., .55, y)) : mix(mid, bot, smoothstep(0., -.4, -y * -1.));
                  vec3 cell = floor(vP * 300.); float s = step(.9965, h(cell)) * smoothstep(.05, .4, y) * stars; s *= .6 + .4 * sin(time * 2. + h(cell) * 40.);
                  gl_FragColor = vec4(c + s, 1.); }`,
        })));
        this.scene.fog = new THREE.Fog(0xffffff, 70, 230);
    }
    lights() {
        this.hemi = new THREE.HemisphereLight(0xffffff, 0x7a6a5a, 1);
        const s = this.sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
        s.position.set(22, 34, 18); s.castShadow = !this.mobile; s.shadow.mapSize.set(2048, 2048);
        Object.assign(s.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 }); s.shadow.bias = -0.0008; s.shadow.normalBias = 0.03;
        this.scene.add(this.hemi, s);
    }

    /* ── islands ───────────────────────────────────────────────────── */
    islandBase(parent, R, seed = 1) {
        const top = new THREE.CylinderGeometry(R, R * 0.97, 1.4, 64, 1);
        this.mesh(top, this.M.grass, 0, -0.7, 0, parent);
        const under = new THREE.ConeGeometry(R * 0.97, R * 1.25, 18, 5);
        const p = under.attributes.position;
        for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < R * 0.6) { p.setX(i, p.getX(i) * (0.9 + rnd() * 0.25)); p.setZ(i, p.getZ(i) * (0.9 + rnd() * 0.25)); } }
        under.computeVertexNormals();
        const u = this.mesh(under, this.M.rock, 0, -1.4 - R * 0.625, 0, parent); u.rotation.x = Math.PI;
        this.mesh(new THREE.CylinderGeometry(R * 0.985, R * 0.985, 0.35, 64), this.M.rock2, 0, -1.55, 0, parent);
    }
    tree(parent, x, z, s = 1) {
        const g = this.group(x, z, null, null, 0, parent);
        this.cyl(0.07 * s, 0.1 * s, 0.5 * s, this.M.wood, 0, 0, 0, g, 6);
        this.mesh(new THREE.ConeGeometry(0.45 * s, 1 * s, 7), rnd() < 0.5 ? this.M.leaf : this.M.leaf2, 0, 0.95 * s, 0, g);
        this.mesh(new THREE.ConeGeometry(0.32 * s, 0.7 * s, 7), this.M.leaf2, 0, 1.4 * s, 0, g);
        g.rotation.y = rnd() * 6;
    }
    palm(parent, x, z) {
        const g = this.group(x, z, null, null, 0, parent);
        const t = this.cyl(0.07, 0.12, 1.8, this.M.wood, 0, 0, 0, g, 6); t.rotation.z = 0.12;
        for (let i = 0; i < 6; i++) { const l = this.mesh(new RoundedBoxGeometry(1.1, 0.05, 0.28, 1, 0.02), this.M.leaf, 0, 1.85, 0, g); l.rotation.set(0, (i / 6) * Math.PI * 2, -0.4); l.translateX(0.5); }
    }
    house(parent, x, z, s = 1, roof = this.M.roof) {
        const g = this.group(x, z, null, null, 0, parent);
        this.box(1.1 * s, 0.9 * s, 1 * s, this.M.cream, 0, 0, 0, g);
        const rf = this.mesh(new THREE.ConeGeometry(0.95 * s, 0.7 * s, 4), roof, 0, 1.25 * s, 0, g); rf.rotation.y = Math.PI / 4;
        const w = this.box(0.22 * s, 0.22 * s, 0.04, this.M.window, 0.25 * s, 0.4 * s, 0.5 * s, g, 0.02); this.windows.push(w);
        g.rotation.y = rnd() * 6;
        return g;
    }
    turbine(parent, x, z, h = 5) {
        const g = this.group(x, z, null, null, 0, parent);
        this.cyl(0.09, 0.2, h, this.M.white, 0, 0, 0, g, 12);
        this.box(0.35, 0.3, 0.7, this.M.white, 0, h - 0.05, -0.1, g, 0.1);
        const rotor = new THREE.Group(); rotor.position.set(0, h + 0.1, 0.3); g.add(rotor);
        this.mesh(new THREE.SphereGeometry(0.14, 12, 8), this.M.white, 0, 0, 0, rotor);
        for (let i = 0; i < 3; i++) { const a = new THREE.Group(); a.rotation.z = (i * Math.PI * 2) / 3; rotor.add(a); this.mesh(new RoundedBoxGeometry(0.16, 2.3, 0.05, 1, 0.04), this.M.white, 0, 1.2, 0, a); }
        this.spin.push({ o: rotor, axis: "z", speed: -1.4 - rnd() });
        g.rotation.y = -0.4;
    }

    mainIsland() {
        const W = this.main = this.group(0, 0); const M = this.M;
        this.islandBase(W, 18);
        // hills in the north-west for the energy sources
        [[-11, -8, 4, 2.2], [-6, -12, 3.2, 1.6], [-13, -1, 3, 1.4]].forEach(([x, z, r, h]) => { const m = this.mesh(new THREE.ConeGeometry(r, h, 9, 1), M.grass2, x, h / 2 - 0.02, z, W); m.rotation.y = rnd(); });
        // paths
        const path = new THREE.Mesh(new THREE.RingGeometry(7.2, 7.9, 64), M.path); path.rotation.x = -Math.PI / 2; path.position.y = 0.02; path.receiveShadow = true; W.add(path);

        // Sources
        const src = this.pick(this.group(-10, -7, "sources", "Data sources", 0, W));
        [[-1.2, -1.2, 5.2], [1.3, -1.8, 4.6], [-0.2, 1.4, 4.2]].forEach(([x, z, h]) => this.turbine(src, x, z, h));
        const solar = this.pick(this.group(-4.5, -12.5, "sources", "Data sources", 0, W));
        for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { const p = this.box(0.9, 0.06, 0.6, M.panel, j * 1.05 - 1.6, 0.4, i * 0.85 - 0.8, solar, 0.02); p.rotation.x = -0.5; this.cyl(0.03, 0.03, 0.4, M.dark, j * 1.05 - 1.6, 0, i * 0.85 - 0.8, solar, 6); }
        const fac = this.pick(this.group(-14, 3.5, "sources", "Data sources", 0, W));
        this.box(2.4, 1.3, 1.6, M.steel, 0, 0, 0, fac); this.box(1.2, 0.9, 1.2, M.roof2, -0.7, 1.3, 0, fac);
        this.cyl(0.18, 0.24, 2.6, M.brick, 0.8, 0, 0.3, fac, 10);
        this.smoke = []; for (let i = 0; i < 4; i++) { const s = this.mesh(new THREE.SphereGeometry(0.28, 10, 8), M.cloud, 0.8, 2.8 + i * 0.5, 0.3, fac); s.castShadow = false; this.smoke.push({ m: s, k: i }); }

        // Data lake — terraced pools bronze → silver → gold
        const lake = this.lake = this.pick(this.group(-4, 1, "lake", "Data lake · Databricks", 0, W));
        this.lakeWater = [];
        [[3.2, 0, M.bronze], [2.3, 0.55, M.silver], [1.4, 1.1, M.gold]].forEach(([r, y, mat], i) => {
            this.cyl(r, r + 0.1, 0.5, mat, 0, y, 0, lake, 40);
            const w = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.22, r - 0.22, 0.06, 40), new THREE.MeshStandardMaterial({ color: 0x3aa7d8, emissive: 0x1d7fb0, emissiveIntensity: 0.35, roughness: 0.1, metalness: 0.3 }));
            w.position.y = y + 0.5; lake.add(w); this.lakeWater.push(w);
            if (i < 2) { const fall = this.box(0.35, 0.55, 0.12, w.material, r - 0.35, y + 0.05, 0, lake, 0.04); fall.rotation.y = 0; }
        });

        // Governance gate
        const gate = this.gate = this.pick(this.group(3, -1, "gate", "Governance gate", 0, W));
        this.box(0.7, 3.2, 0.7, M.white, -1.6, 0, 0, gate, 0.15); this.box(0.7, 3.2, 0.7, M.white, 1.6, 0, 0, gate, 0.15);
        const arch = this.mesh(new THREE.TorusGeometry(1.6, 0.32, 12, 24, Math.PI), M.white, 0, 3.2, 0, gate); arch.castShadow = true;
        const sh = new THREE.Shape(); sh.moveTo(0, -0.62); sh.quadraticCurveTo(0.56, -0.3, 0.5, 0.36); sh.lineTo(0, 0.5); sh.lineTo(-0.5, 0.36); sh.quadraticCurveTo(-0.56, -0.3, 0, -0.62);
        this.shield = this.mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }), M.accent, 0, 4.1, -0.07, gate);
        this.beam = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 3), new THREE.MeshBasicMaterial({ color: 0x73d4ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
        this.beam.position.set(0, 1.5, 0); gate.add(this.beam);
        gate.rotation.y = Math.PI / 2 - 0.2;

        // AI tower
        const tw = this.tower = this.pick(this.group(9.5, -4, "tower", "AI agent", 0, W));
        this.cyl(1.1, 1.5, 0.6, M.white, 0, 0, 0, tw, 24);
        this.cyl(0.55, 0.85, 5.6, M.steel, 0, 0.6, 0, tw, 24);
        for (let i = 0; i < 5; i++) this.cyl(0.62 + (4 - i) * 0.06, 0.62 + (4 - i) * 0.06, 0.12, M.accent, 0, 1.2 + i * 1, 0, tw, 24);
        this.core = this.mesh(new THREE.IcosahedronGeometry(0.9, 1), M.accent2, 0, 7.4, 0, tw); this.core.castShadow = false;
        this.coreRings = [0, 1].map(i => { const r = this.mesh(new THREE.TorusGeometry(1.45 + i * 0.35, 0.04, 8, 64), M.accent, 0, 7.4, 0, tw); r.rotation.x = 1.1 + i * 0.5; return r; });

        // Town — where trusted answers arrive
        const town = this.pick(this.group(12, 5, "town", "People & teams", 0, W));
        [[0, 0], [1.7, -0.6], [-1.5, 1.2], [0.6, 1.9], [2.2, 1.4], [-0.4, -1.8]].forEach(([x, z], i) => this.house(town, x, z, 0.9 + (i % 3) * 0.12, i % 2 ? this.M.roof : this.M.roof2));

        // Office tower — experience, one lit floor per role
        const hq = this.hq = this.pick(this.group(-3, 10, "hq", "Office tower · Experience", 0, W));
        this.box(3.2, 0.4, 3.2, M.white, 0, 0, 0, hq, 0.1);
        this.box(2.4, 9, 2.4, M.glass, 0, 0.4, 0, hq, 0.12);
        this.floors = [];
        for (let i = 0; i < 9; i++) { const f = this.box(2.5, 0.08, 2.5, M.white, 0, 0.4 + i * 1, 0, hq, 0.02); if (i === 2 || i === 5 || i === 8) { const band = this.box(2.52, 0.55, 2.52, new THREE.MeshStandardMaterial({ color: 0x2d3a4a, emissive: 0x73d4ff, emissiveIntensity: 0.15, transparent: true, opacity: 0.55 }), 0, 0.55 + i * 1 - (i === 8 ? 0.2 : 0), 0, hq, 0.04); this.floors.push(band); } }
        this.box(0.08, 1.2, 0.08, M.dark, 0.6, 9.4, 0.6, hq, 0.02);

        // University (TUHH)
        const uni = this.uni = this.pick(this.group(5, 11, "uni", "University · TUHH", 0, W));
        this.box(4, 0.3, 2.4, M.white, 0, 0, 0, uni, 0.05); this.box(3.6, 1.8, 1.4, M.cream, 0, 0.3, -0.4, uni);
        for (let i = 0; i < 6; i++) this.cyl(0.12, 0.12, 1.8, M.white, -1.5 + i * 0.6, 0.3, 0.6, uni, 12);
        const ped = this.mesh(new THREE.CylinderGeometry(0, 2.1, 0.9, 3), M.white, 0, 2.6, 0.2, uni); ped.rotation.set(Math.PI / 2, 0, 0); ped.scale.set(1, 0.35, 1); ped.rotation.x = 0; ped.rotation.y = Math.PI / 2;

        // Projects
        const lab = this.labG = this.pick(this.group(13.5, -11, "p-argus", "Argus AI", 0, W));
        this.cyl(1.9, 2, 0.5, M.white, 0, 0, 0, lab, 36);
        const dome = this.mesh(new THREE.SphereGeometry(1.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.glass, 0, 0.5, 0, lab); dome.castShadow = false;
        this.mesh(new THREE.SphereGeometry(0.45, 20, 12), M.accent, 0, 1, 0, lab);
        this.cyl(0.04, 0.04, 1.6, M.dark, 1, 1.6, 0, lab, 6); this.mesh(new THREE.SphereGeometry(0.12, 10, 8), M.red, 1, 3.3, 0, lab);

        const barn = this.pick(this.group(-15, 10, "p-poultry", "Poultry Shield", 0, W));
        this.box(2.2, 1.4, 1.6, M.brick, 0, 0, 0, barn);
        const tri = new THREE.Shape(); tri.moveTo(-1.25, 0); tri.lineTo(1.25, 0); tri.lineTo(0, 0.95); tri.closePath();
        const roofB = this.mesh(new THREE.ExtrudeGeometry(tri, { depth: 1.7, bevelEnabled: false }), M.white, 0, 1.4, -0.85, barn);
        this.box(0.6, 0.8, 0.04, M.white, 0, 0, 0.81, barn, 0.02);
        this.chickens = []; for (let i = 0; i < 5; i++) { const c = this.group(-1 + i * 0.5, 1.6 + (i % 2) * 0.5, null, null, 0, barn); this.mesh(new THREE.SphereGeometry(0.16, 10, 8), M.white, 0, 0.16, 0, c); this.mesh(new THREE.SphereGeometry(0.09, 8, 6), M.white, 0.12, 0.33, 0, c); this.mesh(new THREE.ConeGeometry(0.04, 0.08, 6), M.gold, 0.22, 0.33, 0, c).rotation.z = -Math.PI / 2; this.mesh(new THREE.SphereGeometry(0.05, 6, 6), M.red, 0.12, 0.43, 0, c); this.chickens.push({ g: c, k: i }); }

        const radar = this.pick(this.group(16, 0, "p-radiation", "Radiation Tracker", 0, W));
        this.cyl(0.18, 0.3, 3.2, M.steel, 0, 0, 0, radar, 10);
        const dish = this.radarDish = new THREE.Group(); dish.position.y = 3.4; radar.add(dish);
        const d = this.mesh(new THREE.SphereGeometry(1.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3), M.white, 0, 0, 0, dish); d.rotation.x = Math.PI / 2 + 0.5;
        this.mesh(new THREE.SphereGeometry(0.1, 8, 6), M.warn, 0, 0.3, 0.6, dish);

        const stock = this.pick(this.group(11.5, 12.5, "p-stock", "StockFlow", 0, W));
        this.bars = []; for (let i = 0; i < 6; i++) { const b = this.box(0.35, 1, 0.35, i % 2 ? M.accent : M.accent2, i * 0.5 - 1.25, 0, 0, stock, 0.06); b.userData.k = i; this.bars.push(b); }
        this.box(3.2, 0.2, 0.9, M.white, 0, 0, 0, stock, 0.05);

        const twin = this.pick(this.group(-9.5, 13.5, "p-twin", "Digital Twin", 0, W));
        this.box(1.2, 3, 1.2, M.cream, -0.9, 0, 0, twin);
        const wire = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3, 1.2), new THREE.MeshBasicMaterial({ color: 0x73d4ff, wireframe: true, transparent: true, opacity: 0.7 })); wire.position.set(0.9, 1.5, 0); twin.add(wire); this.twinWire = wire;

        const lib = this.pick(this.group(-16, -6, "p-books", "Book Analysis", 0, W));
        this.box(2, 1.6, 1.4, M.cream, 0, 0, 0, lib); const lr = this.mesh(new THREE.ConeGeometry(1.5, 0.8, 4), M.roof2, 0, 2, 0, lib); lr.rotation.y = Math.PI / 4;
        [M.red, M.gold, M.accent, M.accent2, M.ok].forEach((m, i) => this.box(0.18, 0.55, 0.4, m, -0.6 + i * 0.28, 0, 0.9, lib, 0.03));

        // trees & rocks
        for (let i = 0; i < (this.mobile ? 26 : 48); i++) {
            const a = rnd() * Math.PI * 2, rr = 9 + rnd() * 8;
            const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
            if (Math.hypot(x + 3, z - 10) < 3 || Math.hypot(x - 5, z - 11) < 3.2 || Math.hypot(x - 12, z - 5) < 3 || Math.hypot(x - 13.5, z + 11) < 2.8 || Math.hypot(x + 15, z - 10) < 2.5 || Math.hypot(x - 16, z) < 1.8 || Math.hypot(x - 8, z - 14.5) < 2.4 || Math.hypot(x + 9.5, z - 13.5) < 2.2 || Math.hypot(x + 16, z + 6) < 2.2 || Math.hypot(x + 14, z - 3.5) < 2.6) continue;
            this.tree(W, x, z, 0.8 + rnd() * 0.6);
        }
        // street lamps along the path (glow at night)
        this.lamps = [];
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.3, x = Math.cos(a) * 8.3, z = Math.sin(a) * 8.3; this.cyl(0.04, 0.05, 1.1, M.dark, x, 0, z, W, 6); const b = this.mesh(new THREE.SphereGeometry(0.12, 10, 8), M.window, x, 1.2, z, W); this.windows.push(b); }
    }

    homeIsland() {
        const H = this.home = this.group(-78, -60, null, null, -3); const M = this.M;
        this.islandBase(H, 8);
        const college = this.homeCollege = this.pick(this.group(-1.5, -1, "college", "Cooch Behar Govt. Engineering College", 0, H));
        this.box(3.6, 1.6, 1.8, M.brick, 0, 0, 0, college); this.box(1.2, 2.4, 1.2, M.brick, 0, 0, 0.1, college);
        for (let i = 0; i < 5; i++) { const w = this.box(0.3, 0.35, 0.04, M.window, -1.4 + i * 0.7, 0.8, 0.92, college, 0.02); this.windows.push(w); }
        this.homeHouse = this.house(H, 3, 2, 1.2);
        [[4.5, -2], [-4.5, 2.5], [1, 4.5], [-3.5, -4], [5, 3.5], [-5.5, -1]].forEach(([x, z]) => this.palm(H, x, z));
        const pond = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), new THREE.MeshStandardMaterial({ color: 0x3aa7d8, roughness: 0.1 })); pond.rotation.x = -Math.PI / 2; pond.position.set(-1, 0.03, 3.5); H.add(pond);
    }

    /* ── data streams ──────────────────────────────────────────────── */
    streams() {
        const W = this.main, L = (x, y, z) => V(x, y, z);
        const curves = {
            wind: [L(-10, 1.2, -7), L(-8, 3, -4), L(-5.5, 2.2, 0), L(-4, 2, 1)],
            solar: [L(-4.5, 0.8, -12.5), L(-5, 3, -8), L(-4.4, 2.4, -2), L(-4, 2, 1)],
            factory: [L(-14, 2, 3.5), L(-10, 3.5, 3), L(-6.5, 2.5, 1.8), L(-4, 2, 1)],
            toGate: [L(-4, 2, 1), L(-1, 3, 0.5), L(1.5, 2.4, -0.5), L(3, 1.6, -1)],
            toTower: [L(3, 1.6, -1), L(5.5, 3, -2), L(8, 5, -3.5), L(9.5, 7.3, -4)],
            toTown: [L(9.5, 7.3, -4), L(11.5, 6, 0), L(12.5, 3, 3.5), L(12, 1.2, 5)],
            toHq: [L(9.5, 7.3, -4), L(4, 8, 4), L(-1, 6, 9), L(-3, 5, 10)],
            attack: [L(20, 4, 4), L(12, 5, 3), L(6, 3, 0.5), L(3.3, 1.8, -0.8)],
        };
        this.curves = {};
        const lineMat = this.lineMat = new THREE.MeshBasicMaterial({ color: 0x73d4ff, transparent: true, opacity: 0.25, depthWrite: false });
        Object.entries(curves).forEach(([k, pts]) => {
            const c = new THREE.CatmullRomCurve3(pts); this.curves[k] = c;
            if (k !== "attack") W.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.03, 5, false), lineMat));
        });
        const N = this.mobile ? 90 : 180;
        this.packets = [];
        const keys = ["wind", "solar", "factory", "toGate", "toTower", "toTown", "toHq", "attack"];
        const geo = new THREE.SphereGeometry(0.11, 10, 8);
        this.pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        this.pInst = new THREE.InstancedMesh(geo, this.pMat, N); W.add(this.pInst);
        const colA = new THREE.Color(0x73d4ff), colB = new THREE.Color(0xb69cff), colR = new THREE.Color(0xff4d4d);
        for (let i = 0; i < N; i++) {
            const k = keys[i % keys.length];
            this.packets.push({ k, t: rnd(), v: 0.05 + rnd() * 0.05 });
            this.pInst.setColorAt(i, k === "attack" ? colR : rnd() < 0.5 ? colA : colB);
        }
        this.dummy = new THREE.Object3D();
        this.zaps = [];
    }

    plane() {
        const p = this.planeG = new THREE.Group(); this.scene.add(p); const M = this.M; p.scale.setScalar(1.25);
        const body = this.mesh(new THREE.CapsuleGeometry(0.35, 2.2, 6, 14), M.white, 0, 0, 0, p); body.rotation.z = Math.PI / 2;
        this.box(0.6, 0.06, 3, M.white, 0.1, -0.05, 0, p, 0.03);
        this.box(0.4, 0.7, 0.07, M.accent, -1.25, 0.1, 0, p, 0.03);
        this.box(0.3, 0.05, 1.1, M.white, -1.2, 0, 0, p, 0.02);
        for (let i = 0; i < 4; i++) { const w = this.box(0.12, 0.12, 0.04, M.accent, 0.6 - i * 0.35, 0.05, 0.34, p, 0.02); }
        const A = V(-71.5, -2.2, -55), B = V(-8.5, 1.4, 4.5), mid = A.clone().lerp(B, 0.5).add(V(0, 26, 0));
        this.flightCurve = new THREE.QuadraticBezierCurve3(A, mid, B);
        const trail = this.trailGeo = new THREE.BufferGeometry().setFromPoints(this.flightCurve.getPoints(120));
        this.trail = new THREE.Line(trail, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.8, gapSize: 0.6, transparent: true, opacity: 0.6 }));
        this.trail.computeLineDistances(); this.scene.add(this.trail);
    }
    clouds() {
        this.cloudList = [];
        for (let i = 0; i < (this.mobile ? 10 : 18); i++) {
            const c = new THREE.Group();
            [[0, 0, 0, 1.4], [1.3, 0.1, 0, 1], [-1.3, 0, 0.2, 1], [0.3, 0.7, 0, 0.9]].forEach(([x, y, z, s]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(s, 14, 10), this.M.cloud); m.position.set(x, y, z); c.add(m); });
            // a sea of clouds below the islands, and a few far away — never between camera and valley
            const a = rnd() * Math.PI * 2, r = 34 + rnd() * 80, below = i % 3 !== 0;
            c.position.set(Math.cos(a) * r - 20, below ? -16 - rnd() * 10 : 6 + rnd() * 14, Math.sin(a) * r - 30 - (below ? 0 : 50));
            c.scale.setScalar(below ? 2.5 + rnd() * 2.5 : 1.4 + rnd() * 1.4); c.userData.v = 0.2 + rnd() * 0.4;
            this.scene.add(c); this.cloudList.push(c);
        }
    }

    /* ── theme: day / night (+ warm sky over Bengal) ───────────────── */
    applyPalette() {
        const p = getPalette(), night = getMode() === "dark";
        const sky = new THREE.Color(p.sky), hor = new THREE.Color(p.horizon), acc = new THREE.Color(p.accent);
        if (night) {
            this.skyU.top.value.copy(sky).multiplyScalar(0.8); this.skyU.mid.value.copy(hor); this.skyU.bot.value.copy(sky).multiplyScalar(0.6); this.skyU.stars.value = 1;
            this.hemi.intensity = 0.55; this.hemi.color.set(0x9fb3d9); this.sun.intensity = 0.9; this.sun.color.set(0xa8c0ff);
            this.renderer.toneMappingExposure = 1.05; this.scene.fog.color.copy(hor).multiplyScalar(0.8);
            this.M.window.emissiveIntensity = 1.6; this.lineMat.opacity = 0.45;
        } else {
            this.skyU.top.value.copy(sky); this.skyU.mid.value.copy(hor); this.skyU.bot.value.copy(hor).lerp(new THREE.Color(1, 1, 1), 0.3); this.skyU.stars.value = 0;
            this.hemi.intensity = 1.05; this.hemi.color.set(0xffffff); this.sun.intensity = 2.3; this.sun.color.set(0xfff1dc);
            this.renderer.toneMappingExposure = 0.95; this.scene.fog.color.copy(hor);
            this.M.window.emissiveIntensity = 0; this.lineMat.opacity = 0.28;
        }
        this.M.accent.color.copy(acc); this.M.accent.emissive.copy(acc);
        this.lineMat.color.copy(acc);
    }

    /* ── camera / focus control from the page ──────────────────────── */
    setView(pos, look) { this.goalPos.set(...pos); this.goalLook.set(...look); }
    jumpView(pos, look) { this.setView(pos, look); this.camPos.copy(this.goalPos); this.camLook.copy(this.goalLook); }
    setFocus(id) { this.focusId = id; }
    setFlight(t) { this.flight = t; }
    flightPoint(t) { return this.flightCurve.getPoint(t).toArray(); }
    setPointer(x, y) { this.pointer.set(x, y); }
    setOrbit(w) { this.orbitW = w; }

    resize() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        if (!w || !h) return;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.fov = w / h < 0.8 ? 52 : w / h < 1.3 ? 42 : 36;
        this.camera.updateProjectionMatrix();
    }

    hover(cx, cy) {
        const r = this.canvas.getBoundingClientRect();
        this.ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), this.camera);
        const hit = this.ray.intersectObjects(this.pickables, false)[0];
        return hit ? hit.object.userData.pick.userData : null;
    }

    tick() {
        const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
        this.skyU.time.value = t;
        // camera glides; pointer adds a small parallax orbit
        this.camPos.lerp(this.goalPos, 1 - Math.pow(0.001, dt));
        this.camLook.lerp(this.goalLook, 1 - Math.pow(0.001, dt));
        this.smooth.lerp(this.pointer, 0.05);
        const off = V(this.smooth.x * 1.6, this.smooth.y * 0.9, 0);
        this.camera.position.copy(this.camPos).add(off);
        if (this.orbitW > 0.001) { // slow sway around the look point (hero only); fades out with the weight
            const a = Math.sin(t * 0.13) * 0.42 * this.orbitW;
            this.camera.position.sub(this.camLook).applyAxisAngle(V(0, 1, 0), a).add(this.camLook);
        }
        this.camera.lookAt(this.camLook);

        this.spin.forEach(s => { s.o.rotation[s.axis] += s.speed * dt; });
        this.smoke.forEach(s => { const k = (t * 0.35 + s.k / 4) % 1; s.m.position.y = 2.8 + k * 2.4; s.m.scale.setScalar(0.5 + k * 1.2); s.m.material.opacity = 1; });
        this.core.rotation.y += dt * 0.6; this.core.rotation.x += dt * 0.25;
        const coreHot = this.focusId === "tower" ? 1 : 0;
        this.core.scale.setScalar(1 + Math.sin(t * 2.4) * 0.05 + coreHot * 0.15);
        this.coreRings.forEach((r, i) => { r.rotation.z += dt * (0.5 + i * 0.3); });
        this.beam.material.opacity = 0.12 + Math.abs(Math.sin(t * 2)) * 0.18 + (this.focusId === "gate" ? 0.15 : 0);
        this.beam.position.y = 1.5 + Math.sin(t * 1.5) * 0.2;
        this.shield.rotation.y = Math.sin(t) * 0.25;
        this.radarDish.rotation.y += dt * 0.9;
        this.bars.forEach(b => { const h = 0.6 + Math.abs(Math.sin(t * 1.3 + b.userData.k * 0.9)) * 2; b.scale.y = h; b.position.y = h / 2; });
        this.twinWire.rotation.y = Math.sin(t * 0.8) * 0.1;
        this.chickens.forEach(c => { c.g.position.x = -1 + c.k * 0.5 + Math.sin(t * 1.4 + c.k) * 0.2; c.g.rotation.y = Math.sin(t + c.k) * 1.5; });
        this.lakeWater.forEach((w, i) => { w.material.emissiveIntensity = 0.3 + Math.sin(t * 2 + i) * 0.1 + (this.focusId === "lake" ? 0.4 : 0); });
        this.floors.forEach((f, i) => { const on = this.focusId === `floor-${i + 1}` || this.focusId === "hq"; f.material.emissiveIntensity += ((on ? 1.4 : 0.15) - f.material.emissiveIntensity) * 0.08; });
        this.cloudList.forEach(c => { c.position.x += c.userData.v * dt; if (c.position.x > 90) c.position.x = -120; });

        // packets
        const d = this.dummy;
        this.packets.forEach((p, i) => {
            p.t += p.v * dt * (this.focusId === "gate" || this.focusId === "security" ? 1.3 : 1);
            if (p.t > 1) { p.t -= 1; if (p.k === "attack") this.zap(); }
            const pt = this.curves[p.k].getPointAt(p.t);
            d.position.copy(pt);
            d.scale.setScalar(p.k === "attack" ? 1.5 * (p.t > 0.92 ? (1 - p.t) * 12 : 1) : 1);
            d.updateMatrix(); this.pInst.setMatrixAt(i, d.matrix);
        });
        this.pInst.instanceMatrix.needsUpdate = true;
        this.zaps = this.zaps.filter(z => { z.life -= dt; z.m.scale.setScalar(1 + (1 - z.life) * 6); z.m.material.opacity = Math.max(0, z.life); if (z.life <= 0) { this.main.remove(z.m); z.m.geometry.dispose(); z.m.material.dispose(); return false; } return true; });

        // plane: parked in Bengal before the flight, flies during it, parked in Hamburg after
        const f = Math.min(1, Math.max(0, this.flight));
        const pos = this.flightCurve.getPoint(f), ahead = this.flightCurve.getPoint(Math.min(1, f + 0.01));
        this.planeG.position.copy(pos).add(V(0, f > 0 && f < 1 ? 0 : 0.5, 0));
        if (f < 0.999) this.planeG.lookAt(ahead.x, ahead.y, ahead.z);
        this.planeG.rotateY(-Math.PI / 2);
        this.trail.material.opacity = f > 0 && f < 1 ? 0.8 : 0.25;

        this.renderer.render(this.scene, this.camera);
    }
    zap() {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.32, 24), new THREE.MeshBasicMaterial({ color: 0xff5d5d, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
        m.position.set(3.3, 1.8, -0.8); m.lookAt(this.camera.position); this.main.add(m); this.zaps.push({ m, life: 1 });
    }

    start() { if (!this.running) { this.running = true; this.clock.getDelta(); this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() {
        this.stop(); this.off?.(); this.ro.disconnect();
        this.scene.traverse(o => { o.geometry?.dispose(); });
        this.renderer.dispose();
    }
}
