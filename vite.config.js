import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/*
 * Dev only: serve the Vercel functions in api/*.js from `vite dev`, so the AI features
 * (chat, Break my AI, contact) work on localhost exactly as in production.
 * Keys come from .env / .env.local (e.g. GROQ_API_KEY) and never reach the browser bundle.
 */
function vercelApi() {
    return {
        name: "vercel-api-dev",
        configureServer(server) {
            const env = loadEnv(server.config.mode, process.cwd(), "");
            for (const [k, v] of Object.entries(env)) if (!(k in process.env)) process.env[k] = v;
            server.middlewares.use("/api", async (req, res, next) => {
                const name = (req.url || "").split("?")[0].replace(/^\/+|\/+$/g, "");
                if (!/^[a-z][a-z0-9-]*$/.test(name)) return next(); // never _private helpers
                let mod;
                try { mod = await server.ssrLoadModule(`/api/${name}.js`); } catch { return next(); }
                let raw = ""; for await (const c of req) raw += c;
                try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
                res.status = code => { res.statusCode = code; return res; };
                res.json = obj => { if (!res.headersSent) res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); return res; };
                try { await mod.default(req, res); } catch (e) { console.error(`api/${name}:`, e); if (!res.headersSent) res.status(500).json({ error: "Server error" }); }
            });
        },
    };
}

export default defineConfig({
    plugins: [react(), vercelApi()],
});
