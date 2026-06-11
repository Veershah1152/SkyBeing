/**
 * Cloudflare Pages Function — API Proxy
 *
 * All requests to /api/* on your Pages site are forwarded
 * to your Render backend. This means:
 *  - No CORS issues (same origin)
 *  - Frontend calls /api/v1/... just like local dev
 *  - Backend stays untouched on Render
 *
 * Set BACKEND_URL in Pages → Settings → Environment Variables:
 *   BACKEND_URL = https://skybeings-backend.onrender.com
 */

export async function onRequest(context) {
    const { request, env, params } = context;

    // env.BACKEND_URL is set in Cloudflare Pages dashboard
    const backendUrl = env.BACKEND_URL;

    if (!backendUrl) {
        return new Response(
            JSON.stringify({ success: false, message: "BACKEND_URL not configured in Pages env vars" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    // Build the upstream URL: strip the Pages origin, keep full path + query
    const url = new URL(request.url);
    const upstream = new URL(url.pathname + url.search, backendUrl);

    // Forward all headers, but fix the Host header to match the backend
    const headers = new Headers(request.headers);
    headers.set("Host", new URL(backendUrl).host);
    // Pass the real client IP to backend (for rate limiting / stats)
    headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP") || "");
    headers.set("X-Real-IP", request.headers.get("CF-Connecting-IP") || "");

    // Clone the request to the backend
    const upstreamRequest = new Request(upstream.toString(), {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
        redirect: "follow",
    });

    try {
        const response = await fetch(upstreamRequest);

        // Rebuild response — forward all headers from backend
        const responseHeaders = new Headers(response.headers);

        // Allow cookies to be set cross-origin
        responseHeaders.set("Access-Control-Allow-Origin", url.origin);
        responseHeaders.set("Access-Control-Allow-Credentials", "true");
        responseHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type,Authorization,Cookie");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ success: false, message: "Backend unreachable", error: err.message }),
            { status: 502, headers: { "Content-Type": "application/json" } }
        );
    }
}

// Handle OPTIONS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization,Cookie",
            "Access-Control-Max-Age": "86400",
        },
    });
}
