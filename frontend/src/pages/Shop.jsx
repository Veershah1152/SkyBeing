import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectWishlistIds } from '../store/slices/wishlistSlice';
import BannerCarousel from '../components/ui/BannerCarousel';
import { Search, SlidersHorizontal, ChevronDown, Star, X, Heart, ShoppingCart } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const PRODUCTS_PER_PAGE = 8;

// Filter tab definitions
const FILTER_TABS = [
    { id: 'all', label: 'All Products' },
    { id: 'best-sellers', label: 'Best Sellers' },
    { id: 'Bird Feeder', label: 'Bird Feeders' },
    { id: 'Water Feeder', label: 'Water Feeders' },
    { id: 'Bird House', label: 'Bird Houses' },
    { id: 'Accessories', label: 'Accessories' },
];

const SORT_OPTIONS = [
    { value: 'default', label: 'Default Sorting' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Top Rated' },
    { value: 'newest', label: 'Newest First' },
];

const StarRating = ({ rating = 0 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
        ))}
    </div>
);

const Shop = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items: products, status } = useSelector(state => state.products);
    const wishlistIds = useSelector(selectWishlistIds);
    const [hoveredProd, setHoveredProd] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const toast = useToast();

    // Filter state
    const [activeTab, setActiveTab] = useState(location.state?.category || 'all');
    const [sortBy, setSortBy] = useState('default');
    const [sortOpen, setSortOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Read ?search= from URL (set by Header search)
    const urlParams = new URLSearchParams(location.search);
    const urlSearch = urlParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(urlSearch);

    // Sync search when URL changes (e.g. user searches again from header)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('search') || '';
        setSearchQuery(q);
    }, [location.search]);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchProducts());
    }, [status, dispatch]);

    useEffect(() => {
        if (location.state?.category) {
            setActiveTab(location.state.category);
        }
    }, [location.state?.category]);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [activeTab, sortBy, searchQuery]);

    // ── Filter + Sort + Search ──────────────────────────────────────────
    const filteredProducts = useMemo(() => {
        let list = [...products];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.tags?.some(t => t.toLowerCase().includes(q))
            );
        }

        // Category / Best-sellers filter
        if (activeTab === 'best-sellers') {
            list = list.filter(p => p.ratings >= 4).sort((a, b) => b.ratings - a.ratings);
        } else if (activeTab !== 'all') {
            list = list.filter(p => p.category === activeTab);
        }

        // Sort
        switch (sortBy) {
            case 'price-asc': list.sort((a, b) => a.price - b.price); break;
            case 'price-desc': list.sort((a, b) => b.price - a.price); break;
            case 'rating-desc': list.sort((a, b) => (b.ratings || 0) - (a.ratings || 0)); break;
            case 'newest': list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            default: break;
        }

        return list;
    }, [products, activeTab, sortBy, searchQuery]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const paginated = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const handleAddToCart = async (prod) => {
        try {
            setAddingId(prod._id);
            await dispatch(addToCart({ productId: prod._id, quantity: 1 })).unwrap();
            toast.cart(prod.name, { image: prod.images?.[0] });
        } catch (err) {
            toast.error(err || 'Please login to add to cart');
        } finally {
            setAddingId(null);
        }
    };

    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;

    return (
        <div className="bg-white min-h-screen">

            {/* ── Banner (admin managed or fallback) ─────────────────── */}
            <BannerCarousel
                page="shop"
                height="md:h-[300px] lg:h-[400px]"
                fallback={
                    <div className="h-[300px] bg-[#FCECD8] w-full flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="relative z-10 text-center">
                            <h1 className="text-5xl font-bold text-black mb-4 tracking-wide">Shop</h1>
                            <p className="text-lg text-black font-semibold"><Link to="/" className="hover:underline transition">Home</Link> <span className="mx-2">&gt;</span> Shop</p>
                        </div>
                    </div>
                }
            />

            {/* ── Filter Ribbon ───────────────────────────────────────── */}
            <div className="bg-[#A77B51] w-full text-white text-sm font-semibold tracking-wider shadow-md">
                <div className="max-w-7xl mx-auto w-full px-6 flex items-center whitespace-nowrap overflow-x-auto">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-6 uppercase transition-all border-b-2 flex-shrink-0 ${activeTab === tab.id
                                ? 'border-white text-white'
                                : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-24">

                {/* ── Toolbar: search + sort + count ─────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
                    {/* Left — result count + active filter badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> products
                        </p>
                        {activeTab !== 'all' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-skyGreen/10 text-skyGreen rounded-full">
                                {FILTER_TABS.find(t => t.id === activeTab)?.label}
                                <button onClick={() => setActiveTab('all')}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {searchQuery && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-skyBrown/10 text-skyBrown rounded-full">
                                "{searchQuery}"
                                <button onClick={() => setSearchQuery('')}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>

                    {/* Right — search + sort */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products…"
                                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-skyGreen focus:ring-1 focus:ring-skyGreen bg-gray-50 w-48"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Sort dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setSortOpen(o => !o)}
                                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-skyGreen bg-gray-50 text-gray-700 font-medium min-w-[170px] justify-between">
                                <span className="flex items-center gap-1.5">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                                    {currentSortLabel}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {sortOpen && (
                                <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
                                    {SORT_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === opt.value
                                                ? 'bg-skyGreen text-white font-semibold'
                                                : 'text-gray-700 hover:bg-skyGreen/5 hover:text-skyGreen'
                                                }`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Products Grid ───────────────────────────────────── */}
                {status === 'loading' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-x-8 gap-y-8 sm:gap-y-12">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col animate-pulse">
                                <div className="w-full aspect-square bg-gray-200 rounded-sm" />
                                <div className="bg-gray-100 p-5 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-6xl mb-4">🪺</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {searchQuery
                                ? `No results for "${searchQuery}"`
                                : `No products in this category yet.`}
                        </p>
                        <button
                            onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                            className="px-6 py-2.5 bg-skyGreen text-white font-semibold rounded-lg hover:bg-[#0c660b] transition-all">
                            View All Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-x-8 gap-y-8 sm:gap-y-12">
                        {paginated.map(prod => (
                            <div
                                key={prod._id}
                                className="relative group flex flex-col items-center cursor-pointer block border border-transparent transition-all"
                                onClick={() => navigate(`/product/${prod._id}`)}
                                onMouseEnter={() => setHoveredProd(prod._id)}
                                onMouseLeave={() => setHoveredProd(null)}>

                                {/* Best seller badge */}
                                {prod.ratings >= 4 && (
                                    <div className="absolute top-3 left-3 z-10 bg-skyGreen text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                        ⭐ Best Seller
                                    </div>
                                )}

                                {/* Out of stock badge */}
                                {prod.stock === 0 && (
                                    <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                        Out of Stock
                                    </div>
                                )}

                                {/* Image box */}
                                <div className="w-full aspect-square bg-[#F4F5F7] relative overflow-hidden">
                                    {prod.images?.length > 0 ? (
                                        <img
                                            src={prod.images[0]}
                                            alt={prod.name}
                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Desktop Hover Actions */}
                                    {hoveredProd === prod._id && (
                                        <div className="hidden md:flex absolute inset-0 bg-[#3A3A3A]/80 flex-col items-center justify-center gap-3 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAddToCart(prod); }}
                                                disabled={prod.stock === 0 || addingId === prod._id}
                                                className="bg-white text-skyGreen font-bold px-10 py-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                {addingId === prod._id
                                                    ? 'Adding…'
                                                    : prod.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                                            </button>
                                            <div className="flex gap-4 text-white text-sm mt-1 font-semibold items-center">
                                                <Link to={`/product/${prod._id}`} className="hover:underline">View</Link>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(prod)); }}
                                                    className="flex items-center gap-1 transition-colors"
                                                >
                                                    <Heart
                                                        className={`w-4 h-4 transition-all ${wishlistIds.includes(prod._id) ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mobile Quick Actions (Always visible on mobile) */}
                                    <div className="md:hidden absolute bottom-2 right-2 z-10 flex flex-col gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(prod)); }}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border ${wishlistIds.includes(prod._id) ? 'bg-white border-red-100' : 'bg-white border-gray-100'}`}
                                        >
                                            <Heart className={`w-4 h-4 ${wishlistIds.includes(prod._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(prod); }}
                                            disabled={prod.stock === 0 || addingId === prod._id}
                                            className="w-8 h-8 bg-skyGreen text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:opacity-50"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Product info */}
                                <div className="w-full bg-[#F4F5F7] p-3 sm:p-5 flex flex-col flex-grow">
                                    <div className="text-sm sm:text-lg font-bold text-[#3A3A3A] mb-1 leading-tight group-hover:text-skyGreen transition-colors line-clamp-2">
                                        {prod.name}
                                    </div>
                                    <p className="text-sm text-[#898989] font-medium mb-2">{prod.category || 'Feeder'}</p>

                                    {/* Star rating */}
                                    {
                                        prod.ratings > 0 && (
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <StarRating rating={prod.ratings} />
                                                <span className="text-xs text-gray-400">({prod.reviews?.length || 0})</span>
                                            </div>
                                        )
                                    }

                                    < div className="flex items-center justify-between w-full mt-auto" >
                                        <span className="text-[#3A3A3A] font-extrabold text-xl">
                                            ₹{Math.round(prod.price)?.toLocaleString('en-IN')}
                                        </span>
                                        {
                                            prod.mrp > 0 && prod.mrp > prod.price && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{Math.round(prod.mrp)?.toLocaleString('en-IN')}
                                                </span>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        ))
                        }
                    </div >
                )}

                {/* ── Pagination ────────────────────────────────────────── */}
                {
                    totalPages > 1 && (
                        <div className="mt-20 flex justify-center items-center gap-3">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-5 h-12 rounded bg-[#F9F1E7] text-black hover:bg-[#A77B51] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed font-medium">
                                ← Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-12 h-12 rounded font-medium transition ${page === currentPage
                                        ? 'bg-[#A77B51] text-white shadow-md'
                                        : 'bg-[#F9F1E7] text-black hover:bg-[#A77B51] hover:text-white'
                                        }`}>
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-5 h-12 rounded bg-[#F9F1E7] text-black hover:bg-[#A77B51] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed font-medium">
                                Next →
                            </button>
                        </div>
                    )
                }

                {/* Page info */}
                {
                    filteredProducts.length > PRODUCTS_PER_PAGE && (
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Page {currentPage} of {totalPages} · {filteredProducts.length} products total
                        </p>
                    )
                }
            </div >
        </div >
    );
};

export default Shop;
