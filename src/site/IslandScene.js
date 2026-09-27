import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { getPalette, onPalette, getMode } from "./theme";
import { LANDMARKS } from "./landmarks";

/* A floating clay island; every landmark is a section of the site. */

const clay = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.7, clearcoat: 0.3, clearcoatRoughness: 0.6, ...extra });
const M = {
    grass: clay(0x7cc47a), rock: clay(0xc9ae94, { flatShading: true }), rock2: clay(0xa98f79, { flatShading: true }),
    white: clay(0xf4efe7), cream: clay(0xeadfcb), roof: clay(0xe07a5f), wood: clay(0x9c6b4e), leaf: clay(0x4f9e5b, { flatShading: true }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x5bb8ec, roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.85 }),
    steel: clay(0xcfd8e3), dark: clay(0x39424e), gold: clay(0xf2c14e, { metalness: 0.3, roughness: 0.35 }), red: clay(0xe0524d),
    accent: clay(0x73d4ff, { emissive: 0x73d4ff, emissiveIntensity: 0.35 }), cloud: clay(0xffffff, { roughness: 1, clearcoat: 0 }),
};
const box = (w, h, d, m, r = 0.06) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m);
const cyl = (rt, rb, h, m, s = 24) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m);
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

function tree(scale = 1) {
    const g = new THREE.Group();
    g.add(at(cyl(0.07, 0.1, 0.5, M.wood, 8), 0, 0.25, 0));
    g.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 7), M.leaf), 0, 0.8, 0));
    g.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 7), M.leaf), 0, 1.15, 0));
    g.scale.setScalar(scale);
    return g;
}
function palm() {
    const g = new THREE.Group();
    const trunk = cyl(0.06, 0.1, 1.4, M.wood, 8); trunk.position.y = 0.7; trunk.rotation.z = 0.15; g.add(trunk);
    for (let i = 0; i < 5; i++) {
        const l = box(0.9, 0.04, 0.22, M.leaf, 0.02);
        l.position.set(-0.1, 1.42, 0); l.rotation.set(0, (i / 5) * Math.PI * 2, -0.45); l.translateX(0.4);
        g.add(l);
    }
    return g;
}

