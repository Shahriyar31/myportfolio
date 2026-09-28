import * as THREE from "three";

/*
 * "Inside my AI" — a living neural network behind the whole site.
 * - Thousands of neurons with real signal propagation: firing a neuron sends sparks
 *   along its connections, which fire the next neurons (chain reactions).
 * - Two shapes: a brain (hero) and an ordered network of 5 layers (the defence stack).
 *   uMix morphs between them on the GPU; the page drives it by scroll.
 * - attack(result): a red signal climbs the layers and is stopped at the layer the
 *   server says stopped it (that layer flashes red), or leaves the top in green.
 */

const LAYERS = 5;
const rnd = (s => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646)(7);

const NODE_VS = `
attribute vec3 posA; attribute vec3 posB; attribute float act; attribute float tint; attribute float seed;
uniform float uMix, uTime, uSize, uPR;
varying float vAct; varying float vTint; varying float vSeed; varying float vFade;
void main() {
  vec3 p = mix(posA, posB, uMix);
  p += 0.045 * vec3(sin(uTime * .7 + seed * 20.), cos(uTime * .6 + seed * 13.), sin(uTime * .5 + seed * 7.));
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(uSize * uPR * (.55 + seed * .6 + act * 3.2) * (18. / -mv.z), 30. * uPR);
  vAct = act; vTint = tint; vSeed = seed;
  vFade = clamp(12. / -mv.z, .4, 1.); // far neurons overlap a lot: keep them dim
}`;
const NODE_FS = `
uniform vec3 uCold, uWarm, uRed, uGreen; uniform float uDim;
varying float vAct; varying float vTint; varying float vSeed; varying float vFade;
void main() {
  float d = length(gl_PointCoord - .5); if (d > .5) discard;
  float a = pow(smoothstep(.5, 0., d), 1.7) + vAct * .35 * smoothstep(.5, .1, d);
  vec3 c = mix(uCold, uWarm, vSeed);
  c = mix(c, vec3(1.), vAct * .65);
  c = vTint > 0. ? mix(c, uRed, vTint) : mix(c, uGreen, -vTint);
  gl_FragColor = vec4(c * (.5 + vAct * 1.6), a * (.5 * vFade + vAct * .6) * uDim);
}`;
const EDGE_VS = `
attribute vec3 posA; attribute vec3 posB; uniform float uMix;
void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(posA, posB, uMix), 1.); }`;
const EDGE_FS = `uniform vec3 uColor; uniform float uOpacity; void main() { gl_FragColor = vec4(uColor, uOpacity); }`;
const SIG_VS = `
attribute vec3 col; uniform float uPR; varying vec3 vCol;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = 1.7 * uPR * (18. / -mv.z); vCol = col; }`;
const SIG_FS = `
uniform float uDim; varying vec3 vCol;
void main() { float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vCol * 1.8, pow(smoothstep(.5, 0., d), 1.4) * uDim); }`;

