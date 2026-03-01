import { useEffect } from 'react';
import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import BannerCarousel from '../components/ui/BannerCarousel';

const Contact = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-white min-h-screen">

            {/* ── Hero Banner — same style as Shop ──────────────────────── */}
            <BannerCarousel
                page="contact"
                height="h-[300px]"
                fallback={
                    <div className="h-[300px] bg-[#FCECD8] w-full flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="relative z-10 text-center">
                            <h1 className="text-5xl font-bold text-black mb-4 tracking-wide">Contact</h1>
                            <p className="text-lg text-black font-semibold">
                                Home <span className="mx-2">&gt;</span> Contact
                            </p>
                        </div>
                    </div>
                }
            />

            {/* ── Get In Touch ─────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-3">
                        Get In Touch With Us
                    </h2>
                    <p className="text-[#9F9F9F] text-sm leading-relaxed max-w-sm mx-auto">
                        For More Information About Our Product &amp; Services. Please Feel Free To Drop Us
                        An Email. Our Staff Always Be There To Help You Out. Do Not Hesitate!
                    </p>
                </div>

                {/* Two-column layout */}
                <div className="flex flex-col lg:flex-row gap-0 shadow-sm border border-gray-200">

                    {/* ── Left: Info Blocks ───────────────────────────── */}
                    <div className="lg:w-[36%] bg-white p-10 flex flex-col gap-10 border-b lg:border-b-0 lg:border-r border-gray-200">

                        {/* Address */}
                        <div className="flex items-start gap-5">
                            <MapPin className="w-5 h-5 text-black shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-base text-[#1a1a1a] mb-1.5">Address</h4>
                                <p className="text-[#444] text-sm leading-relaxed">
                                    6624/6, Chinchkhed Road,<br />
                                    Bramhaa Valley School,<br />
                                    Sambhaji Nagar, Pimpalgaon Baswant,<br />
                                    Nashik, Maharashtra-422209
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-5">
                            <Phone className="w-5 h-5 text-black shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-base text-[#1a1a1a] mb-1.5">Phone</h4>
                                <p className="text-[#444] text-sm leading-relaxed">
                                    Mobile: +91 721 900 6729<br />
                                    WhatsApp: +91 721 900 6729
                                </p>
                            </div>
                        </div>

                        {/* Working Time */}
                        <div className="flex items-start gap-5">
                            <Clock className="w-5 h-5 text-black shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-base text-[#1a1a1a] mb-1.5">Working Time</h4>
                                <p className="text-[#444] text-sm leading-relaxed">
                                    Monday-Friday: 9:00 -<br />
                                    22:00<br />
                                    Saturday-Sunday: 9:00 -<br />
                                    21:00
                                </p>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="flex items-start gap-5">
                            <div className="w-5 h-5 shrink-0 mt-0.5" /> {/* Spacer to align with text */}
                            <div>
                                <h4 className="font-semibold text-base text-[#1a1a1a] mb-3">Follow Us</h4>
                                <div className="flex space-x-6">
                                    <a href="https://www.facebook.com/share/18BuUErAsw/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#0c660b] transition">
                                        <Facebook className="w-6 h-6" strokeWidth={1.5} />
                                    </a>
                                    <a href="https://www.instagram.com/skybeingss?igsh=eGZkMmNvbTl1NDll&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#0c660b] transition">
                                        <Instagram className="w-6 h-6" strokeWidth={1.5} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Form ────────────────────────────────── */}
                    <div className="lg:w-[64%] bg-white p-10">
                        <form className="flex flex-col gap-5 w-full">
                            <div>
                                <label className="block text-[#1a1a1a] font-medium mb-2 text-sm">Your name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-skyGreen transition"
                                    placeholder="Abc"
                                />
                            </div>
                            <div>
                                <label className="block text-[#1a1a1a] font-medium mb-2 text-sm">Email address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-skyGreen transition"
                                    placeholder="Abc@def.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[#1a1a1a] font-medium mb-2 text-sm">Subject</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-skyGreen transition"
                                    placeholder="This is an optional"
                                />
                            </div>
                            <div>
                                <label className="block text-[#1a1a1a] font-medium mb-2 text-sm">Message</label>
                                <textarea
                                    rows="5"
                                    className="w-full px-4 py-3 border border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 resize-y focus:border-skyGreen transition"
                                    placeholder="Hi! I'd like to ask about"
                                />
                            </div>
                            <div className="mt-2">
                                <button
                                    type="submit"
                                    className="bg-skyGreen hover:bg-[#0c660b] text-white font-semibold py-3 px-14 transition text-sm"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>

            {/* ── Location Map ─────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="text-center mb-8">
                    <h2 className="text-[#0E7A0D] font-bold tracking-widest uppercase text-sm mb-2">Our Location</h2>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">
                        Visit Our Store
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

            {/* ── Feature Highlights Bar ─────────────────────────────────── */}
            <div className="bg-[#5C3A1E]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

                        {/* Bird-First Design */}
                        <div className="flex items-center gap-4">
                            <svg className="w-9 h-9 text-white/80 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm6-1.5c0 1.243 1.007 2.25 2.25 2.25S12.75 11.743 12.75 10.5 11.743 8.25 10.5 8.25 8.25 9.257 8.25 10.5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6.75a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                            </svg>
                            <div>
                                <p className="text-white font-semibold text-sm">Bird-First Design</p>
                                <p className="text-white/55 text-xs mt-0.5">Comfort &amp; safety</p>
                            </div>
                        </div>

                        {/* All-Weather Build */}
                        <div className="flex items-center gap-4">
                            <svg className="w-9 h-9 text-white/80 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 00.985-7.363A5.25 5.25 0 0012 4.5a5.25 5.25 0 00-5.25 4.875A4.5 4.5 0 002.25 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19.5v2m3-2v2m3-2v2" />
                            </svg>
                            <div>
                                <p className="text-white font-semibold text-sm">All-Weather Build</p>
                                <p className="text-white/55 text-xs mt-0.5">Sun &amp; rain ready</p>
                            </div>
                        </div>

                        {/* Easy to Hang */}
                        <div className="flex items-center gap-4">
                            <svg className="w-9 h-9 text-white/80 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                            </svg>
                            <div>
                                <p className="text-white font-semibold text-sm">Easy to Hang</p>
                                <p className="text-white/55 text-xs mt-0.5">Install in minutes</p>
                            </div>
                        </div>

                        {/* Nature Approved */}
                        <div className="flex items-center gap-4">
                            <svg className="w-9 h-9 text-white/80 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
                            </svg>
                            <div>
                                <p className="text-white font-semibold text-sm">Nature Approved</p>
                                <p className="text-white/55 text-xs mt-0.5">Loved by birds</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default Contact;
