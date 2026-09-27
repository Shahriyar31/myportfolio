import * as THREE from "three";
import LAND from "../data/land.json";
import { getPalette, onPalette, getMode } from "./theme";
import { PLACES } from "./places";



const R = 1;
const toVec = (lat, lon, r = R) => {
    const p = THREE.MathUtils.degToRad(lat), l = THREE.MathUtils.degToRad(lon);
    return new THREE.Vector3(Math.cos(p) * Math.sin(l) * r, Math.sin(p) * r, Math.cos(p) * Math.cos(l) * r);
};

/** Great-circle arc lifted off the surface, as a smooth curve. */
function arcCurve(a, b, lift = 0.32, n = 96) {
    const va = toVec(a.lat, a.lon), vb = toVec(b.lat, b.lon);
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const v = new THREE.Vector3().copy(va).lerp(vb, t).normalize();
        pts.push(v.multiplyScalar(R + Math.sin(Math.PI * t) * lift + 0.004));
    }
    return new THREE.CatmullRomCurve3(pts);
}

export default class GlobeScene {
    constructor(canvas, { labels } = {}) {
        this.canvas = canvas;
        this.labels = labels; // { home: el, hamburg: el, plane: el }
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
        this.camera.position.set(0, 0, 4.4);
        this.globe = new THREE.Group();
        this.scene.add(this.globe);
        this.progress = 0;   // arc drawn 0..1
        this.focus = { lat: PLACES.home.lat, lon: PLACES.home.lon };
        this.zoom = 4.4;
        this.shift = 0.9;
        this.clock = new THREE.Clock();

        this.buildDots();
        this.buildAtmosphere();
        this.buildArc();
        this.buildMarkers();
        this.applyPalette(getPalette());
        this.off = onPalette(p => this.applyPalette(p));
        this.resize = this.resize.bind(this);
        this.tick = this.tick.bind(this);
        this.resize();
        // Track the canvas itself: layout can change its size without a window resize
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(canvas);
    }

