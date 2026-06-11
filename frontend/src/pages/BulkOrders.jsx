import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Globe, Gift, CheckCircle, MessageCircle, Phone, Mail, ChevronRight } from 'lucide-react';
import useSEO from '../hooks/useSEO';

const WHATSAPP_NUMBER = '918329245729';

const USE_CASES = [
    {
        icon: <Package className="w-8 h-8 text-[#0E7A0D]" />,
        title: 'Bulk Supply',
        subtitle: 'NGOs · Pet Stores · Nurseries',
        description:
            'Order 10+ units of any feeder, water dispenser or bird house at wholesale pricing. Ideal for bird-care NGOs, garden nurseries, and pet supply retailers across India.',
        badge: 'From 10 units',
    },
    {
        icon: <Gift className="w-8 h-8 text-[#0E7A0D]" />,
        title: 'Corporate Gifting',
        subtitle: 'Offices · Events · Sustainability Drives',
        description:
            'Surprise your employees or clients with a thoughtful, eco-friendly gift that connects them with nature. Custom branding and bulk packaging available on request.',
        badge: 'Custom branding',
    },
    {
        icon: <Globe className="w-8 h-8 text-[#0E7A0D]" />,
        title: 'Export / International',
        subtitle: 'Global Distributors · Importers',
        description:
            'We manufacture premium metal and plastic bird-feeding components and can fulfill international purchase orders. Reach out for pricing, MOQ, and shipping details.',
        badge: 'Export ready',
    },
];

const PRODUCT_OPTIONS = [
    'Bird Feeders (Hanging)',
    'Bird Feeders (Window)',
    'Water Feeders',
    'Bird Houses',
    'Accessories',
    'Assorted / Mixed Pack',
    'Custom Product Request',
];

const TRUST_POINTS = [
    'Manufactured in India — Nashik, Maharashtra',
    'MOQ as low as 10 units per SKU',
    'Custom packaging & branding available',
    'Pan-India + International shipping',
    'Dedicated account manager assigned',
    'Response within 24 business hours',
];

