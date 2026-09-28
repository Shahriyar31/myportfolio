import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { getPalette, onPalette, getMode } from "./theme";

/*
 * The Model: one particle object behind the whole site. Every stop on the page
 * names a shape (see stations.js); scrolling morphs the particles from one shape
 * to the next. Highlighted parts (hi = 1) glow in a second colour so each shape
 * reads at a glance: the gold tier of the lake, the current floor of the HQ…
 */

const G = (g, { r = [0, 0, 0], t = [0, 0, 0], s = [1, 1, 1] } = {}) => {
    const c = g.index ? g.toNonIndexed() : g.clone();
    c.scale(...s); c.rotateX(r[0]); c.rotateY(r[1]); c.rotateZ(r[2]); c.translate(...t);
    return c;
};
const area = g => {
    const p = g.attributes.position, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    let sum = 0;
    for (let i = 0; i < p.count; i += 3) { a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2); sum += b.sub(a).cross(c.sub(a)).length() / 2; }
    return sum;
};
const Box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const Cyl = (a, b, h, n = 32) => new THREE.CylinderGeometry(a, b, h, n, 1);
const Sph = (r, ...rest) => new THREE.SphereGeometry(r, 40, 24, ...rest);
const Tor = (r, t, arc = Math.PI * 2) => new THREE.TorusGeometry(r, t, 8, 90, arc);
const shieldGeo = () => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.7); s.quadraticCurveTo(1.5, 1.5, 1.5, 1); s.lineTo(1.5, 0); s.quadraticCurveTo(1.3, -1.3, 0, -1.9);
    s.quadraticCurveTo(-1.3, -1.3, -1.5, 0); s.lineTo(-1.5, 1); s.quadraticCurveTo(-1.5, 1.5, 0, 1.7);
    return new THREE.ExtrudeGeometry(s, { depth: 0.45, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 }).translate(0, 0, -0.25);
};

