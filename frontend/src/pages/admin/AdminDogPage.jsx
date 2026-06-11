import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, RefreshCw, Eye, EyeOff, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/ui/Toast';

// ── Available icons for feature cards ────────────────────────────────────────
const ICON_OPTIONS = ['Shield', 'Award', 'Truck', 'Zap', 'Heart', 'Star'];

// ── Collapsible Section Wrapper ───────────────────────────────────────────────
const Section = ({ title, emoji, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="flex items-center gap-2 font-bold text-gray-800 text-base">
                    <span>{emoji}</span> {title}
                </span>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {open && <div className="px-6 pb-6 pt-2 border-t border-gray-50">{children}</div>}
        </div>
    );
};

// ── Input helper ──────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, textarea = false }) => (
    <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        {textarea ? (
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A] focus:ring-1 focus:ring-[#C2692A] resize-none"
            />
        ) : (
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A] focus:ring-1 focus:ring-[#C2692A]"
            />
        )}
    </div>
);

// ── AdminDogPage Component ────────────────────────────────────────────────────
const AdminDogPage = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ── Config state ──────────────────────────────────────────────────────────
    const [hero, setHero] = useState({
        badge: '', title: '', titleHighlight: '', subtitle: '',
        ctaPrimaryText: '', ctaPrimaryLink: '',
        ctaSecondaryText: '', ctaSecondaryLink: '',
        stat1: '', stat2: '',
    });

    const [categories, setCategories] = useState([]);
    const [features, setFeatures] = useState([]);
    const [cta, setCta] = useState({ emoji: '', title: '', subtitle: '', buttonText: '', buttonLink: '' });
    const [homeSection, setHomeSection] = useState({
        enabled: true, badge: '', title: '', titleHighlight: '', titleSuffix: '',
        subtitle: '', ctaText: '', ctaLink: '', chips: [], cards: [],
    });

    // ── Fetch on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        api.get('/dog-page')
            .then(res => {
                const d = res.data?.data;
                if (!d) return;
                if (d.hero) setHero(d.hero);
                if (d.categories) setCategories(d.categories);
                if (d.features) setFeatures(d.features);
                if (d.cta) setCta(d.cta);
                if (d.homeSection) setHomeSection({
                    ...d.homeSection,
                    chips: d.homeSection.chips || [],
                    cards: d.homeSection.cards || [],
                });
            })
            .catch(() => toast.error('Failed to load dog page config'))
            .finally(() => setLoading(false));
    }, []);

    // ── Save all ──────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/dog-page', { hero, categories, features, cta, homeSection });
            toast.success('Dog page saved successfully!');
        } catch {
            toast.error('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Category helpers ──────────────────────────────────────────────────────
    const addCategory = () => setCategories(c => [...c, { emoji: '🐾', label: 'New Category', desc: '', slug: 'dogs', order: c.length }]);
    const removeCategory = i => setCategories(c => c.filter((_, idx) => idx !== i));
    const updateCategory = (i, field, val) => setCategories(c => c.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
    const moveCat = (i, dir) => {
        setCategories(c => {
            const arr = [...c];
            const j = i + dir;
            if (j < 0 || j >= arr.length) return arr;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            return arr.map((item, idx) => ({ ...item, order: idx }));
        });
    };

    // ── Feature helpers ───────────────────────────────────────────────────────
    const addFeature = () => setFeatures(f => [...f, { iconName: 'Shield', title: 'New Feature', desc: '' }]);
    const removeFeature = i => setFeatures(f => f.filter((_, idx) => idx !== i));
    const updateFeature = (i, field, val) => setFeatures(f => f.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

    // ── Home section chip / card helpers ─────────────────────────────────────
    const addChip = () => setHomeSection(h => ({ ...h, chips: [...h.chips, 'New Tag'] }));
    const removeChip = i => setHomeSection(h => ({ ...h, chips: h.chips.filter((_, idx) => idx !== i) }));
    const updateChip = (i, val) => setHomeSection(h => ({ ...h, chips: h.chips.map((c, idx) => idx === i ? val : c) }));

    const addCard = () => setHomeSection(h => ({ ...h, cards: [...h.cards, { emoji: '🐾', label: 'New Card', desc: '' }] }));
    const removeCard = i => setHomeSection(h => ({ ...h, cards: h.cards.filter((_, idx) => idx !== i) }));
    const updateCard = (i, field, val) => setHomeSection(h => ({ ...h, cards: h.cards.map((c, idx) => idx === i ? { ...c, [field]: val } : c) }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#C2692A] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading dog page config…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto admin-page-enter">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">🐾 Dog Page Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Customize every section of the /dogs landing page and the homepage teaser.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/dogs" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                        <Eye className="w-4 h-4" /> Preview
                    </a>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 font-bold text-white rounded-lg text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #C2692A, #A0521F)' }}>
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
            <Section title="Hero Section" emoji="🦸" defaultOpen>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <Field label="Badge Text" value={hero.badge} onChange={v => setHero(h => ({ ...h, badge: v }))} placeholder="🐕 New — Dog Collection" />
                    <Field label="Title Line 1" value={hero.title} onChange={v => setHero(h => ({ ...h, title: v }))} placeholder="The Best for" />
                    <Field label="Highlighted Title (orange)" value={hero.titleHighlight} onChange={v => setHero(h => ({ ...h, titleHighlight: v }))} placeholder="Your Best Friend" />
                    <div className="sm:col-span-2">
                        <Field label="Subtitle" value={hero.subtitle} onChange={v => setHero(h => ({ ...h, subtitle: v }))} placeholder="Premium dog essentials…" textarea />
                    </div>
                    <Field label="Primary Button Text" value={hero.ctaPrimaryText} onChange={v => setHero(h => ({ ...h, ctaPrimaryText: v }))} placeholder="Shop Dog Products" />
                    <Field label="Primary Button Link" value={hero.ctaPrimaryLink} onChange={v => setHero(h => ({ ...h, ctaPrimaryLink: v }))} placeholder="/collections/dogs" />
                    <Field label="Secondary Button Text" value={hero.ctaSecondaryText} onChange={v => setHero(h => ({ ...h, ctaSecondaryText: v }))} placeholder="Browse All Products" />
                    <Field label="Secondary Button Link" value={hero.ctaSecondaryLink} onChange={v => setHero(h => ({ ...h, ctaSecondaryLink: v }))} placeholder="/shop" />
                    <Field label="Stat 1 (e.g. Free Shipping)" value={hero.stat1} onChange={v => setHero(h => ({ ...h, stat1: v }))} placeholder="Free Shipping ₹499+" />
                    <Field label="Stat 2" value={hero.stat2} onChange={v => setHero(h => ({ ...h, stat2: v }))} placeholder="Easy Returns" />
                </div>
            </Section>

            {/* ── CATEGORY CARDS ───────────────────────────────────────────────── */}
            <Section title="Category Cards" emoji="🗂️" defaultOpen>
                <p className="text-xs text-gray-400 mb-4">These appear as the 6-card grid on the /dogs page. Use arrows to reorder.</p>
                <div className="space-y-3">
                    {categories.map((cat, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex flex-col gap-1 mt-1">
                                <button onClick={() => moveCat(i, -1)} disabled={i === 0} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                                <button onClick={() => moveCat(i, 1)} disabled={i === categories.length - 1} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Emoji</label>
                                    <input value={cat.emoji} onChange={e => updateCategory(i, 'emoji', e.target.value)}
                                        className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#C2692A]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Label</label>
                                    <input value={cat.label} onChange={e => updateCategory(i, 'label', e.target.value)}
                                        className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Description</label>
                                    <input value={cat.desc} onChange={e => updateCategory(i, 'desc', e.target.value)}
                                        className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Link Slug</label>
                                    <input value={cat.slug} onChange={e => updateCategory(i, 'slug', e.target.value)}
                                        placeholder="dogs"
                                        className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A]" />
                                </div>
                            </div>
                            <button onClick={() => removeCategory(i)} className="mt-1 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={addCategory}
                    className="mt-4 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-dashed transition-all"
                    style={{ borderColor: '#C2692A50', color: '#C2692A' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#C2692A10'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </Section>

            {/* ── WHY FEATURES ─────────────────────────────────────────────────── */}
            <Section title="Why SkyBeings Features" emoji="✨">
                <p className="text-xs text-gray-400 mb-4">Shown in the dark brown section at the bottom of /dogs page.</p>
                <div className="space-y-3">
                    {features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex flex-col gap-3 flex-1">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Icon</label>
                                        <select value={feat.iconName} onChange={e => updateFeature(i, 'iconName', e.target.value)}
                                            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A] bg-white">
                                            {ICON_OPTIONS.map(ico => <option key={ico} value={ico}>{ico}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Title</label>
                                        <input value={feat.title} onChange={e => updateFeature(i, 'title', e.target.value)}
                                            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A]" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Description</label>
                                        <input value={feat.desc} onChange={e => updateFeature(i, 'desc', e.target.value)}
                                            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A]" />
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => removeFeature(i)} className="mt-1 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={addFeature}
                    className="mt-4 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-dashed transition-all"
                    style={{ borderColor: '#C2692A50', color: '#C2692A' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#C2692A10'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
                    <Plus className="w-4 h-4" /> Add Feature
                </button>
            </Section>

            {/* ── CTA STRIP ────────────────────────────────────────────────────── */}
            <Section title="Bottom CTA Strip" emoji="📣">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <Field label="Emoji" value={cta.emoji} onChange={v => setCta(c => ({ ...c, emoji: v }))} placeholder="🐕" />
                    <Field label="Title" value={cta.title} onChange={v => setCta(c => ({ ...c, title: v }))} placeholder="Ready to Spoil Your Dog?" />
                    <div className="sm:col-span-2">
                        <Field label="Subtitle" value={cta.subtitle} onChange={v => setCta(c => ({ ...c, subtitle: v }))} placeholder="Browse our full collection…" textarea />
                    </div>
                    <Field label="Button Text" value={cta.buttonText} onChange={v => setCta(c => ({ ...c, buttonText: v }))} placeholder="Browse All Dog Products" />
                    <Field label="Button Link" value={cta.buttonLink} onChange={v => setCta(c => ({ ...c, buttonLink: v }))} placeholder="/collections/dogs" />
                </div>
            </Section>

            {/* ── HOME PAGE TEASER ──────────────────────────────────────────────── */}
            <Section title="Homepage Dog Section" emoji="🏠">
                <div className="flex items-center gap-3 mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <button
                        onClick={() => setHomeSection(h => ({ ...h, enabled: !h.enabled }))}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${homeSection.enabled ? 'bg-[#C2692A]' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${homeSection.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                    <div>
                        <p className="text-sm font-bold text-gray-800">{homeSection.enabled ? 'Section is Visible' : 'Section is Hidden'}</p>
                        <p className="text-xs text-gray-500">Toggle to show/hide the dog section on the homepage</p>
                    </div>
                    {homeSection.enabled ? <Eye className="w-4 h-4 text-[#C2692A] ml-auto" /> : <EyeOff className="w-4 h-4 text-gray-400 ml-auto" />}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <Field label="Badge Text" value={homeSection.badge} onChange={v => setHomeSection(h => ({ ...h, badge: v }))} placeholder="🐕 New — Dog Collection" />
                    <Field label="Title" value={homeSection.title} onChange={v => setHomeSection(h => ({ ...h, title: v }))} placeholder="Everything Your" />
                    <Field label="Highlighted Word (orange)" value={homeSection.titleHighlight} onChange={v => setHomeSection(h => ({ ...h, titleHighlight: v }))} placeholder="Best Friend" />
                    <Field label="Title Suffix" value={homeSection.titleSuffix} onChange={v => setHomeSection(h => ({ ...h, titleSuffix: v }))} placeholder="Needs" />
                    <div className="sm:col-span-2">
                        <Field label="Subtitle" value={homeSection.subtitle} onChange={v => setHomeSection(h => ({ ...h, subtitle: v }))} placeholder="From nutritious treats…" textarea />
                    </div>
                    <Field label="CTA Button Text" value={homeSection.ctaText} onChange={v => setHomeSection(h => ({ ...h, ctaText: v }))} placeholder="Shop Dog Products" />
                    <Field label="CTA Button Link" value={homeSection.ctaLink} onChange={v => setHomeSection(h => ({ ...h, ctaLink: v }))} placeholder="/dogs" />
                </div>

                {/* Chips */}
                <div className="mt-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Filter Chips (tags shown below headline)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {homeSection.chips.map((chip, i) => (
                            <div key={i} className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-1">
                                <input value={chip} onChange={e => updateChip(i, e.target.value)}
                                    className="text-xs font-semibold text-amber-700 bg-transparent focus:outline-none w-24" />
                                <button onClick={() => removeChip(i)} className="text-red-400 hover:text-red-600">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <button onClick={addChip}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border border-dashed"
                            style={{ borderColor: '#C2692A50', color: '#C2692A' }}>
                            <Plus className="w-3 h-3" /> Add Chip
                        </button>
                    </div>
                </div>

                {/* Cards */}
                <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Icon Cards (2×2 grid on the right)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {homeSection.cards.map((card, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <input value={card.emoji} onChange={e => updateCard(i, 'emoji', e.target.value)}
                                    className="w-12 text-center px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C2692A]" />
                                <div className="flex-1 flex flex-col gap-1">
                                    <input value={card.label} onChange={e => updateCard(i, 'label', e.target.value)}
                                        placeholder="Label" className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#C2692A]" />
                                    <input value={card.desc} onChange={e => updateCard(i, 'desc', e.target.value)}
                                        placeholder="Description" className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#C2692A]" />
                                </div>
                                <button onClick={() => removeCard(i)} className="text-red-400 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addCard}
                        className="mt-3 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-dashed transition-all"
                        style={{ borderColor: '#C2692A50', color: '#C2692A' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#C2692A10'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
                        <Plus className="w-4 h-4" /> Add Card
                    </button>
                </div>
            </Section>

            {/* Sticky save bar */}
            <div className="sticky bottom-0 mt-4 py-4 bg-white/90 backdrop-blur border-t border-gray-100 flex justify-end">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 font-bold text-white rounded-xl text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #C2692A, #A0521F)' }}>
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
};

export default AdminDogPage;
