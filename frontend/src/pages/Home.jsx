import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectWishlistIds } from '../store/slices/wishlistSlice';
import { Heart, ShoppingCart } from 'lucide-react';
import BannerCarousel from '../components/ui/BannerCarousel';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';

import birdFeederImg from '../assets/images/bird_feeder.png';
import waterFeederImg from '../assets/images/water_feeder.png';
import birdHouseImg from '../assets/images/bird_house.png';

import SkeletonLoader from '../components/ui/SkeletonLoader';

// ── Gallery Section Component ────────────────────────────────────────────────
const MOSAIC_COLS = [
    { width: 100, slots: [{ h: 240 }, { h: 240 }] },
    { width: 220, slots: [{ h: 220 }, { h: 160 }] },
    { width: 280, slots: [{ h: 490 }] },  // centre large
    { width: 220, slots: [{ h: 190 }, { h: 220 }] },
    { width: 100, slots: [{ h: 280 }, { h: 200 }] },
];

const PLACEHOLDER_COLORS = [
    'from-[#c8e6c9] to-[#a5d6a7]',
    'from-[#dcedc8] to-[#c5e1a5]',
    'from-[#b2dfdb] to-[#80cbc4]',
    'from-[#ffe0b2] to-[#ffcc80]',
    'from-[#d7ccc8] to-[#bcaaa4]',
    'from-[#f0f4c3] to-[#e6ee9c]',
    'from-[#b3e5fc] to-[#81d4fa]',
    'from-[#e1bee7] to-[#ce93d8]',
    'from-[#fce4ec] to-[#f48fb1]',
];

// Pre-compute a flat slot list with cumulative indices
const ALL_SLOTS = MOSAIC_COLS.flatMap((col, ci) =>
    col.slots.map((slot, si) => ({ ...slot, ci, si, width: col.width }))
).map((slot, idx) => ({ ...slot, idx }));