// Each shape: list of [geometry, hi, weight multiplier]
function library() {
    const hq = n => [0, 1, 2].map(i => [G(Box(2.6, 1.05, 2.2), { t: [0, -1.5 + i * 1.3, 0] }), i === n ? 1 : 0, i === n ? 1.4 : 1])
        .concat([[G(Cyl(0.05, 0.05, 1.2, 6), { t: [0.8, 2.2, 0] }), 0, 1]]);
    const bars = [1, 1.8, 1.3, 2.6, 2.1, 3.3];
    return {
        core: [[new THREE.TorusKnotGeometry(1.7, 0.5, 220, 28), 0, 1], [G(Tor(3, 0.03), { r: [1.2, 0.3, 0] }), 1, 0.9], [G(Tor(3.3, 0.03), { r: [1.9, -0.5, 0] }), 0, 0.9]],
        flow: [[Sph(1.1), 1, 1], ...[0, 1, 2].map(i => {
            const a = i * 2.1, curve = new THREE.CatmullRomCurve3([new THREE.Vector3(Math.cos(a) * 4, -1.5 + i, Math.sin(a) * 2), new THREE.Vector3(Math.cos(a + 0.6) * 2.4, 0.8, Math.sin(a + 0.6) * 1.4), new THREE.Vector3(0, 0, 0)]);
            return [new THREE.TubeGeometry(curve, 60, 0.12, 6), 0, 2];
        })],
        lake: [[G(Cyl(3.2, 3.3, 0.35), { t: [0, -1.1, 0] }), 0, 1], [G(Cyl(2.3, 2.4, 0.35), { t: [0, -0.5, 0] }), 0, 1], [G(Cyl(1.4, 1.5, 0.35), { t: [0, 0.1, 0] }), 1, 1.4], [G(Tor(0.7, 0.05), { r: [Math.PI / 2, 0, 0], t: [0, 1.1, 0] }), 1, 2]],
        gate: [[G(Tor(1.9, 0.25, Math.PI), { t: [0, 0.2, 0] }), 0, 1], [G(Box(0.55, 2.4, 0.55), { t: [-1.9, -1, 0] }), 0, 1], [G(Box(0.55, 2.4, 0.55), { t: [1.9, -1, 0] }), 0, 1], [G(shieldGeo(), { s: [0.45, 0.45, 0.45], t: [0, 0.3, 0] }), 1, 1.6], [G(new THREE.PlaneGeometry(3.2, 2.2), { t: [0, -0.9, 0] }), 1, 0.25]],
        tower: [[G(Cyl(0.5, 0.85, 4.6), { t: [0, -0.7, 0] }), 0, 1], ...[-1.2, 0, 1.2].map(y => [G(Tor(1.05, 0.05), { r: [Math.PI / 2, 0, 0], t: [0, y, 0] }), 1, 2]), [G(new THREE.IcosahedronGeometry(0.8, 1), { t: [0, 2.3, 0] }), 1, 1.2]],
        shield: [[shieldGeo(), 0, 1], [G(Box(0.25, 1, 0.25), { r: [0, 0, 0.8], t: [-0.35, -0.2, 0.35] }), 1, 3], [G(Box(0.25, 1.7, 0.25), { r: [0, 0, -0.6], t: [0.35, 0.2, 0.35] }), 1, 3]],
        hq: hq(-1), hq1: hq(0), hq2: hq(1), hq3: hq(2),
        district: [[-2.2, 0, 1.2], [0, 0, 1.8], [2.2, 0, 1], [-2.2, 1.9, 0.8], [0, 1.9, 1.4], [2.2, 1.9, 1.1]].map(([x, z, h], i) => [G(Box(1.3, h, 1.3), { t: [x, -1 + h / 2, z - 1] }), i % 2, 1]),
        radar: [[G(Sph(2, 0, Math.PI * 2, 0, Math.PI / 3), { r: [-0.7, 0, 0], t: [0, 0.4, 0] }), 0, 1], [G(Cyl(0.12, 0.25, 2.2, 10), { t: [0, -1.4, 0] }), 0, 1], ...[1, 1.6].map(r => [G(Tor(r, 0.04, Math.PI / 2), { r: [0, 0, Math.PI / 4], t: [0, 1.5, 0.8] }), 1, 3])],
        stock: [...bars.map((h, i) => [G(Box(0.55, h, 0.55), { t: [-2.5 + i, -1.8 + h / 2, 0] }), 0, 1]),
            [new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bars.map((h, i) => new THREE.Vector3(-2.5 + i, -1.3 + h, 0.5))), 80, 0.07, 6), 1, 3]],
        twin: [[G(Box(1.6, 2.8, 1.6), { t: [-1.3, -0.2, 0] }), 0, 1], [G(Box(1.6, 2.8, 1.6), { t: [1.3, -0.2, 0] }), 1, 0.45], [G(Cyl(0.05, 0.05, 1, 6), { r: [0, 0, Math.PI / 2], t: [0, 0.4, 0] }), 1, 3]],
        egg: [[G(Sph(1.3), { s: [1, 1.35, 1] }), 0, 1], [G(Box(0.3, 1.1, 0.3), { t: [0, 0, 1.3] }), 1, 3], [G(Box(1.1, 0.3, 0.3), { t: [0, 0, 1.3] }), 1, 3]],
        books: [0, 1, 2, 3].map(i => [G(Box(2.8, 0.45, 2), { r: [0, (i % 2 ? 0.18 : -0.12) * (i + 1) * 0.5, 0], t: [0, -1.2 + i * 0.5, 0] }), i === 3 ? 1 : 0, 1])
            .concat([[G(Box(0.35, 2.4, 1.6), { r: [0, 0, 0.3], t: [1.9, -0.2, 0] }), 1, 1]]),
        college: [[G(Box(4, 1.4, 2), { t: [0, -1, 0] }), 0, 1], ...[-1.5, -0.5, 0.5, 1.5].map(x => [G(Cyl(0.15, 0.15, 1.6, 10), { t: [x, 0.5, 1.1] }), 0, 1.5]), [G(Cyl(1.2, 1.2, 4.2, 3), { r: [0, 0, Math.PI / 2], s: [1, 1, 0.5], t: [0, 1.7, 0.6] }), 1, 1]],
        house: [[G(Box(2.6, 1.8, 2.2), { t: [0, -0.8, 0] }), 0, 1], [G(Cyl(1.7, 1.7, 2.4, 3), { r: [Math.PI / 2, 0, 0], s: [1.05, 1, 0.65], t: [0, 0.7, 0] }), 1, 1], [G(Box(0.6, 1, 0.1), { t: [0, -1.2, 1.12] }), 1, 2]],
        plane: [[G(Cyl(0.38, 0.28, 4.4, 16), { r: [0, 0, Math.PI / 2] }), 0, 1], [G(Box(1.1, 0.08, 4.6), { t: [0.2, 0, 0] }), 1, 1], [G(Box(0.7, 1, 0.08), { t: [-2, 0.5, 0] }), 1, 1.5], [G(Box(0.5, 0.06, 1.6), { t: [-2, 0.05, 0] }), 1, 1.5]],
        cap: [[G(Box(3.4, 0.14, 3.4), { r: [0.35, Math.PI / 4, 0], t: [0, 0.7, 0] }), 0, 1], [G(Cyl(1.15, 1.25, 1.1), { t: [0, -0.1, 0] }), 0, 1], [G(Cyl(0.03, 0.03, 1.4, 6), { t: [1.3, 0, 0.9] }), 1, 4], [G(Sph(0.18), { t: [1.3, -0.75, 0.9] }), 1, 3]],
        globe: [[Sph(2.2), 0, 1], [G(Tor(2.5, 0.05, 2.3), { r: [0.4, 0.3, 0.5] }), 1, 4], [G(Sph(0.18), { t: [-1.4, 1.1, 1.7] }), 1, 4], [G(Sph(0.18), { t: [1.9, 1.1, 0.8] }), 1, 4]],
        atom: [[Sph(0.9), 1, 1], [G(Tor(2.8, 0.04), { r: [1.2, 0, 0] }), 0, 3], [G(Tor(2.8, 0.04), { r: [1.2, 1, 0] }), 0, 3], [G(Tor(2.8, 0.04), { r: [1.2, 2.1, 0] }), 0, 3]],
        bubble: [[G(Sph(2), { s: [1.4, 0.95, 0.45] }), 0, 1], [G(new THREE.ConeGeometry(0.5, 1.2, 12), { r: [0, 0, 2.5], t: [-1.6, -1.6, 0] }), 0, 1], ...[-0.9, 0, 0.9].map(x => [G(Sph(0.28), { t: [x, 0, 0.9] }), 1, 4])],
        camera: [[G(Box(3.8, 2.4, 1.4), {}), 0, 1], [G(Cyl(0.9, 0.9, 1, 32), { r: [Math.PI / 2, 0, 0], t: [0, 0, 1.1] }), 1, 1.3], [G(Box(1, 0.5, 0.8), { t: [-1, 1.4, 0] }), 0, 1]],
    };
}

