import { useEffect } from 'react';
import BannerCarousel from '../components/ui/BannerCarousel';
import { Leaf, HeartHandshake, Sprout, Bird } from 'lucide-react';

const AboutUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <BannerCarousel
                page="about"
                height="h-[300px]"
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
                            src="https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=800"
                            alt="Bird house in nature"
                            className="w-full h-[500px] object-cover rounded-2xl shadow-xl"
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
                            Bringing Nature Closer to Your Everyday Spaces.
                        </h3>
                        <p className="text-[#4A4A4A] text-[16px] leading-relaxed mb-6 font-medium">
                            SkyBeing was born from a simple yet profound belief: humans and nature are meant to coexist beautifully.
                            In today's fast-paced urban world, we noticed a growing disconnect from the gentle wildlife that shares
                            our environment—especially birds. We set out to bridge that gap.
                        </p>
                        <p className="text-[#4A4A4A] text-[16px] leading-relaxed mb-8 font-medium">
                            Based in India, our team of passionate craftsmen and nature enthusiasts design thoughtful, durable, and
                            aesthetically pleasing bird feeders, baths, and homes. Every SkyBeing product is meticulously crafted
                            to blend seamlessly into modern balconies and lush gardens alike, ensuring absolute comfort for our
                            feathered friends.
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
                            Everything we do at SkyBeing is guided by a commitment to quality, community, and the environment.
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
                                a unique, deeply human touch to every single SkyBeing piece.
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