export default class Brain {
    constructor(canvas, { mobile = false } = {}) {
        this.canvas = canvas; this.mobile = mobile;
        const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
        this.pr = Math.min(devicePixelRatio, mobile ? 1.5 : 1.75);
        r.setPixelRatio(this.pr);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
        this.camPos = new THREE.Vector3(0, 0.6, 19); this.camLook = new THREE.Vector3();
        this.goalPos = this.camPos.clone(); this.goalLook = this.camLook.clone();
        this.group = new THREE.Group(); this.scene.add(this.group);
        this.mix = 0; this.goalMix = 0; this.dim = 1; this.goalDim = 1; this.mood = 0; this.goalMood = 0;
        this.focusLayer = -1; this.pointer = new THREE.Vector2(); this.smooth = new THREE.Vector2(); this.shake = 0;
        this.build();
        this.applyBg();
        // glow is drawn in the shaders (soft halos + additive light), no post-processing: crisp and fast
        this.clock = new THREE.Clock(); this.frames = []; this.spont = 0;
        this.tick = this.tick.bind(this); this.resize = this.resize.bind(this);
        this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas); this.resize();
        this.mo = new MutationObserver(() => this.applyBg()); this.mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }

    applyBg() {
        const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0b1016";
        this.light = document.documentElement.dataset.theme === "light";
        this.renderer.setClearColor(new THREE.Color(this.light ? "#0e1620" : bg).lerp(new THREE.Color("#05080d"), 0.55));
    }

    build() {
        const N = this.N = this.mobile ? 1700 : 3600;
        const A = this.A = new Float32Array(N * 3), B = this.B = new Float32Array(N * 3);
        const seed = new Float32Array(N), layer = this.layer = new Uint8Array(N);
        this.layerNodes = Array.from({ length: LAYERS }, () => []);
        const per = Math.ceil(N / LAYERS);
        for (let i = 0; i < N; i++) {
            // brain: two folded hemispheres
            const s = i % 2 ? 1 : -1, th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
            const rr = 0.3 + 0.7 * Math.cbrt(rnd()), fold = 1 + 0.08 * Math.sin(7 * th + s) * Math.sin(5 * ph);
            let x = Math.sin(ph) * Math.cos(th), y = Math.cos(ph), z = Math.sin(ph) * Math.sin(th);
            x = s * 1.25 + x * 3.5 * rr * fold; if (s * x < 0.25) x = s * (0.25 + rnd() * 0.3);
            A[i * 3] = x; A[i * 3 + 1] = y * 3.9 * rr * fold * (y < 0 ? 0.78 : 1); A[i * 3 + 2] = z * 5.2 * rr * fold;
            // network: 5 layers, sunflower discs
            const L = i % LAYERS, k = Math.floor(i / LAYERS), rad = 3.4 * Math.sqrt((k + 0.5) / per), ang = k * 2.39996;
            B[i * 3] = (L - 2) * 4.2; B[i * 3 + 1] = rad * Math.cos(ang); B[i * 3 + 2] = rad * Math.sin(ang);
            layer[i] = L; this.layerNodes[L].push(i); seed[i] = rnd();
        }
        // brain wiring: 2 nearest neighbours via a spatial grid
        const cell = 0.9, grid = new Map(), key = (a, b, c) => `${a},${b},${c}`;
        for (let i = 0; i < N; i++) { const k = key(Math.floor(A[i * 3] / cell), Math.floor(A[i * 3 + 1] / cell), Math.floor(A[i * 3 + 2] / cell)); (grid.get(k) || grid.set(k, []).get(k)).push(i); }
        const brainE = [];
        this.adjA = Array.from({ length: N }, () => []);
        for (let i = 0; i < N; i++) {
            const cx = Math.floor(A[i * 3] / cell), cy = Math.floor(A[i * 3 + 1] / cell), cz = Math.floor(A[i * 3 + 2] / cell), cand = [];
            for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) (grid.get(key(cx + a, cy + b, cz + c)) || []).forEach(j => { if (j !== i) cand.push([j, (A[j * 3] - A[i * 3]) ** 2 + (A[j * 3 + 1] - A[i * 3 + 1]) ** 2 + (A[j * 3 + 2] - A[i * 3 + 2]) ** 2]); });
            cand.sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([j]) => { brainE.push(i, j); this.adjA[i].push(j); this.adjA[j].push(i); });
        }
        // network wiring: each neuron feeds 2 nearby neurons in the next layer
        const layerE = [];
        this.adjB = Array.from({ length: N }, () => []);
        for (let i = 0; i < N; i++) {
            if (layer[i] >= LAYERS - 1) continue;
            const next = this.layerNodes[layer[i] + 1], cand = [];
            for (let t = 0; t < 14; t++) { const j = next[Math.floor(rnd() * next.length)]; cand.push([j, (B[j * 3 + 1] - B[i * 3 + 1]) ** 2 + (B[j * 3 + 2] - B[i * 3 + 2]) ** 2]); }
            cand.sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([j]) => { layerE.push(i, j); this.adjB[i].push(j); });
        }

        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(A, 3));
        g.setAttribute("posA", new THREE.BufferAttribute(A, 3)); g.setAttribute("posB", new THREE.BufferAttribute(B, 3));
        this.act = new Float32Array(N); this.tint = new Float32Array(N);
        g.setAttribute("act", new THREE.BufferAttribute(this.act, 1).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute("tint", new THREE.BufferAttribute(this.tint, 1).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
        this.U = {
            uMix: { value: 0 }, uTime: { value: 0 }, uSize: { value: this.mobile ? 5.5 : 5 }, uPR: { value: this.pr }, uDim: { value: 1 },
            uCold: { value: new THREE.Color("#4fc3ff") }, uWarm: { value: new THREE.Color("#a98bff") }, uRed: { value: new THREE.Color("#ff3b3b") }, uGreen: { value: new THREE.Color("#3ee08f") },
        };
        const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
        this.nodes = new THREE.Points(g, new THREE.ShaderMaterial({ vertexShader: NODE_VS, fragmentShader: NODE_FS, uniforms: this.U, ...add }));
        this.nodes.frustumCulled = false; this.group.add(this.nodes);

        const edges = (list, color) => {
            const n = list.length, pa = new Float32Array(n * 3), pb = new Float32Array(n * 3);
            list.forEach((i, k) => { for (let c = 0; c < 3; c++) { pa[k * 3 + c] = A[i * 3 + c]; pb[k * 3 + c] = B[i * 3 + c]; } });
            const eg = new THREE.BufferGeometry(); eg.setAttribute("position", new THREE.BufferAttribute(pa, 3)); eg.setAttribute("posA", new THREE.BufferAttribute(pa, 3)); eg.setAttribute("posB", new THREE.BufferAttribute(pb, 3));
            const m = new THREE.ShaderMaterial({ vertexShader: EDGE_VS, fragmentShader: EDGE_FS, uniforms: { uMix: this.U.uMix, uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0.1 } }, ...add });
            const ls = new THREE.LineSegments(eg, m); ls.frustumCulled = false; this.group.add(ls); return ls;
        };
        this.edgesA = edges(brainE, "#3d7fb8"); this.edgesB = edges(layerE, "#6f86e8");

        // sparks travelling along connections
        const MAX = this.MAX = this.mobile ? 700 : 1600;
        this.sig = []; this.sigPos = new Float32Array(MAX * 3); this.sigCol = new Float32Array(MAX * 3);
        const sg = new THREE.BufferGeometry();
        sg.setAttribute("position", new THREE.BufferAttribute(this.sigPos, 3).setUsage(THREE.DynamicDrawUsage));
        sg.setAttribute("col", new THREE.BufferAttribute(this.sigCol, 3).setUsage(THREE.DynamicDrawUsage));
        this.sparks = new THREE.Points(sg, new THREE.ShaderMaterial({ vertexShader: SIG_VS, fragmentShader: SIG_FS, uniforms: { uPR: this.U.uPR, uDim: this.U.uDim }, ...add }));
        this.sparks.frustumCulled = false; this.group.add(this.sparks);
        this._v = new THREE.Vector3();
    }

    /* ── signals ─────────────────────────────────────────────── */
    pos(i, out) { const m = this.mix, A = this.A, B = this.B; return out.set(A[i * 3] + (B[i * 3] - A[i * 3]) * m, A[i * 3 + 1] + (B[i * 3 + 1] - A[i * 3 + 1]) * m, A[i * 3 + 2] + (B[i * 3 + 2] - A[i * 3 + 2]) * m); }
    adj(i) { return this.mix > 0.5 ? this.adjB[i] : this.adjA[i]; }
    spawn(from, to, energy, kind) { if (this.sig.length < this.MAX) this.sig.push({ from, to, t: 0, v: 1.6 + Math.random() * 1.4, energy, kind }); }
    /** fire one neuron: it lights up and sends sparks to its neighbours */
    fire(i, energy = 0.8, kind = 0) {
        this.act[i] = 1; if (kind === 1) this.tint[i] = 1; else if (kind === 2) this.tint[i] = -1;
        this.adj(i).forEach(j => { if (Math.random() < 0.85) this.spawn(i, j, energy, kind); });
    }
    /** nearest neuron to a screen point (px), or -1 */
    pick(cx, cy, radius = 46) {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight, v = this._v; let best = -1, bd = radius * radius;
        this.group.updateMatrixWorld();
        for (let i = 0; i < this.N; i += this.mobile ? 1 : 2) {
            this.pos(i, v).applyMatrix4(this.group.matrixWorld).project(this.camera);
            if (v.z > 1) continue;
            const dx = (v.x + 1) / 2 * w - cx, dy = (1 - v.y) / 2 * h - cy, d = dx * dx + dy * dy;
            if (d < bd) { bd = d; best = i; }
        }
        return best;
    }
    touch(cx, cy) { const n = this.pick(cx, cy); if (n >= 0) this.fire(n, 0.9); }
    burst(cx, cy) {
        const n = this.pick(cx, cy, 120); if (n < 0) return;
        this.fire(n, 1.2); this.adj(n).forEach(j => { this.fire(j, 1.1); this.adj(j).forEach(k => this.fire(k, 1)); });
        this.shake = 1;
    }
    setPointer(x, y) { this.pointer.set(x, y); }
    setView(p, l, mix, dim) { this.goalPos.set(...p); this.goalLook.set(...l); this.goalMix = mix; this.goalDim = dim; }
    setFocusLayer(L) { this.focusLayer = L; }
    setMood(m) { if (m && !this.goalMood) for (let i = 0; i < this.N; i += 3) this.tint[i] = -1; this.goalMood = m; }

    /** One visitor message through the 5 layers. result → { verdict, at } */
    async attack(result) {
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const pickN = (L, n) => { const a = this.layerNodes[L]; return Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]); };
        const wave = (L, kind, n) => pickN(L, n).forEach(i => this.fire(i, 0.25, kind));
        this.attacking = true;
        try {
            wave(0, 1, 45);
            let r = null; result.then(v => { r = v; });
            while (!r) { await wait(380); wave(0, 1, 18); }
            const at = { input: 0, judge: 1, model: 2, output: 3 }[r.at] ?? (r.verdict === "blocked" ? 0 : 99);
            for (let L = 1; L < LAYERS; L++) {
                await wait(430);
                if (L === at + 1 || at === 0 && L === 1) break;
                wave(L, L >= 4 && at === 99 ? 2 : 1, 32);
            }
            if (at <= 3) { this.layerNodes[at].forEach(i => { this.act[i] = 1; this.tint[i] = 1; }); this.shake = 0.7; }
            else this.layerNodes[LAYERS - 1].forEach(i => { this.act[i] = 1; this.tint[i] = -1; });
            await wait(800);
            return r;
        } finally { this.attacking = false; }
    }

    resize() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight; if (!w || !h) return;
        this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
        this.composer?.setSize(w, h);
    }
    degrade() { if (this.lite) return; this.lite = true; this.composer?.dispose(); this.composer = null; this.pr = 1; this.renderer.setPixelRatio(1); this.U.uPR.value = 1; this.resize(); }

    tick() {
        const raw = this.clock.getDelta(), dt = Math.min(raw, 0.05), t = this.clock.elapsedTime;
        if (this.frames && raw > 0) { this.frames.push(raw); if (this.frames.length > 90) { const f = this.frames.sort((a, b) => a - b); if (f[45] > 1 / 30) this.degrade(); this.frames = null; } }
        const e = 1 - Math.pow(0.03, dt);
        this.mix += (this.goalMix - this.mix) * (1 - Math.pow(0.08, dt)); this.U.uMix.value = this.mix;
        this.dim += (this.goalDim - this.dim) * e; this.U.uDim.value = this.dim;
        this.mood += (this.goalMood - this.mood) * e;
        this.U.uCold.value.set("#4fc3ff").lerp(new THREE.Color("#3ee08f"), this.mood * 0.7);
        this.U.uTime.value = t;
        const far = Math.min(1, 11 / this.camPos.distanceTo(this.camLook.clone().setZ(0)));
        this.edgesA.material.uniforms.uOpacity.value = 0.12 * far * (1 - this.mix) * this.dim;
        this.edgesB.material.uniforms.uOpacity.value = 0.035 * this.mix * this.dim;
        // camera
        this.camPos.lerp(this.goalPos, e); this.camLook.lerp(this.goalLook, e);
        this.smooth.lerp(this.pointer, 0.05); this.shake *= Math.pow(0.02, dt);
        const sh = this.shake * 0.25;
        this.camera.position.copy(this.camPos).add(this._v.set(this.smooth.x * 1.2 + (Math.random() - 0.5) * sh, this.smooth.y * 0.7 + (Math.random() - 0.5) * sh, 0));
        this.camera.lookAt(this.camLook);
        this.group.rotation.y = Math.sin(t * 0.08) * 0.7 * (1 - this.mix) - 0.62 * this.mix + this.smooth.x * 0.12;
        this.group.rotation.x = Math.sin(t * 0.06) * 0.12 * (1 - this.mix) + 0.18 * this.mix;
        // neurons fade; the brain fires on its own now and then
        const decay = Math.exp(-dt * 2.6), tdec = Math.exp(-dt * 0.7);
        for (let i = 0; i < this.N; i++) { this.act[i] *= decay; this.tint[i] *= tdec; }
        this.spont -= dt;
        if (this.spont < 0) { this.spont = 0.09 + Math.random() * 0.15; this.fire(Math.floor(Math.random() * this.N), 0.55); }
        if (this.focusLayer >= 0) {
            const a = this.layerNodes[this.focusLayer];
            for (let k = 0; k < a.length; k++) { const i = a[k]; this.act[i] = Math.max(this.act[i], 0.45 + 0.25 * Math.sin(t * 3 + i)); }
            if (Math.random() < 0.3) this.fire(a[Math.floor(Math.random() * a.length)], 0.3);
        }
        // sparks
        const v = this._v, w = new THREE.Vector3(); let n = 0;
        const next = [];
        for (const s of this.sig) {
            s.t += s.v * dt;
            if (s.t >= 1) {
                this.act[s.to] = Math.min(1, this.act[s.to] + 0.8);
                if (s.kind === 1) this.tint[s.to] = 1; else if (s.kind === 2) this.tint[s.to] = -1;
                if (s.energy > 0.18) this.adj(s.to).forEach(j => { if (j !== s.from && Math.random() < 0.6) next.push({ from: s.to, to: j, t: 0, v: 1.6 + Math.random() * 1.4, energy: s.energy * 0.7, kind: s.kind }); });
                continue;
            }
            next.push(s);
        }
        this.sig = next.slice(0, this.MAX);
        for (const s of this.sig) {
            this.pos(s.from, v); this.pos(s.to, w); v.lerp(w, s.t);
            this.sigPos[n * 3] = v.x; this.sigPos[n * 3 + 1] = v.y; this.sigPos[n * 3 + 2] = v.z;
            const c = s.kind === 1 ? [1, 0.25, 0.25] : s.kind === 2 ? [0.3, 1, 0.6] : [0.75, 0.9, 1];
            this.sigCol[n * 3] = c[0]; this.sigCol[n * 3 + 1] = c[1]; this.sigCol[n * 3 + 2] = c[2]; n++;
        }
        const sg = this.sparks.geometry; sg.setDrawRange(0, n); sg.attributes.position.needsUpdate = true; sg.attributes.col.needsUpdate = true;
        const ng = this.nodes.geometry; ng.attributes.act.needsUpdate = true; ng.attributes.tint.needsUpdate = true;
        if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
    }
    start() { if (!this.running) { this.running = true; this.clock.getDelta(); this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() { this.stop(); this.ro.disconnect(); this.mo.disconnect(); this.composer?.dispose(); this.scene.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); }); this.renderer.dispose(); }
}
