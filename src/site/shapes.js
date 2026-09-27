import LAND from "../data/land.json";

/*
 * Target shapes for the particle universe. Each shape is N points in world
 * units (visible height ≈ 10) plus a "tone" per point: 0..1 mixes the two
 * theme accents, or real RGB colours (the portrait).
 */

const rand = (seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646)(7);

function canvasPoints(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.strokeStyle = "#fff";
    draw(x, w, h);
    const d = x.getImageData(0, 0, w, h).data, pts = [];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 128) pts.push(i, j);
    return pts;
}

/** Turn 2D pixel samples into N 3D points, `size` world units wide. */
function fromPixels(pts, w, h, n, size, depth = 0.35, toneFn = () => rand()) {
    const pos = new Float32Array(n * 3), tone = new Float32Array(n);
    const count = pts.length / 2;
    for (let k = 0; k < n; k++) {
        const i = Math.floor(rand() * count) * 2;
        const px = pts[i] + rand(), py = pts[i + 1] + rand();
        pos[k * 3] = (px / w - 0.5) * size;
        pos[k * 3 + 1] = -(py / w - (h / w) * 0.5) * size;
        pos[k * 3 + 2] = (rand() - 0.5) * depth;
        tone[k] = toneFn(px / w, py / h);
    }
    return { pos, tone };
}

export function portrait(n, img) {
    const S = 200;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const x = c.getContext("2d");
    const side = Math.min(img.width, img.height);
    x.drawImage(img, (img.width - side) / 2, 0, side, side, 0, 0, S, S);
    const d = x.getImageData(0, 0, S, S).data;
    // keep the person, drop the flat grey studio backdrop (low saturation, mid brightness)
    const keep = [];
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
        const o = (py * S + px) * 4, r = d[o] / 255, g = d[o + 1] / 255, b = d[o + 2] / 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0, lum = 0.3 * r + 0.59 * g + 0.11 * b;
        const backdrop = sat < 0.13 && lum > 0.3 && lum < 0.8;
        if (!backdrop) keep.push(px, py, r, g, b, lum);
    }
    // weight samples by local contrast so eyes, glasses and mouth get more particles
    const L = (px, py) => { const o = (Math.min(S - 1, Math.max(0, py)) * S + Math.min(S - 1, Math.max(0, px))) * 4; return (0.3 * d[o] + 0.59 * d[o + 1] + 0.11 * d[o + 2]) / 255; };
    const cum = []; let total = 0;
    for (let i = 0; i < keep.length; i += 6) {
        const px = keep[i], py = keep[i + 1];
        const gx = L(px + 1, py) - L(px - 1, py), gy = L(px, py + 1) - L(px, py - 1);
        const face = py < S * 0.62 && px > S * 0.25 && px < S * 0.75 ? 1.6 : 1;
        total += (0.25 + Math.min(1.5, Math.hypot(gx, gy) * 6)) * face; cum.push(total);
    }
    const pickIdx = () => { const v = rand() * total; let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < v) lo = m + 1; else hi = m; } return lo; };
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
        const o = pickIdx() * 6;
        const px = keep[o] + rand() * 0.8, py = keep[o + 1] + rand() * 0.8;
        let r = keep[o + 2], g = keep[o + 3], b = keep[o + 4];
        const lum = keep[o + 5];
        pos[k * 3] = (px / S - 0.5) * 6.2;
        pos[k * 3 + 1] = -(py / S - 0.5) * 6.2;
        pos[k * 3 + 2] = (lum - 0.4) * 1.1 + (rand() - 0.5) * 0.06;
        // dark hair / suit would vanish on a dark page: tint them a cool blue instead
        if (lum < 0.22) { const t = lum / 0.22; r = 0.2 + 0.1 * t; g = 0.36 + 0.14 * t; b = 0.62 + 0.18 * t; }
        const boost = 1.25;
        col[k * 3] = Math.min(1, r * boost); col[k * 3 + 1] = Math.min(1, g * boost); col[k * 3 + 2] = Math.min(1, b * boost);
    }
    return { pos, col };
}

export function network(n) {
    const nodes = [], NN = 28, R = 2.6;
    for (let i = 0; i < NN; i++) {
        const y = 1 - (i / (NN - 1)) * 2, r = Math.sqrt(1 - y * y), t = i * 2.39996;
        nodes.push([Math.cos(t) * r * R, y * R * 0.95, Math.sin(t) * r * R]);
    }
    const edges = [];
    nodes.forEach((a, i) => {
        nodes.map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2])
            .sort((p, q) => p[1] - q[1]).slice(1, 4).forEach(([j]) => { if (i < j) edges.push([i, j]); });
    });
    const pos = new Float32Array(n * 3), tone = new Float32Array(n);
    for (let k = 0; k < n; k++) {
        let p, t;
        if (k % 10 < 4) { // node clusters
            const a = nodes[k % NN], s = 0.16;
            p = [a[0] + (rand() - 0.5) * s, a[1] + (rand() - 0.5) * s, a[2] + (rand() - 0.5) * s]; t = 1;
        } else {
            const [i, j] = edges[k % edges.length], u = rand(), a = nodes[i], b = nodes[j];
            p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u].map(v => v + (rand() - 0.5) * 0.03); t = 0.2 + rand() * 0.3;
        }
        pos.set(p, k * 3); tone[k] = t;
    }
    return { pos, tone };
}

