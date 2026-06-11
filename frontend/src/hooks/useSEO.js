import { useEffect } from 'react';

const BASE_URL = 'https://skybeings.in';

/**
 * useSEO — sets per-page <title>, meta description, canonical, and Open Graph tags.
 *
 * @param {object} opts
 * @param {string}  [opts.title]         — page-specific title (appended with " | SkyBeings")
 * @param {string}  [opts.description]   — meta description (≤160 chars recommended)
 * @param {string}  [opts.canonical]     — full canonical URL, e.g. "https://skybeings.in/collections/bird-feeders"
 * @param {string}  [opts.ogImage]       — absolute OG image URL
 * @param {string}  [opts.ogType]        — OG type, default "website"
 */
export default function useSEO({
    title,
    description,
    canonical,
    ogImage = `${BASE_URL}/logo-cropped.png`,
    ogType = 'website',
} = {}) {
    useEffect(() => {
        // ── Title ────────────────────────────────────────────────────────────
        const fullTitle = title
            ? `${title} | SkyBeings`
            : 'Premium Bird Feeders & Houses Online India | SkyBeings';
        document.title = fullTitle;

        // ── Helper: upsert a <meta> tag ───────────────────────────────────────
        const setMeta = (selector, attr, value) => {
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                const [attrName, attrValue] = selector
                    .replace(/[\[\]']/g, '')
                    .split('=');
                el.setAttribute(attrName, attrValue);
                document.head.appendChild(el);
            }
            el.setAttribute(attr, value);
        };

        // ── Helper: upsert a <link> tag ───────────────────────────────────────
        const setLink = (rel, href) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.rel = rel;
                document.head.appendChild(el);
            }
            el.href = href;
        };

        // ── Meta Description ────────────────────────────────────────────────
        const desc = description ||
            'Shop premium, all-weather bird feeders, water feeders, and bird houses at SkyBeings. Bring nature to your window with durable balcony and garden bird accessories.';
        setMeta('meta[name="description"]', 'content', desc);

        // ── Canonical ───────────────────────────────────────────────────────
        const canonicalHref = canonical || `${BASE_URL}${window.location.pathname}`;
        setLink('canonical', canonicalHref);

        // ── Open Graph ──────────────────────────────────────────────────────
        setMeta('meta[property="og:title"]', 'content', fullTitle);
        setMeta('meta[property="og:description"]', 'content', desc);
        setMeta('meta[property="og:url"]', 'content', canonicalHref);
        setMeta('meta[property="og:image"]', 'content', ogImage);
        setMeta('meta[property="og:type"]', 'content', ogType);

        // ── Twitter Card ────────────────────────────────────────────────────
        setMeta('meta[name="twitter:title"]', 'content', fullTitle);
        setMeta('meta[name="twitter:description"]', 'content', desc);
        setMeta('meta[name="twitter:image"]', 'content', ogImage);
    }, [title, description, canonical, ogImage, ogType]);
}