function sampleShape(parts, N) {
    parts = parts.map(([g, h, w]) => [g.index ? g.toNonIndexed() : g, h, w]);
    const pos = new Float32Array(N * 3), hi = new Float32Array(N);
    const areas = parts.map(([g, , w]) => area(g) * w), total = areas.reduce((a, b) => a + b, 0);
    let k = 0; const v = new THREE.Vector3();
    parts.forEach(([g, h], pi) => {
        const n = pi === parts.length - 1 ? N - k : Math.round(N * areas[pi] / total);
        const s = new MeshSurfaceSampler(new THREE.Mesh(g)).build();
        for (let i = 0; i < n && k < N; i++, k++) { s.sample(v); pos.set([v.x, v.y, v.z], k * 3); hi[k] = h; }
    });
    shuffle(pos, hi, N);
    return { pos, hi };
}

function textShape(str, N) {
    const c = document.createElement("canvas"), W = 600, H = 150; c.width = W; c.height = H;
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.font = "700 110px 'Clash Display', 'General Sans', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(str, W / 2, H / 2);
    const d = x.getImageData(0, 0, W, H).data, px = [];
    for (let y = 0; y < H; y += 2) for (let i = 0; i < W; i += 2) if (d[(y * W + i) * 4 + 3] > 128) px.push([i, y]);
    const pos = new Float32Array(N * 3), hi = new Float32Array(N);
    for (let k = 0; k < N; k++) { const [i, y] = px[(Math.random() * px.length) | 0] || [W / 2, H / 2]; pos.set([(i - W / 2) / 70 + Math.random() * 0.03, -(y - H / 2) / 70, (Math.random() - 0.5) * 0.35], k * 3); hi[k] = k % 5 === 0 ? 1 : 0; }
    return { pos, hi };
}