export function euStars(n) {
    const W = 320, pts = canvasPoints(W, W, x => {
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2, cx = W / 2 + Math.cos(a) * 118, cy = W / 2 + Math.sin(a) * 118;
            x.beginPath();
            for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 22, b = (k / 10) * Math.PI * 2 - Math.PI / 2; x.lineTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r); }
            x.fill();
        }
    });
    return fromPixels(pts, W, W, n, 5.6, 0.3, () => 0.55 + rand() * 0.45);
}

export function padlock(n) {
    const W = 300, H = 340, pts = canvasPoints(W, H, x => {
        x.lineWidth = 34; x.beginPath(); x.arc(W / 2, 128, 72, Math.PI, 0); x.lineTo(W / 2 + 72, 170); x.moveTo(W / 2 - 72, 128); x.lineTo(W / 2 - 72, 170); x.stroke();
        x.beginPath(); x.roundRect(40, 160, W - 80, 160, 26); x.fill();
        x.globalCompositeOperation = "destination-out";
        x.beginPath(); x.arc(W / 2, 222, 22, 0, Math.PI * 2); x.fill(); x.fillRect(W / 2 - 9, 230, 18, 52);
    });
    return fromPixels(pts, W, H, n, 4.4, 0.5, (u, v) => (v < 0.47 ? 0.95 : 0.25 + rand() * 0.2));
}

export function dataLayers(n) {
    const pos = new Float32Array(n * 3), tone = new Float32Array(n), R = 2.3;
    for (let k = 0; k < n; k++) {
        const layer = k % 3, y = (layer - 1) * 1.15, a = rand() * Math.PI * 2;
        let x, z, yy;
        if (rand() < 0.55) { const r = R * Math.sqrt(rand()); x = Math.cos(a) * r; z = Math.sin(a) * r; yy = y + 0.25; }
        else { x = Math.cos(a) * R; z = Math.sin(a) * R; yy = y + (rand() - 0.5) * 0.5; }
        pos.set([x, yy, z * 0.8], k * 3); tone[k] = layer / 2;
    }
    return { pos, tone };
}

export function shield(n) {
    const W = 300, H = 340, pts = canvasPoints(W, H, x => {
        x.beginPath(); x.moveTo(W / 2, 20); x.lineTo(W - 40, 70); x.bezierCurveTo(W - 40, 200, W - 90, 280, W / 2, 322); x.bezierCurveTo(90, 280, 40, 200, 40, 70); x.closePath(); x.fill();
        x.globalCompositeOperation = "destination-out"; x.lineWidth = 26; x.lineCap = "round"; x.lineJoin = "round";
        x.beginPath(); x.moveTo(100, 172); x.lineTo(138, 212); x.lineTo(206, 132); x.stroke();
    });
    return fromPixels(pts, W, H, n, 4.6, 0.45, (u, v) => 0.3 + v * 0.7);
}

export const CITIES = { home: [26.32, 89.45], hamburg: [53.55, 9.99] };
export function worldMap(n) {
    const proj = (lat, lon) => [(lon - 48) * 0.05, (lat - 33) * 0.05];
    const land = [];
    for (let i = 0; i < LAND.length; i += 2) { const lat = LAND[i], lon = LAND[i + 1]; if (lon >= -12 && lon <= 104 && lat >= -2 && lat <= 64) land.push(proj(lat, lon)); }
    const A = proj(...CITIES.home), B = proj(...CITIES.hamburg), C = [(A[0] + B[0]) / 2, Math.max(A[1], B[1]) + 1.2];
    const pos = new Float32Array(n * 3), tone = new Float32Array(n);
    for (let k = 0; k < n; k++) {
        const r = rand();
        if (r < 0.66) { const p = land[k % land.length]; pos.set([p[0] + (rand() - 0.5) * 0.05, p[1] + (rand() - 0.5) * 0.05, (rand() - 0.5) * 0.15], k * 3); tone[k] = 0.1; }
        else if (r < 0.9) { const u = rand(), v = 1 - u; pos.set([v * v * A[0] + 2 * v * u * C[0] + u * u * B[0] + (rand() - 0.5) * 0.04, v * v * A[1] + 2 * v * u * C[1] + u * u * B[1] + (rand() - 0.5) * 0.04, 0.2], k * 3); tone[k] = 1; }
        else { const P = r < 0.95 ? A : B, a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * 0.22; pos.set([P[0] + Math.cos(a) * d, P[1] + Math.sin(a) * d, 0.25], k * 3); tone[k] = 0.95; }
    }
    return { pos, tone };
}

export function words(n, text, width = 9) {
    const W = 900, H = 220, pts = canvasPoints(W, H, x => {
        x.font = "800 150px 'General Sans', 'Panchang', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, W / 2, H / 2);
    });
    return fromPixels(pts, W, H, n, width, 0.3, u => u);
}

export function ambient(n) {
    const pos = new Float32Array(n * 3), tone = new Float32Array(n);
    for (let k = 0; k < n; k++) {
        const arm = k % 3, r = Math.pow(rand(), 0.6) * 11, a = r * 0.45 + (arm / 3) * Math.PI * 2 + (rand() - 0.5) * 0.6;
        pos.set([Math.cos(a) * r, (rand() - 0.5) * 1.2 + Math.sin(a) * r * 0.32, Math.sin(a) * r * 0.5 - 3], k * 3);
        tone[k] = rand();
    }
    return { pos, tone };
}