const BulkOrders = () => {
    useSEO({
        title: 'Bulk Orders & Corporate Gifting | SkyBeings Bird Feeders',
        description:
            'Order SkyBeings bird feeders in bulk for NGOs, corporate gifting, nurseries, or international export. Custom branding, wholesale pricing, pan-India & global shipping available.',
    });

    const [form, setForm] = useState({
        name: '',
        company: '',
        phone: '',
        email: '',
        product: PRODUCT_OPTIONS[0],
        quantity: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const buildWhatsAppMessage = () => {
        return `Hi SkyBeings! 🤝 I'm interested in a Bulk / B2B Order.

*Name:* ${form.name}
*Company:* ${form.company || 'N/A'}
*Phone:* ${form.phone}
*Email:* ${form.email}
*Product Interest:* ${form.product}
*Quantity Required:* ${form.quantity}
*Message:* ${form.message || 'Please share pricing and availability.'}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setSubmitted(true);
    };

    return (
        <div className="bg-white min-h-screen">

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-[#0E7A0D] via-[#1a9918] to-[#25c423] text-white py-20 px-4 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center justify-center gap-2 text-white/70 text-sm mb-8">
                        <Link to="/" className="hover:text-white transition">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white font-medium">Bulk Orders</span>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        🤝 For Businesses, NGOs & International Buyers
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        SkyBeings<br />
                        <span className="text-yellow-300">for Business</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed mb-10">
                        Wholesale pricing, custom branding, and dedicated support — for bulk buyers, corporate gifters, NGOs, and international distributors.
                    </p>
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi SkyBeings! I\'m interested in a bulk/B2B order. Can you share more details?')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                    >
                        <MessageCircle className="w-6 h-6 fill-white" />
                        Chat on WhatsApp
                    </a>
                </div>
            </section>

            {/* ── Use Cases ─────────────────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who We Work With</h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">Whether you're buying 10 units or 10,000, we have a solution tailored for you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {USE_CASES.map((uc) => (
                        <div
                            key={uc.title}
                            className="border border-gray-100 rounded-2xl p-8 hover:border-[#0E7A0D]/30 hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 bg-[#F0FBF0] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0E7A0D]/10 transition-colors">
                                {uc.icon}
                            </div>
                            <span className="inline-block bg-[#0E7A0D]/10 text-[#0E7A0D] text-xs font-bold px-3 py-1 rounded-full mb-4">
                                {uc.badge}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{uc.title}</h3>
                            <p className="text-sm text-[#0E7A0D] font-semibold mb-4">{uc.subtitle}</p>
                            <p className="text-gray-500 text-sm leading-relaxed">{uc.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Trust Signals ─────────────────────────────────────────────── */}
            <section className="bg-[#F9F9F7] py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Choose SkyBeings for B2B?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {TRUST_POINTS.map((pt) => (
                            <div key={pt} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[#0E7A0D] shrink-0 mt-0.5" />
                                <span className="text-gray-700 font-medium text-sm">{pt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Enquiry Form ──────────────────────────────────────────────── */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Send an Enquiry</h2>
                    <p className="text-gray-500">Fill in your details below. We'll send your message directly to our WhatsApp for the fastest response.</p>
                </div>

                {submitted ? (
                    <div className="text-center py-16 bg-[#F0FBF0] rounded-2xl border border-[#0E7A0D]/20">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-[#0E7A0D] mb-2">Enquiry Sent!</h3>
                        <p className="text-gray-600 mb-6">Your WhatsApp message has been opened. Our team will respond within 24 business hours.</p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="bg-[#0E7A0D] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#0c660b] transition"
                        >
                            Send Another Enquiry
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handle}
                                    placeholder="Your full name"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0E7A0D] focus:ring-1 focus:ring-[#0E7A0D] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Company / Organisation</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={form.company}
                                    onChange={handle}
                                    placeholder="Optional"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0E7A0D] focus:ring-1 focus:ring-[#0E7A0D] transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone / WhatsApp *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={form.phone}
                                    onChange={handle}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0E7A0D] focus:ring-1 focus:ring-[#0E7A0D] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={form.email}
                                    onChange={handle}
                                    placeholder="you@company.com"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0E7A0D] focus:ring-1 focus:ring-[#0E7A0D] transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Interest *</label>
                                <select
                                    name="product"
                                    required
                                    value={form.product}
                                    onChange={handle}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0E7A0D] focus:ring-1 focus:ring-[#0E7A0D] transition bg-white"
                                >
                                    {PRODUCT_OPTIONS.map((o) => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity Required *</label>
                                <input
                                    type="text"
                                    name="quantity"
                                    required
                                    value={form.quantity}
                                    onChange={handle}
                                    placeholder="e.g. 50 units"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0E7A0D] focus:ring-1 focus:ring-[#0E7A0D] transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Message</label>
                            <textarea
                                name="message"
                                rows={4}
                                value={form.message}
                                onChange={handle}
                                placeholder="Any specific requirements, custom branding needs, delivery timeline, etc."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0E7A0D] focus:ring-1 focus:ring-[#0E7A0D] transition resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            id="bulk-order-submit-btn"
                            className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-4 rounded-xl text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            <MessageCircle className="w-5 h-5 fill-white" />
                            Send via WhatsApp
                        </button>

                        <p className="text-xs text-gray-400 text-center">
                            Clicking the button opens WhatsApp with your enquiry pre-filled. No account or app login needed.
                        </p>
                    </form>
                )}

                {/* Direct contact fallback */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 border border-gray-100 rounded-xl px-5 py-4 hover:border-[#25D366]/40 hover:bg-[#F0FBF0] transition group"
                    >
                        <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0" />
                        <div>
                            <div className="text-xs text-gray-400 font-medium">WhatsApp</div>
                            <div className="text-sm font-semibold text-gray-800 group-hover:text-[#0E7A0D] transition">+91 93702 28555</div>
                        </div>
                    </a>
                    <a
                        href="tel:+918329245729"
                        className="flex items-center gap-3 border border-gray-100 rounded-xl px-5 py-4 hover:border-[#0E7A0D]/40 hover:bg-[#F0FBF0] transition group"
                    >
                        <Phone className="w-5 h-5 text-[#0E7A0D] shrink-0" />
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Call Us</div>
                            <div className="text-sm font-semibold text-gray-800 group-hover:text-[#0E7A0D] transition">+91 83292 45729</div>
                        </div>
                    </a>
                    <a
                        href="mailto:Skybeingss422209@gmail.com"
                        className="flex items-center gap-3 border border-gray-100 rounded-xl px-5 py-4 hover:border-[#0E7A0D]/40 hover:bg-[#F0FBF0] transition group"
                    >
                        <Mail className="w-5 h-5 text-[#0E7A0D] shrink-0" />
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Email</div>
                            <div className="text-sm font-semibold text-gray-800 group-hover:text-[#0E7A0D] transition truncate">Skybeingss422209@gmail.com</div>
                        </div>
                    </a>
                </div>
            </section>

        </div>
    );
};

export default BulkOrders;
