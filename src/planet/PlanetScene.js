import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import fontData from "three/examples/fonts/helvetiker_bold.typeface.json";
import { PLACES, SKIES, ORBS, R } from "./world";

/*
 * Farhan's tiny planet. A small round world; a little 3D me walks along one path
 * around it. The page turns the planet (so only one place is in view at a time),
 * changes the sky per chapter, and asks for moments: an attack at the gate,
 * the flight to Hamburg, sitting at my desk, collecting skill orbs, neural vision.
 */

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const rnd = (s => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646)(21);
const D2R = Math.PI / 180;

/** direction on the planet: theta = degrees along the path (0 = top), back = degrees towards the far side */
export function dirAt(theta, back = 0) { const t = theta * D2R, b = back * D2R; return V(Math.sin(t) * Math.cos(b), Math.cos(t) * Math.cos(b), -Math.sin(b)); }

const SKY_VS = `varying vec3 vP; void main() { vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const SKY_FS = `uniform vec3 uTop, uBottom; varying vec3 vP;
void main() { float h = clamp(vP.y * .5 + .5, 0., 1.); vec3 c = mix(uBottom, uTop, smoothstep(.28, .85, h)); gl_FragColor = vec4(c, 1.); }`;
const PTS_VS = `attribute float seed; uniform float uT, uPR, uSize; varying float vS;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; vS = seed;
  gl_PointSize = uSize * uPR * (.7 + .6 * sin(uT * 2. + seed * 40.)) * (14. / -mv.z); }`;
const PTS_FS = `uniform float uOp; varying float vS; void main() { float d = length(gl_PointCoord - .5); if (d > .5) discard;
  vec3 c = mix(vec3(.37, .82, 1.), vec3(.66, .55, 1.), vS); gl_FragColor = vec4(c * 1.4, pow(smoothstep(.5, 0., d), 1.6) * uOp); }`;

export default class PlanetScene {
    constructor(canvas, { mobile = false } = {}) {
        this.canvas = canvas; this.mobile = mobile;
        const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
        this.pr = Math.min(devicePixelRatio, mobile ? 1.5 : 1.75); r.setPixelRatio(this.pr);
        r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
        r.shadowMap.enabled = !mobile; r.shadowMap.type = THREE.PCFSoftShadowMap;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);
        this.planet = new THREE.Group(); this.scene.add(this.planet);
        this.angle = 0; this.goalAngle = 0; this.clock = new THREE.Clock(); this.pointer = new THREE.Vector2(); this.smooth = new THREE.Vector2();
        this.anim = []; this.spin = []; this.clickables = []; this.orbs = []; this.flowers = 0; this.neural = 0; this.goalNeural = 0;
        this.mode = "walk"; this.flight = -1; this.dir = 1;
        this.M = this.materials();
        this.sky(); this.lights(); this.globe(); this.path(); this.places(); this.plane(); this.clouds(); this.makeOrbs();
        this.skyState = { ...SKIES[0] }; this.applySky(SKIES[0], 1);
        this.loadModels();
        this.ray = new THREE.Raycaster(); this.tick = this.tick.bind(this); this.resize = this.resize.bind(this);
        this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas); this.resize();
        this.frames = [];
    }

    materials() {
        const m = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...o });
        return {
            grass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }),
            path: m(0xe7d3a8), white: m(0xf3efe8), cream: m(0xe9dcc4), steel: m(0x8a9bb0, { metalness: 0.2, roughness: 0.5 }), dark: m(0x2a3240),
            brick: m(0xa45e4d), red: m(0xbf616a), gold: m(0xd8b779), wood: m(0x8a5a3b),
            accent: m(0x88c0d0, { emissive: 0x5e81ac, emissiveIntensity: 0.6 }), accent2: m(0xb48ead, { emissive: 0x7d6a8c, emissiveIntensity: 0.7 }),
            glass: new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.3 }),
            window: new THREE.MeshStandardMaterial({ color: 0xf0e2c8, emissive: 0xd8b779, emissiveIntensity: 1.2 }),
            water: new THREE.MeshStandardMaterial({ color: 0x5e81ac, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92, flatShading: true }),
            cloud: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, transparent: true, opacity: 0.95 }),
        };
    }
    mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = !this.mobile; o.receiveShadow = true; parent.add(o); return o; }
    box(w, h, d, mat, parent, x, y, z, r = 0.06) { return this.mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat, parent, x, y + h / 2, z); }
    cyl(rt, rb, h, mat, parent, x, y, z, s = 16) { return this.mesh(new THREE.CylinderGeometry(rt, rb, h, s), mat, parent, x, y + h / 2, z); }
    /** a group standing on the planet at (theta, back), upright */
    spot(theta, back = 0, lift = 0) { const g = new THREE.Group(), d = dirAt(theta, back); g.position.copy(d).multiplyScalar(R + lift); g.quaternion.setFromEuler(new THREE.Euler(-back * D2R, 0, -theta * D2R, "ZYX")); this.planet.add(g); return g; }

    /* ── sky, light, planet ── */
    sky() {
        this.skyU = { uTop: { value: new THREE.Color() }, uBottom: { value: new THREE.Color() } };
        this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: this.skyU, vertexShader: SKY_VS, fragmentShader: SKY_FS })));
        const n = this.mobile ? 500 : 1100, p = new Float32Array(n * 3), s = new Float32Array(n);
        for (let i = 0; i < n; i++) { const d = V(rnd() - 0.5, rnd() * 0.9 + 0.1, rnd() - 0.5).normalize().multiplyScalar(150); p.set([d.x, d.y, d.z], i * 3); s[i] = rnd(); }
        const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("seed", new THREE.BufferAttribute(s, 1));
        this.starU = { uT: { value: 0 }, uPR: { value: this.pr }, uSize: { value: 9 }, uOp: { value: 0 } };
        this.stars = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: this.starU, vertexShader: PTS_VS, fragmentShader: PTS_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        this.scene.add(this.stars);
    }
    lights() {
        this.hemi = new THREE.HemisphereLight(0xdfe9ff, 0x3a4a2a, 0.9); this.scene.add(this.hemi);
        const s = this.sun = new THREE.DirectionalLight(0xffffff, 2.2); s.position.set(8, R + 14, 12);
        s.castShadow = !this.mobile; s.shadow.mapSize.set(2048, 2048); const c = s.shadow.camera; c.left = c.bottom = -12; c.right = c.top = 12; c.near = 1; c.far = 60; s.shadow.bias = -0.0008;
        s.target.position.set(0, R, 0); this.scene.add(s, s.target);
        this.fill = new THREE.PointLight(0xd8b9a0, 0, 30); this.fill.position.set(-4, R + 3, 5); this.scene.add(this.fill);
    }
    globe() {
        const geo = new THREE.IcosahedronGeometry(R, this.mobile ? 24 : 36), pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color(), v = V(0, 0, 0);
        const g1 = new THREE.Color(0x789c68), g2 = new THREE.Color(0x8fae7a), sand = new THREE.Color(0xe7d3a8), sea = new THREE.Color(0x5e81ac);
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).normalize();
            const theta = ((Math.atan2(v.x, v.y) / D2R) + 360) % 360, ocean = PLACES.oceanFrom < theta && theta < PLACES.oceanTo && Math.abs(v.z) < 0.95;
            const n = Math.sin(v.x * 9) * Math.cos(v.z * 7) * Math.sin(v.y * 5), onPath = Math.abs(v.z) < 0.09;
            const bump = ocean ? -0.35 : onPath ? 0 : Math.max(0, n) * 0.55 * Math.min(1, (Math.abs(v.z) - 0.09) * 8);
            v.multiplyScalar(R + bump); pos.setXYZ(i, v.x, v.y, v.z);
            c.copy(ocean ? sea : bump > 0.25 ? g1 : g2).lerp(sand, ocean ? 0 : Math.max(0, 0.25 - Math.abs(v.z / R)) * 0.6); col.set([c.r, c.g, c.b], i * 3);
        }
        geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
        this.ground = this.mesh(geo, this.M.grass, this.planet); this.ground.castShadow = false;
        this.clickables.push(this.ground);
        const water = this.mesh(new THREE.SphereGeometry(R - 0.12, 48, 32), this.M.water, this.planet); water.castShadow = false;
    }
    /** stepping stones along the path, except over the ocean */
    path() {
        const n = this.mobile ? 180 : 300, stone = new RoundedBoxGeometry(0.62, 0.08, 0.95, 1, 0.03), inst = new THREE.InstancedMesh(stone, this.M.path, n), d = new THREE.Object3D();
        let k = 0;
        for (let i = 0; i < n; i++) {
            const th = (i / n) * 360; if (th > PLACES.oceanFrom - 2 && th < PLACES.oceanTo + 2) continue;
            const dir = dirAt(th + (rnd() - 0.5) * 0.3); d.position.copy(dir).multiplyScalar(R + 0.02); d.quaternion.setFromUnitVectors(UP, dir); d.rotateY((rnd() - 0.5) * 0.25); d.updateMatrix(); inst.setMatrixAt(k++, d.matrix);
        }
        inst.count = k; inst.receiveShadow = true; this.planet.add(inst);
    }

    /* ── the places ── */
    places() {
        const M = this.M, P = PLACES;
        // hero: a signpost with my name, a bench, lamps
        { this.nameLetters("FARHAN", P.home.theta, 5.5); }
        // what I do: the AI tower
        { const g = this.tower = this.spot(P.what.theta, 9);
            this.cyl(1.1, 1.5, 0.5, M.white, g, 0, 0, 0, 24); this.cyl(0.5, 0.8, 5.2, M.steel, g, 0, 0.5, 0, 24);
            for (let i = 0; i < 5; i++) this.cyl(0.62 + (4 - i) * 0.05, 0.62 + (4 - i) * 0.05, 0.1, M.accent, g, 0, 1.1 + i * 0.95, 0, 24);
            this.coreMat = new THREE.MeshStandardMaterial({ color: 0xb48ead, emissive: 0x7d6a8c, emissiveIntensity: 1.1, flatShading: true });
            this.core = this.mesh(new THREE.IcosahedronGeometry(0.85, 1), this.coreMat, g, 0, 6.8, 0);
            this.coreRings = [0, 1].map(i => { const t = this.mesh(new THREE.TorusGeometry(1.35 + i * 0.35, 0.04, 8, 64), M.accent, g, 0, 6.8, 0); t.rotation.x = 1.1 + i * 0.5; return t; }); }
        // break my AI: the governance gate
        { const g = this.gate = this.spot(P.break.theta, 5);
            this.box(0.6, 3, 0.6, M.white, g, -1.5, 0, 0, 0.12); this.box(0.6, 3, 0.6, M.white, g, 1.5, 0, 0, 0.12);
            const arch = this.mesh(new THREE.TorusGeometry(1.5, 0.3, 12, 24, Math.PI), M.white, g, 0, 3, 0);
            const sh = new THREE.Shape(); sh.moveTo(0, -0.6); sh.quadraticCurveTo(0.55, -0.3, 0.5, 0.35); sh.lineTo(0, 0.5); sh.lineTo(-0.5, 0.35); sh.quadraticCurveTo(-0.55, -0.3, 0, -0.6);
            this.shield = this.mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }), M.accent, g, 0, 3.9, -0.07);
            this.beamMat = new THREE.MeshBasicMaterial({ color: 0x88c0d0, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
            this.beam = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.9), this.beamMat); this.beam.position.set(0, 1.45, 0); g.add(this.beam); arch.castShadow = true; }
        // experience: Nordex tower with turbines around it (placeholder until the model loads)
        { const g = this.hq = this.spot(P.experience.theta, 11);
            this.hqStand = this.box(2.6, 8.4, 2.6, M.glass, g, 0, 0, 0, 0.1);
            this.floors = [0, 1, 2, 3].map(i => { const f = this.box(2.72, 0.5, 2.72, new THREE.MeshStandardMaterial({ color: 0x1d2740, emissive: 0x88c0d0, emissiveIntensity: 0.1, transparent: true, opacity: 0.7 }), g, 0, 1.2 + i * 1.8, 0, 0.04); f.castShadow = false; return f; });
            [[-5, 12], [4.5, 14], [8, 6]].forEach(([dt, back], i) => this.turbine(this.spot(P.experience.theta + dt, back), 3.8 + i * 0.5)); }
        // projects: one object per project, spread along the path
        { const T = P.projects.items;
            const argus = this.spot(T[0].theta, 6); this.cyl(1.4, 1.5, 0.35, M.white, argus, 0, 0, 0, 32); this.mesh(new THREE.SphereGeometry(1.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.glass, argus, 0, 0.35, 0); this.mesh(new THREE.SphereGeometry(0.4, 16, 12), M.accent, argus, 0, 0.8, 0);
            const twin = this.spot(T[1].theta, 6); this.box(0.9, 2.4, 0.9, M.cream, twin, -0.6, 0, 0); const w = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 0.9), new THREE.MeshBasicMaterial({ color: 0x88c0d0, wireframe: true })); w.position.set(0.6, 1.2, 0); twin.add(w); this.anim.push(t => { w.rotation.y = Math.sin(t) * 0.3; });
            const radar = this.spot(T[2].theta, 6); this.cyl(0.15, 0.25, 2.4, M.steel, radar, 0, 0, 0, 10); const dish = new THREE.Group(); dish.position.y = 2.55; radar.add(dish); const dm = this.mesh(new THREE.SphereGeometry(0.9, 20, 10, 0, Math.PI * 2, 0, Math.PI / 3), M.white, dish); dm.rotation.x = Math.PI / 2 + 0.5; this.spin.push({ o: dish, speed: 0.9 });
            const stock = this.spot(T[3].theta, 6); const bars = [0, 1, 2, 3, 4].map(i => this.box(0.3, 1, 0.3, i % 2 ? M.accent : M.accent2, stock, i * 0.42 - 0.84, 0, 0, 0.05)); this.anim.push(t => bars.forEach((b, i) => { const h = 0.5 + Math.abs(Math.sin(t * 1.3 + i * 0.9)) * 1.7; b.scale.y = h; b.position.y = h / 2; }));
            const barn = this.spot(T[4].theta, 6); this.box(1.8, 1.1, 1.3, M.brick, barn, 0, 0, 0); const tri = new THREE.Shape(); tri.moveTo(-1, 0); tri.lineTo(1, 0); tri.lineTo(0, 0.75); tri.closePath(); this.mesh(new THREE.ExtrudeGeometry(tri, { depth: 1.4, bevelEnabled: false }), M.white, barn, 0, 1.1, -0.7);
            this.libSpot = this.spot(T[5].theta, 6); this.box(1.8, 1.4, 1.2, M.cream, this.libSpot, 0, 0, 0);
            this.projectSpots = T.map(p => p.theta); this.projOn = -1; this.projCol = new THREE.Color(0x88c0d0);
            this.beacons = T.map(p => { const g = this.spot(p.theta, 6);
                const ring = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.8, 56), new THREE.MeshBasicMaterial({ color: 0x88c0d0, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.07; g.add(ring);
                const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 7, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0x88c0d0, alphaMap: this.fadeTex(), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); beam.position.y = 3.5; g.add(beam);
                return { ring, beam, k: 0 }; });
            this.coder(); }
        // journey: my college in Cooch Behar, home (getting ready), the runway; ocean; TUHH in Hamburg
        { const J = P.journey;
            this.cgec(this.spot(J.cgec, 7.5));
            const home = this.homeSpot = this.spot(J.home, 8); this.box(1.8, 1.3, 1.6, M.cream, home, 0, 0, 0); const roof = this.mesh(new THREE.ConeGeometry(1.5, 0.9, 4), M.red, home, 0, 1.75, 0); roof.rotation.y = Math.PI / 4;
            this.palmSpots = [[J.cgec - 6, 13], [J.cgec + 5, 13], [J.home + 5, 13], [J.cgec - 11, 5], [J.home - 3, 12]];
            const run = this.spot(J.runway, 0, 0.01); const strip = this.mesh(new THREE.BoxGeometry(3.4, 0.04, 1.4), M.dark, run); strip.receiveShadow = true;
            for (let i = 0; i < 5; i++) this.box(0.4, 0.01, 0.08, M.white, run, -1.4 + i * 0.7, 0.04, 0, 0.005);
            const uni = this.uni = this.spot(P.tuhh.theta, 8); this.tuhh(uni);
            this.rain = this.makeRain();
            this.lab(this.spot(P.lab.theta, 6));
            this.bags(); }
        // skills: a garden of five pedestals
        { const g = this.garden = this.spot(P.skills.theta, 6); this.pedMat = M.white.clone(); this.pedMat.emissive = new THREE.Color(0); this.roleCol = new THREE.Color(0x88c0d0); this.roleK = 0;
            this.roleBeams = [];
            this.pedestals = ORBS.map((o, i) => { const a = (i - 2) * 0.95, x = Math.sin(a) * 2.6, z = -Math.cos(a) * 0.9 + 0.9; this.cyl(0.32, 0.4, 0.7, this.pedMat, g, x, 0, z, 12);
                const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x88c0d0, alphaMap: this.fadeTex(), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); b.position.set(x, 2.7, z); g.add(b); this.roleBeams.push(b);
                return V(x, 1.35, z); }); }
        // photography: a camera on a tripod and fireflies
        { const g = this.spot(P.lens.theta, 5); [[-0.35, 0.3], [0.35, 0.3], [0, -0.4]].forEach(([x, z]) => { const l = this.cyl(0.03, 0.03, 1.5, M.dark, g, x * 0.6, 0, z * 0.6, 6); l.rotation.set(z * 0.35, 0, -x * 0.35); });
            this.box(0.7, 0.45, 0.4, M.dark, g, 0, 1.45, 0, 0.06); this.cyl(0.16, 0.18, 0.35, M.dark, g, 0, 1.55, 0.3).rotation.x = Math.PI / 2;
            this.fireflies = this.makeFireflies(P.lens.theta); }
        // contact: my desk (placeholder until furniture loads) and a mailbox
        { this.deskSpot = this.spot(P.contact.theta, 3.2); this.box(1.8, 0.08, 0.9, M.wood, this.deskSpot, 0, 0.75, 0); this.screenMat = new THREE.MeshStandardMaterial({ color: 0x0b1320, emissive: 0x88c0d0, emissiveIntensity: 0.9 });
            const mail = this.spot(P.contact.theta - 7, 5); this.cyl(0.06, 0.06, 1.1, M.dark, mail, 0, 0, 0, 6); this.mailBox = this.box(0.7, 0.5, 0.45, M.red, mail, 0, 1.1, 0, 0.12);
            this.envelope = this.box(0.5, 0.02, 0.34, M.white, mail, 0, 1.64, 0, 0.01); this.envelope.visible = false; }
        this.scatter();
    }
    /** a vertical fade (bright at the bottom) for light beams */
    fadeTex() { if (this._fade) return this._fade; const c = document.createElement("canvas"); c.width = 4; c.height = 128; const x = c.getContext("2d"), gr = x.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, "#fff"); gr.addColorStop(1, "#000"); x.fillStyle = gr; x.fillRect(0, 0, 4, 128); return (this._fade = new THREE.CanvasTexture(c)); }
    /** the project park: I sit on a stool and code on a laptop; code floats up from the screen */
    coder() {
        const M = this.M, g = this.rig = new THREE.Group(); g.position.set(0, R + 0.06, 0.15); g.scale.setScalar(0.001); g.visible = false; this.scene.add(g); this.rigK = 0;
        this.box(0.42, 0.34, 0.38, M.wood, g, 0, 0, -0.04, 0.05);
        const table = new THREE.Group(); table.position.set(0, 0, 0.66); g.add(table); this.box(0.7, 0.52, 0.46, M.white, table, 0, 0, 0, 0.05);
        const cv = this.codeCanvas = document.createElement("canvas"); cv.width = 256; cv.height = 168; this.codeTex = new THREE.CanvasTexture(cv); this.codeTex.colorSpace = THREE.SRGBColorSpace; this.codeLines = []; this.codeT = 0;
        this.lapScreen = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: this.codeTex, emissiveIntensity: 1.3 });
        const lap = new THREE.Group(); lap.position.set(0, 0.52, 0); table.add(lap);
        this.box(0.5, 0.03, 0.34, M.dark, lap, 0, 0, 0, 0.01);
        const lid = new THREE.Group(); lid.position.set(0, 0.03, 0.16); lid.rotation.x = 0.22; lap.add(lid);
        this.mesh(new THREE.BoxGeometry(0.5, 0.34, 0.02), [M.dark, M.dark, M.dark, M.dark, M.dark, this.lapScreen], lid, 0, 0.17, 0);
        this.lapGlow = new THREE.PointLight(0x88c0d0, 0, 2.5); this.lapGlow.position.set(0, 0.35, -0.1); lap.add(this.lapGlow);
        const glyph = t => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); x.font = "700 64px 'JetBrains Mono', monospace"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#fff"; x.shadowColor = "#fff"; x.shadowBlur = 12; x.fillText(t, 64, 64); const tx = new THREE.CanvasTexture(c); return tx; };
        this.glyphs = ["</>", "{ }", "AI", "fn", "01", "λ", "RAG", "=>"].map((t, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyph(t), color: 0x88c0d0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.34); s.userData.o = i / 8; g.add(s); return s; });
    }
    drawCode(col) {
        const x = this.codeCanvas.getContext("2d"), L = this.codeLines;
        if (L.length > 9) L.shift();
        L.push({ ind: [0, 1, 1, 2, 1, 0][Math.floor(Math.random() * 6)], parts: Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => [8 + Math.random() * 46, Math.random()]) });
        x.fillStyle = "#0a1220"; x.fillRect(0, 0, 256, 168); x.fillStyle = "#16233a"; x.fillRect(0, 0, 256, 14);
        ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(9 + i * 10, 7, 3, 0, 7); x.fill(); });
        L.forEach((l, r) => { let cx = 14 + l.ind * 14; x.fillStyle = "#3a4a66"; x.fillRect(3, 20 + r * 15, 6, 6); l.parts.forEach(([w, c]) => { x.fillStyle = c < 0.35 ? col : c < 0.6 ? "#b48ead" : c < 0.8 ? "#e6edf5" : "#ebcb8b"; x.fillRect(cx, 20 + r * 15, w, 7); cx += w + 6; }); });
        if (Math.floor(performance.now() / 400) % 2) { const last = L[L.length - 1]; x.fillStyle = "#fff"; x.fillRect(14 + last.ind * 14 + last.parts.reduce((a, p) => a + p[0] + 6, 0), 19 + (L.length - 1) * 15, 3, 9); }
        this.codeTex.needsUpdate = true;
    }
    /** my name as big 3D letters standing on the planet; click one and it flips */
    nameLetters(word, theta, back) {
        const font = new FontLoader().parse(fontData), cols = [0xf4efe6, 0xf4efe6, 0xf4efe6, 0x88c0d0, 0xb48ead, 0x88c0d0];
        this.letters = [...word].map((ch, i) => {
            const geo = new TextGeometry(ch, { font, size: 1.05, depth: 0.32, curveSegments: 5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 2 });
            geo.computeBoundingBox(); const b = geo.boundingBox; geo.translate(-(b.max.x + b.min.x) / 2, 0, -0.16);
            const mat = new THREE.MeshStandardMaterial({ color: cols[i], roughness: 0.55, metalness: 0.05, emissive: cols[i], emissiveIntensity: i > 2 ? 0.25 : 0.04 });
            const half = (word.length - 1) / 2, g = this.spot(theta + (i - half) * 5.4 + Math.sign(i - half) * 3.2, back), holder = new THREE.Group(); g.add(holder);
            const m = new THREE.Mesh(geo, mat); m.castShadow = !this.mobile; m.receiveShadow = true; holder.add(m); m.userData.letter = i; this.clickables.push(m);
            holder.rotation.y = (i - (word.length - 1) / 2) * -0.06;
            return { holder, m, t0: -10, drop: null, hov: 0 };
        });
    }
    /** the intro: my name falls from the sky, letter by letter, and bounces into place */
    dropLetters() { if (this.dropped) return; this.dropped = true; const t = this.clock.elapsedTime; (this.letters || []).forEach((L, i) => { L.drop = t + 0.15 + i * 0.13; }); }
    kick(i) { const L = this.letters?.[i]; if (!L || this.clock.elapsedTime - L.t0 < 1.2) return; L.t0 = this.clock.elapsedTime; L.dir = Math.random() > 0.5 ? 1 : -1; }
    /** where the camera looks: dy lifts the world, fx slides it, zoom leans in, focus flies to a point */
    setView(v = {}) { this.viewGoal = { dy: 0, fx: 0, zoom: 0, focus: null, ...v }; }
    focusPoint(f) { if (!f) return null; if (f.floorF !== undefined && this.floors) { const a = Math.floor(f.floorF), b = Math.min(3, a + 1), t = f.floorF - a, e = t * t * (3 - 2 * t); return this.floors[a].getWorldPosition(V(0, 0, 0)).lerp(this.floors[b].getWorldPosition(V(0, 0, 0)), e); } if (f.floor !== undefined) return this.floors?.[f.floor]?.getWorldPosition(V(0, 0, 0)); if (f.what === "lab") return this.labHolo?.getWorldPosition(V(0, 0, 0)); return null; }
    /** a flat sign with text (canvas texture) */
    sign(lines, w, h, { bg = "#f7f1e6", fg = "#1a2230", band, font = "'Clash Display', Arial Black, sans-serif" } = {}) {
        const cv = document.createElement("canvas"), W = 1024, H = Math.round(1024 * h / w); cv.width = W; cv.height = H; const x = cv.getContext("2d");
        x.fillStyle = bg; x.fillRect(0, 0, W, H); if (band) { x.fillStyle = band; x.fillRect(0, H - H * 0.14, W, H * 0.14); }
        x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle";
        lines.forEach(([t, size, y, weight = 700]) => { x.font = `${weight} ${size}px ${font}`; x.fillText(t, W / 2, H * y, W * 0.94); });
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
        return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
    }
    /** Cooch Behar Government Engineering College, as I remember it: a long cream block with red bands, a tall entrance */
    cgec(g) {
        const m = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true }), wall = m(0xf1e8d6), band = m(0xb5523b), glass = m(0x5d8fb8);
        this.box(6.4, 0.2, 2, this.M.path, g, 0, 0, 0.1, 0.04);
        this.box(5.6, 2.5, 1.3, wall, g, 0, 0.2, -0.2, 0.05);
        for (let f = 0; f < 3; f++) { this.box(5.68, 0.1, 1.38, band, g, 0, 0.2 + 0.78 * (f + 1) - 0.05, -0.2, 0.02);
            for (let i = 0; i < 10; i++) { if (i === 4 || i === 5) continue; this.box(0.34, 0.36, 0.04, glass, g, -2.45 + i * 0.545, 0.42 + f * 0.78, 0.46, 0.02); } }
        this.box(1.5, 3.3, 1.7, band, g, 0, 0.2, 0, 0.06); this.box(1.8, 0.12, 0.8, wall, g, 0, 1.25, 0.9, 0.03);
        this.cyl(0.07, 0.07, 1.05, wall, g, -0.75, 0.2, 1.22, 8); this.cyl(0.07, 0.07, 1.05, wall, g, 0.75, 0.2, 1.22, 8);
        this.box(0.7, 0.9, 0.04, glass, g, 0, 0.2, 0.86, 0.02);
        const s = this.sign([["COOCH BEHAR GOVT.", 150, 0.36], ["ENGINEERING COLLEGE", 132, 0.72]], 1.7, 0.5, { bg: "#f7f1e6", fg: "#7a2a1c" }); s.position.set(0, 2.3, 0.87); g.add(s);
    }
    /** TUHH, Hamburg: red-brick main building, white windows, dark roof, and the modern turquoise wing */
    tuhh(g) {
        const m = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true }), brick = m(0x9c3b2b), frame = m(0xf4f1ea), roofM = m(0x4a4f58), glass = m(0x7fb8d8), tq = m(0x00c1d4);
        this.box(6.2, 0.18, 2.2, this.M.path, g, 0, 0, 0.1, 0.04);
        this.box(4.4, 2.5, 1.5, brick, g, -0.7, 0.18, -0.2, 0.04);
        for (let f = 0; f < 3; f++) for (let i = 0; i < 8; i++) { this.box(0.34, 0.46, 0.05, frame, g, -2.55 + i * 0.53, 0.34 + f * 0.78, 0.56, 0.02); this.box(0.26, 0.38, 0.06, glass, g, -2.55 + i * 0.53, 0.38 + f * 0.78, 0.57, 0.02); }
        const tri = new THREE.Shape(); tri.moveTo(-0.85, 0); tri.lineTo(0.85, 0); tri.lineTo(0, 1.05); tri.closePath();
        const roof = this.mesh(new THREE.ExtrudeGeometry(tri, { depth: 4.5, bevelEnabled: false }), roofM, g, 1.55, 2.68, -0.2); roof.rotation.y = -Math.PI / 2;
        for (let i = 0; i < 3; i++) this.box(0.35, 0.35, 0.3, roofM, g, -2.1 + i * 1.4, 2.95, 0.35, 0.03);
        // modern wing
        this.box(1.7, 3.2, 1.6, glass, g, 2.35, 0.18, -0.1, 0.04); this.box(1.8, 0.35, 1.7, tq, g, 2.35, 3.38, -0.1, 0.04);
        for (let f = 0; f < 4; f++) this.box(1.74, 0.05, 1.64, frame, g, 2.35, 0.18 + 0.8 * (f + 1), -0.1, 0.01);
        const s = this.sign([["TUHH", 330, 0.5, 800]], 1.4, 0.36, { bg: "#00c1d4", fg: "#ffffff" }); s.position.set(2.35, 3.555, 0.76); g.add(s);
        const s2 = this.sign([["HAMBURG UNIVERSITY", 120, 0.36], ["OF TECHNOLOGY", 120, 0.72]], 1.9, 0.44, { bg: "#f4f1ea", fg: "#1c2a36" }); s2.position.set(-0.7, 0.22 + 0.22, 1.25); g.add(s2);
        this.box(0.08, 0.5, 0.08, this.M.dark, g, -1.6, 0.18, 1.25, 0.01); this.box(0.08, 0.5, 0.08, this.M.dark, g, 0.2, 0.18, 1.25, 0.01); s2.position.y = 0.85;
    }
    /** my research lab next to Nordex: a digital twin turning above it */
    lab(g) {
        this.box(2, 1.2, 1.4, this.M.white, g, 0, 0, 0, 0.1); this.box(2.1, 0.12, 1.5, this.M.accent, g, 0, 1.2, 0, 0.04);
        const s = this.sign([["TUHH RESEARCH", 120, 0.5]], 1.6, 0.26, { bg: "#00c1d4", fg: "#fff" }); s.position.set(0, 0.8, 0.71); g.add(s);
        const holo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshBasicMaterial({ color: 0x00c1d4, wireframe: true, transparent: true, opacity: 0.8 })); holo.position.y = 2.3; g.add(holo);
        const dots = new THREE.Points(new THREE.IcosahedronGeometry(0.7, 1), new THREE.PointsMaterial({ color: 0xffffff, size: 0.07 })); holo.add(dots);
        this.anim.push(t => { holo.rotation.y = t * 0.6; holo.rotation.x = Math.sin(t * 0.5) * 0.3; holo.position.y = 2.3 + Math.sin(t * 1.4) * 0.1; });
        this.labHolo = holo;
    }
    /** getting ready for Germany: a suitcase and a stack of papers appear next to me */
    bags() {
        const g = this.bag = new THREE.Group(); g.position.set(-0.62, R + 0.06, 0.3); g.scale.setScalar(0.001); g.visible = false; this.scene.add(g); this.bagK = 0;
        const blue = new THREE.MeshStandardMaterial({ color: 0x2b6cb0, roughness: 0.6, flatShading: true });
        this.box(0.46, 0.6, 0.22, blue, g, 0, 0.05, 0, 0.06); this.box(0.2, 0.05, 0.05, this.M.dark, g, 0, 0.66, 0, 0.02); this.box(0.04, 0.28, 0.04, this.M.dark, g, -0.08, 0.66, 0, 0.01); this.box(0.04, 0.28, 0.04, this.M.dark, g, 0.08, 0.66, 0, 0.01);
        [[-0.12, 0], [0.12, 0]].forEach(([x]) => this.cyl(0.04, 0.04, 0.05, this.M.dark, g, x, 0, 0.06, 8));
        const papers = new THREE.Group(); papers.position.set(0.5, 0, 0.1); g.add(papers);
        for (let i = 0; i < 4; i++) { const p = this.box(0.34, 0.02, 0.44, i === 3 ? new THREE.MeshStandardMaterial({ color: 0x7a1f2b }) : this.M.white, papers, 0, i * 0.025, 0, 0.005); p.rotation.y = (i - 1.5) * 0.12; }
    }
    setPrep(v) { this.prep = v; }
    /** where a floor of the Nordex tower (or the AI core) is on screen, for cards popping out of it */
    screenOf(what, i = 0) {
        let w;
        if (what === "me") { if (!this.me || !this.me.visible) return null; w = this.me.getWorldPosition(V(0, 0, 0)).add(V(0, this.sitting || this.base === "sit" ? 1.25 : 1.55, 0)); }
        else if (what === "plane") { if (!this.planeG) return null; w = this.planeG.getWorldPosition(V(0, 0, 0)).add(V(0, 0.7, 0)); }
        else if (what === "tower") { w = this.tower.localToWorld(V(Math.cos(i) * 6.4, 3.3 + Math.sin(i * 2) * 0.2, Math.sin(i) * 2.4)); }
        else { const o = what === "floor" ? this.floors?.[i] : what === "core" ? this.core : what === "lab" ? this.labHolo : what === "mail" ? this.mailBox : null; if (!o) return null; w = o.getWorldPosition(V(0, 0, 0)); }
        const cam = w.clone().applyMatrix4(this.camera.matrixWorldInverse), v = w.project(this.camera), r = this.canvas.getBoundingClientRect();
        if (what === "tower") return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, depth: -cam.z };
        return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
    }
    signpost(g, title, sub) {
        const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 360; const x = cv.getContext("2d");
        x.fillStyle = "#f7f1e6"; x.beginPath(); x.roundRect(8, 8, 1008, 344, 40); x.fill(); x.fillStyle = "#88c0d0"; x.fillRect(8, 300, 1008, 52);
        x.fillStyle = "#1a2230"; x.font = "700 124px 'Clash Display', Arial Black, sans-serif"; x.textAlign = "center"; x.fillText(title.split(" ")[0], 512, 150); x.font = "700 92px 'Clash Display', Arial Black, sans-serif"; x.fillText(title.split(" ").slice(1).join(" "), 512, 250);
        x.font = "600 34px 'General Sans', Arial, sans-serif"; x.fillStyle = "#06121c"; x.fillText(sub.toUpperCase(), 512, 338);
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
        this.cyl(0.08, 0.1, 2.2, this.M.wood, g, -1.3, 0, 0, 8); this.cyl(0.08, 0.1, 2.2, this.M.wood, g, 1.3, 0, 0, 8);
        const board = this.mesh(new THREE.BoxGeometry(3, 1.05, 0.12), [this.M.wood, this.M.wood, this.M.wood, this.M.wood, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), this.M.wood], g, 0, 2.05, 0);
        this.signBoard = board;
    }
    lamp(g) { this.cyl(0.05, 0.07, 1.8, this.M.dark, g, 0, 0, 0, 8); const b = this.mesh(new THREE.SphereGeometry(0.18, 12, 8), this.M.window, g, 0, 1.9, 0); b.castShadow = false; (this.lamps ||= []).push(b); }
    turbine(g, h) { this.cyl(0.1, 0.18, h, this.M.white, g, 0, 0, 0, 10); const hub = new THREE.Group(); hub.position.set(0, h, 0.2); g.add(hub);
        for (let i = 0; i < 3; i++) { const b = this.box(0.14, 1.9, 0.05, this.M.white, hub, 0, 0, 0, 0.03); b.geometry.translate(0, -0.95 + 0.95, 0); b.rotation.z = (i * Math.PI * 2) / 3; }
        this.spin.push({ o: hub, axis: "z", speed: 1.4 }); }
    makeRain() { const n = this.mobile ? 160 : 400, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) p.set([(rnd() - 0.5) * 12, rnd() * 8, (rnd() - 0.5) * 6], i * 3);
        const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
        const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfe2f5, size: 0.06, transparent: true, opacity: 0 })); this.uni.add(pts); return pts; }
    makeFireflies(theta) { const n = 40, p = new Float32Array(n * 3), s = new Float32Array(n); for (let i = 0; i < n; i++) { p.set([(rnd() - 0.5) * 8, 0.4 + rnd() * 3, (rnd() - 0.5) * 5], i * 3); s[i] = rnd(); }
        const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("seed", new THREE.BufferAttribute(s, 1));
        const U = { uT: this.starU.uT, uPR: this.starU.uPR, uSize: { value: 8 }, uOp: { value: 0 } };
        const pts = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: PTS_VS, fragmentShader: PTS_FS.replace("vec3(.37, .82, 1.), vec3(.66, .55, 1.)", "vec3(1., .85, .4), vec3(.9, 1., .5)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        this.spot(theta, 0).add(pts); pts.userData.U = U; return pts; }
    /** where trees and rocks may go: not on the path, not on a place */
    scatter() {
        const busy = [];
        Object.values(PLACES).forEach(p => { if (p.theta !== undefined) busy.push(p.theta); if (p.items) p.items.forEach(i => busy.push(i.theta)); });
        for (let i = -3; i <= 3; i++) busy.push(PLACES.home.theta + i * 5); busy.push(PLACES.journey.cgec, PLACES.journey.home, PLACES.journey.runway, PLACES.lab.theta, PLACES.contact.theta - 7);
        this.treeDirs = []; const n = this.mobile ? 70 : 150;
        for (let t = 0; t < n * 6 && this.treeDirs.length < n; t++) {
            const d = V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), theta = ((Math.atan2(d.x, d.y) / D2R) + 360) % 360;
            if (d.z > -0.16 && d.z < 0.62) continue; // the path band and the near slope in front of me
            if (theta > PLACES.oceanFrom - 3 && theta < PLACES.oceanTo + 3 && Math.abs(d.z) < 0.95) continue;
            if (d.z < -0.16 && d.z > -0.6 && busy.some(b => Math.abs(((theta - b + 540) % 360) - 180) < 7)) continue;
            this.treeDirs.push([d, 0.8 + rnd() * 0.7]);
        }
        this.fallbackTrees = this.treeDirs.map(([d, k], i) => { const g = new THREE.Group(); g.position.copy(d).multiplyScalar(R); g.quaternion.setFromUnitVectors(UP, d);
            this.cyl(0.08, 0.12, 0.7 * k, this.M.wood, g, 0, 0, 0, 6); this.mesh(new THREE.ConeGeometry(0.55 * k, 1.3 * k, 7), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x3f8f4a : 0x56a85a, flatShading: true }), g, 0, 0.7 * k + 0.6 * k, 0); this.planet.add(g); return g; });
    }
    plane() {
        const p = this.planeG = new THREE.Group(), M = this.M; p.scale.setScalar(0.8);
        const body = this.mesh(new THREE.CapsuleGeometry(0.32, 2, 6, 14), M.white, p); body.rotation.z = Math.PI / 2;
        this.box(0.55, 0.05, 2.8, M.white, p, 0.1, -0.05, 0, 0.03); this.box(0.35, 0.6, 0.06, M.accent, p, -1.15, 0.05, 0, 0.03); this.box(0.28, 0.05, 1, M.white, p, -1.1, 0, 0, 0.02);
        for (let i = 0; i < 4; i++) this.box(0.11, 0.11, 0.03, M.window, p, 0.55 - i * 0.32, 0.03, 0.31, 0.02);
        this.planeParked = this.spot(PLACES.journey.runway, 0); this.planeParked.add(p); p.position.set(0, 0.45, 0);
        const tp = new Float32Array(90 * 3), tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.BufferAttribute(tp, 3));
        this.trail = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); this.trail.frustumCulled = false; this.scene.add(this.trail); this.trailPts = [];
    }
    clouds() { this.cloudG = new THREE.Group(); this.planet.add(this.cloudG); this.cloudList = [];
        for (let i = 0; i < (this.mobile ? 9 : 16); i++) { const c = new THREE.Group(); [[0, 0, 0, 0.9], [0.8, 0.1, 0, 0.65], [-0.8, 0, 0.1, 0.65], [0.2, 0.45, 0, 0.55]].forEach(([x, y, z, s]) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), this.M.cloud); m.position.set(x, y, z); c.add(m); });
            const th = rnd() * 360, d = dirAt(th, 10 + rnd() * 55); c.position.copy(d).multiplyScalar(R + 7 + rnd() * 3); c.quaternion.setFromUnitVectors(UP, d); c.scale.setScalar(0.8 + rnd() * 0.8); this.cloudG.add(c); this.cloudList.push(c); } }

    /* ── skill orbs (collectibles) ── */
    makeOrbs() {
        ORBS.forEach((o, i) => {
            const g = this.spot(o.theta, o.back ?? -1, 2.1), col = new THREE.Color(o.color);
            const core = this.mesh(new THREE.IcosahedronGeometry(0.4, 1), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.05, flatShading: true }), g); core.castShadow = false;
            const halo = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(halo);
            core.userData.orb = i; halo.userData.orb = i; this.orbs.push({ g, core, halo, got: false, id: o.id }); this.clickables.push(core, halo);
        });
    }
    setCollected(ids) { this.orbs.forEach((o, i) => { const got = ids.includes(o.id); if (got && !o.got) this.placeOnPedestal(i); o.got = got; o.g.visible = !got; }); }
    placeOnPedestal(i) { const o = this.orbs[i]; if (o.shown) return; o.shown = true; const c = o.core.clone(); c.position.copy(this.pedestals[i]); this.garden.add(c); this.anim.push(t => { c.rotation.y = t + i; c.position.y = 1.35 + Math.sin(t * 2 + i) * 0.08; }); }

    /* ── models (Kenney, CC0) ── */
    async loadModels() {
        let lib;
        try {
            const [{ GLTFLoader }, SU] = await Promise.all([import("three/examples/jsm/loaders/GLTFLoader.js"), import("three/examples/jsm/utils/SkeletonUtils.js")]); const L = new GLTFLoader(); this.skelClone = SU.clone;
            const files = { me: "chars/character-male-d", glasses: "chars/aid-glasses", sky: "city/building-skyscraper-a", libb: "city/building-d", h5: "sub/building-type-k", h1: "sub/building-type-a",
                t1: "nature/tree_detailed", t2: "nature/tree_oak", t3: "nature/tree_pineRoundA", t4: "nature/tree_pineTallA_detailed", t5: "nature/tree_default", palm1: "nature/tree_palmDetailedTall", palm2: "nature/tree_palmBend",
                bush: "nature/plant_bushDetailed", rock: "nature/rock_largeA", fl1: "nature/flower_redA", fl2: "nature/flower_yellowA",
                desk: "furn/desk", chair: "furn/chairDesk", screen: "furn/computerScreen", keys: "furn/computerKeyboard", lampT: "furn/lampRoundTable", plant: "furn/pottedPlant", laptop: "furn/laptop" };
            const got = await Promise.all(Object.entries(files).map(([k, f]) => L.loadAsync(`/models/${f}.glb`).then(g => { g.scene.userData.clips = g.animations; return [k, g.scene]; })));
            if (this.disposed) return; lib = this.lib = Object.fromEntries(got);
        } catch { return; }
        const shadow = !this.mobile;
        const put = (key, parent, h, x = 0, z = 0, ry = 0) => {
            const m = lib[key].clone(true), box = new THREE.Box3().setFromObject(m), size = box.getSize(V(0, 0, 0)), c = box.getCenter(V(0, 0, 0)), k = h / size.y;
            m.scale.setScalar(k); m.position.set(-c.x * k, -box.min.y * k, -c.z * k);
            m.traverse(o => { if (o.isMesh) { o.castShadow = shadow; o.receiveShadow = true; o.material = o.material.clone(); o.material.roughness = 0.85; o.material.metalness = 0; } });
            const g = new THREE.Group(); g.add(m); g.position.set(x, 0, z); g.rotation.y = ry; g.userData.size = size.clone().multiplyScalar(k); parent.add(g); return g;
        };
        // trees, palms, undergrowth
        this.fallbackTrees.forEach(g => { g.visible = false; });
        const kinds = ["t1", "t2", "t3", "t4", "t5", "t1", "bush", "rock", "fl1", "fl2"];
        this.treeDirs.forEach(([d, k], i) => { const g = new THREE.Group(); g.position.copy(d).multiplyScalar(R - 0.02); g.quaternion.setFromUnitVectors(UP, d); this.planet.add(g); const kind = kinds[i % kinds.length]; put(kind, g, kind.startsWith("t") ? 1.4 + k * 0.9 : kind === "bush" ? 0.55 : kind === "rock" ? 0.6 : 0.35, 0, 0, rnd() * 6); });
        this.palmSpots.forEach(([th, back], i) => put(i % 2 ? "palm2" : "palm1", this.spot(th, back), 2.6 + (i % 2) * 0.3, 0, 0, rnd() * 6));
        // real buildings
        this.hqStand.visible = false; const sky = put("sky", this.hq, 7.2); const fs = sky.userData.size;
        this.floors.forEach((f, i) => { f.scale.set((fs.x + 0.12) / 2.72, 1, (fs.z + 0.12) / 2.72); f.position.y = 1.1 + i * 1.45 + 0.25; });
        this.libSpot.children.forEach(c => { c.visible = false; }); put("libb", this.libSpot, 2.4, 0, 0, 0.5);
        this.homeSpot.children.forEach(c => { c.visible = false; }); put("h5", this.homeSpot, 1.9, 0, 0, -0.4);
        put("h1", this.spot(PLACES.tuhh.theta + 9, 12), 2.2, 0, 0, 0.6);
        // my desk
        const ds = this.deskSpot; ds.children.forEach(c => { c.visible = false; });
        put("desk", ds, 0.78, 0, 0); const scr = put("screen", ds, 0.5, 0, -0.18); put("keys", ds, 0.03, 0, 0.12); ds.children[ds.children.length - 1].position.y = 0.78; scr.position.y = 0.78;
        put("lampT", ds, 0.45, 0.7, -0.1).position.y = 0.78; put("plant", ds, 0.6, -1.1, 0.2);
        scr.traverse(o => { if (o.isMesh && o.material.name?.toLowerCase().includes("screen")) o.material.emissive?.set(0x88c0d0); });
        this.chair = put("chair", ds, 0.9, 0, 0.75, Math.PI);
        // me
        this.character(lib);
        // flowers you can plant
        this.flowerKinds = ["fl1", "fl2"]; this.putModel = put;
    }
    character(lib) {
        const holder = this.me = new THREE.Group(); this.scene.add(holder);
        const body = this.skelClone(lib.me), box = new THREE.Box3().setFromObject(body), k = 1.25 / box.getSize(V(0, 0, 0)).y;
        body.scale.setScalar(k); body.position.y = -box.min.y * k; body.traverse(o => { if (o.isMesh) { o.castShadow = !this.mobile; o.frustumCulled = false; } });
        holder.add(body); this.meBody = body;
        this.head = body.getObjectByName("head");
        if (this.head && lib.glasses) this.head.add(lib.glasses.clone(true));
        this.mixer = new THREE.AnimationMixer(body); this.actions = {};
        (lib.me.userData.clips || []).forEach(c => { this.actions[c.name] = this.mixer.clipAction(c); });
        ["jump", "pick-up", "emote-yes"].forEach(n => { const a = this.actions[n]; if (a) { a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; } });
        this.mixer.addEventListener("finished", () => { this.oneShot = null; this.play(this.base || "idle"); });
        this.play("idle");
        body.traverse(o => { if (o.isSkinnedMesh) this.clickables.push(o); o.userData.me = true; });
        this.ready = true; this.onReady?.();
    }
    play(name, fade = 0.25) {
        const a = this.actions?.[name]; if (!a || this.current === name) return;
        const prev = this.actions[this.current]; a.reset().fadeIn(fade).play(); prev?.fadeOut(fade); this.current = name;
    }
    once(name) { if (!this.actions?.[name]) return; this.oneShot = name; this.current = null; this.play(name, 0.15); }

    /* ── moments the page asks for ── */
    setAngle(a) { this.goalAngle = a; }
    setSky(sky) { this.skyGoal = sky; }
    setProjectFocus(theta) { this.projectFocus = theta; }
    setPointer(x, y) { this.pointer.set(x, y); }
    setWhat(k) { const c = [0xb48ead, 0x88c0d0, 0xd8b779, 0xa3be8c][k + 1] ?? 0xb48ead; this.coreMat.color.set(c); this.coreMat.emissive.set(c); this.coreBoost = k >= 0 ? 1 : 0; }
    setFloor(n) { this.floorOn = n; }
    setFlight(p) { this.flight = p; }
    setSit(v) { this.sitting = v; }
    /** project park: I code; the chosen project's building gets a beacon in its colour */
    setCoding(v) { this.coding = v; }
    setProject(i, color) { this.projOn = i; if (color) { this.projCol.set(color); this.projHex = color; } }
    /** skills: a role lights the garden in its colour */
    setRole(color) { this.roleOn = !!color; if (color) this.roleCol.set(color); }
    setMail(v) { this.envelope.visible = v; }
    setNeural(v) { this.goalNeural = v ? 1 : 0; if (v && !this.neuralBuilt) this.buildNeural(); }

    /** turn every object into glowing neurons (sampled on its surface), and back */
    buildNeural() {
        this.neuralBuilt = true; this.neuralPts = [];
        const meshes = []; this.planet.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.geometry?.attributes.position && o.visible !== false) meshes.push(o); });
        const area = o => { const b = o.geometry.boundingBox || (o.geometry.computeBoundingBox(), o.geometry.boundingBox), s = b.getSize(V(0, 0, 0)).multiply(o.getWorldScale(V(0, 0, 0))); return s.x * s.y + s.y * s.z + s.x * s.z + 0.01; };
        const total = meshes.reduce((a, o) => a + area(o), 0), budget = this.mobile ? 14000 : 34000;
        meshes.forEach(o => {
            const n = Math.max(12, Math.round(budget * area(o) / total)); let sampler;
            try { sampler = new MeshSurfaceSampler(o).build(); } catch { return; }
            const p = new Float32Array(n * 3), s = new Float32Array(n), v = V(0, 0, 0);
            for (let i = 0; i < n; i++) { sampler.sample(v); p.set([v.x, v.y, v.z], i * 3); s[i] = Math.random(); }
            const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("seed", new THREE.BufferAttribute(s, 1));
            const pts = new THREE.Points(g, this.neuralMat ||= new THREE.ShaderMaterial({ uniforms: this.neuralU = { uT: this.starU.uT, uPR: this.starU.uPR, uSize: { value: this.mobile ? 6 : 5 }, uOp: { value: 0 } }, vertexShader: PTS_VS, fragmentShader: PTS_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
            pts.frustumCulled = false; o.add(pts); this.neuralPts.push(pts);
        });
        this.neuralMeshes = meshes;
    }

    /** Break my AI: a red message flies in from the sky; the server's verdict decides where it dies */
    async attack(result) {
        const g = new THREE.Group(), col = new THREE.Color(0xbf616a);
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 2), new THREE.MeshBasicMaterial({ color: 0xffffff })), glow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
        g.add(core, glow); this.scene.add(g);
        const tween = (ms, fn) => new Promise(res => { const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / ms); fn(k * k * (3 - 2 * k)); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
        const gatePos = () => this.gate.localToWorld(V(0, 1.6, 0));
        const from = V(9, R + 8, 2);
        try {
            const to = gatePos(); await tween(1100, k => { g.position.lerpVectors(from, to, k).add(V(0, Math.sin(k * Math.PI) * 2, 0)); });
            let r = null; result.then(v => { r = v; });
            while (!r) await tween(300, k => { glow.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.6); this.beamMat.opacity = 0.2 + Math.sin(k * Math.PI) * 0.4; });
            if (r.verdict === "blocked") {
                this.beamMat.color.set(0xbf616a); this.once("emote-yes");
                const at = g.position.clone(), ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.45, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
                ring.position.copy(at); ring.lookAt(this.camera.position); this.scene.add(ring); core.visible = false;
                await tween(800, k => { ring.scale.setScalar(1 + k * 9); ring.material.opacity = 1 - k; glow.scale.setScalar(1 + k * 5); glow.material.opacity = 0.35 * (1 - k); });
                this.scene.remove(ring); ring.geometry.dispose(); ring.material.dispose();
                setTimeout(() => this.beamMat.color.set(0x88c0d0), 900);
            } else {
                glow.material.color.set(0xa3be8c); const a = g.position.clone(); await tween(900, k => { g.position.lerpVectors(a, V(-6, R + 9, 0), k); });
            }
            return r;
        } finally { this.scene.remove(g); core.geometry.dispose(); glow.geometry.dispose(); core.material.dispose(); glow.material.dispose(); }
    }

    /** a click on the world: collect an orb, make me jump, or plant a flower */
    click(cx, cy) {
        const rect = this.canvas.getBoundingClientRect(), p = new THREE.Vector2((cx - rect.left) / rect.width * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
        this.ray.setFromCamera(p, this.camera);
        const hit = this.ray.intersectObjects(this.clickables, false)[0]; if (!hit) return null;
        if (hit.object.userData.letter !== undefined) { this.kick(hit.object.userData.letter); return { letter: hit.object.userData.letter }; }
        if (hit.object.userData.orb !== undefined) { const o = this.orbs[hit.object.userData.orb]; if (o.got) return null; this.once("pick-up"); return { orb: o.id }; }
        let me = false; hit.object.traverseAncestors(a => { if (a === this.me) me = true; }); if (me) { this.once("jump"); return { me: true }; }
        if (hit.object === this.ground && this.lib && this.flowers < 40) { this.flowers++; const local = this.planet.worldToLocal(hit.point.clone()), d = local.clone().normalize();
            const g = new THREE.Group(); g.position.copy(d).multiplyScalar(R - 0.02); g.quaternion.setFromUnitVectors(UP, d); this.planet.add(g); const f = this.putModel(this.flowerKinds[this.flowers % 2], g, 0.4, 0, 0, Math.random() * 6);
            f.scale.setScalar(0.01); const t0 = performance.now(); const grow = now => { const k = Math.min(1, (now - t0) / 500); f.scale.setScalar(0.01 + k * 0.99 * (1 + Math.sin(k * Math.PI) * 0.3)); if (k < 1) requestAnimationFrame(grow); }; requestAnimationFrame(grow); return { flower: true }; }
        return null;
    }

    applySky(s, k) {
        const st = this.skyState;
        ["top", "bottom", "sun", "hemi", "ground"].forEach(n => { st[n] = (st[n] instanceof THREE.Color ? st[n] : new THREE.Color(st[n])).lerp(new THREE.Color(s[n]), k); });
        ["sunI", "stars", "rain", "fire", "lamp"].forEach(n => { st[n] = (st[n] ?? s[n]) + (s[n] - (st[n] ?? s[n])) * k; });
        this.skyU.uTop.value.copy(st.top); this.skyU.uBottom.value.copy(st.bottom); this.sun.color.copy(st.sun); this.sun.intensity = st.sunI;
        this.hemi.color.copy(st.hemi); this.hemi.groundColor.copy(st.ground); this.hemi.intensity = 0.55 + st.sunI * 0.2; this.starU.uOp.value = st.stars;
        this.fill.intensity = st.lamp * 18;
    }
    resize() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight; if (!w || !h) return;
        this.renderer.setSize(w, h, false); this.camera.aspect = w / h;
        const portrait = this.portrait = w / h < 0.85; this.camera.fov = portrait ? 52 : 38;
        // phones: the world sits in the top half, above the cards; big screens: centred
        this.camBase = portrait ? { p: V(0, R + 3.9, 17), l: V(0, R - 1.7, 0) } : { p: V(0, R + 2.9, 13.2), l: V(0, R + 1.6, 0) };
        this.camera.updateProjectionMatrix();
    }
    tick() {
        const raw = this.clock.getDelta(), dt = Math.min(raw, 0.05), t = this.clock.elapsedTime;
        if (this.frames && raw > 0) { this.frames.push(raw); if (this.frames.length > 120) { const f = this.frames.sort((a, b) => a - b); if (f[60] > 1 / 32) { this.renderer.shadowMap.enabled = false; this.renderer.setPixelRatio(1); this.resize(); } this.frames = null; } }
        this.starU.uT.value = t;
        // the planet turns towards the chapter; I walk while it moves
        const prev = this.angle; this.angle += (this.goalAngle - this.angle) * (1 - Math.pow(0.004, dt));
        const speed = (this.angle - prev) / Math.max(dt, 1e-4); this.planet.rotation.z = this.angle * D2R;
        // sky between chapters
        if (this.skyGoal) this.applySky(this.skyGoal, 1 - Math.pow(0.03, dt));
        // camera: gentle parallax with the pointer
        this.smooth.lerp(this.pointer, 0.04);
        // the project park: the camera leans in while I code
        const vg = this.viewGoal || { dy: 0, fx: 0, zoom: 0 }, vw = this.view ||= { dy: 0, fx: 0, zoom: 0, fk: 0, fp: V(0, R, 0) }, kk = 1 - Math.pow(0.08, dt);
        vw.dy += (vg.dy - vw.dy) * kk; vw.fx += (vg.fx - vw.fx) * kk; vw.zoom += (vg.zoom - vw.zoom) * kk;
        const fp = this.focusPoint(vg.focus); vw.fk += ((fp ? 1 : 0) - vw.fk) * (1 - Math.pow(0.12, dt)); if (fp) vw.fp.lerp(fp, fp && vw.fk < 0.05 ? 1 : kk);
        if (this.camBase) {
            const look = this.camBase.l.clone().add(V(vw.fx, vw.dy, 0)), pos = this.camBase.p.clone().add(V(vw.fx, vw.dy, 0)).lerp(look, 0.3 * vw.zoom);
            if (vw.fk > 0.001) { const fl = vw.fp.clone(), fpos = vw.fp.clone().add(V(this.portrait ? 0 : -2.2, 0.6, this.portrait ? 12 : 9.5)); look.lerp(fl.add(V(this.portrait ? 0 : -2.2, this.portrait ? -2.2 : 0, 0)), vw.fk); pos.lerp(fpos, vw.fk); }
            this.camera.position.copy(pos).add(V(this.smooth.x * 1.2, this.smooth.y * 0.5, 0)); this.camera.lookAt(look);
        }
        // me
        if (this.me) {
            const flying = this.flight > 0.02 && this.flight < 0.98;
            this.me.visible = !flying;
            if (Math.abs(speed) > 0.6 && !this.oneShot) { this.dir = Math.sign(speed); this.base = Math.abs(speed) > 9 ? "sprint" : "walk"; this.play(this.base); }
            else if (!this.oneShot) { this.base = this.sitting || (this.coding && !flying) ? "sit" : "idle"; this.play(this.base); }
            const typing = this.coding && !this.sitting && this.base === "sit";
            const faceCam = this.sitting ? Math.PI : typing ? 1.2 : (this.base === "idle" ? this.smooth.x * 0.9 : this.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
            this.me.position.set(0, R + 0.06, this.sitting ? 0.02 : 0.15);
            this.meBody.rotation.y += (faceCam - this.meBody.rotation.y) * 0.12;
            if (this.head && this.base === "idle" && !this.oneShot) { this.head.rotation.y += (this.smooth.x * 0.5 - this.head.rotation.y) * 0.1; this.head.rotation.x += (-this.smooth.y * 0.3 - this.head.rotation.x) * 0.1; }
            this.mixer.update(dt);
            if (typing && !this.oneShot && this.head) { this.head.rotation.x = 0.18 + Math.sin(t * 5) * 0.035; this.head.rotation.y = -0.25 + Math.sin(t * 0.7) * 0.08; }
            // the coding rig appears under me when I sit down in the park
            this.rigK += ((typing ? 1 : 0) - this.rigK) * 0.12; this.rig.visible = this.rigK > 0.01; this.rig.scale.setScalar(Math.max(0.001, this.rigK)); this.rig.rotation.y = 1.2;
            if (this.rig.visible) {
                const col = this.projHex || "#88c0d0"; this.codeT += dt; if (this.codeT > 0.14) { this.codeT = 0; this.drawCode(col); }
                this.lapGlow.color.set(col); this.lapGlow.intensity = 1.2 * this.rigK;
                this.glyphs.forEach((s, i) => { const k = (t * 0.28 + s.userData.o) % 1; s.position.set(Math.sin(i * 2.3) * 0.35 + Math.sin(t + i) * 0.06, 0.95 + k * 1.5, 0.66 + Math.cos(i * 1.7) * 0.2); s.material.opacity = Math.sin(k * Math.PI) * 0.95 * this.rigK; s.material.color.set(col); });
            }
        }
        if (this.bag) { this.bagK += ((this.prep && this.me?.visible ? 1 : 0) - this.bagK) * 0.1; this.bag.visible = this.bagK > 0.01; this.bag.scale.setScalar(Math.max(0.001, this.bagK)); this.bag.rotation.y = Math.sin(t * 0.8) * 0.05; }
        // letters: hover lift (the cursor over a letter), intro drop, click flip
        if (this.letters && this.dropped && (this.frameN = (this.frameN || 0) + 1) % 3 === 0 && Math.abs(((this.angle % 360) + 540) % 360 - 180) > 150) {
            this.ray.setFromCamera(this.pointer, this.camera); const hit = this.ray.intersectObjects(this.letters.map(L => L.m), false)[0];
            this.hovLetter = hit ? hit.object.userData.letter : -1; this.canvas.style.cursor = hit ? "pointer" : "";
        }
        (this.letters || []).forEach((L, i) => {
            L.hov += ((this.hovLetter === i ? 1 : 0) - L.hov) * 0.15;
            if (!this.dropped) { L.holder.position.y = 14; return; }
            const kd = L.drop === null ? 1 : (t - L.drop) / 1.1;
            if (kd < 1) { if (kd < 0) { L.holder.position.y = 14; return; } const b = kd < 0.55 ? 1 - Math.pow(kd / 0.55, 2) : kd < 0.8 ? Math.sin((kd - 0.55) / 0.25 * Math.PI) * 0.16 : Math.sin((kd - 0.8) / 0.2 * Math.PI) * 0.05; L.holder.position.y = b * 14; L.holder.rotation.z = (1 - kd) * 0.5 * (i % 2 ? 1 : -1); const sq = kd > 0.52 && kd < 0.62 ? 0.78 : 1; L.holder.scale.set(2 - sq, sq, 1); return; }
            const k = (t - L.t0) / 1.1; if (k < 0 || k > 1) { L.holder.position.y = L.hov * 0.35; L.holder.rotation.x = 0; L.holder.rotation.z = Math.sin(t * 9) * 0.05 * L.hov; L.holder.scale.set(1, 1, 1); return; } const e = Math.sin(k * Math.PI); L.holder.position.y = e * 1.8; L.holder.rotation.x = k * Math.PI * 2 * L.dir; const sq = k > 0.85 ? 1 - Math.sin((k - 0.85) / 0.15 * Math.PI) * 0.25 : 1; L.holder.scale.set(1 + (1 - sq) * 0.5, sq, 1); });
        // project beacons and the skills garden
        (this.beacons || []).forEach((b, k) => { b.k += ((k === this.projOn ? 1 : 0) - b.k) * 0.08; b.ring.material.opacity = b.k * 0.9; b.beam.material.opacity = b.k * 0.32; b.ring.material.color.copy(this.projCol); b.beam.material.color.copy(this.projCol); b.ring.scale.setScalar(1 + Math.sin(t * 2.2) * 0.05); });
        this.roleK += ((this.roleOn ? 1 : 0) - this.roleK) * 0.08; this.M.cloud.opacity = 0.95 * (1 - this.roleK * 0.9); this.cloudG.visible = this.roleK < 0.98; this.pedMat.emissive.copy(this.roleCol).multiplyScalar(this.roleK * 0.9);
        this.roleBeams.forEach((b, i) => { b.material.color.copy(this.roleCol); b.material.opacity = this.roleK * (0.35 + Math.sin(t * 3 + i) * 0.1); });
        // the flight: plane lifts off, flies high over the ocean, lands in Hamburg
        if (this.planeG) {
            const f = this.flight;
            if (f > 0.02 && f < 0.98) {
                if (this.planeG.parent !== this.scene) { this.scene.add(this.planeG); this.planeG.scale.setScalar(0.9); }
                const h = Math.sin(Math.min(1, f) * Math.PI), tilt = Math.cos(f * Math.PI) * 0.35;
                this.planeG.position.set(Math.sin(t * 0.8) * 0.3, R + 0.7 + h * 3.4, 0.4); this.planeG.rotation.set(0, 0, tilt + Math.sin(t * 1.3) * 0.04);
                this.trailPts.unshift(this.planeG.localToWorld(V(-1.2, 0, 0)).add(V(0, 0, 0))); this.trailPts.length = Math.min(this.trailPts.length, 90);
                const arr = this.trail.geometry.attributes.position.array; this.trailPts.forEach((p, i) => { arr[i * 3] = p.x - i * 0.07; arr[i * 3 + 1] = p.y - i * 0.004; arr[i * 3 + 2] = p.z; });
                this.trail.geometry.setDrawRange(0, this.trailPts.length); this.trail.geometry.attributes.position.needsUpdate = true; this.trail.material.opacity = 0.55;
            } else {
                const park = f >= 0.98 ? this.planeLanded ||= this.spot(PLACES.tuhh.theta - 15, 9) : this.planeParked;
                if (this.planeG.parent !== park) { park.add(this.planeG); this.planeG.position.set(0, 0.45, 0); this.planeG.rotation.set(0, 0, 0); this.planeG.scale.setScalar(0.8); }
                this.trail.material.opacity *= 0.9; this.trailPts.length = 0;
            }
        }
        // the world is alive
        this.spin.forEach(s => { s.o.rotation[s.axis || "y"] += s.speed * dt; });
        this.anim.forEach(f => f(t));
        this.core.rotation.y += dt * (0.6 + (this.coreBoost || 0) * 2.4); this.core.rotation.x += dt * 0.25; this.core.scale.setScalar(1 + Math.sin(t * 2.4) * 0.05 + (this.coreBoost || 0) * 0.18);
        this.coreRings.forEach((r, i) => { r.rotation.z += dt * (0.5 + i * 0.3 + (this.coreBoost || 0) * 1.5); });
        this.beam.position.y = 1.45 + Math.sin(t * 1.5) * 0.15; this.shield.rotation.y = Math.sin(t) * 0.3;
        this.floors.forEach((f, i) => { const on = this.floorOn !== undefined && i <= this.floorOn; f.material.emissiveIntensity += ((on ? 1.5 + Math.sin(t * 3 + i) * 0.2 : 0.1) - f.material.emissiveIntensity) * 0.08; });
        this.orbs.forEach((o, i) => { if (!o.g.visible) return; o.core.rotation.y = t * 1.5 + i; o.core.position.y = Math.sin(t * 2 + i) * 0.15; o.halo.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.12); });
        this.cloudG.rotation.y = t * 0.01;
        const st = this.skyState; this.rain.material.opacity = st.rain * 0.8; if (st.rain > 0.01) { const a = this.rain.geometry.attributes.position.array; for (let i = 1; i < a.length; i += 3) { a[i] -= dt * 9; if (a[i] < 0) a[i] += 8; } this.rain.geometry.attributes.position.needsUpdate = true; }
        this.fireflies.userData.U.uOp.value = st.fire; (this.lamps || []).forEach(l => { l.material.emissiveIntensity = 0.2 + st.lamp * 1.6; });
        // neural vision
        this.neural += (this.goalNeural - this.neural) * (1 - Math.pow(0.05, dt));
        if (this.neuralBuilt) { this.neuralU.uOp.value = this.neural; this.neuralMeshes.forEach(o => { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (!m) return; if (m.userData.op0 === undefined) { m.userData.op0 = m.opacity; m.userData.tr0 = m.transparent; } const tr = m.userData.tr0 || this.neural > 0.01; if (tr !== m.transparent) { m.transparent = tr; m.needsUpdate = true; } m.opacity = m.userData.op0 * (1 - this.neural * 0.94); m.depthWrite = this.neural < 0.5; }); }); if (this.me) this.me.traverse(o => { if (o.isMesh) { o.material.transparent = true; o.material.opacity = 1 - this.neural * 0.8; } }); }
        this.renderer.render(this.scene, this.camera);
    }
    start() { if (!this.running) { this.running = true; this.clock.getDelta(); this.renderer.setAnimationLoop(this.tick); } }
    stop() { this.running = false; this.renderer.setAnimationLoop(null); }
    dispose() { this.disposed = true; this.stop(); this.ro.disconnect(); this.scene.traverse(o => { o.geometry?.dispose(); }); this.renderer.dispose(); }
}
