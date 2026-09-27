import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { getPalette, onPalette, getMode } from "./theme";
import { NODES } from "./AgentScene.nodes";

/*
 * The hero: how I build, as a 3D clay diagram.
 *   sources → lakehouse (bronze/silver/gold) → agent (+ tools) → policy gate → answer → audit ledger
 *   with a governance catalogue watching the lakehouse and the agent.
 * Nodes are hoverable (tooltips come from NODES) and react to the live agent trace.
 */


const EDGES = [ // [from, to, bend offset of the curve's midpoint, dashed]
    ["sources", "lakehouse", [-0.7, 0, 0.5]], ["lakehouse", "agent", [0, -0.9, 0.5]], ["agent", "policy", [0, -0.5, 0.4]],
    ["policy", "answer", [0.8, 0, 0.3]], ["policy", "ledger", [0.8, 0, 0.3]],
    ["catalog", "lakehouse", [0, 0, 0], true], ["catalog", "agent", [0, 0, 0], true],
];
// Which nodes light up for each step of the live agent trace
const STEP_NODES = { intent: ["agent"], retrieve: ["lakehouse", "catalog"], generate: ["agent"], policy: ["policy"], ledger: ["ledger", "answer"] };

const V = a => new THREE.Vector3(...a);

export default class AgentScene {
    constructor(canvas, { labels = {}, onHover } = {}) {
        this.canvas = canvas;
        this.labels = labels;
        this.onHover = onHover;
        const narrow = canvas.clientWidth / Math.max(1, canvas.clientHeight) < 1;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, narrow ? 1.5 : 1.75));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

        this.scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        pmrem.dispose();

        this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        this.root = new THREE.Group();
        this.scene.add(this.root);
        this.pointer = new THREE.Vector2(9, 9);
        this.smooth = new THREE.Vector2();
        this.ray = new THREE.Raycaster();
        this.clock = new THREE.Clock();
        this.heat = {}; // node id → glow 0..1
        this.hovered = null;

        this.buildLights();
        this.buildMaterials();
        this.buildNodes();
        this.buildEdges();
        this.applyPalette(getPalette());
        this.off = onPalette(p => this.applyPalette(p));

        this.onStep = e => (STEP_NODES[e.detail] || []).forEach(id => { this.heat[id] = 1; });
        window.addEventListener("agent-step", this.onStep);
        this.resize = this.resize.bind(this);
        this.tick = this.tick.bind(this);
        this.resize();
        // Track the canvas itself: layout can change its size without a window resize
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(canvas);
    }

    buildLights() {
        this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
        this.key = new THREE.DirectionalLight(0xffffff, 1.6);
        this.key.position.set(-6, 9, 8);
        this.rim = new THREE.DirectionalLight(0xffffff, 0.9);
        this.rim.position.set(8, -2, -6);
        this.scene.add(this.hemi, this.key, this.rim);
    }

    buildMaterials() {
        const clay = () => new THREE.MeshPhysicalMaterial({ color: 0xdddddd, roughness: 0.62, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.5, envMapIntensity: 0.9 });
        this.m = {
            clay: clay(),
            clay2: clay(),
            accent: new THREE.MeshPhysicalMaterial({ color: 0x73d4ff, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2, emissive: 0x73d4ff, emissiveIntensity: 0.25 }),
            bronze: new THREE.MeshPhysicalMaterial({ color: 0xb4804f, roughness: 0.5, clearcoat: 0.4 }),
            silver: new THREE.MeshPhysicalMaterial({ color: 0xbcc5cf, roughness: 0.4, clearcoat: 0.5, metalness: 0.2 }),
            gold: new THREE.MeshPhysicalMaterial({ color: 0xe0b84e, roughness: 0.38, clearcoat: 0.5, metalness: 0.25 }),
            edge: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }),
            dash: new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.12, gapSize: 0.1, transparent: true, opacity: 0.4 }),
            spark: new THREE.MeshBasicMaterial({ color: 0x73d4ff }),
        };
    }

    buildNodes() {
        this.nodes = {};
        this.pickables = [];
        const add = (id, obj) => { obj.traverse(o => { if (o.isMesh) { o.userData.id = id; this.pickables.push(o); } }); };

        NODES.forEach(n => {
            const g = new THREE.Group();
            g.position.copy(V(n.pos));
            g.userData = { base: V(n.pos), phase: Math.random() * 6 };
            const m = this.m;
            if (n.kind === "sources") {
                [[-1.15, 0, 0], [0, 0.3, 0.5], [1.15, -0.1, -0.2]].forEach((p, i) => {
                    const c = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.72, 0.72, 4, 0.18), m.clay);
                    c.position.set(...p); c.rotation.set(0.4 + i, 0.6 * i, 0.2);
                    g.add(c);
                });
            } else if (n.kind === "lakehouse") {
                [["bronze", -0.72], ["silver", 0], ["gold", 0.72]].forEach(([mat, y]) => {
                    const s = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.46, 1.6, 5, 0.2), m[mat]);
                    s.position.y = y; s.userData.slab = y;
                    g.add(s);
                });
            } else if (n.kind === "catalog") {
                const t = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.2, 24, 64), m.clay2);
                t.rotation.x = 1.1;
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), m.accent);
                g.add(t, eye);
                g.userData.spin = t;
            } else if (n.kind === "agent") {
                const core = new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 48), m.accent);
                g.add(core);
                g.userData.core = core;
                g.userData.sats = ["Retrieve", "SQL", "Search"].map((name, i) => {
                    const s = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 24), m.clay);
                    s.userData.orbit = { r: 1.65, speed: 0.5 + i * 0.12, off: (i * Math.PI * 2) / 3, tilt: 0.5 + i * 0.25 };
                    g.add(s);
                    return s;
                });
            } else if (n.kind === "policy") {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.2, 24, 6), m.clay2); // hexagonal gate
                ring.rotation.y = 0.95;
                const bar = new THREE.Mesh(new RoundedBoxGeometry(0.14, 1.3, 0.14, 2, 0.06), m.accent);
                bar.rotation.y = ring.rotation.y;
                g.add(ring, bar);
                g.userData.spin = ring;
            } else if (n.kind === "answer") {
                const pill = new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.72, 0.5, 6, 0.3), m.clay);
                const dots = [-0.35, 0, 0.35].map(x => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), m.accent); d.position.set(x, 0, 0.27); return d; });
                g.add(pill, ...dots);
            } else if (n.kind === "ledger") {
                for (let i = 0; i < 4; i++) {
                    const b = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.5, 0.5, 3, 0.12), i === 3 ? m.accent : m.clay);
                    b.position.set(i * 0.62 - 0.93, Math.sin(i) * 0.08, 0);
                    b.userData.bob = i;
                    g.add(b);
                    if (i < 3) {
                        const link = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 8), m.clay2);
                        link.rotation.z = Math.PI / 2; link.position.set(i * 0.62 - 0.62, 0, 0);
                        g.add(link);
                    }
                }
            }
            add(n.id, g);
            this.root.add(g);
            this.nodes[n.id] = g;
            this.heat[n.id] = 0;
        });
    }

    buildEdges() {
        this.flows = [];
        const sparkGeo = new THREE.SphereGeometry(0.06, 12, 8);
        this.packetMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), this.m.spark);
        this.packetMesh.visible = false;
        this.root.add(this.packetMesh);
        EDGES.forEach(([a, b, bend, dashed]) => {
            const A = V(NODES.find(n => n.id === a).pos), B = V(NODES.find(n => n.id === b).pos);
            const mid = A.clone().lerp(B, 0.5).add(V(bend));
            const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
            if (dashed) {
                const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), this.m.dash);
                line.computeLineDistances();
                this.root.add(line);
                return;
            }
            this.root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.022, 6, false), this.m.edge));
            const sparks = Array.from({ length: 5 }, (_, i) => {
                const s = new THREE.Mesh(sparkGeo, this.m.spark);
                this.root.add(s);
                return { mesh: s, t: i / 5 };
            });
            this.flows.push({ curve, sparks, to: b, from: a });
        });
    }

    applyPalette(p) {
        const dark = getMode() === "dark";
        const bg = new THREE.Color(p.bg), acc = new THREE.Color(p.accent), fg = new THREE.Color(p.fg);
        this.m.clay.color.copy(bg).lerp(new THREE.Color(1, 1, 1), dark ? 0.2 : 0.55);
        this.m.clay2.color.copy(bg).lerp(new THREE.Color(1, 1, 1), dark ? 0.1 : 0.35);
        this.m.accent.color.copy(acc);
        this.m.accent.emissive.copy(acc);
        this.m.spark.color.copy(acc);
        this.m.edge.color.copy(fg);
        this.m.edge.opacity = dark ? 0.2 : 0.28;
        this.m.dash.color.copy(fg);
        this.hemi.groundColor.copy(bg).multiplyScalar(0.6);
        this.key.intensity = dark ? 1.5 : 1.9;
        this.renderer.toneMappingExposure = dark ? 0.95 : 1.05;
    }

    setPointer(x, y) { this.pointer.set(x, y); }

    /** Highlight one step and fly a packet to it from the previous step. */
    setActive(id) {
        if (id === this.active) return;
        const from = this.active && this.nodes[this.active], to = this.nodes[id];
        this.active = id;
        if (!from || !to) return;
        const A = from.userData.base.clone(), B = to.userData.base.clone();
        const mid = A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, 0.9, 1.2));
        this.packet = { curve: new THREE.QuadraticBezierCurve3(A, mid, B), t: 0 };
    }

    resize() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        if (!w || !h) return;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.narrow = w / h < 1;
        // Wide: the diagram sits to the right of the headline. Narrow: centred and smaller.
        this.camera.fov = this.narrow ? 42 : 30;
        this.camera.updateProjectionMatrix();
        const a = w / h;
        this.root.position.set(this.narrow ? 0.1 : 5.3 + (a - 1.6) * 3.2, this.narrow ? 4.6 : -0.4, 0);
        this.root.scale.setScalar(this.narrow ? 0.54 : Math.min(1, 0.78 + (a - 1.3) * 0.3));
    }

    projectLabel(id, el) {
        if (!el) return;
        const g = this.nodes[id];
        // where each tag sits relative to its node (x, y in node space)
        const [ox, oy] = { agent: [0, -1.4], lakehouse: [0, -1.25], sources: [0, -0.85], catalog: [2.1, 0.4], policy: [0, -1.3], answer: [0, -0.7], ledger: [0, -0.6] }[id] || [0, -1];
        const p = new THREE.Vector3(ox, oy, 0).applyMatrix4(g.matrixWorld).project(this.camera);
        el.style.transform = `translate3d(${(p.x * 0.5 + 0.5) * this.canvas.clientWidth}px, ${(-p.y * 0.5 + 0.5) * this.canvas.clientHeight}px, 0)`;
        el.classList.toggle("is-hot", this.active === id || this.hovered === id);
    }

    tick() {
        const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;

        // Gentle camera parallax from the pointer (only while it's over the page)
        const px = Math.abs(this.pointer.x) > 2 ? 0 : this.pointer.x, py = Math.abs(this.pointer.y) > 2 ? 0 : this.pointer.y;
        this.smooth.lerp(new THREE.Vector2(px, py), 0.05);
        this.camera.position.set(this.smooth.x * 1.6, 1.4 + this.smooth.y * 1.1, this.narrow ? 24 : 21);
        if (this.narrow) this.camera.lookAt(0, 0, 0); else this.camera.lookAt(this.root.position.x * 0.35, this.root.position.y * 0.6, 0);

        // Hover picking
        if (Math.abs(this.pointer.x) <= 1 && Math.abs(this.pointer.y) <= 1) {
            this.ray.setFromCamera(this.pointer, this.camera);
            const hit = this.ray.intersectObjects(this.pickables, false)[0];
            const id = hit?.object.userData.id ?? null;
            if (id !== this.hovered) { this.hovered = id; this.onHover?.(id); }
        } else if (this.hovered) { this.hovered = null; this.onHover?.(null); }

        NODES.forEach(n => {
            const g = this.nodes[n.id], u = g.userData;
            this.heat[n.id] = Math.max(this.active === n.id ? 0.75 : 0, this.heat[n.id] - dt * 0.7);
            const h = Math.max(this.heat[n.id], this.hovered === n.id ? 0.6 : 0);
            g.position.y = u.base.y + Math.sin(t * 0.8 + u.phase) * 0.12;
            const s = 1 + h * 0.08;
            g.scale.lerp(new THREE.Vector3(s, s, s), 0.15);
            if (u.spin) u.spin.rotation.z += dt * (0.3 + h * 2);
            if (u.core) u.core.material.emissiveIntensity = 0.25 + h * 0.9 + Math.sin(t * 2) * 0.05;
            if (u.sats) u.sats.forEach(sat => {
                const o = sat.userData.orbit, a = t * o.speed * (1 + h * 2) + o.off;
                sat.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r * Math.sin(o.tilt), Math.sin(a) * o.r * Math.cos(o.tilt));
            });
            g.children.forEach(c => {
                if (c.userData.slab !== undefined) c.position.x = Math.sin(t * 0.6 + c.userData.slab * 3) * 0.08 + (this.hovered === n.id ? c.userData.slab * 0.35 : 0);
                if (c.userData.bob !== undefined) c.position.y = Math.sin(t * 1.4 + c.userData.bob) * 0.1;
            });
        });

        if (this.packet) {
            this.packet.t = Math.min(1, this.packet.t + dt * 1.1);
            const e = 1 - Math.pow(1 - this.packet.t, 3);
            this.packetMesh.visible = this.packet.t < 1;
            this.packetMesh.position.copy(this.packet.curve.getPoint(e));
            this.packetMesh.scale.setScalar(0.6 + Math.sin(Math.PI * e) * 0.8);
            if (this.packet.t >= 1) this.packet = null;
        }

        // Data flowing along the edges; faster where the trace is active
        this.flows.forEach(f => {
            const boost = 1 + Math.max(this.heat[f.to], this.heat[f.from]) * 3;
            f.sparks.forEach(sp => {
                sp.t = (sp.t + dt * 0.18 * boost) % 1;
                sp.mesh.position.copy(f.curve.getPointAt(sp.t));
                sp.mesh.scale.setScalar(0.7 + Math.sin(sp.t * Math.PI) * 0.6);
            });
        });

        this.root.updateMatrixWorld();
        Object.entries(this.labels).forEach(([id, el]) => this.projectLabel(id, el));
        this.renderer.render(this.scene, this.camera);
    }

    start() { if (!this.running) { this.running = true; this.clock.getDelta(); this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() {
        this.stop(); this.off?.();
        window.removeEventListener("agent-step", this.onStep);
        this.ro?.disconnect();
        this.scene.environment?.dispose();
        this.scene.traverse(o => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
        this.renderer.dispose();
    }
}
