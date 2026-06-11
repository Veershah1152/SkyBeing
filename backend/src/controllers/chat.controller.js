import Groq from "groq-sdk";

// ── Lazy Groq client ─────────────────────────────────────────────────────────
// In Cloudflare Workers, process.env is populated by syncEnvToProcess(env)
// which runs AFTER module import. So we must NOT instantiate Groq at the
// module top-level — instead we do it lazily on first request.
let _groq = null;
function getGroqClient() {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is not set");
    if (!_groq) _groq = new Groq({ apiKey: key });
    return _groq;
}

const SYSTEM_PROMPT = `You are Skye 🦜, a cheerful and knowledgeable bird expert assistant for SkyBeings (skybeings.in) — India's premier bird feeder and bird care shop.

Your expertise covers:
- Common Indian garden birds: House Sparrow, Common Myna, Rose-ringed Parakeet, Oriental Magpie-Robin, Sunbirds, Bulbuls, Red-whiskered Bulbul, Common Babbler, Pigeons, Doves, Woodpeckers, Kingfishers, Owls, Kites, and many more
- Bird feeder types: platform feeders, tube feeders, suet feeders, hanging feeders, ground feeders, window feeders
- Bird food: millet, sunflower seeds, peanuts, suet, nectar, fruits, corn, safflower seeds
- Feeding tips: feeder placement, hygiene & cleaning, seasonal feeding patterns, water baths & bird baths
- Bird behavior: nesting habits, migration, calls, mating seasons
- SkyBeings product navigation: direct users to /shop for feeders and food, /blogs for bird articles, /gallery for bird photos, /contact for human support, /about for our story

Communication style:
- Always warm, enthusiastic, and educational
- Keep responses concise (2-4 sentences max) unless the user asks for detail
- Use bird emoji occasionally 🐦🦜🌿 to stay on-brand
- When recommending products, mention they can browse at skybeings.in/shop
- If asked about completely unrelated topics (politics, coding, math, etc.), politely say: "I'm best at bird questions and helping you explore SkyBeings! 🦜 What would you like to know about birds or our products?"
- Never make up product names or prices — always direct to /shop for current listings

You are concise, helpful, and always bring the conversation back to birds or SkyBeings.`;

// Simple in-memory rate limiter per IP (resets on server restart)
const rateLimitMap = new Map();
const RATE_LIMIT = 15; // messages per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, windowStart: now });
        return true;
    }

    if (entry.count >= RATE_LIMIT) {
        return false;
    }

    entry.count++;
    return true;
}

export const sendMessage = async (req, res) => {
    try {
        const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
        if (!checkRateLimit(ip)) {
            return res.status(429).json({
                success: false,
                message: "Too many messages. Please wait a moment before sending again. 🐦",
            });
        }

        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Messages array is required.",
            });
        }

        // Sanitise & cap history to last 20 messages
        const safeMessages = messages
            .slice(-20)
            .filter((m) => m.role && m.content && typeof m.content === "string")
            .map((m) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: String(m.content).slice(0, 2000), // cap per-message length
            }));

        if (safeMessages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid messages provided.",
            });
        }

        const groq = getGroqClient();
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant", // free & fast
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...safeMessages,
            ],
            max_tokens: 400,
            temperature: 0.7,
        });

        const reply = completion.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            throw new Error("Empty response from AI");
        }

        return res.status(200).json({ success: true, reply });
    } catch (err) {
        console.error("[Chat Controller] Error:", err.message);
        return res.status(500).json({
            success: false,
            reply: "Oops! Skye is taking a quick rest 🐦 Please try again in a moment.",
        });
    }
};