function shuffle(pos, hi, N) { // random order so morphs look like a swarm, not a scan
    for (let i = N - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        for (let a = 0; a < 3; a++) { const t = pos[i * 3 + a]; pos[i * 3 + a] = pos[j * 3 + a]; pos[j * 3 + a] = t; }
        const t = hi[i]; hi[i] = hi[j]; hi[j] = t;
    }
}

const VERT = /* glsl */`
attribute vec3 posB; attribute float hiA; attribute float hiB; attribute float rnd;
uniform float uMix, uTime, uPulse, uSize, uPR; uniform vec3 uPointer;
varying float vHi, vR, vA;
void main() {
    float e = clamp(uMix * 1.5 - rnd * 0.5, 0.0, 1.0); e = e * e * (3.0 - 2.0 * e);
    vec3 p = mix(position, posB, e);
    float swirl = sin(e * 3.14159);
    p += normalize(p + 0.001) * swirl * (0.6 + rnd * 1.4);                        // burst outward mid-morph
    p += vec3(sin(uTime * 0.9 + rnd * 40.0), cos(uTime * 0.7 + rnd * 30.0), sin(uTime * 0.8 + rnd * 20.0)) * 0.035;
    p *= 1.0 + uPulse * (0.25 + rnd * 0.5);                                         // click shockwave
    vec4 w = modelMatrix * vec4(p, 1.0);
    vec3 d = w.xyz - uPointer; float f = smoothstep(1.6, 0.0, length(d.xy));
    w.xy += normalize(d.xy + 0.0001) * f * 0.7;                                      // particles part around the cursor
    vec4 mv = viewMatrix * w;
    gl_Position = projectionMatrix * mv;
    vHi = mix(hiA, hiB, e); vR = rnd; vA = 1.0 - swirl * 0.35;
    gl_PointSize = uSize * uPR * (0.55 + rnd * 0.9) * (1.0 + vHi * 0.35) * (12.0 / -mv.z);
}`;
const FRAG = /* glsl */`
uniform vec3 uColA, uColB, uHi; uniform float uDim;
varying float vHi, vR, vA;
void main() {
    float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    vec3 c = mix(mix(uColA, uColB, vR), uHi, vHi);
    gl_FragColor = vec4(c, a * uDim * vA * (0.85 + 0.15 * vHi));
}`;

export default class ModelScene {
    constructor(canvas, { mobile }) {
        this.mobile = mobile;
        const N = this.N = mobile ? 9000 : 16000;
        const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
        r.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200); this.camera.position.set(0, 0, 13);
        this.clock = new THREE.Clock();

        const lib = library();
        this.shapes = Object.fromEntries(Object.entries(lib).map(([k, parts]) => [k, sampleShape(parts, N)]));
        this.shapes.text = textShape("Let's talk", N);

