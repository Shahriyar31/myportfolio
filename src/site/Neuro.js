import * as THREE from "three";

/*
 * The vertical brain. One neural network, stacked region by region down the page:
 *   0 face (built from my photo) · 1 defence layers · 2 three skills · 3 experience
 *   4 projects · 5 the journey West Bengal → Hamburg · 6 contact orb
 * Neurons fire and pass sparks along real connections; long axons carry signals
 * from each region down to the next. The page moves the camera between regions.
 */

export const SPACING = 17;
const rnd = (s => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646)(11);

const NODE_VS = `
attribute vec3 start; attribute vec3 target; attribute float act; attribute float tint; attribute float seed; attribute float face; attribute float bright;
uniform float uTime, uSize, uPR, uAssemble;
varying float vAct; varying float vTint; varying float vSeed; varying float vFade; varying float vBright;
void main() {
  float k = face > .5 ? clamp(uAssemble * 1.4 - seed * .4, 0., 1.) : 1.;
  k = k * k * (3. - 2. * k);
  vec3 p = mix(start, target, k);
  p += .04 * vec3(sin(uTime * .7 + seed * 20.), cos(uTime * .6 + seed * 13.), sin(uTime * .5 + seed * 7.));
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(uSize * uPR * (face > .5 ? .55 + bright * .55 : .5 + seed * .5) * (1. + act * 3.) * (16. / -mv.z), 30. * uPR);
  vAct = act; vTint = tint; vSeed = seed; vBright = bright; vFade = clamp(14. / -mv.z, .35, 1.);
}`;
const NODE_FS = `
uniform vec3 uCold, uWarm, uRed, uGreen; uniform float uDim;
varying float vAct; varying float vTint; varying float vSeed; varying float vFade; varying float vBright;
void main() {
  float d = length(gl_PointCoord - .5); if (d > .5) discard;
  float a = pow(smoothstep(.5, 0., d), 1.7) + vAct * .35 * smoothstep(.5, .1, d);
  vec3 c = mix(uCold, uWarm, vSeed * .6);
  c = mix(c, vec3(1.), vAct * .65);
  c = vTint > 0. ? mix(c, uRed, vTint) : mix(c, uGreen, -vTint);
  gl_FragColor = vec4(c * (.35 + vBright * .85 + vAct * 1.6), a * ((.22 + vBright * .75) * vFade + vAct * .6) * uDim);
}`;
const EDGE_VS = `attribute vec3 color; varying vec3 vC; void main() { vC = color; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const EDGE_FS = `uniform float uOpacity; varying vec3 vC; void main() { gl_FragColor = vec4(vC, uOpacity); }`;
const SIG_VS = `attribute vec3 col; uniform float uPR; varying vec3 vCol;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = 1.8 * uPR * (16. / -mv.z); vCol = col; }`;
const SIG_FS = `uniform float uDim; varying vec3 vCol;
void main() { float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vCol * 1.8, pow(smoothstep(.5, 0., d), 1.4) * uDim); }`;

// ── region shapes (local coordinates around the region centre) ──
const sphere = (n, r, cx = 0, cy = 0, cz = 0) => Array.from({ length: n }, () => { const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1), rr = r * Math.cbrt(rnd()); return [cx + rr * Math.sin(ph) * Math.cos(th), cy + rr * Math.cos(ph), cz + rr * Math.sin(ph) * Math.sin(th)]; });
const disc = (n, r, y) => Array.from({ length: n }, (_, k) => { const rad = r * Math.sqrt((k + 0.5) / n), a = k * 2.39996; return [rad * Math.cos(a), y + (rnd() - 0.5) * 0.12, rad * Math.sin(a)]; });

export default class Neuro {
    constructor(canvas, { mobile = false } = {}) {
        this.canvas = canvas; this.mobile = mobile;
        const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
        this.pr = Math.min(devicePixelRatio, mobile ? 1.5 : 1.75); r.setPixelRatio(this.pr);
        r.setClearColor(new THREE.Color("#070b11"));
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
        this.cam = new THREE.Vector3(0, 0, 16); this.goal = this.cam.clone(); this.look = new THREE.Vector3(); this.goalLook = new THREE.Vector3();
        this.cx = mobile ? 0 : 4.2; // regions sit on the right; text on the left
        this.pointer = new THREE.Vector2(); this.smooth = new THREE.Vector2();
        this.dim = 1; this.goalDim = 1; this.mood = 0; this.goalMood = 0; this.focus = -1; this.thinking = false; this.region = 0;
        this.assemble = 0; this.journey = 0;
        this.build();
        this.clock = new THREE.Clock(); this.spont = 0; this.frames = [];
        this.tick = this.tick.bind(this); this.resize = this.resize.bind(this);
        this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas); this.resize();
        this.loadFace("/images/profile-suit.jpg");
    }

    build() {
        const M = this.mobile ? 0.55 : 1, nodes = [], regions = [];
        const add = (region, pts, extra = {}) => pts.forEach(p => nodes.push({ region, p, ...extra }));
        // 0 · face: placeholder head until the photo is sampled
        const FACE = this.FACE = Math.round(5200 * M);
        add(0, sphere(FACE, 3.2).map(([x, y, z]) => [x * 0.85, y * 1.25, z * 0.5]), { face: 1 });
        // 1 · four defence layers
        [0, 1, 2, 3].forEach(L => add(1, disc(Math.round(230 * M), 2.7, 2.7 - L * 1.8), { layer: L }));
        // 2 · three skills: build · legal · ship
        [-3.1, 0, 3.1].forEach((x, g) => add(2, sphere(Math.round(190 * M), 1.35, x, (g - 1) * -0.4, 0), { group: g }));
        // 3 · experience: Nordex (big) linked to TUHH
        add(3, sphere(Math.round(430 * M), 2.3, -1.4, 0.6, 0), { group: 0 }); add(3, sphere(Math.round(210 * M), 1.4, 2.6, -1.4, 0.4), { group: 1 });
        // 4 · projects: Argus in the middle, five orbiting
        add(4, sphere(Math.round(380 * M), 1.9), { group: 0 });
        for (let s = 0; s < 5; s++) { const a = s / 5 * Math.PI * 2 + 0.4; add(4, sphere(Math.round(70 * M), 0.7, Math.cos(a) * 3.8, Math.sin(a) * 2.6, Math.sin(a) * 1.2), { group: s + 1 }); }
        // 5 · the journey: West Bengal → a long arc → Hamburg
        add(5, sphere(Math.round(160 * M), 1.1, -2.4, -1.8, 0), { group: 0 }); add(5, sphere(Math.round(160 * M), 1.1, 4.2, 1.8, 0), { group: 2 });
        const ARC = Math.round(260 * M);
        for (let k = 0; k < ARC; k++) { const u = k / (ARC - 1), x = -2.4 + 6.6 * u, y = -1.8 + 3.6 * u + Math.sin(u * Math.PI) * 2.6; nodes.push({ region: 5, p: [x + (rnd() - 0.5) * 0.35, y + (rnd() - 0.5) * 0.35, (rnd() - 0.5) * 0.5], group: 1, u }); }
        // 6 · contact orb
        add(6, sphere(Math.round(560 * M), 2.6));

        const N = this.N = nodes.length;
        this.nodes = nodes; this.regionNodes = Array.from({ length: 7 }, () => []);
        this.layerNodes = [[], [], [], []]; this.groupNodes = {};
        const start = new Float32Array(N * 3), target = new Float32Array(N * 3), seed = new Float32Array(N), face = new Float32Array(N), bright = new Float32Array(N);
        nodes.forEach((n, i) => {
            const cy = -n.region * SPACING, [x, y, z] = n.p;
            target[i * 3] = this.cx + x; target[i * 3 + 1] = cy + y; target[i * 3 + 2] = z;
            if (n.face) { const a = rnd() * Math.PI * 2, rr = 9 + rnd() * 14; start[i * 3] = this.cx + Math.cos(a) * rr; start[i * 3 + 1] = cy + (rnd() - 0.5) * 16; start[i * 3 + 2] = Math.sin(a) * rr - 4; }
            else { start[i * 3] = target[i * 3]; start[i * 3 + 1] = target[i * 3 + 1]; start[i * 3 + 2] = target[i * 3 + 2]; }
            seed[i] = rnd(); face[i] = n.face ? 1 : 0; bright[i] = n.face ? 0.5 : 0.35;
            this.regionNodes[n.region].push(i);
            if (n.layer !== undefined) this.layerNodes[n.layer].push(i);
            if (n.group !== undefined) (this.groupNodes[`${n.region}:${n.group}`] ||= []).push(i);
        });
        this.arc = this.groupNodes["5:1"].slice().sort((a, b) => nodes[a].u - nodes[b].u);
        this.T = target; this.S = start;

        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(target, 3));
        this.aTarget = new THREE.BufferAttribute(target, 3); g.setAttribute("target", this.aTarget);
        g.setAttribute("start", new THREE.BufferAttribute(start, 3));
        this.act = new Float32Array(N); this.tint = new Float32Array(N);
        g.setAttribute("act", new THREE.BufferAttribute(this.act, 1).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute("tint", new THREE.BufferAttribute(this.tint, 1).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute("seed", new THREE.BufferAttribute(seed, 1)); g.setAttribute("face", new THREE.BufferAttribute(face, 1));
        this.aBright = new THREE.BufferAttribute(bright, 1); g.setAttribute("bright", this.aBright);
        this.U = {
            uTime: { value: 0 }, uSize: { value: this.mobile ? 5.5 : 5 }, uPR: { value: this.pr }, uDim: { value: 1 }, uAssemble: { value: 0 },
            uCold: { value: new THREE.Color("#4fc3ff") }, uWarm: { value: new THREE.Color("#a98bff") }, uRed: { value: new THREE.Color("#ff3b3b") }, uGreen: { value: new THREE.Color("#3ee08f") },
        };
        const addB = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
        this.points = new THREE.Points(g, new THREE.ShaderMaterial({ vertexShader: NODE_VS, fragmentShader: NODE_FS, uniforms: this.U, ...addB }));
        this.points.frustumCulled = false; this.scene.add(this.points);
        this.wire();
        // sparks
        const MAX = this.MAX = this.mobile ? 800 : 1800;
        this.sig = []; this.sigPos = new Float32Array(MAX * 3); this.sigCol = new Float32Array(MAX * 3);
        const sg = new THREE.BufferGeometry();
        sg.setAttribute("position", new THREE.BufferAttribute(this.sigPos, 3).setUsage(THREE.DynamicDrawUsage));
        sg.setAttribute("col", new THREE.BufferAttribute(this.sigCol, 3).setUsage(THREE.DynamicDrawUsage));
        this.sparks = new THREE.Points(sg, new THREE.ShaderMaterial({ vertexShader: SIG_VS, fragmentShader: SIG_FS, uniforms: { uPR: this.U.uPR, uDim: this.U.uDim }, ...addB }));
        this.sparks.frustumCulled = false; this.scene.add(this.sparks);
        this._v = new THREE.Vector3(); this._w = new THREE.Vector3();
    }

    /** connections: 2 nearest neighbours inside each region, disc → next disc, and long axons between regions */
    wire() {
        const N = this.N, T = this.T, adj = this.adj = Array.from({ length: N }, () => []), E = [];
        const link = (a, b, dir = false) => { adj[a].push(b); if (!dir) adj[b].push(a); E.push(a, b); };
        if (this.edges) { this.scene.remove(this.edges); this.edges.geometry.dispose(); }
        this.regionNodes.forEach(list => {
            const cell = 0.7, grid = new Map(), key = (a, b, c) => `${a},${b},${c}`, cf = i => [Math.floor(T[i * 3] / cell), Math.floor(T[i * 3 + 1] / cell), Math.floor(T[i * 3 + 2] / cell)];
            list.forEach(i => { const k = key(...cf(i)); (grid.get(k) || grid.set(k, []).get(k)).push(i); });
            list.forEach(i => {
                const [cx, cy, cz] = cf(i), cand = [];
                for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) (grid.get(key(cx + a, cy + b, cz + c)) || []).forEach(j => { if (j > i) cand.push([j, (T[j * 3] - T[i * 3]) ** 2 + (T[j * 3 + 1] - T[i * 3 + 1]) ** 2 + (T[j * 3 + 2] - T[i * 3 + 2]) ** 2]); });
                cand.sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([j]) => link(i, j));
            });
        });
        for (let L = 0; L < 3; L++) this.layerNodes[L].forEach(i => { for (let t = 0; t < 2; t++) link(i, this.layerNodes[L + 1][Math.floor(rnd() * this.layerNodes[L + 1].length)], true); });
        this.axons = [];
        for (let R = 0; R < 6; R++) for (let t = 0; t < 12; t++) {
            const a = this.regionNodes[R][Math.floor(rnd() * this.regionNodes[R].length)], b = this.regionNodes[R + 1][Math.floor(rnd() * this.regionNodes[R + 1].length)];
            link(a, b, true); this.axons.push([a, b, R]);
        }
        const pos = new Float32Array(E.length * 3), col = new Float32Array(E.length * 3);
        E.forEach((i, k) => { pos.set([T[i * 3], T[i * 3 + 1], T[i * 3 + 2]], k * 3); col.set(this.nodes[i].region !== this.nodes[E[k ^ 1]]?.region ? [0.45, 0.4, 0.95] : this.nodes[i].face ? [0.07, 0.14, 0.22] : [0.24, 0.5, 0.75], k * 3); });
        const eg = new THREE.BufferGeometry(); eg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); eg.setAttribute("color", new THREE.BufferAttribute(col, 3));
        this.edges = new THREE.LineSegments(eg, new THREE.ShaderMaterial({ vertexShader: EDGE_VS, fragmentShader: EDGE_FS, uniforms: { uOpacity: { value: 0.1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        this.edges.frustumCulled = false; this.scene.add(this.edges);
    }

    /** sample my portrait: neurons land where the photo has detail, brighter where the face is lit */
    loadFace(src) {
        const img = new Image(); img.decoding = "async";
        img.onload = () => {
            const W = 170, H = 170, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
            const g = cv.getContext("2d", { willReadFrequently: true });
            const s = Math.max(W / img.width, H / img.height), dw = img.width * s, dh = img.height * s;
            g.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
            const d = g.getImageData(0, 0, W, H).data, px = (x, y) => { const k = (y * W + x) * 4; return [d[k], d[k + 1], d[k + 2]]; };
            const L = (x, y) => { const [r, gg, bb] = px(x, y); return (r * 0.3 + gg * 0.59 + bb * 0.11) / 255; };
            const bgc = [0, 0, 0]; let nb = 0;
            for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) for (const X of [x, W - 1 - x]) { const c = px(X, y); bgc[0] += c[0]; bgc[1] += c[1]; bgc[2] += c[2]; nb++; }
            bgc.forEach((v, k) => { bgc[k] = v / nb; });
            const cand = [];
            for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
                const c = px(x, y), l = L(x, y), mx = Math.max(...c), sat = mx ? (mx - Math.min(...c)) / mx : 0, dist = sat;
                const edge = Math.abs(L(x + 1, y) - L(x - 1, y)) + Math.abs(L(x, y + 1) - L(x, y - 1));
                // the studio backdrop is grey, mid-bright and flat; hair is dark, skin warm, suit blue, shirt white
                if (sat < 0.14 && l > 0.28 && l < 0.8 && edge < 0.07) continue;
                cand.push([x, y, l, Math.min(1, 0.35 + edge * 3 + dist)]);
            }
            const list = this.regionNodes[0], T = this.T, B = this.aBright.array;
            for (let n = 0; n < list.length && cand.length; n++) {
                // weighted pick: detail (eyes, glasses, hairline) gets more neurons
                let c; for (let t = 0; t < 6; t++) { c = cand[Math.floor(rnd() * cand.length)]; if (rnd() < c[3]) break; }
                const [x, y, l] = c, i = list[n];
                T[i * 3] = this.cx + (x / W - 0.5 + (rnd() - 0.5) / W) * 8.6; T[i * 3 + 1] = (0.5 - y / H + (rnd() - 0.5) / H) * 8.4 + 0.2; T[i * 3 + 2] = (l - 0.45) * 1.8 + (rnd() - 0.5) * 0.2;
                B[i] = 0.06 + Math.pow(l, 1.5) * 1.45;
            }
            this.aTarget.needsUpdate = true; this.aBright.needsUpdate = true;
            this.wire(); this.assemble = 0; // fly in again, now into the face
        };
        img.src = src;
    }

    /* ── signals ── */
    pos(i, out) { const f = this.nodes[i].face, T = this.T, S = this.S; if (!f || this.assemble >= 1) return out.set(T[i * 3], T[i * 3 + 1], T[i * 3 + 2]); const k = Math.min(1, Math.max(0, this.assemble * 1.4)); return out.set(S[i * 3] + (T[i * 3] - S[i * 3]) * k, S[i * 3 + 1] + (T[i * 3 + 1] - S[i * 3 + 1]) * k, S[i * 3 + 2] + (T[i * 3 + 2] - S[i * 3 + 2]) * k); }
    spawn(from, to, energy, kind) { if (this.sig.length < this.MAX) this.sig.push({ from, to, t: 0, v: 1.8 + Math.random() * 1.4, energy, kind }); }
    fire(i, energy = 0.8, kind = 0) { this.act[i] = 1; if (kind === 1) this.tint[i] = 1; else if (kind === 2) this.tint[i] = -1; this.adj[i].forEach(j => { if (Math.random() < 0.85) this.spawn(i, j, energy, kind); }); }
    pick(cx, cy, list, radius = 44) {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight, v = this._v; let best = -1, bd = radius * radius;
        for (let k = 0; k < list.length; k += this.mobile ? 1 : 2) {
            const i = list[k]; this.pos(i, v).project(this.camera); if (v.z > 1) continue;
            const dx = (v.x + 1) / 2 * w - cx, dy = (1 - v.y) / 2 * h - cy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; }
        }
        return best;
    }
    touch(cx, cy) { const n = this.pick(cx, cy, this.regionNodes[this.region]); if (n >= 0) this.fire(n, 0.9); }
    burst(cx, cy) { const n = this.pick(cx, cy, this.regionNodes[this.region], 140); if (n < 0) return; this.fire(n, 1.3); this.adj[n].forEach(j => { this.fire(j, 1.1); this.adj[j].forEach(k => this.fire(k, 1)); }); }
    /** scrolling sends signals down the axons towards where you're going */
    flow(amount) { const n = Math.min(6, Math.floor(Math.abs(amount) / 25)); for (let k = 0; k < n; k++) { const [a, b] = this.axons[Math.floor(Math.random() * this.axons.length)]; this.spawn(a, b, 0.5, 0); } }

    setPointer(x, y) { this.pointer.set(x, y); }
    /** camera: y follows the region in view; z breathes a little */
    setView(y, z, region, dim) { this.goal.set(0, y, z); this.goalLook.set(this.mobile ? 0 : 0.6, y, 0); this.region = region; this.goalDim = dim; }
    setFocus(g) { this.focus = g; }
    setThinking(v) { this.thinking = v; }
    setMood(m) { if (m && !this.goalMood) this.regionNodes[6].forEach(i => { this.tint[i] = -1; this.act[i] = 1; }); this.goalMood = m; }
    /** screen position of a region-local anchor, for labels */
    project(x, y, z) { const v = this._w.set(x, y, z).project(this.camera), w = this.canvas.clientWidth, h = this.canvas.clientHeight; return [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h, v.z < 1]; }
    centerOf(region, group) { const l = this.groupNodes[`${region}:${group}`] || this.regionNodes[region], v = new THREE.Vector3(); l.forEach(i => v.add(this._v.set(this.T[i * 3], this.T[i * 3 + 1], this.T[i * 3 + 2]))); return v.divideScalar(l.length); }

    /** Break my AI: red signal down the four defence layers; the blocking layer flashes red */
    async attack(result) {
        const wait = ms => new Promise(r => setTimeout(r, ms)), some = (a, n) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]);
        const wave = (L, kind, n) => some(this.layerNodes[L], n).forEach(i => this.fire(i, 0.25, kind));
        wave(0, 1, 40);
        let r = null; result.then(v => { r = v; });
        while (!r) { await wait(380); wave(0, 1, 16); }
        const at = { input: 0, judge: 1, model: 2, output: 3 }[r.at] ?? (r.verdict === "blocked" ? 0 : 99);
        for (let L = 1; L < 4 && L <= at; L++) { await wait(430); if (L === at) break; wave(L, 1, 30); }
        if (at <= 3) this.layerNodes[at].forEach(i => { this.act[i] = 1; this.tint[i] = 1; });
        else { await wait(430); this.layerNodes[3].forEach(i => { this.act[i] = 1; this.tint[i] = -1; }); }
        await wait(800); return r;
    }

    resize() { const w = this.canvas.clientWidth, h = this.canvas.clientHeight; if (!w || !h) return; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
    tick() {
        const raw = this.clock.getDelta(), dt = Math.min(raw, 0.05), t = this.clock.elapsedTime;
        if (this.frames && raw > 0) { this.frames.push(raw); if (this.frames.length > 90) { const f = this.frames.sort((a, b) => a - b); if (f[45] > 1 / 30) { this.pr = 1; this.renderer.setPixelRatio(1); this.U.uPR.value = 1; this.resize(); } this.frames = null; } }
        const e = 1 - Math.pow(0.02, dt);
        this.assemble = Math.min(1.2, this.assemble + dt / 2.8); this.U.uAssemble.value = this.assemble; this.U.uTime.value = t;
        this.dim += (this.goalDim - this.dim) * e; this.U.uDim.value = this.dim;
        this.mood += (this.goalMood - this.mood) * e; this.edges.material.uniforms.uOpacity.value = 0.1 * this.dim * Math.min(1, this.assemble);
        this.cam.lerp(this.goal, e); this.look.lerp(this.goalLook, e); this.smooth.lerp(this.pointer, 0.05);
        this.camera.position.set(this.cam.x + this.smooth.x * 1.3, this.cam.y + this.smooth.y * 0.8, this.cam.z);
        this.camera.lookAt(this.look);
        const decay = Math.exp(-dt * 2.6), tdec = Math.exp(-dt * 0.7);
        for (let i = 0; i < this.N; i++) { this.act[i] *= decay; this.tint[i] *= tdec; }
        // the region in view is alive; when my AI is thinking the face lights up
        const here = this.regionNodes[this.region];
        this.spont -= dt;
        if (this.spont < 0) { this.spont = this.thinking && this.region === 0 ? 0.02 : 0.1 + Math.random() * 0.12; this.fire(here[Math.floor(Math.random() * here.length)], this.thinking ? 0.9 : 0.55); }
        if (this.focus >= 0) { const l = this.groupNodes[`2:${this.focus}`]; l.forEach(i => { this.act[i] = Math.max(this.act[i], 0.4 + 0.25 * Math.sin(t * 3 + i)); }); if (Math.random() < 0.3) this.fire(l[Math.floor(Math.random() * l.length)], 0.4); }
        if (this.region === 5) { // the flight: a bright signal travels the arc from West Bengal to Hamburg
            this.journey = (this.journey + dt * 0.22) % 1.25; const at = Math.min(1, this.journey), n = this.arc.length, k = Math.floor(at * (n - 1));
            for (let q = Math.max(0, k - 6); q <= k; q++) this.act[this.arc[q]] = Math.max(this.act[this.arc[q]], 1 - (k - q) / 7);
            if (this.journey > 1 && this.journey - dt * 0.22 <= 1) this.groupNodes["5:2"].forEach(i => { this.act[i] = 1; });
        }
        if (this.mood > 0.5 && Math.random() < 0.2) this.fire(this.regionNodes[6][Math.floor(Math.random() * this.regionNodes[6].length)], 0.5, 2);
        // sparks
        const v = this._v, w = this._w, next = []; let n = 0;
        for (const s of this.sig) {
            s.t += s.v * dt * (this.nodes[s.from].region !== this.nodes[s.to].region ? 0.25 : 1);
            if (s.t >= 1) {
                this.act[s.to] = Math.min(1, this.act[s.to] + 0.8); if (s.kind === 1) this.tint[s.to] = 1; else if (s.kind === 2) this.tint[s.to] = -1;
                if (s.energy > 0.18) this.adj[s.to].forEach(j => { if (j !== s.from && Math.random() < 0.55 && this.nodes[j].region === this.nodes[s.to].region) next.push({ from: s.to, to: j, t: 0, v: 1.8 + Math.random() * 1.4, energy: s.energy * 0.7, kind: s.kind }); });
                continue;
            }
            next.push(s);
        }
        this.sig = next.slice(0, this.MAX);
        for (const s of this.sig) {
            this.pos(s.from, v); this.pos(s.to, w); v.lerp(w, s.t);
            this.sigPos.set([v.x, v.y, v.z], n * 3);
            this.sigCol.set(s.kind === 1 ? [1, 0.25, 0.25] : s.kind === 2 ? [0.3, 1, 0.6] : [0.75, 0.9, 1], n * 3); n++;
        }
        const sg = this.sparks.geometry; sg.setDrawRange(0, n); sg.attributes.position.needsUpdate = true; sg.attributes.col.needsUpdate = true;
        const ng = this.points.geometry; ng.attributes.act.needsUpdate = true; ng.attributes.tint.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
        this.afterTick?.();
    }
    start() { if (!this.running) { this.running = true; this.clock.getDelta(); this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() { this.stop(); this.ro.disconnect(); this.scene.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); }); this.renderer.dispose(); }
}
