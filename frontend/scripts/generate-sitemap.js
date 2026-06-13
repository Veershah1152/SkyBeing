import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read VITE_API_BASE_URL from .env file or fallback to production
let apiBaseUrl = "https://skybeings-backend.talkwithaman22.workers.dev/api/v1";

try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_API_BASE_URL\s*=\s*(.*)/);
    if (match && match[1]) {
      apiBaseUrl = match[1].trim().replace(/['"]/g, '');
    }
  }
} catch (err) {
  console.warn("Could not read .env file, using default API URL:", err.message);
}

// Get the backend root URL (e.g. https://skybeings-backend.talkwithaman22.workers.dev)
const backendUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

const domain = "https://skybeings.in";
// Only publicly indexable pages — no /cart, /checkout, /login, /wishlist
const staticPages = [
  { path: "",                           priority: "1.0", changefreq: "daily"   },
  { path: "/blogs",                     priority: "0.8", changefreq: "weekly"  },
  { path: "/gallery",                   priority: "0.7", changefreq: "weekly"  },
  { path: "/about",                     priority: "0.6", changefreq: "monthly" },
  { path: "/contact",                   priority: "0.5", changefreq: "monthly" },
  // SEO collection pages
  { path: "/collections/bird-feeders",  priority: "0.9", changefreq: "weekly"  },
  { path: "/collections/water-feeders", priority: "0.9", changefreq: "weekly"  },
  { path: "/collections/bird-houses",   priority: "0.9", changefreq: "weekly"  },
  { path: "/collections/accessories",   priority: "0.8", changefreq: "weekly"  },
  { path: "/collections/best-sellers",  priority: "0.8", changefreq: "weekly"  },
  { path: "/collections/dogs",          priority: "0.8", changefreq: "weekly"  },
  // Policy pages (low priority)
  { path: "/privacy-policy",            priority: "0.3", changefreq: "yearly"  },
  { path: "/return-policy",             priority: "0.3", changefreq: "yearly"  },
  { path: "/shipping-policy",           priority: "0.3", changefreq: "yearly"  },
  { path: "/terms",                     priority: "0.3", changefreq: "yearly"  },
];

async function generateSitemap() {
  console.log(`Generating sitemap using backend URL: ${backendUrl}`);
  
  let products = [];
  let blogs = [];

  // Fetch products
  try {
    const productRes = await fetch(`${backendUrl}/api/v1/products`);
    if (productRes.ok) {
      const json = await productRes.json();
      products = json.data || [];
      console.log(`Fetched ${products.length} products successfully.`);
    } else {
      console.warn(`Failed to fetch products: ${productRes.status} ${productRes.statusText}`);
    }
  } catch (e) {
    console.error("Failed to fetch products for sitemap:", e.message);
  }

  // Fetch blogs
  try {
    const blogRes = await fetch(`${backendUrl}/api/v1/blogs`);
    if (blogRes.ok) {
      const json = await blogRes.json();
      blogs = json.data || [];
      console.log(`Fetched ${blogs.length} blogs successfully.`);
    } else {
      console.warn(`Failed to fetch blogs: ${blogRes.status} ${blogRes.statusText}`);
    }
  } catch (e) {
    console.error("Failed to fetch blogs for sitemap:", e.message);
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

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log(`Sitemap written successfully to: ${sitemapPath}`);
}

generateSitemap().catch(err => {
  console.error("Error generating sitemap:", err);
  process.exit(1);
});