const BUILDERS = {
    home() {
        const g = new THREE.Group();
        g.add(at(box(1, 0.75, 0.9, M.cream), 0, 0.38, 0));
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.6, 4), M.roof); roof.position.y = 1.05; roof.rotation.y = Math.PI / 4; g.add(roof);
        g.add(at(box(0.22, 0.4, 0.05, M.wood, 0.02), 0, 0.2, 0.46));
        g.add(at(palm(), 0.85, 0, 0.2));
        return g;
    },
    tower() {
        const g = new THREE.Group();
        g.add(at(box(0.9, 2.4, 0.9, M.steel), 0, 1.2, 0));
        for (let i = 0; i < 6; i++) g.add(at(box(0.92, 0.1, 0.92, M.accent, 0.02), 0, 0.45 + i * 0.35, 0));
        g.add(at(cyl(0.03, 0.03, 0.5, M.dark, 6), 0, 2.65, 0));
        return g;
    },
    uni() {
        const g = new THREE.Group();
        g.add(at(box(1.5, 0.15, 0.9, M.white), 0, 0.08, 0));
        for (let i = 0; i < 4; i++) g.add(at(cyl(0.07, 0.07, 0.75, M.white, 12), -0.55 + i * 0.37, 0.52, 0.3));
        g.add(at(box(1.4, 0.75, 0.5, M.cream), 0, 0.52, -0.12));
        const ped = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.4, 3), M.white); ped.position.set(0, 1.1, 0.05); ped.rotation.set(0, 0, 0); ped.scale.set(1, 1, 0.5); g.add(ped);
        return g;
    },
    lab() {
        const g = new THREE.Group();
        g.add(at(cyl(0.8, 0.85, 0.3, M.white), 0, 0.15, 0));
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.glass); dome.position.y = 0.3; g.add(dome);
        g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.accent), 0, 0.55, 0));
        g.add(at(cyl(0.02, 0.02, 0.6, M.dark, 6), 0.35, 1.05, 0));
        g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), M.red), 0.35, 1.38, 0));
        return g;
    },
    shield() {
        const g = new THREE.Group();
        g.add(at(box(0.8, 0.35, 0.8, M.rock2), 0, 0.18, 0));
        const s = new THREE.Shape();
        s.moveTo(0, -0.6); s.quadraticCurveTo(0.55, -0.3, 0.5, 0.35); s.lineTo(0, 0.5); s.lineTo(-0.5, 0.35); s.quadraticCurveTo(-0.55, -0.3, 0, -0.6);
        const sh = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 }), M.accent);
        sh.position.set(0, 1.0, -0.07); g.add(sh);
        const tick = box(0.36, 0.08, 0.05, M.white, 0.02); tick.position.set(0.05, 1.0, 0.12); tick.rotation.z = 0.8; g.add(tick);
        const tick2 = box(0.18, 0.08, 0.05, M.white, 0.02); tick2.position.set(-0.13, 0.95, 0.12); tick2.rotation.z = -0.8; g.add(tick2);
        return g;
    },
    camera() {
        const g = new THREE.Group();
        [-0.25, 0.25].forEach(x => { const l = cyl(0.025, 0.025, 0.9, M.dark, 6); l.position.set(x, 0.42, 0); l.rotation.z = x > 0 ? -0.25 : 0.25; g.add(l); });
        g.add(at(box(0.7, 0.45, 0.35, M.dark), 0, 1.05, 0));
        const lens = cyl(0.17, 0.2, 0.3, M.steel); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.05, 0.3); g.add(lens);
        g.add(at(box(0.16, 0.08, 0.12, M.red, 0.02), 0.22, 1.32, 0));
        return g;
    },
    robot() {
        const g = new THREE.Group();
        g.add(at(box(0.55, 0.55, 0.45, M.white, 0.12), 0, 0.45, 0));
        g.add(at(box(0.7, 0.55, 0.55, M.white, 0.18), 0, 1.05, 0));
        [-0.15, 0.15].forEach(x => g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), M.accent), x, 1.08, 0.28)));
        g.add(at(cyl(0.02, 0.02, 0.3, M.dark, 6), 0, 1.45, 0));
        g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), M.red), 0, 1.62, 0));
        return g;
    },
    mailbox() {
        const g = new THREE.Group();
        g.add(at(cyl(0.05, 0.05, 0.8, M.wood, 8), 0, 0.4, 0));
        g.add(at(box(0.55, 0.35, 0.35, M.red, 0.12), 0, 0.95, 0));
        g.add(at(box(0.04, 0.3, 0.12, M.gold, 0.01), 0.3, 1.1, 0));
        return g;
    },
    coins() {
        const g = new THREE.Group();
        for (let i = 0; i < 5; i++) { const c = cyl(0.32, 0.32, 0.1, M.gold, 28); c.position.set(Math.sin(i) * 0.04, 0.06 + i * 0.12, 0); g.add(c); }
        const big = cyl(0.4, 0.4, 0.08, M.gold, 32); big.rotation.x = Math.PI / 2; big.position.y = 1.2; big.userData.spin = true; g.add(big);
        return g;
    },
    chest() {
        const g = new THREE.Group();
        g.add(at(box(0.9, 0.5, 0.6, M.wood), 0, 0.25, 0));
        const lid = box(0.92, 0.2, 0.62, M.wood); lid.position.set(0, 0.62, -0.18); lid.rotation.x = -0.5; g.add(lid);
        g.add(at(box(0.96, 0.08, 0.64, M.gold, 0.02), 0, 0.3, 0));
        g.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.2), M.accent), 0, 0.72, 0.05));
        return g;
    },
    plane() {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.9, 6, 12), M.white); body.rotation.z = Math.PI / 2; g.add(body);
        g.add(at(box(0.3, 0.04, 1.3, M.white, 0.02), 0.05, 0, 0));
        g.add(at(box(0.18, 0.3, 0.04, M.accent, 0.02), -0.5, 0.18, 0));
        g.add(at(box(0.14, 0.04, 0.5, M.white, 0.02), -0.5, 0.05, 0));
        return g;
    },
};