const GallerySection = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/gallery/active')
            .then(res => setImages(res.data?.data?.images || []))
            .catch(() => setImages([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="bg-[#FAFAFA] py-16 text-center">
            <p className="text-gray-400 font-medium text-sm tracking-wider mb-2">
                Get your bird friend at resting place to your window
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">When Birds Come Home</h2>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <SkeletonLoader text="Loading Gallery..." />
                </div>
            ) : images.length > 0 ? (
                <div className="max-w-6xl mx-auto px-4 overflow-hidden">
                    <div className="flex gap-3 items-center justify-center">
                        {MOSAIC_COLS.map((col, ci) => (
                            <div
                                key={ci}
                                className={`flex flex-col gap-3 ${ci !== 2 ? 'hidden md:flex' : 'flex'}`}
                                style={{ width: `${col.width}px` }}>
                                {col.slots.map((slot, si) => {
                                    const flatIdx = ALL_SLOTS.find(s => s.ci === ci && s.si === si)?.idx ?? 0;
                                    const img = images[flatIdx];
                                    if (!img) return null;
                                    return (
                                        <div
                                            key={si}
                                            className="rounded-sm overflow-hidden bg-gray-100 flex-shrink-0 w-full"
                                            style={{ height: `${slot.h}px` }}>
                                            <img
                                                src={img.imageUrl}
                                                alt={img.caption || 'Gallery'}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* View All Buttons */}
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/gallery"
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#4A6443] text-white font-bold rounded-xl hover:bg-green-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm uppercase tracking-wider"
                        >
                            View All Gallery
                        </Link>
                        <Link
                            to="/blogs"
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#FCECD8] text-[#A77B51] font-bold rounded-xl hover:bg-[#A77B51] hover:text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm uppercase tracking-wider border border-[#A77B51]/20"
                        >
                            Read Our Blogs
                        </Link>
                    </div>
                </div>
            ) : null}
        </section>
    );
};


const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: products, status } = useSelector(state => state.products);
    const wishlistIds = useSelector(selectWishlistIds);
    const [hoveredProd, setHoveredProd] = useState(null);
    const toast = useToast();

    useEffect(() => {
        if (status === 'idle') dispatch(fetchProducts());
    }, [status, dispatch]);

    const displayProducts = products.length > 0 ? products.slice(0, 8) : [];
    const categories = [
        { name: 'Bird Feeder', image: birdFeederImg },
        { name: 'Water Feeder', image: waterFeederImg },
        { name: 'Bird House', image: birdHouseImg },
    ];

    return (
        <div className="w-full bg-white">

            {/* ========== HERO BANNER ========== */}
            <BannerCarousel
                page="home"
                fallback={
                    <div className="w-full h-[420px] md:h-[500px] relative overflow-hidden"
                        style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #5BB5E0 40%, #3A9FD8 70%, #4AAF5A 95%, #3D8B37 100%)' }}>
                        <div className="absolute top-[20%] left-[10%] w-[200px] h-[60px] bg-white/20 rounded-full blur-xl" />
                        <div className="absolute top-[30%] right-[15%] w-[150px] h-[50px] bg-white/15 rounded-full blur-xl" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">Welcome to SkyBeings</h1>
                            <p className="text-white/80 text-lg mb-6">Premium bird feeders &amp; accessories</p>
                            <Link to="/shop" className="inline-block bg-white text-skyGreen font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-lg">
                                Shop Now
                            </Link>
                        </div>
                    </div>
                }
            />

            {/* ========== EXPLORE CATEGORIES ========== */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                <div className="text-center mb-5 md:mb-10">
                    <h2 className="text-lg md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Explore Categories</h2>
                    <p className="text-gray-400 text-xs md:text-sm">Made to match nature</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                    {categories.map((cat, i) => (
                        <Link to="/shop" state={{ category: cat.name }} key={i} className="flex flex-col group block">
                            <div className="bg-[#F0F0F0] h-24 sm:h-40 md:h-64 flex items-center justify-center overflow-hidden mb-0">
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <div className="w-full py-1.5 md:py-3 text-center bg-skyGreen text-white font-bold text-[10px] sm:text-xs md:text-base cursor-pointer group-hover:bg-skyGreen/90 transition leading-tight px-1">
                                {cat.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ========== OUR PRODUCTS ========== */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">Our Products</h2>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {displayProducts.length > 0 ? displayProducts.map((prod) => (
                        <div key={prod._id}
                            className="relative group flex flex-col bg-white border border-gray-100 overflow-hidden transition duration-300 hover:shadow-lg cursor-pointer"
                            onClick={() => navigate(`/product/${prod._id}`)}
                            onMouseEnter={() => setHoveredProd(prod._id)}
                            onMouseLeave={() => setHoveredProd(null)}>
                            <div className="w-full aspect-square bg-[#F4F5F7] flex items-center justify-center relative overflow-hidden">
                                {prod.images && prod.images.length > 0 ? (
                                    <img src={prod.images[0]} alt={prod.name} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                        <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Desktop Hover Overlay */}
                                {hoveredProd === prod._id && (
                                    <div className="hidden md:flex absolute inset-0 bg-[#3A3A3A]/80 flex-col items-center justify-center gap-3 transition-opacity">
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    await dispatch(addToCart({ productId: prod._id, quantity: 1 })).unwrap();
                                                    toast.cart(prod.name, { image: prod.images?.[0] });
                                                } catch (err) {
                                                    toast.error(err || 'Please login to add to cart');
                                                }
                                            }}
                                            className="bg-white text-skyGreen font-bold px-8 py-2.5 text-sm hover:bg-gray-100 transition">
                                            Add to cart
                                        </button>
                                        <div className="flex gap-4 text-white text-xs mt-2 items-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(prod)); }}
                                                className="flex items-center gap-1 transition-colors"
                                            >
                                                <Heart
                                                    className={`w-4 h-4 transition-all ${wishlistIds.includes(prod._id)
                                                        ? 'fill-red-500 text-red-500 scale-110'
                                                        : 'text-white'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Quick Actions (Always visible on mobile) */}
                                <div className="md:hidden absolute bottom-2 right-2 z-10 flex flex-col gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(prod)); }}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md border bg-white ${wishlistIds.includes(prod._id) ? 'border-red-100' : 'border-gray-100'}`}
                                    >
                                        <Heart className={`w-3.5 h-3.5 ${wishlistIds.includes(prod._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                    </button>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await dispatch(addToCart({ productId: prod._id, quantity: 1 })).unwrap();
                                                toast.cart(prod.name, { image: prod.images?.[0] });
                                            } catch (err) {
                                                toast.error(err || 'Please login to add to cart');
                                            }
                                        }}
                                        className="w-7 h-7 bg-skyGreen text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="w-full bg-[#F4F5F7] p-3 sm:p-4">
                                <div className="text-sm sm:text-base font-bold text-[#3A3A3A] mb-1 block group-hover:text-skyGreen transition line-clamp-1">
                                    {prod.name}
                                </div>
                                <p className="text-xs text-[#898989] font-medium mb-2">{prod.category || 'Feeder'}</p>
                                <span className="text-skyGreen font-extrabold text-sm">₹ {Math.round(prod.price)?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    )) : (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col bg-white border border-gray-100 overflow-hidden">
                                <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                    </svg>
                                </div>
                                <div className="w-full bg-[#F4F5F7] p-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-center mt-10">
                    <Link to="/shop"
                        className="border-2 border-skyGreen text-skyGreen font-bold px-12 py-2.5 text-sm hover:bg-skyGreen hover:text-white transition">
                        Show More
                    </Link>
                </div>
            </section>

            {/* ========== WHEN BIRDS COME HOME — DYNAMIC GALLERY ========== */}
            <GallerySection />

        </div>
    );
};

export default Home;
