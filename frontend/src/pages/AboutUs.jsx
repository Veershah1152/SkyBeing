import { useEffect, useState } from 'react';
import BannerCarousel from '../components/ui/BannerCarousel';
import { Leaf, HeartHandshake, Sprout, Bird } from 'lucide-react';
import api from '../api/axios';
import useSEO from '../hooks/useSEO';

const AboutUs = () => {
    useSEO({
        title: 'About Us',
        description: 'Learn about SkyBeings, our mission to support local avian life in India, and how we craft our high-quality bird feeders, houses, and water sanctuaries.'
    });

    const [contentImage, setContentImage] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Fetch the about-content image from admin banners
        api.get('/banners/active?page=about-content')
            .then(res => {
                const banners = res.data?.data || [];
                if (banners.length > 0) setContentImage(banners[0].imageUrl);
            })
            .catch(() => { });
    }, []);

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <BannerCarousel
                page="about"
                height="md:h-[300px] lg:h-[400px]"
                fallback={
                    <div className="h-[300px] bg-[#FCECD8] w-full flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555169062-013468b47726?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                        <div className="relative z-10 text-center">
                            <h1 className="text-5xl font-bold text-black mb-4 tracking-wide">About Us</h1>
                            <p className="text-lg text-black font-semibold">
                                Home <span className="mx-2">&gt;</span> About Us
                            </p>
                        </div>
                    </div>
                }
            />

            {/* ── Main Story Section ───────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 text-left">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    {/* Story Image */}
                    <div className="w-full lg:w-1/2 relative">
                        <img
                            src={contentImage || '/about-founder.jpg'}
                            alt="Aman Shah, Founder of SkyBeings"
                            className="w-full h-[500px] md:h-[650px] object-cover rounded-2xl shadow-xl border border-gray-100"
                        />
                        {/* Decorative badge */}
                        <div className="absolute -bottom-6 -right-6 lg:-bottom-10 lg:-right-10 bg-[#0E7A0D] text-white w-32 h-32 rounded-full hidden md:flex flex-col items-center justify-center shadow-2xl border-8 border-white">
                            <span className="text-2xl font-extrabold">100%</span>
                            <span className="text-[10px] tracking-wider uppercase font-bold mt-1 text-center leading-tight">Eco<br />Friendly</span>
                        </div>
                    </div>

                    {/* Story Text */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-[#0E7A0D] font-bold tracking-widest uppercase text-sm mb-3">Our Story</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] mb-6 leading-tight">
                            A Dream to Protect Birds.
                        </h3>
                        <p className="text-[#4A4A4A] text-[16px] leading-relaxed mb-6 font-medium">
                            SkyBeings was founded in 2021 by Aman Shah, Founder and CEO, with a simple dream: to bring joy and safety to birds through thoughtfully designed bird feeders, homes, and water feeders. Each product is born from deep research and a love for nature. Under my leadership, we’ve grown to offer some of the best bird feeders in India and worldwide, earning top ratings on Amazon as a Best Choice.
                        </p>
                        <p className="text-[#4A4A4A] text-[16px] leading-relaxed mb-8 font-medium">
                            Our success started from zero, driven by a passion for quality and a dream to protect birds. Today, we aim to create a world where every garden is a sanctuary. Join us as we grow, hand in hand with nature, and make a difference—one bird at a time.
                        </p>

                        <div className="flex items-center gap-4 text-[#1a1a1a] p-4 bg-[#F9F1E7] rounded-xl border border-[#E8D8C5] inline-flex">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                                <Bird className="w-6 h-6 text-[#8C5D3A]" />
                            </div>
                            <div>
                                <p className="font-bold text-lg leading-tight">10,000+ Birds</p>
                                <p className="text-sm text-gray-600 font-medium">Fed & Housed Monthly</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Core Values Section ──────────────────────────────────────── */}
            <div className="bg-[#FAF9F6] py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-[#0E7A0D] font-bold tracking-widest uppercase text-sm mb-3">What Drives Us</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] mb-4">
                            Our Core Values
                        </h3>
                        <p className="text-[#898989] max-w-2xl mx-auto text-base">
                            Everything we do at SkyBeings is guided by a commitment to quality, community, and the environment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Value 1 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                                <Leaf className="w-7 h-7 text-[#0E7A0D]" />
                            </div>
                            <h4 className="text-xl font-bold text-[#1a1a1a] mb-4">Eco-Conscious Design</h4>
                            <p className="text-[#666] leading-relaxed text-sm">
                                We utilize sustainable, bird-safe materials. Our designs minimize environmental impact while maximizing
                                the longevity of our products against harsh outdoor weather.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                                <HeartHandshake className="w-7 h-7 text-[#8C5D3A]" />
                            </div>
                            <h4 className="text-xl font-bold text-[#1a1a1a] mb-4">Bird-First Comfort</h4>
                            <p className="text-[#666] leading-relaxed text-sm">
                                Every feeder and home is structurally analyzed to ensure proper ventilation, predator protection,
                                and easy access for local species. Their well-being is our priority.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Sprout className="w-7 h-7 text-blue-600" />
                            </div>
                            <h4 className="text-xl font-bold text-[#1a1a1a] mb-4">Local Craftsmanship</h4>
                            <p className="text-[#666] leading-relaxed text-sm">
                                We are proudly rooted in India. We empower local artisans to hand-finish our products, bringing
                                a unique, deeply human touch to every single SkyBeings piece.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Location Map ─────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
                <div className="text-center mb-10">
                    <h2 className="text-[#0E7A0D] font-bold tracking-widest uppercase text-sm mb-3">Visit Us</h2>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a]">
                        Find Us on the Map
                    </h3>
                </div>
                <div className="w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://maps.google.com/maps?q=20°10'31.1%22N+73°59'19.0%22E&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        title="Our Location"
                        className="grayscale hover:grayscale-0 transition-all duration-700 object-cover"
                    ></iframe>
                </div>
            </div>

            {/* ── Mini Call to Action ──────────────────────────────────────── */}
            <div className="py-20 text-center px-6">
                <h3 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-6">
                    Ready to invite nature to your home?
                </h3>
                <a
                    href="/shop"
                    className="inline-block bg-skyGreen hover:bg-[#0c660b] text-white font-bold px-10 py-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                    Explore Our Shop
                </a>
            </div>

        </div>
    );
};

export default AboutUs;
