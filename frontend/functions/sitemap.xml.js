export async function onRequest(context) {
    const { env } = context;
    const backendUrl = env.BACKEND_URL;

    if (!backendUrl) {
        return new Response("BACKEND_URL environment variable is not configured", { status: 500 });
    }

    const domain = "https://skybeings.in";
    // Only include publicly indexable pages — no /cart, /checkout, /login, /wishlist
    // IMPORTANT: Every <loc> must match the canonical URL exactly.
    // /shop 301-redirects to /collections/bird-feeders, so we list the canonical directly.
    const staticPages = [
        { path: "",                              priority: "1.0", changefreq: "daily"   },
        { path: "/shop",                         priority: "0.9", changefreq: "weekly"  },
        { path: "/blogs",                        priority: "0.8", changefreq: "weekly"  },
        { path: "/gallery",                      priority: "0.7", changefreq: "weekly"  },
        { path: "/about",                        priority: "0.6", changefreq: "monthly" },
        { path: "/contact",                      priority: "0.5", changefreq: "monthly" },
        // Canonical collection pages (directly — NOT via /shop redirect)
        { path: "/collections/bird-feeders",    priority: "0.9", changefreq: "weekly"  },
        { path: "/collections/water-feeders",   priority: "0.9", changefreq: "weekly"  },
        { path: "/collections/bird-houses",     priority: "0.9", changefreq: "weekly"  },
        { path: "/collections/accessories",     priority: "0.8", changefreq: "weekly"  },
        { path: "/collections/best-sellers",    priority: "0.8", changefreq: "weekly"  },
        { path: "/collections/dogs",            priority: "0.7", changefreq: "weekly"  },
        // Policy pages (low priority)
        { path: "/privacy-policy",              priority: "0.3", changefreq: "yearly"  },
        { path: "/return-policy",               priority: "0.3", changefreq: "yearly"  },
        { path: "/shipping-policy",             priority: "0.3", changefreq: "yearly"  },
        { path: "/terms",                       priority: "0.3", changefreq: "yearly"  },
    ];

    let products = [];
    let blogs = [];

    // Fetch products in parallel with blogs
    try {
        const productRes = await fetch(`${backendUrl}/api/v1/products`);
        if (productRes.ok) {
            const json = await productRes.json();
            products = json.data || [];
        }
    } catch (e) {
        console.error("Failed to fetch products for sitemap:", e);
    }

    try {
        const blogRes = await fetch(`${backendUrl}/api/v1/blogs`);
        if (blogRes.ok) {
            const json = await blogRes.json();
            blogs = json.data || [];
        }
    } catch (e) {
        console.error("Failed to fetch blogs for sitemap:", e);
    }

    const xmlUrls = [];
    const now = new Date().toISOString().split('T')[0];

    // 1. Static Pages
    staticPages.forEach(({ path, priority, changefreq }) => {
        xmlUrls.push(`
  <url>
    <loc>${domain}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
    });

    // 2. Dynamic Products
    products.forEach(p => {
        if (p._id) {
            const updated = p.updatedAt ? p.updatedAt.split('T')[0] : now;
            xmlUrls.push(`
  <url>
    <loc>${domain}/product/${p._id}</loc>
    <lastmod>${updated}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
        }
    });

    // 3. Dynamic Blogs
    blogs.forEach(b => {
        if (b.slug) {
            const updated = b.updatedAt ? b.updatedAt.split('T')[0] : now;
            xmlUrls.push(`
  <url>
    <loc>${domain}/blogs/${b.slug}</loc>
    <lastmod>${updated}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
        }
    });

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls.join('')}
</urlset>`;

    return new Response(sitemapXml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        },
    });
}
