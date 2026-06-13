/**
 * Cloudflare Pages Middleware — SEO Meta Injector
 *
 * This runs on EVERY request BEFORE the SPA is served.
 * For crawler bots (Googlebot, Bingbot) and social crawlers,
 * it injects server-side meta tags into the HTML shell so the
 * page is never a "Soft 404" — content is visible without JS.
 *
 * For regular users, React's useSEO hook takes over after hydration.
 */

const DOMAIN = "https://skybeings.in";

// Per-route SEO metadata
const ROUTE_META = {
    "/": {
        title: "Premium Bird Feeders & Houses Online India | SkyBeings",
        description:
            "Shop premium, all-weather bird feeders, water feeders, and bird houses at SkyBeings. Bring nature to your window with durable balcony and garden bird accessories.",
        canonical: "https://skybeings.in/",
    },
    "/shop": {
        title: "Shop Premium Bird Supplies | SkyBeings",
        description:
            "Browse our catalog of custom-designed bird feeders, durable handcrafted bird houses, and fresh water feeders. Provide premium comfort to local wild birds.",
        canonical: "https://skybeings.in/collections/bird-feeders",
    },
    "/gallery": {
        title: "Bird Gallery — SkyBeings",
        description:
            "See stunning photos of birds visiting SkyBeings feeders and bird houses across India. Get inspired to bring nature closer to your home.",
        canonical: "https://skybeings.in/gallery",
    },
    "/blogs": {
        title: "Bird Care Blog & Tips | SkyBeings",
        description:
            "Read expert tips on attracting birds to your garden, choosing the right bird feeder, and creating a bird-friendly balcony. Bird care guides by SkyBeings.",
        canonical: "https://skybeings.in/blogs",
    },
    "/about": {
        title: "About SkyBeings — Our Story",
        description:
            "Learn about SkyBeings, India's leading brand for premium bird feeders and bird houses. Discover our mission to bring nature closer to every Indian home.",
        canonical: "https://skybeings.in/about",
    },
    "/contact": {
        title: "Contact SkyBeings",
        description:
            "Get in touch with SkyBeings for product inquiries, bulk orders, or support. We are happy to help bird lovers across India.",
        canonical: "https://skybeings.in/contact",
    },
    "/privacy-policy": {
        title: "Privacy Policy | SkyBeings",
        description: "Read SkyBeings privacy policy to understand how we collect, use and protect your personal data.",
        canonical: "https://skybeings.in/privacy-policy",
    },
    "/return-policy": {
        title: "Return & Refund Policy | SkyBeings",
        description: "Understand SkyBeings easy returns and refund process for bird feeders and accessories.",
        canonical: "https://skybeings.in/return-policy",
    },
    "/shipping-policy": {
        title: "Shipping Policy | SkyBeings",
        description: "Learn about SkyBeings shipping timelines, delivery partners, and free shipping thresholds across India.",
        canonical: "https://skybeings.in/shipping-policy",
    },
    "/terms": {
        title: "Terms & Conditions | SkyBeings",
        description: "Read the terms and conditions governing your use of the SkyBeings website and purchase of products.",
        canonical: "https://skybeings.in/terms",
    },
    // Collection pages
    "/collections/bird-feeders": {
        title: "Buy Bird Feeders Online India | SkyBeings",
        description:
            "Shop premium window and hanging bird feeders at SkyBeings. Weatherproof, easy-to-clean, 6-port designs with comfortable perches — perfect for balcony and garden use.",
        canonical: "https://skybeings.in/collections/bird-feeders",
    },
    "/collections/water-feeders": {
        title: "Buy Water Feeders for Birds Online India | SkyBeings",
        description:
            "Keep birds hydrated with SkyBeings water feeders. BPA-free, durable designs ideal for balcony, terrace, and garden setups.",
        canonical: "https://skybeings.in/collections/water-feeders",
    },
    "/collections/bird-houses": {
        title: "Buy Bird Houses Online India | SkyBeings",
        description:
            "Give birds a safe nesting home with SkyBeings handcrafted bird houses. Weatherproof, spacious, and designed for Indian garden birds.",
        canonical: "https://skybeings.in/collections/bird-houses",
    },
    "/collections/accessories": {
        title: "Bird Accessories & Supplies Online India | SkyBeings",
        description:
            "Browse SkyBeings bird accessories — hanging hooks, cleaning brushes, replacement ports and more.",
        canonical: "https://skybeings.in/collections/accessories",
    },
    "/collections/best-sellers": {
        title: "Best Selling Bird Feeders & Accessories India | SkyBeings",
        description:
            "Discover our top-rated, best-selling bird feeders, water feeders and bird houses at SkyBeings.",
        canonical: "https://skybeings.in/collections/best-sellers",
    },
    "/collections/dogs": {
        title: "Buy Premium Dog Products Online India — SkyBeings",
        description:
            "Shop dog food, toys, grooming supplies, collars, leashes, beds and health products at SkyBeings. Premium dog essentials delivered across India with fast shipping.",
        canonical: "https://skybeings.in/collections/dogs",
    },
};

