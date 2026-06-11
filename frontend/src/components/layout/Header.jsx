import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Settings, Heart, X, Menu, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { selectWishlistCount } from '../../store/slices/wishlistSlice';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { totalQuantity } = useSelector((state) => state.cart) || { totalQuantity: 0 };
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const wishlistCount = useSelector(selectWishlistCount);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [shopDropOpen, setShopDropOpen] = useState(false);
    const [mobileShopOpen, setMobileShopOpen] = useState(false);
    const searchInputRef = useRef(null);

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        } else {
            setSearchQuery('');
        }
    }, [searchOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        setSearchOpen(false);
        navigate(`/shop?search=${encodeURIComponent(q)}`);
    };

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Body scroll lock when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    return (
        <>
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">

                        {/* Mobile Menu Button (Left on Mobile) */}
                        <div className="flex-1 md:hidden flex items-center">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="text-gray-700 hover:text-skyGreen transition-colors"
                                title="Menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Left Navigation (Desktop) */}
                        <nav className="hidden md:flex items-center space-x-8 flex-1">
                            <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-skyGreen transition-colors tracking-wide">Home</Link>

                            {/* Shop Mega-Dropdown */}
                            <div
                                className="relative"
                                onMouseEnter={() => setShopDropOpen(true)}
                                onMouseLeave={() => setShopDropOpen(false)}
                            >
                                <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-skyGreen transition-colors tracking-wide">
                                    Shop <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${shopDropOpen ? 'rotate-180 text-skyGreen' : ''}`} />
                                </button>

                                {shopDropOpen && (
                                    <div className="absolute left-0 top-full pt-3 z-50">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-[560px] grid grid-cols-2 gap-x-8 gap-y-1">

                                            {/* Col 1: Bird Feeders & Water */}
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Bird Feeders</p>
                                                <Link to="/collections/bird-feeders" onClick={() => setShopDropOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-skyGreen font-medium transition-colors">
                                                    <span className="text-base">🪺</span> All Bird Feeders
                                                </Link>
                                                <Link to="/collections/hanging-bird-feeders" onClick={() => setShopDropOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-skyGreen font-medium transition-colors">
                                                    <span className="text-base">🔗</span> Hanging Feeders
                                                </Link>
                                                <Link to="/collections/window-bird-feeders" onClick={() => setShopDropOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-skyGreen font-medium transition-colors">
                                                    <span className="text-base">🪟</span> Window Feeders
                                                </Link>

                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-5">Bird Watering</p>
                                                <Link to="/collections/water-feeders" onClick={() => setShopDropOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-skyGreen font-medium transition-colors">
                                                    <span className="text-base">💧</span> Water Feeders
                                                </Link>
                                            </div>

                                            {/* Col 2: Bird Homes & More */}
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Bird Homes</p>
                                                <Link to="/collections/bird-houses" onClick={() => setShopDropOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-skyGreen font-medium transition-colors">
                                                    <span className="text-base">🏠</span> Bird Houses
                                                </Link>

                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-5">More</p>
                                                <Link to="/collections/best-sellers" onClick={() => setShopDropOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-skyGreen font-medium transition-colors">
                                                    <span className="text-base">⭐</span> Best Sellers
                                                </Link>
                                                <Link to="/collections/accessories" onClick={() => setShopDropOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-skyGreen font-medium transition-colors">
                                                    <span className="text-base">🎒</span> Accessories
                                                </Link>
                                                <Link to="/shop" onClick={() => setShopDropOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-skyGreen font-medium transition-colors">
                                                    <span className="text-base">🛒</span> All Products
                                                </Link>
                                            </div>

                                            {/* Bottom CTA */}
                                            <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
                                                <Link
                                                    to="/bulk-orders"
                                                    onClick={() => setShopDropOpen(false)}
                                                    className="flex items-center justify-center gap-2 bg-skyGreen text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#0c660b] transition-colors"
                                                >
                                                    🤝 Bulk Orders &amp; Corporate Gifting
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to="/contact" className="text-sm font-semibold text-gray-700 hover:text-skyGreen transition-colors tracking-wide">Contact</Link>
                            <Link to="/bulk-orders" className="text-sm font-semibold text-[#0E7A0D] hover:text-skyGreen transition-colors tracking-wide border border-[#0E7A0D] px-3 py-1.5 rounded-lg hover:bg-skyGreen/5">Bulk Orders</Link>
                        </nav>

                        {/* Center Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center justify-center">
                            <img src="/logo-cropped.png" alt="SkyBeings Logo" className="h-16 w-auto object-contain pt-1 transform scale-125" />
                        </Link>

                        {/* Right Icons */}
                        <div className="flex items-center justify-end space-x-4 md:space-x-5 flex-1">

                            {/* Search Button */}
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="text-gray-700 hover:text-skyGreen transition-colors"
                                title="Search"
                            >
                                <Search className="w-5 h-5 md:w-5 md:h-5" />
                            </button>

                            {/* Wishlist Heart Button */}
                            <Link
                                to="/wishlist"
                                className="relative text-gray-700 hover:text-red-500 transition-colors hidden sm:flex"
                                title="Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Admin */}
                            {isAuthenticated && user?.role === 'admin' && (
                                <Link to="/admin" className="text-gray-700 hover:text-skyGreen transition-colors hidden sm:flex" title="Admin Dashboard">
                                    <Settings className="w-5 h-5" />
                                </Link>
                            )}

                            {/* Auth */}
                            {isAuthenticated ? (
                                <button onClick={() => dispatch(logoutUser())} className="text-gray-700 hover:text-red-500 transition-colors hidden sm:flex" title="Logout">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            ) : (
                                <Link to="/login" className="text-gray-700 hover:text-skyGreen transition-colors hidden sm:flex" title="Login">
                                    <User className="w-5 h-5" />
                                </Link>
                            )}

                            {/* Cart */}
                            <Link to="/cart" className="text-gray-700 hover:text-skyGreen transition-colors relative flex items-center" title="Cart">
                                <ShoppingBag className="w-5 h-5" />
                                {totalQuantity > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {totalQuantity}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Mobile Sidebar Menu ───────────────────────────────────── */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    {/* Drawer */}
                    <div
                        className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out z-[101]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <span className="font-extrabold text-[#0E7A0D] text-lg">SkyBeings</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-black">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <nav className="flex flex-col flex-1 overflow-y-auto px-5 py-6 space-y-1">
                            <Link to="/" className="text-lg font-semibold text-gray-800 hover:text-[#0E7A0D] py-2.5 border-b border-gray-50">Home</Link>

                            {/* Shop Accordion */}
                            <div className="border-b border-gray-50">
                                <button
                                    onClick={() => setMobileShopOpen(o => !o)}
                                    className="flex items-center justify-between w-full text-lg font-semibold text-gray-800 hover:text-[#0E7A0D] py-2.5"
                                >
                                    Shop
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${mobileShopOpen ? 'rotate-180 text-[#0E7A0D]' : ''}`} />
                                </button>
                                {mobileShopOpen && (
                                    <div className="pl-3 pb-3 flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 mb-1">Bird Feeders</p>
                                        <Link to="/collections/bird-feeders" className="text-sm font-medium text-gray-700 hover:text-[#0E7A0D] py-1.5">🪺 All Bird Feeders</Link>
                                        <Link to="/collections/hanging-bird-feeders" className="text-sm font-medium text-gray-700 hover:text-[#0E7A0D] py-1.5">🔗 Hanging Feeders</Link>
                                        <Link to="/collections/window-bird-feeders" className="text-sm font-medium text-gray-700 hover:text-[#0E7A0D] py-1.5">🪟 Window Feeders</Link>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">Bird Watering</p>
                                        <Link to="/collections/water-feeders" className="text-sm font-medium text-gray-700 hover:text-[#0E7A0D] py-1.5">💧 Water Feeders</Link>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">Bird Homes</p>
                                        <Link to="/collections/bird-houses" className="text-sm font-medium text-gray-700 hover:text-[#0E7A0D] py-1.5">🏠 Bird Houses</Link>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">More</p>
                                        <Link to="/collections/best-sellers" className="text-sm font-medium text-gray-700 hover:text-[#0E7A0D] py-1.5">⭐ Best Sellers</Link>
                                        <Link to="/collections/accessories" className="text-sm font-medium text-gray-700 hover:text-[#0E7A0D] py-1.5">🎒 Accessories</Link>
                                        <Link to="/shop" className="text-sm font-medium text-gray-700 hover:text-[#0E7A0D] py-1.5">🛒 All Products</Link>
                                    </div>
                                )}
                            </div>

                            <Link to="/contact" className="text-lg font-semibold text-gray-800 hover:text-[#0E7A0D] py-2.5 border-b border-gray-50">Contact</Link>
                            <Link to="/wishlist" className="flex items-center gap-3 text-lg font-semibold text-gray-800 hover:text-[#0E7A0D] py-2.5 border-b border-gray-50">
                                <Heart className="w-5 h-5" />
                                Wishlist ({wishlistCount})
                            </Link>
                            <Link to="/bulk-orders" className="flex items-center gap-2 text-lg font-semibold text-[#0E7A0D] hover:text-black py-2.5 border-b border-gray-50">
                                🤝 Bulk Orders
                            </Link>
                        </nav>

                        {/* Drawer Footer (Auth/Admin) */}
                        <div className="p-5 border-t border-gray-100 bg-gray-50">
                            {isAuthenticated ? (
                                <div className="flex flex-col gap-4">
                                    <span className="text-sm font-semibold text-gray-600">Logged in as {user?.name}</span>
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" className="flex items-center gap-3 text-sm font-semibold text-skyGreen hover:text-black transition">
                                            <Settings className="w-4 h-4" /> Admin Dashboard
                                        </Link>
                                    )}
                                    <button onClick={() => { dispatch(logoutUser()); setMobileMenuOpen(false); }} className="flex items-center gap-3 text-sm font-semibold text-red-500 hover:text-red-700 transition">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center gap-3 text-sm font-semibold text-[#0E7A0D] hover:text-black transition">
                                    <User className="w-4 h-4" /> Login / Register
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Search Overlay ─────────────────────────────────────────── */}
            {searchOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-center pt-24 px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
                >
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden self-start">
                        <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4">
                            <Search className="w-5 h-5 text-skyGreen flex-shrink-0" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="flex-1 text-base text-gray-800 outline-none placeholder-gray-400 bg-transparent"
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="bg-skyGreen text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#0c660b] transition-colors"
                            >
                                Search
                            </button>
                        </form>
                        <div className="px-5 pb-4 flex gap-2 flex-wrap">
                            <span className="text-xs text-gray-400 font-medium pt-1">Try:</span>
                            {['Feeder', 'Bird House', 'Water Feeder', 'Accessories'].map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => { setSearchQuery(tag); navigate(`/shop?search=${encodeURIComponent(tag)}`); setSearchOpen(false); }}
                                    className="text-xs bg-gray-100 hover:bg-skyGreen hover:text-white text-gray-600 px-3 py-1.5 rounded-full transition-colors font-medium whitespace-nowrap"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