        const g = this.geo = new THREE.BufferGeometry(), s0 = this.shapes.core;
        const rnd = new Float32Array(N).map(() => Math.random());
        g.setAttribute("position", new THREE.BufferAttribute(s0.pos, 3));
        g.setAttribute("posB", new THREE.BufferAttribute(s0.pos, 3));
        g.setAttribute("hiA", new THREE.BufferAttribute(s0.hi, 1));
        g.setAttribute("hiB", new THREE.BufferAttribute(s0.hi, 1));
        g.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);
        this.u = { uMix: { value: 0 }, uTime: { value: 0 }, uPulse: { value: 0 }, uSize: { value: mobile ? 5.2 : 6.2 }, uPR: { value: r.getPixelRatio() }, uPointer: { value: new THREE.Vector3(99, 99, 0) },
            uColA: { value: new THREE.Color() }, uColB: { value: new THREE.Color() }, uHi: { value: new THREE.Color() }, uDim: { value: 1 } };
        this.mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: this.u, transparent: true, depthWrite: false });
        this.group = new THREE.Group(); this.scene.add(this.group);
        this.group.add(new THREE.Points(g, this.mat));

        // faint dust for depth
        const dn = mobile ? 500 : 1100, dp = new Float32Array(dn * 3).map((_, i) => (Math.random() - 0.5) * (i % 3 === 2 ? 20 : 34));
        const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
        this.dustMat = new THREE.PointsMaterial({ size: 0.045, transparent: true, opacity: 0.5, depthWrite: false });
        this.dust = new THREE.Points(dg, this.dustMat); this.scene.add(this.dust);

        this.pair = ["core", "core"]; this.goal = { x: 0, y: 0, s: 1, dim: 1 }; this.cur = { ...this.goal };
        this.pointer = new THREE.Vector2(); this.smooth = new THREE.Vector2(); this.mixGoal = 0; this.flight = null;
        this.resize = this.resize.bind(this); addEventListener("resize", this.resize); this.resize();
        this.applyPalette(); this.off = onPalette(() => this.applyPalette());
    }

    resize() {
        const w = innerWidth, h = innerHeight;
        this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
        this.halfW = Math.tan(THREE.MathUtils.degToRad(20)) * 13 * this.camera.aspect;
    }

    applyPalette() {
        const p = getPalette(), dark = getMode() === "dark";
        this.u.uColA.value.set(p.accent); this.u.uColB.value.set(p.a2);
        this.u.uHi.value.set(dark ? "#ffe2a0" : "#f08c00");
        this.mat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending; this.mat.needsUpdate = true;
        this.dustMat.color.set(dark ? p.fg : p.mute);
    }

    /** Morph between two shapes. t = 0 → a, 1 → b. */
    setMorph(a, b, t) {
        if (!this.shapes[a]) a = "core"; if (!this.shapes[b]) b = "core";
        if (a !== this.pair[0] || b !== this.pair[1]) {
            const g = this.geo, A = this.shapes[a], B = this.shapes[b];
            g.attributes.position.array = A.pos; g.attributes.hiA.array = A.hi; g.attributes.posB.array = B.pos; g.attributes.hiB.array = B.hi;
            ["position", "posB", "hiA", "hiB"].forEach(k => { g.attributes[k].needsUpdate = true; });
            this.pair = [a, b];
        }
        this.u.uMix.value = t;
    }
    /** Where the object sits: side = -1 (left) … 1 (right), dim for big cards. */
    setLayout({ side = 0, dim = 1, narrow = false, y = 0 }) {
        this.goal.x = narrow ? 0 : side * this.halfW * 0.42;
        this.goal.y = narrow ? 1.7 : y; this.goal.s = narrow ? 0.72 : dim < 1 ? 1.25 : 0.9; this.goal.dim = dim;
    }
    setFlight(t) { this.flight = t == null ? null : Math.min(1, Math.max(0, t)); }
    setPointer(x, y) { this.pointer.set(x, y); }
    pulse() { this.pulseT = this.clock.elapsedTime; }

    tick() {
        const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime, c = this.cur, g = this.goal, k = 1 - Math.pow(0.004, dt);
        c.x += (g.x - c.x) * k; c.y += (g.y - c.y) * k; c.s += (g.s - c.s) * k; c.dim += (g.dim - c.dim) * k;
        this.smooth.lerp(this.pointer, 0.06);
        const G = this.group;
        let x = c.x, y = c.y, rz = 0;
        if (this.flight != null) { // the plane crosses the screen as you scroll
            const f = this.flight; x += (f - 0.5) * this.halfW * 1.1; y += Math.sin(f * Math.PI) * 1.2 - 0.3; rz = Math.cos(f * Math.PI) * 0.18;
        }
        G.position.set(x, y, 0); G.scale.setScalar(c.s);
        G.rotation.set((this.flight != null ? 0.95 : 0.18) - this.smooth.y * 0.25, (this.flight != null ? 0.35 : Math.sin(t * 0.25) * 0.45) + this.smooth.x * 0.4, rz);
        this.u.uTime.value = t; this.u.uDim.value = c.dim;
        this.u.uPulse.value = this.pulseT != null ? Math.max(0, 1 - (t - this.pulseT) * 1.6) * Math.sin(Math.min(1, (t - this.pulseT) * 3) * Math.PI) : 0;
        this.u.uPointer.value.set(this.smooth.x * this.halfW, this.smooth.y * this.halfW / this.camera.aspect, 0);
        this.dust.rotation.y = t * 0.01; this.dust.rotation.x = t * 0.004;
        this.renderer.render(this.scene, this.camera);
    }
    start() { if (this.raf) return; const loop = () => { this.tick(); this.raf = requestAnimationFrame(loop); }; loop(); }
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
    dispose() { this.stop(); removeEventListener("resize", this.resize); this.off?.(); this.geo.dispose(); this.mat.dispose(); this.renderer.dispose(); }
}
