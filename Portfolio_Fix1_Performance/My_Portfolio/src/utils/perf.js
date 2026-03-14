// ── DEVICE PERFORMANCE TIER ──────────────────────────────────────────
// Returns "low" | "mid" | "high"
// Used to throttle canvas animations and reduce particle counts

export function getDeviceTier() {
    // Mobile → always low
    if (window.matchMedia("(hover: none)").matches) return "low";

    // Hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;

    // Memory (GB) — Chrome/Edge only, undefined elsewhere
    const mem = navigator.deviceMemory || 4;

    // GPU check via canvas
    try {
        const gl = document.createElement("canvas").getContext("webgl");
        if (gl) {
            const dbg = gl.getExtension("WEBGL_debug_renderer_info");
            if (dbg) {
                const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL).toLowerCase();
                // Known weak GPUs
                if (/intel hd|intel uhd 620|mali-4|mali-t|adreno [23]/i.test(renderer)) return "low";
                // Known strong GPUs
                if (/nvidia|radeon rx|apple m[23]/i.test(renderer)) return "high";
            }
        }
    } catch (_) { /* ignore */ }

    if (cores <= 2 || mem <= 2) return "low";
    if (cores <= 4 || mem <= 4) return "mid";
    return "high";
}

// Canvas config by tier
export const CANVAS_CONFIG = {
    low: {
        nodes: 25,
        globePoints: 60,
        particles: 80,
        maxRipples: 4,
        targetFPS: 30,
        enableGlobe: false,
        enableParticles: false,
        enableRipples: false,
    },
    mid: {
        nodes: 40,
        globePoints: 120,
        particles: 150,
        maxRipples: 8,
        targetFPS: 45,
        enableGlobe: true,
        enableParticles: true,
        enableRipples: true,
    },
    high: {
        nodes: 55,
        globePoints: 180,
        particles: 300,
        maxRipples: 12,
        targetFPS: 60,
        enableGlobe: true,
        enableParticles: true,
        enableRipples: true,
    },
};
