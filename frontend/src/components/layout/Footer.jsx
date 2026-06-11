import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-white font-sans mt-8">

            {/* ── Shop via WhatsApp Banner ───────────────────────────────── */}
            <div className="bg-[#0E7A0D] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
                            <MessageCircle className="w-6 h-6 fill-white" />
                        </div>
                        <div>
                            <p className="font-bold text-lg leading-tight">Shop via WhatsApp</p>
                            <p className="text-white/80 text-sm">Send us a message — we'll confirm your order in minutes</p>
                        </div>
                    </div>
                    <a
                        href="https://wa.me/918329245729?text=Hi%20SkyBeings!%20I%20want%20to%20place%20an%20order.%20Can%20you%20help%20me%3F"
                        target="_blank"
                        rel="noopener noreferrer"
                        id="footer-whatsapp-cta"
                        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-7 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap active:scale-95"
                    >
                        <MessageCircle className="w-5 h-5 fill-white" />
                        +91 83292 45729
                    </a>
                </div>
            </div>

            {/* Top Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">

                    {/* Left: Brand Info */}
                    <div>
                        <h2 className="text-[32px] font-bold text-[#0E7A0D] mb-6 tracking-tight">SkyBeings</h2>

                        <p className="text-[#4A4A4A] text-[15px] leading-relaxed mb-8 max-w-md">
                            We design thoughtful bird feeders that bring nature closer to
                            balconies, gardens, and homes. Crafted in India with care, every
                            SkyBeings product blends beauty, durability, and bird comfort.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/share/18BuUErAsw/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-[#0E7A0D] hover:text-[#0c660b] transition">
                                <Facebook className="w-7 h-7" strokeWidth={1.5} />
                            </a>
                            <a href="https://www.instagram.com/skybeingsss?igsh=eGZkMmNvbTl1NDll&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-[#0E7A0D] hover:text-[#0c660b] transition">
                                <Instagram className="w-7 h-7" strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* Right: Contact Us */}
                    <div className="md:pl-8 lg:pl-20 pt-2">
                        <h4 className="text-[#0E7A0D] font-bold text-[17px] mb-5 tracking-wide">Contact Us</h4>
                        <ul className="space-y-3 text-[#4A4A4A] text-[15px] leading-relaxed font-normal">
                            <li>
                                <a href="tel:+918329245729" className="flex items-center gap-2 hover:text-[#0E7A0D] transition">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    Call: +91 83292 45729
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://wa.me/918329245729?text=Hi%20SkyBeings!%20I%20want%20to%20place%20an%20order."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-[#25D366] transition font-semibold"
                                >
                                    <MessageCircle className="w-4 h-4 shrink-0 text-[#25D366]" />
                                    WhatsApp: +91 83292 45729
                                </a>
                            </li>
                            <li>Support Time: 24/7</li>
                            <li>
                                <a href="mailto:Skybeingss422209@gmail.com" className="hover:text-[#0E7A0D] transition">
                                    Email: Skybeingss422209@gmail.com
                                </a>
                            </li>
                            <li className="text-sm leading-snug">Address: 6624/6, CHINCHKHED ROAD, SAMBHAJI NAGAR,<br />PIMPALGAON BASWANT, NASHIK, MH-422209</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Solid Horizontal Divider */}
            <div className="w-full border-t border-black"></div>

            {/* Bottom Links Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
                {/* Policy Links */}
                <div className="flex flex-wrap justify-between items-center gap-6 mb-12 text-[14px] text-[#555555] font-medium px-2">
                    <Link to="/about" className="hover:text-black transition">About Us</Link>
                    <Link to="/bulk-orders" className="hover:text-[#0E7A0D] transition font-semibold text-[#0E7A0D]">Bulk Orders</Link>
                    <Link to="/privacy-policy" className="hover:text-black transition">Privacy Policy</Link>
                    <Link to="/return-policy" className="hover:text-black transition">Return Policy</Link>
                    <Link to="/shipping-policy" className="hover:text-black transition">Shipping Policy</Link>
                    <Link to="/terms" className="hover:text-black transition">Terms &amp; Conditions</Link>
                </div>

                {/* Categories Links — lifecycle order: Feeder → Water → Home → Best Sellers → Accessories */}
                <div className="flex flex-wrap justify-center items-center gap-y-4 gap-x-1 sm:gap-x-2 text-[13px] text-[#8C5D3A] font-medium tracking-wide">
                    <Link to="/collections/bird-feeders" className="hover:text-black transition px-1 sm:px-2">BIRD FEEDER</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/collections/water-feeders" className="hover:text-black transition px-1 sm:px-2">WATER FEEDER</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/collections/bird-houses" className="hover:text-black transition px-1 sm:px-2">BIRD HOME</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/collections/best-sellers" className="hover:text-black transition px-1 sm:px-2">BEST SELLERS</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/collections/accessories" className="hover:text-black transition px-1 sm:px-2">ACCESSORIES</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/bulk-orders" className="hover:text-black transition px-1 sm:px-2">BULK ORDERS</Link>
                </div>
            </div>

        </footer>
    );
};

export default Footer;
