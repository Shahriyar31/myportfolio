import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/*
 * "Most AI is a black box. I build glass boxes."
 * A glass cube with four glowing layers inside — my real defence pipeline, bottom to top:
 * input shield → AI judge → my AI → output scan. Data particles rise through it constantly.
 * attack(result) sends one visitor message up through the layers; it bursts at the layer
 * the server says stopped it, or leaves the top as a safe answer.
 */

export const LAYER_COLORS = ["#73d4ff", "#ffc857", "#b69cff", "#3ee08f"];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const BASE_Y = [-0.9, -0.3, 0.3, 0.9];

export default class GlassBox {
    constructor(canvas, { mobile = false } = {}) {
        this.canvas = canvas; this.mobile = mobile;
        const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
        r.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
        r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
        this.scene = new THREE.Scene();
        this.scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
        this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100); this.camera.position.set(0, 0, 10);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 6); this.scene.add(key);

        const g = this.group = new THREE.Group(); this.scene.add(g);
        this.inner = new THREE.Group(); g.add(this.inner);
        // the glass
        this.glassMat = new THREE.MeshPhysicalMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, iridescence: mobile ? 0 : 0.6, iridescenceIOR: 1.3, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide });
        this.glass = new THREE.Mesh(new RoundedBoxGeometry(2.3, 2.9, 2.3, 4, 0.16), this.glassMat); g.add(this.glass);
        this.edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.3, 2.9, 2.3)), new THREE.LineBasicMaterial({ color: 0x9fe3ff, transparent: true, opacity: 0.55 }));
        g.add(this.edges);
        // the four layers
        this.plates = LAYER_COLORS.map((c, i) => {
            const col = new THREE.Color(c);
            const m = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.07, 1.7, 2, 0.03), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.45, transparent: true, opacity: 0.6, roughness: 0.3 }));
            const ring = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.74, 0.08, 1.74)), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.9 }));
            m.add(ring); m.position.y = BASE_Y[i]; m.userData = { col, flash: 0, flashCol: new THREE.Color() };
            this.inner.add(m); return m;
        });
        // rising data particles (some are red attacks that die at the first layer)
        const N = this.N = mobile ? 40 : 70;
        this.dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), N);
        this.dotData = Array.from({ length: N }, (_, i) => this.spawn({}, Math.random() * 3.2 - 1.6, i));
        this.dotData.forEach((d, i) => this.dots.setColorAt(i, d.bad ? new THREE.Color(0xff5d5d) : new THREE.Color(i % 3 ? 0x9fe3ff : 0xd9ccff)));
        this.inner.add(this.dots);
        this.dummy = new THREE.Object3D();

        this.intro = 0; this.spinV = 0; this.spin = 0; this.focusIdx = -1; this.mood = 0; this.goalMood = 0;
        this.explode = 0; this.goalExplode = 0; this.pointer = new THREE.Vector2(); this.smooth = new THREE.Vector2();
        this.clock = new THREE.Clock(); this.tick = this.tick.bind(this); this.resize = this.resize.bind(this);
        this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas); this.resize();
    }
    spawn(d, y = -1.6, i = 0) { return Object.assign(d, { x: (Math.random() - 0.5) * 1.3, z: (Math.random() - 0.5) * 1.3, y, v: 0.25 + Math.random() * 0.3, bad: i % 9 === 0 }); }

    /** Put the box at a screen rectangle (px) — the page moves it between "slots". */
    place(cx, cy, h, explode, snap) {
        const vh = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)), k = vh / innerHeight;
        this.goal = { x: (cx - innerWidth / 2) * k, y: -(cy - innerHeight / 2) * k, s: (h * k) / ((2.9 + explode * 1.8) * 1.45), snap };
        this.goalExplode = explode;
    }
    setPointer(x, y) { this.pointer.set(x, y); }
    /** light up one layer (hovering a card), -1 for none */
    focus(i) { this.focusIdx = i; }
    /** scroll speed gives the box a spin */
    kick(v) { this.spinV += Math.max(-4, Math.min(4, v)) * 0.004; }
    /** 1 = verified: the edges glow green */
    setMood(m) { if (m && !this.goalMood) this.plates.forEach((_, i) => setTimeout(() => this.flash(i, "#3ee08f"), i * 140)); this.goalMood = m; }
    plateY(i) { return BASE_Y[i] * (1 + this.explode * 0.75); }

    flash(i, hex) { const u = this.plates[i].userData; u.flash = 1; u.flashCol.set(hex); }

    /** One visitor message. `result` resolves to the server's verdict ({ verdict, at, layers }). */
    async attack(result) {
        const ids = ["input", "judge", "model", "output"];
        const pk = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 12), new THREE.MeshBasicMaterial({ color: 0xff5d5d }));
        const halo = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 12), new THREE.MeshBasicMaterial({ color: 0xff5d5d, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
        pk.add(halo); pk.position.set(0, -2.4, 0); this.inner.add(pk); this.attacking = true;
        const tween = (ms, fn) => new Promise(res => { const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / ms); fn(k * k * (3 - 2 * k)); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
        const rise = (to, ms) => { const from = pk.position.y; return tween(ms, k => { pk.position.y = from + (to - from) * k; }); };
        try {
            await rise(this.plateY(0) - 0.25, 700);
            let r = null; result.then(v => { r = v; });
            while (!r) await tween(300, k => halo.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.6));
            for (let i = 0; i < 4; i++) {
                const l = r.layers?.find(x => x.id === ids[i]);
                await rise(this.plateY(i), 420);
                if (!l) break;
                if (l.status === "block") {
                    this.flash(i, "#ff5d5d");
                    await tween(600, k => { pk.scale.setScalar(1 + k * 4); pk.material.transparent = true; pk.material.opacity = 1 - k; halo.material.opacity = 0.25 * (1 - k); });
                    return r;
                }
                this.flash(i, l.status === "mask" ? "#ffc857" : "#3ee08f");
                await tween(220, () => {});
            }
            pk.material.color.set(0x3ee08f); halo.material.color.set(0x3ee08f);
            await rise(3, 700);
            return r;
        } finally { this.inner.remove(pk); pk.geometry.dispose(); pk.material.dispose(); halo.geometry.dispose(); halo.material.dispose(); this.attacking = false; }
    }

    resize() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight; if (!w || !h) return;
        this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    }
    tick() {
        const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime, g = this.group;
        if (this.goal) { const e = this.goal.snap ? 1 : 1 - Math.pow(0.004, dt); g.position.x += (this.goal.x - g.position.x) * e; g.position.y += (this.goal.y - g.position.y) * e; g.scale.setScalar(g.scale.x + (this.goal.s - g.scale.x) * e); }
        this.explode += (this.goalExplode - this.explode) * (1 - Math.pow(0.01, dt));
        this.smooth.lerp(this.pointer, 0.06);
        // intro: the box assembles itself — layers drop in one by one, then the glass appears
        this.intro = Math.min(1, this.intro + dt / 2.6);
        const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3), glassIn = ease((this.intro - 0.55) / 0.45);
        this.spinV *= Math.pow(0.08, dt); this.spin += this.spinV;
        g.rotation.y = t * 0.18 + this.spin + this.smooth.x * 0.5 + (1 - ease(this.intro)) * 1.6; g.rotation.x = 0.28 - this.smooth.y * 0.25;
        this.mood += (this.goalMood - this.mood) * (1 - Math.pow(0.05, dt));
        this.glassMat.opacity = 0.1 * (1 - this.explode * 0.4) * glassIn;
        this.edges.material.opacity = (0.55 * (1 - this.explode * 0.5) + this.mood * 0.4) * glassIn;
        this.edges.material.color.setRGB(0.62 - this.mood * 0.38, 0.89, 1 - this.mood * 0.44);
        this.dots.visible = this.intro > 0.7;
        this.plates.forEach((p, i) => {
            const k = ease(this.intro * 1.9 - i * 0.28); // bottom layer first
            p.position.y = this.plateY(i) + (1 - k) * 3.2; p.scale.setScalar(0.6 + k * 0.4); p.material.opacity = 0.6 * k;
            const u = p.userData; u.flash = Math.max(0, u.flash - dt * 1.3);
            p.material.emissive.copy(u.col).lerp(u.flashCol, u.flash); p.material.color.copy(p.material.emissive);
            const f = this.focusIdx < 0 ? 0.45 : i === this.focusIdx ? 1.5 : 0.15;
            u.glow = (u.glow ?? 0.45) + (f - (u.glow ?? 0.45)) * (1 - Math.pow(0.02, dt));
            p.material.emissiveIntensity = u.glow + u.flash * 1.6 + Math.sin(t * 2 + i) * 0.05;
        });
        const top = this.plateY(3) + 0.5, wall = this.plateY(0);
        this.dotData.forEach((d, i) => {
            d.y += d.v * dt;
            if (d.bad && d.y > wall - 0.05) { this.spawn(d, -1.7 - Math.random(), i); } // attacks never pass the first layer
            if (d.y > top) this.spawn(d, -1.7, i);
            this.dummy.position.set(d.x, d.y, d.z); this.dummy.scale.setScalar(d.bad ? 1.5 : 1); this.dummy.updateMatrix(); this.dots.setMatrixAt(i, this.dummy.matrix);
        });
        this.dots.instanceMatrix.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    }
    start() { if (!this.running) { this.running = true; this.clock.getDelta(); this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() { this.stop(); this.ro.disconnect(); this.scene.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); }); this.renderer.dispose(); }
}
