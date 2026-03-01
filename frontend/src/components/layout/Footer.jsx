import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-white font-sans mt-8">
            {/* Top Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">

                    {/* Left: Brand Info */}
                    <div>
                        <h2 className="text-[32px] font-bold text-[#0E7A0D] mb-6 tracking-tight">SkyBeing</h2>
                        <p className="text-[17px] text-[#8C5D3A] mb-5 font-medium">
                            Welcome to SkyBeing, a home for birds in your everyday spaces.
                        </p>
                        <p className="text-[#4A4A4A] text-[15px] leading-relaxed mb-8 max-w-md">
                            We design thoughtful bird feeders that bring nature closer to
                            balconies, gardens, and homes. Crafted in India with care, every
                            SkyBeing product blends beauty, durability, and bird comfort.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/share/18BuUErAsw/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-[#0E7A0D] hover:text-[#0c660b] transition">
                                <Facebook className="w-7 h-7" strokeWidth={1.5} />
                            </a>
                            <a href="https://www.instagram.com/skybeingss?igsh=eGZkMmNvbTl1NDll&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-[#0E7A0D] hover:text-[#0c660b] transition">
                                <Instagram className="w-7 h-7" strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* Right: Contact Us */}
                    <div className="md:pl-8 lg:pl-20 pt-2">
                        <h4 className="text-[#0E7A0D] font-bold text-[17px] mb-5 tracking-wide">Contact Us</h4>
                        <ul className="space-y-2 text-[#4A4A4A] text-[15px] leading-relaxed font-normal">
                            <li>Call: +91 721 900 6729</li>
                            <li>WhatsApp: +91 721 900 6729</li>
                            <li>Support Time: 24/7</li>
                            <li>Email: Skybeings422209@gmail.com</li>
                            <li>Address: 6624/6, CHINCHKHED ROAD, BRAMHAA VALLEY SCHOOL, SAMBHAJI NAGAR, PIMPALGAON BASWANT, NASHIK, MAHARASHTRA-422209</li>
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
                    <Link to="/privacy-policy" className="hover:text-black transition">Privacy Policy</Link>
                    <Link to="/return-policy" className="hover:text-black transition">Return Policy</Link>
                    <Link to="/shipping-policy" className="hover:text-black transition">Shipping Policy</Link>
                    <Link to="/terms" className="hover:text-black transition">Terms &amp; Conditions</Link>
                </div>

                {/* Categories Links (Horizontal List with pipes) */}
                <div className="flex flex-wrap justify-center items-center gap-y-4 gap-x-1 sm:gap-x-2 text-[13px] text-[#8C5D3A] font-medium tracking-wide">
                    <Link to="/shop?category=balcony" className="hover:text-black transition px-1 sm:px-2">BALCONY FEEDERS</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/shop?category=best-sellers" className="hover:text-black transition px-1 sm:px-2">BEST SELLERS</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/shop?category=bird-home" className="hover:text-black transition px-1 sm:px-2">BIRD HOME</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/shop?category=garden" className="hover:text-black transition px-1 sm:px-2">GARDEN FEEDERS</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/shop?category=parrot" className="hover:text-black transition px-1 sm:px-2">PARROT FEEDERS</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/shop?category=bird-home" className="hover:text-black transition px-1 sm:px-2">BIRD HOME</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/shop?category=bird-feeder" className="hover:text-black transition px-1 sm:px-2">BIRD FEEDER</Link>
                    <span className="text-gray-400 hidden md:inline font-light">|</span>

                    <Link to="/shop?category=water-feeder" className="hover:text-black transition px-1 sm:px-2">WATER FEEDERS</Link>
                </div>
            </div>

        </footer>
    );
};

export default Footer;