    buildDots() {
        const n = LAND.length / 2;
        const pos = new Float32Array(n * 3);
        const rnd = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const v = toVec(LAND[i * 2], LAND[i * 2 + 1]);
            pos.set([v.x, v.y, v.z], i * 3);
            rnd[i] = Math.random();
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
        this.dotUniforms = { color: { value: new THREE.Color() }, size: { value: 3 }, time: { value: 0 } };
        this.dots = new THREE.Points(g, new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: this.dotUniforms,
            vertexShader: `
                uniform float size; uniform float time; attribute float rnd; varying float vFacing; varying float vR;
                void main(){
                    vec4 mv = modelViewMatrix * vec4(position, 1.);
                    vec3 n = normalize(normalMatrix * position);
                    vFacing = dot(n, normalize(-mv.xyz));
                    vR = rnd;
                    gl_PointSize = size * (0.6 + 0.4 * rnd) * (4.0 / -mv.z);
                    gl_Position = projectionMatrix * mv;
                }`,
            fragmentShader: `
                uniform vec3 color; uniform float time; varying float vFacing; varying float vR;
                void main(){
                    vec2 c = gl_PointCoord - .5; if (dot(c,c) > .25) discard;
                    float a = smoothstep(-0.15, 0.45, vFacing);
                    float tw = 0.75 + 0.25 * sin(time * 1.5 + vR * 40.);
                    gl_FragColor = vec4(color, a * 0.85 * tw);
                }`,
        }));
        this.globe.add(this.dots);

        // Solid inner sphere hides back-facing dots and gives the globe body
        this.coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 });
        this.globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 64, 48), this.coreMat));
    }

    buildAtmosphere() {
        this.atmoUniforms = { color: { value: new THREE.Color() } };
        const atmo = new THREE.Mesh(
            new THREE.SphereGeometry(R * 1.12, 64, 48),
            new THREE.ShaderMaterial({
                transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
                uniforms: this.atmoUniforms,
                vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
                fragmentShader: "uniform vec3 color; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(color, f * 0.9); }",
            })
        );
        this.scene.add(atmo); // not in the rotating group: the halo stays put
        this.atmo = atmo;
    }

    buildArc() {
        this.curve = arcCurve(PLACES.home, PLACES.hamburg);
        const g = new THREE.TubeGeometry(this.curve, 200, 0.009, 8, false);
        this.arcMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
        this.arc = new THREE.Mesh(g, this.arcMat);
        this.arcCount = g.index.count;
        g.setDrawRange(0, 0);
        this.globe.add(this.arc);

        // Faint full route, so you can see where it's heading
        const ghost = new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(120)), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.02, gapSize: 0.018, transparent: true, opacity: 0.35 }));
        ghost.computeLineDistances();
        this.ghostMat = ghost.material;
        this.globe.add(ghost);

        // Glowing head
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const x = c.getContext("2d");
        const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
        this.headMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        this.head = new THREE.Sprite(this.headMat);
        this.head.scale.setScalar(0.16);
        this.globe.add(this.head);
    }

    buildMarkers() {
        this.markers = {};
        this.ringMats = [];
        Object.entries(PLACES).forEach(([key, p]) => {
            const g = new THREE.Group();
            const v = toVec(p.lat, p.lon, R + 0.003);
            g.position.copy(v);
            g.lookAt(v.clone().multiplyScalar(2));
            const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            g.add(new THREE.Mesh(new THREE.CircleGeometry(0.018, 24), dotMat));
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.036, 48), ringMat);
            g.add(ring);
            this.ringMats.push(ringMat, dotMat);
            g.userData = { ring, v };
            this.globe.add(g);
            this.markers[key] = g;
        });
    }

    applyPalette(p) {
        const dark = getMode() === "dark";
        const fg = new THREE.Color(p.fg), acc = new THREE.Color(p.accent);
        this.dotUniforms.color.value.copy(fg);
        this.coreMat.color.set(p.bg).multiplyScalar(dark ? 0.75 : 0.93);
        this.coreMat.opacity = dark ? 0.7 : 0.6;
        this.atmoUniforms.color.value.copy(acc).multiplyScalar(dark ? 0.9 : 0.7);
        this.arcMat.color.copy(acc);
        this.ghostMat.color.copy(fg);
        this.headMat.color.copy(acc);
        this.ringMats.forEach(m => m.color.copy(acc));
    }

    /** progress: 0..1 of the arc; focus: {lat, lon}; zoom: camera distance */
    set(progress, focus, zoom) {
        this.progress = progress;
        this.targetFocus = focus;
        this.targetZoom = zoom;
    }

    resize() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        if (!w || !h) return;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.narrow = w / h < 1;
        this.shift = this.narrow ? 0 : 0.78;
        this.lift = this.narrow ? 1.05 : 0;
    }

    project(v, el) {
        if (!el) return;
        const world = v.clone().applyMatrix4(this.globe.matrixWorld);
        const normal = world.clone().sub(this.globe.position).normalize();
        const toCam = this.camera.position.clone().sub(world).normalize();
        const front = normal.dot(toCam) > 0.1;
        const s = world.project(this.camera);
        const w = this.canvas.clientWidth;
        const x = Math.min((s.x * 0.5 + 0.5) * w, w - (el.offsetWidth || 140) - 20), y = (-s.y * 0.5 + 0.5) * this.canvas.clientHeight;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.style.opacity = front ? 1 : 0;
    }

    tick() {
        const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
        this.dotUniforms.time.value = t;

        // Ease focus & zoom toward targets
        const f = this.targetFocus || this.focus;
        this.focus.lat += (f.lat - this.focus.lat) * Math.min(1, dt * 3);
        this.focus.lon += (f.lon - this.focus.lon) * Math.min(1, dt * 3);
        this.zoom += ((this.targetZoom || 4.4) - this.zoom) * Math.min(1, dt * 2.5);

        // Rotate so the focus point faces the camera (slight idle drift)
        const lat = THREE.MathUtils.degToRad(this.focus.lat + 8), lon = THREE.MathUtils.degToRad(this.focus.lon + Math.sin(t * 0.2) * 2);
        this.globe.rotation.set(lat, -lon, 0, "XYZ");
        this.globe.position.set(this.shift, this.lift, 0);
        this.atmo.position.copy(this.globe.position);
        this.camera.position.set(0, 0, this.zoom * (this.narrow ? 1.9 : 1));
        this.camera.lookAt(0, 0, 0);

        // Draw the route up to `progress`
        const p = Math.min(1, Math.max(0, this.progress));
        this.arc.geometry.setDrawRange(0, Math.floor(this.arcCount * p / 6) * 6);
        const headPos = this.curve.getPointAt(Math.max(0.001, p));
        this.head.position.copy(headPos);
        this.head.visible = p > 0.002 && p < 0.999;
        this.head.scale.setScalar(0.14 + Math.sin(t * 6) * 0.02);

        Object.values(this.markers).forEach((m, i) => {
            const k = (t * 0.6 + i * 0.5) % 1;
            m.userData.ring.scale.setScalar(1 + k * 2.6);
            m.userData.ring.material.opacity = 1 - k;
        });

        this.globe.updateMatrixWorld();
        if (this.labels) {
            this.project(this.markers.home.userData.v, this.labels.home);
            this.project(this.markers.hamburg.userData.v, this.labels.hamburg);
            this.project(headPos, this.labels.plane);
            if (this.labels.plane) this.labels.plane.style.opacity = this.head.visible ? 1 : 0;
        }
        this.renderer.render(this.scene, this.camera);
    }

    start() { if (!this.running) { this.running = true; this.clock.getDelta(); this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() {
        this.stop(); this.off?.();
        this.ro?.disconnect();
        this.scene.traverse(o => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach(m => { m.map?.dispose(); m.dispose(); }); });
        this.renderer.dispose();
    }
}
