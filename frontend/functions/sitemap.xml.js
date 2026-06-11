export async function onRequest(context) {
    const { env } = context;
    const backendUrl = env.BACKEND_URL;

    if (!backendUrl) {
        return new Response("BACKEND_URL environment variable is not configured", { status: 500 });
    }

    const domain = "https://skybeings.in";
    const staticPages = [
        "",
        "/shop",
        "/gallery",
        "/blogs",
        "/cart",
        "/checkout",
        "/login",
        "/contact",
        "/wishlist",
        "/privacy-policy",
        "/return-policy",
        "/shipping-policy",
        "/terms",
        "/about",
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
    staticPages.forEach(path => {
        xmlUrls.push(`
  <url>
    <loc>${domain}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${path === "" ? "daily" : "weekly"}</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
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