export default class IslandScene {
    constructor(canvas, { labels = {}, onHover, onPick } = {}) {
        this.canvas = canvas; this.labels = labels; this.onHover = onHover; this.onPick = onPick;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.scene = new THREE.Scene();
        const pm = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
        this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        this.world = new THREE.Group(); this.scene.add(this.world);
        this.clock = new THREE.Clock();
        this.rotY = -0.4; this.vel = 0.0025; this.drag = null; this.hovered = null;
        this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2(9, 9);

        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a6a, 0.55));
        this.scene.environmentIntensity = 0.55;
        const sun = new THREE.DirectionalLight(0xfff3e0, 2.4);
        sun.position.set(6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
        Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); sun.shadow.bias = -0.0015;
        this.scene.add(sun);

        this.build();
        this.applyPalette(); this.off = onPalette(() => this.applyPalette());
        this.bind();
        this.resize = this.resize.bind(this); this.tick = this.tick.bind(this);
        this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas); this.resize();
    }

    build() {
        const top = cyl(6, 5.7, 0.7, M.grass, 64); top.position.y = -0.35; top.receiveShadow = true; this.world.add(top);
        const dirt = cyl(5.7, 5.2, 0.6, M.rock, 20); dirt.position.y = -1; this.world.add(dirt);
        const under = new THREE.Mesh(new THREE.ConeGeometry(5.2, 4.6, 14, 3), M.rock2); under.rotation.x = Math.PI; under.position.y = -3.6; this.world.add(under);
        // path ring
        const path = new THREE.Mesh(new THREE.RingGeometry(2.3, 2.75, 64), clay(0xe8d9bf)); path.rotation.x = -Math.PI / 2; path.position.y = 0.01; path.receiveShadow = true; this.world.add(path);
        // scattered trees & rocks
        for (let i = 0; i < 16; i++) {
            const a = i * 2.39, r = 1.3 + ((i * 37) % 10) / 10 * 4.2;
            if (r > 2.1 && r < 3) continue;
            const t = i % 4 === 0 ? at(new THREE.Mesh(new THREE.DodecahedronGeometry(0.25), M.rock2), Math.cos(a) * r, 0.1, Math.sin(a) * r) : tree(0.55 + (i % 3) * 0.15);
            if (i % 4) t.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
            t.traverse(o => { if (o.isMesh) o.castShadow = true; });
            this.world.add(t);
        }
        this.marks = {}; this.pickables = [];
        LANDMARKS.forEach((L, i) => {
            if (L.kind === "plane") return;
            const g = BUILDERS[L.kind]();
            const a = (i / LANDMARKS.length) * Math.PI * 2, r = L.r ?? 4.1;
            g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
            g.rotation.y = -a + Math.PI / 2;
            g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.userData.id = L.id; this.pickables.push(o); } });
            g.userData = { id: L.id, base: g.position.clone(), top: L.top ?? 1.6 };
            this.world.add(g); this.marks[L.id] = g;
        });
        // the plane circles the island — that's the journey
        this.plane = BUILDERS.plane(); this.plane.scale.setScalar(0.9);
        this.plane.traverse(o => { if (o.isMesh) { o.castShadow = true; o.userData.id = "plane"; this.pickables.push(o); } });
        this.plane.userData = { id: "plane", top: 0.5 };
        this.scene.add(this.plane); this.marks.plane = this.plane;
        // clouds
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            const c = new THREE.Group();
            [[0, 0, 0, 0.5], [0.45, 0.05, 0, 0.38], [-0.45, 0, 0.1, 0.35], [0.1, 0.25, 0, 0.35]].forEach(([x, y, z, s]) => c.add(at(new THREE.Mesh(new THREE.SphereGeometry(s, 16, 12), M.cloud), x, y, z)));
            c.userData = { a: i * 1.3, r: 8.8 + (i % 2) * 1.6, y: 4.2 + (i % 3) * 0.9, s: 0.05 + i * 0.01 };
            this.scene.add(c); this.clouds.push(c);
        }
    }

    applyPalette() {
        const p = getPalette(), dark = getMode() === "dark";
        M.accent.color.set(p.accent); M.accent.emissive.set(p.accent);
        this.renderer.toneMappingExposure = dark ? 0.95 : 0.9;
    }

    bind() {
        const c = this.canvas;
        const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1]; };
        this.onDown = e => { this.drag = { x: e.clientX, moved: 0 }; c.setPointerCapture(e.pointerId); };
        this.onMove = e => {
            const [x, y] = pos(e); this.ptr.set(x, y);
            if (this.drag) { const dx = e.clientX - this.drag.x; this.drag.x = e.clientX; this.drag.moved += Math.abs(dx); this.vel = dx * 0.006; this.rotY += dx * 0.006; }
        };
        this.onUp = () => { const click = this.drag && this.drag.moved < 5; this.drag = null; if (click && this.hovered) this.onPick?.(this.hovered); };
        this.onLeave = () => { this.ptr.set(9, 9); };
        c.addEventListener("pointerdown", this.onDown); c.addEventListener("pointermove", this.onMove);
        c.addEventListener("pointerup", this.onUp); c.addEventListener("pointerleave", this.onLeave);
    }

    resize() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        if (!w || !h) return;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        const narrow = w / h < 1;
        this.camera.position.set(0, narrow ? 14 : 10.5, narrow ? 23 : 17.5);
        this.camera.lookAt(0, narrow ? -1.2 : -0.9, 0);
        this.camera.updateProjectionMatrix();
    }

    label(id, obj) {
        const el = this.labels[id]; if (!el) return;
        const wp = obj.getWorldPosition(new THREE.Vector3()); wp.y += obj.userData.top;
        const front = id === "plane" ? true : wp.clone().sub(new THREE.Vector3(0, wp.y, 0)).normalize().dot(this.camera.position.clone().setY(0).normalize()) > -0.25;
        const s = wp.project(this.camera);
        el.style.transform = `translate3d(${(s.x * 0.5 + 0.5) * this.canvas.clientWidth}px, ${(-s.y * 0.5 + 0.5) * this.canvas.clientHeight}px, 0)`;
        el.classList.toggle("is-back", !front);
        el.classList.toggle("is-hot", this.hovered === id);
    }

    tick() {
        const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
        if (!this.drag) { this.vel += (0.0025 - this.vel) * 0.02; this.rotY += this.vel; }
        this.world.rotation.y = this.rotY;
        this.world.position.y = Math.sin(t * 0.8) * 0.12;
        const pa = t * 0.35 + this.rotY;
        this.plane.position.set(Math.cos(pa) * 6.8, 2.6 + Math.sin(t * 1.2) * 0.2, Math.sin(pa) * 6.8);
        this.plane.rotation.set(0, -pa - Math.PI, -0.25);
        // clouds drift only behind the island so they never hide a landmark
        this.clouds.forEach(c => { const u = c.userData; const a = u.a + t * u.s; c.position.set(Math.cos(a) * u.r, u.y, -Math.abs(Math.sin(a)) * u.r - 2); });
        Object.values(this.marks).forEach(g => g.traverse(o => { if (o.userData.spin) o.rotation.z += dt * 2; }));

        this.ray.setFromCamera(this.ptr, this.camera);
        const hit = Math.abs(this.ptr.x) <= 1 ? this.ray.intersectObjects(this.pickables, false)[0] : null;
        const id = hit?.object.userData.id ?? null;
        if (id !== this.hovered) { this.hovered = id; this.canvas.style.cursor = id ? "pointer" : "grab"; this.onHover?.(id); }
        Object.entries(this.marks).forEach(([mid, g]) => {
            const s = mid === this.hovered ? 1.18 : 1;
            if (mid !== "plane") { g.scale.lerp(new THREE.Vector3(s, s, s), 0.2); g.position.y = mid === this.hovered ? 0.15 + Math.sin(t * 6) * 0.05 : 0; }
            this.label(mid, g);
        });
        this.renderer.render(this.scene, this.camera);
    }

    start() { if (!this.running) { this.running = true; this.clock.getDelta(); this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() {
        this.stop(); this.off?.(); this.ro.disconnect();
        const c = this.canvas;
        c.removeEventListener("pointerdown", this.onDown); c.removeEventListener("pointermove", this.onMove);
        c.removeEventListener("pointerup", this.onUp); c.removeEventListener("pointerleave", this.onLeave);
        this.scene.environment?.dispose();
        this.scene.traverse(o => o.geometry?.dispose());
        this.renderer.dispose();
    }
}