// Routes that should NOT be indexed (no-index)
const NO_INDEX_ROUTES = new Set(["/login", "/cart", "/checkout", "/wishlist", "/admin"]);

function buildMetaHtml(meta, noIndex = false) {
    const robotsContent = noIndex ? "noindex, nofollow" : "index, follow";
    return `
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  <link rel="canonical" href="${escapeHtml(meta.canonical)}" />
  <meta name="robots" content="${robotsContent}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:url" content="${escapeHtml(meta.canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="${DOMAIN}/logo-cropped.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${DOMAIN}/logo-cropped.png" />`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Only process HTML page requests (not API, assets, etc.)
    const isPageRequest =
        !pathname.startsWith("/api/") &&
        !pathname.startsWith("/_") &&
        !pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|webp|xml|txt|json)$/);

    if (!isPageRequest) {
        return next();
    }

    // Get the SPA HTML from the next handler
    const response = await next();

    // Only process HTML responses
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("text/html")) {
        return response;
    }

    let html = await response.text();

    // Determine if this route should be no-indexed
    const isNoIndex = [...NO_INDEX_ROUTES].some((r) => pathname === r || pathname.startsWith(r + "/"));

    // Resolve metadata for this route
    let meta = ROUTE_META[pathname];

    // Handle /product/:id routes
    if (!meta && pathname.startsWith("/product/")) {
        const productId = pathname.split("/product/")[1];
        // Fallback meta for product pages (JS will update after hydration)
        meta = {
            title: "Buy Bird Feeder & Accessories Online India | SkyBeings",
            description:
                "Shop premium bird feeders, bird houses and water feeders at SkyBeings. Fast delivery across India.",
            canonical: `${DOMAIN}${pathname}`,
        };
    }

    // Handle /blogs/:slug routes
    if (!meta && pathname.startsWith("/blogs/")) {
        meta = {
            title: "Bird Care Blog | SkyBeings",
            description:
                "Read expert bird care tips and guides at SkyBeings. Learn how to attract and care for birds in your garden.",
            canonical: `${DOMAIN}${pathname}`,
        };
    }

    // Default meta (home page fallback)
    if (!meta) {
        meta = ROUTE_META["/"];
    }

    // Inject server-side meta tags — replace the placeholder <title> in index.html
    // We inject right before </head> so our tags appear early
    const metaHtml = buildMetaHtml(meta, isNoIndex);
    html = html.replace("</head>", `${metaHtml}\n</head>`);

    // Remove the static hardcoded canonical/title/description from index.html
    // (they will be replaced by our dynamically injected ones above)
    // We keep the existing <title> tag removal to avoid duplicates:
    html = html.replace(
        /<title>.*?<\/title>/s,
        `<!-- title set by middleware -->`
    );
    // Remove static canonical
    html = html.replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<!-- canonical set by middleware -->`
    );

    return new Response(html, {
        status: response.status,
        headers: response.headers,
    });
}
