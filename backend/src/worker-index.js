import { handleAsNodeRequest } from "cloudflare:node";
import mongoose from "mongoose/lib/index.js";
import { connectDB, disconnectDB } from "./config/db.js";

class Mutex {
    constructor() {
        this.queue = Promise.resolve();
    }
    async runExclusive(fn) {
        let resolveNext;
        const nextPromise = new Promise(r => { resolveNext = r; });
        const currentQueue = this.queue;
        this.queue = nextPromise;

        try {
            await currentQueue;
        } catch (e) {}

        try {
            return await fn();
        } finally {
            resolveNext();
        }
    }
}
const dbMutex = new Mutex();

// Disable command buffering globally immediately on boot!
// This prevents queries from hanging indefinitely if the connection drops.
mongoose.set("bufferCommands", false);

// ---------------------------------------------------------------------------
// Allowed origins
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
    "https://skybeings.in",
    "https://www.skybeings.in",
    "https://skybeing.pages.dev",
    "http://localhost:5173",
    "http://localhost:3000",
];

function syncEnvToProcess(env) {
    for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string" && !process.env[key]) {
            process.env[key] = value;
        }
    }
    process.env.CORS_ORIGIN = ALLOWED_ORIGINS.join(",");
}

// ---------------------------------------------------------------------------
// Express – boot once per isolate
// ---------------------------------------------------------------------------
let appPromise = null;
function getApp(env) {
    if (!appPromise) {
        syncEnvToProcess(env);
        appPromise = import("./app.js")
            .then(m => new Promise((resolve, reject) => {
                const server = m.app.listen(3000, () => {
                    console.log("⚙️ Express listening on port 3000");
                    resolve(m.app);
                });
                server.on("error", err => {
                    if (err.code === "EADDRINUSE") resolve(m.app);
                    else reject(err);
                });
            }))
            .catch(err => {
                console.error("Failed to boot app.js:", err.message);
                appPromise = null;
                throw err;
            });
    }
    return appPromise;
}

// ---------------------------------------------------------------------------
// DB – connect once per isolate, never disconnect
//
// With the no_handle_cross_request_promise_resolution compatibility flag,
// Cloudflare allows the Mongoose connection pool's internal promises to
// resolve across request contexts safely.
// ---------------------------------------------------------------------------
function ensureDb() {
    return connectDB();
}

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------
function getCorsOrigin(origin, env) {
    const corsOriginStr = env.CORS_ORIGIN || "";
    const allowedOrigins = corsOriginStr.split(",").map(o => o.trim()).filter(Boolean);
    if (!origin) return allowedOrigins[0] || "*";
    if (allowedOrigins.includes("*")) return origin;
    return allowedOrigins.includes(origin) ? origin : null;
}

function addCorsHeaders(response, origin, env) {
    const allowed = getCorsOrigin(origin, env);
    if (!allowed) return response;
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", allowed);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
    
    // For 204 No Content and 304 Not Modified, do not pass response.body (it must be empty)
    if (response.status === 204 || response.status === 304) {
        return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function corsErrorResponse(origin, status, message, env) {
    const allowed = getCorsOrigin(origin, env);
    const ch = allowed
        ? { "Access-Control-Allow-Origin": allowed, "Access-Control-Allow-Credentials": "true", "Vary": "Origin" }
        : { "Access-Control-Allow-Origin": "*", "Vary": "Origin" };
    return new Response(JSON.stringify({ success: false, message }), {
        status,
        headers: { "Content-Type": "application/json", ...ch },
    });
}

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------
export default {
    async fetch(request, env, ctx) {
        const origin = request.headers.get("Origin") || "";
        try {
            // Preflight
            if (request.method === "OPTIONS") {
                const allowed = getCorsOrigin(origin, env);
                if (allowed) {
                    return new Response(null, {
                        status: 204,
                        headers: {
                            "Access-Control-Allow-Origin": allowed,
                            "Access-Control-Allow-Credentials": "true",
                            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
                            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With,Cookie",
                            "Access-Control-Max-Age": "86400",
                            "Vary": "Origin",
                        },
                    });
                }
                return new Response("CORS Origin Not Allowed", { status: 400 });
            }

            // Run requests involving database access sequentially to prevent socket sharing issues
            return await dbMutex.runExclusive(async () => {
                // Boot Express
                await getApp(env);

                // Boot DB
                await ensureDb();

                // Forward to Express
                let response;
                try {
                    response = await handleAsNodeRequest(3000, request);
                } catch (err) {
                    console.error("handleAsNodeRequest error:", err.message);
                    return corsErrorResponse(origin, 500, "Internal Server Error", env);
                }

                // Add CORS headers and return
                const finalResponse = addCorsHeaders(response, origin, env);

                // Always disconnect cleanly before releasing the lock
                try {
                    await disconnectDB();
                } catch (disErr) {
                    console.error("[DB] Disconnect error:", disErr.message);
                }

                return finalResponse;
            });
        } catch (outerErr) {
            console.error("Worker outer catch:", outerErr.message);
            return corsErrorResponse(origin, 500, "Server initialization error", env);
        }
    },
};
