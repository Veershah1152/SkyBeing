import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Settings, Heart, X, Menu } from 'lucide-react';
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
                        <nav className="hidden md:flex space-x-8 flex-1">
                            <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-skyGreen transition-colors tracking-wide">Home</Link>
                            <Link to="/shop" className="text-sm font-semibold text-gray-700 hover:text-skyGreen transition-colors tracking-wide">Shop</Link>
                            <Link to="/contact" className="text-sm font-semibold text-gray-700 hover:text-skyGreen transition-colors tracking-wide">Contact</Link>
                        </nav>

                        {/* Center Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center justify-center">
                            <img src="/logo-cropped.png" alt="SkyBeing Logo" className="h-16 w-auto object-contain pt-1 transform scale-125" />
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
                            <span className="font-extrabold text-[#0E7A0D] text-lg">SkyBeing</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-black">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <nav className="flex flex-col flex-1 overflow-y-auto px-5 py-6 space-y-4">
                            <Link to="/" className="text-lg font-semibold text-gray-800 hover:text-[#0E7A0D] py-2 border-b border-gray-50">Home</Link>
                            <Link to="/shop" className="text-lg font-semibold text-gray-800 hover:text-[#0E7A0D] py-2 border-b border-gray-50">Shop</Link>
                            <Link to="/contact" className="text-lg font-semibold text-gray-800 hover:text-[#0E7A0D] py-2 border-b border-gray-50">Contact</Link>
                            <Link to="/wishlist" className="flex items-center gap-3 text-lg font-semibold text-gray-800 hover:text-[#0E7A0D] py-2 border-b border-gray-50">
                                <Heart className="w-5 h-5" />
                                Wishlist ({wishlistCount})
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
