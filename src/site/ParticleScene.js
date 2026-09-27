import * as THREE from "three";
import * as S from "./shapes";
import { getPalette, onPalette, getMode } from "./theme";

/*
 * One particle universe behind the whole site. Every section names a shape;
 * the same particles swirl from one shape into the next as you scroll.
 */

const vert = /* glsl */ `
attribute vec3 aFrom; attribute vec3 aTo; attribute vec3 cFrom; attribute vec3 cTo; attribute float aRand;
uniform float uMix, uTime, uSize, uSway, uMouseOn, uBurstT, uLight;
uniform vec2 uOffFrom, uOffTo; uniform float uDimFrom, uDimTo;
uniform vec3 uMouse, uBurstP;
varying vec3 vColor; varying float vAlpha;
void main(){
  float mm = clamp(uMix * 1.5 - aRand * 0.5, 0.0, 1.0);
  mm = mm * mm * (3.0 - 2.0 * mm);
  vec3 p = mix(aFrom, aTo, mm);
  float mid = sin(3.14159 * mm);
  float t = uTime;
  p += vec3(sin(t * .7 + aRand * 40.), cos(t * .6 + aRand * 31.), sin(t * .5 + aRand * 23.)) * (0.012 + mid * 1.8);
  float c = cos(uSway), s = sin(uSway);
  p.xz = mat2(c, -s, s, c) * p.xz;
  p.xy += mix(uOffFrom, uOffTo, mm);
  // wind from the pointer
  vec2 d = p.xy - uMouse.xy; float dist = length(d);
  float f = uMouseOn * smoothstep(1.7, 0.0, dist);
  p.xy += normalize(d + 1e-4) * f * 1.1; p.z += f * 1.2;
  // click shockwave
  float age = uTime - uBurstT; vec2 bd = p.xy - uBurstP.xy; float bdist = length(bd);
  float ring = smoothstep(0.9, 0.0, abs(bdist - age * 7.0)) * smoothstep(1.4, 0.0, age);
  p.xy += normalize(bd + 1e-4) * ring * 0.9; p.z += ring * 1.5;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.55 + aRand * 0.9) * (12.0 / -mv.z) * (1.0 + ring * 1.5 + f * 0.6);
  gl_Position = projectionMatrix * mv;
  vColor = mix(cFrom, cTo, mm) + ring * 0.35;
  float dim = mix(uDimFrom, uDimTo, mm);
  vAlpha = (1.0 - dim) * (0.72 + 0.28 * sin(t * 1.7 + aRand * 60.0));
}`;
const frag = /* glsl */ `
varying vec3 vColor; varying float vAlpha; uniform float uLight;
void main(){
  vec2 q = gl_PointCoord - 0.5; float r = dot(q, q);
  if (r > 0.25) discard;
  float a = smoothstep(0.25, 0.0, r);
  gl_FragColor = vec4(vColor * mix(1.0, 0.72, uLight), a * vAlpha * mix(0.9, 0.8, uLight));
}`;

export default class ParticleScene {
    constructor(canvas, { mobile = false } = {}) {
        this.canvas = canvas;
        this.mobile = mobile;
        this.N = mobile ? 11000 : 24000;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        this.camera.position.set(0, 0, 16);
        this.clock = new THREE.Clock();
        this.shapes = {};
        this.tones = {};
        this.from = null; this.to = null;
        this.mouse = new THREE.Vector3(99, 99, 0); this.mouseOn = 0; this.lastMove = 0;

        const g = new THREE.BufferGeometry();
        const N = this.N;
        this.buf = { aFrom: new Float32Array(N * 3), aTo: new Float32Array(N * 3), cFrom: new Float32Array(N * 3), cTo: new Float32Array(N * 3) };
        const r = new Float32Array(N); for (let i = 0; i < N; i++) r[i] = Math.random();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
        Object.entries(this.buf).forEach(([k, v]) => g.setAttribute(k, new THREE.BufferAttribute(v, 3)));
        g.setAttribute("aRand", new THREE.BufferAttribute(r, 1));
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
        this.u = {
            uMix: { value: 0 }, uTime: { value: 0 }, uSize: { value: mobile ? 4 : 3.1 }, uSway: { value: 0 },
            uMouse: { value: this.mouse }, uMouseOn: { value: 0 }, uBurstT: { value: -99 }, uBurstP: { value: new THREE.Vector3() },
            uOffFrom: { value: new THREE.Vector2() }, uOffTo: { value: new THREE.Vector2() }, uDimFrom: { value: 0 }, uDimTo: { value: 0 }, uLight: { value: 0 },
        };
        this.mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: this.u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        this.points = new THREE.Points(g, this.mat);
        this.scene.add(this.points);

        this.buildShapes();
        this.applyPalette();
        this.off = onPalette(() => this.applyPalette());
        this.resize = this.resize.bind(this); this.tick = this.tick.bind(this);
        this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas); this.resize();
    }

    buildShapes() {
        const N = this.N;
        const add = (k, s) => { this.shapes[k] = s.pos; if (s.tone) this.tones[k] = s.tone; if (s.col) this.shapes[k + ":col"] = s.col; };
        add("ambient", S.ambient(N));
        add("network", S.network(N));
        add("eu", S.euStars(N));
        add("lock", S.padlock(N));
        add("data", S.dataLayers(N));
        add("shield", S.shield(N));
        add("map", S.worldMap(N));
        add("hello", S.words(N, "Let's talk", this.mobile ? 6 : 9.5));
        // the portrait needs the photo; until it loads it borrows the network
        this.shapes.portrait = this.shapes.network; this.tones.portrait = this.tones.network;
        const img = new Image();
        img.src = "/images/profile-suit.jpg";
        img.onload = () => {
            add("portrait", S.portrait(N, img));
            delete this.tones.portrait;
            if (this.from === "portrait" || this.to === "portrait") { const f = this.from, t = this.to; this.from = this.to = null; this.setShapes(f, t); }
        };
    }

    colorsFor(key, out) {
        const col = this.shapes[key + ":col"];
        if (col) { out.set(col); return; }
        const tone = this.tones[key], a = this.ca, b = this.cb;
        for (let i = 0; i < this.N; i++) {
            const t = tone ? tone[i] : 0.5;
            out[i * 3] = a.r + (b.r - a.r) * t; out[i * 3 + 1] = a.g + (b.g - a.g) * t; out[i * 3 + 2] = a.b + (b.b - a.b) * t;
        }
    }

    applyPalette() {
        const p = getPalette(), light = getMode() === "light";
        this.ca = new THREE.Color(p.accent); this.cb = new THREE.Color(p.a2 || p.accent);
        if (!light) { this.ca.lerp(new THREE.Color(1, 1, 1), 0.15); this.cb.lerp(new THREE.Color(1, 1, 1), 0.1); }
        this.u.uLight.value = light ? 1 : 0;
        this.mat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
        this.mat.needsUpdate = true;
        if (this.from) { const f = this.from, t = this.to; this.from = this.to = null; this.setShapes(f, t); }
    }

    setShapes(from, to) {
        if (from === this.from && to === this.to) return;
        const g = this.points.geometry;
        if (from !== this.from) { this.buf.aFrom.set(this.shapes[from]); this.colorsFor(from, this.buf.cFrom); g.attributes.aFrom.needsUpdate = g.attributes.cFrom.needsUpdate = true; }
        if (to !== this.to) { this.buf.aTo.set(this.shapes[to]); this.colorsFor(to, this.buf.cTo); g.attributes.aTo.needsUpdate = g.attributes.cTo.needsUpdate = true; }
        this.from = from; this.to = to;
    }

    /** from/to: {shape, x, y, dim} */
    set(a, b, mix) {
        this.setShapes(a.shape, b.shape);
        this.u.uMix.value = mix;
        this.u.uOffFrom.value.set(a.x, a.y); this.u.uOffTo.value.set(b.x, b.y);
        this.u.uDimFrom.value = a.dim; this.u.uDimTo.value = b.dim;
    }

    worldAt(cx, cy) {
        const r = this.canvas.getBoundingClientRect();
        const v = new THREE.Vector3(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1, 0.5).unproject(this.camera);
        const dir = v.sub(this.camera.position).normalize();
        return this.camera.position.clone().add(dir.multiplyScalar(-this.camera.position.z / dir.z));
    }
    pointer(cx, cy) { this.mouse.copy(this.worldAt(cx, cy)); this.lastMove = this.clock.elapsedTime; }
    burst(cx, cy) { this.u.uBurstP.value.copy(this.worldAt(cx, cy)); this.u.uBurstT.value = this.clock.elapsedTime; }

    resize() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        if (!w || !h) return;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.position.z = w / h < 0.8 ? 22 : 16;
        this.camera.updateProjectionMatrix();
    }

    tick() {
        const t = this.clock.getElapsedTime();
        this.u.uTime.value = t;
        const active = t - this.lastMove < 1.2 ? 1 : 0;
        this.mouseOn += (active - this.mouseOn) * 0.06;
        this.u.uMouseOn.value = this.mouseOn;
        this.u.uSway.value = Math.sin(t * 0.25) * 0.28 + (this.mouse.x < 50 ? this.mouse.x * 0.02 : 0);
        this.renderer.render(this.scene, this.camera);
    }
    start() { if (!this.running) { this.running = true; this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() { this.stop(); this.off?.(); this.ro.disconnect(); this.points.geometry.dispose(); this.mat.dispose(); this.renderer.dispose(); }
}
