import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectWishlistIds } from '../store/slices/wishlistSlice';
import { Heart, ShoppingCart, Star, ArrowRight, Shield, Truck, Award, Zap, HeartHandshake } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import useSEO from '../hooks/useSEO';
import api from '../api/axios';

// ── Icon map for feature cards (admin picks by name) ─────────────────────────
const ICON_MAP = { Shield, Award, Truck, Zap, Heart: HeartHandshake, Star };

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
);

// ── Default config (matches backend seed defaults) ────────────────────────────
const DEFAULT_CONFIG = {
    hero: {
        badge: '🐕 New — Dog Collection',
        title: 'The Best for',
        titleHighlight: 'Your Best Friend',
        subtitle: 'Premium dog essentials — food, toys, grooming, beds and more. Curated with love for happy, healthy dogs across India.',
        ctaPrimaryText: 'Shop Dog Products',
        ctaPrimaryLink: '/collections/dogs',
        ctaSecondaryText: 'Browse All Products',
        ctaSecondaryLink: '/shop',
        stat1: 'Free Shipping ₹499+',
        stat2: 'Easy Returns',
    },
    categories: [
        { emoji: '🦴', label: 'Food & Treats', desc: 'Nutritious & delicious', slug: 'dogs' },
        { emoji: '🎾', label: 'Toys', desc: 'Keep them playful', slug: 'dogs' },
        { emoji: '🛁', label: 'Grooming', desc: 'Clean & fresh coat', slug: 'dogs' },
        { emoji: '🎀', label: 'Collars & Leashes', desc: 'Style meets control', slug: 'dogs' },
        { emoji: '🏡', label: 'Beds & Crates', desc: 'Cozy safe haven', slug: 'dogs' },
        { emoji: '💊', label: 'Health & Wellness', desc: 'Stay fit & strong', slug: 'dogs' },
    ],
    features: [
        { iconName: 'Shield', title: 'Safe & Vet-Approved', desc: 'All products are pet-safe, non-toxic and suitable for Indian dog breeds.' },
        { iconName: 'Award', title: 'Premium Quality', desc: "Curated for durability, comfort and your dog's long-term happiness." },
        { iconName: 'Truck', title: 'Fast Delivery', desc: "Delivered across India — from Mumbai to Chennai, your dog won't wait long." },
    ],
    cta: {
        emoji: '🐕',
        title: 'Ready to Spoil Your Dog?',
        subtitle: 'Browse our full collection of premium dog products and give your furry friend the life they deserve.',
        buttonText: 'Browse All Dog Products',
        buttonLink: '/collections/dogs',
    },
};

// ── Dogs Page ─────────────────────────────────────────────────────────────────
const Dogs = () => {
    useSEO({
        title: 'Shop Premium Dog Products Online India — SkyBeings',
        description: 'Buy dog food, toys, grooming supplies, collars, beds and health products online at SkyBeings. Premium dog essentials delivered across India.',
        canonical: 'https://skybeings.in/dogs',
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: products, status } = useSelector(state => state.products);
    const wishlistIds = useSelector(selectWishlistIds);
    const [addingId, setAddingId] = useState(null);
    const [hoveredProd, setHoveredProd] = useState(null);
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const toast = useToast();

    // Fetch page config from API
    useEffect(() => {
        api.get('/dog-page')
            .then(res => {
                if (res.data?.data) setConfig(res.data.data);
            })
            .catch(() => { /* fall back to DEFAULT_CONFIG */ });
    }, []);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchProducts());
    }, [status, dispatch]);

    const dogProducts = products.filter(p =>
        p.category?.toLowerCase() === 'dogs' || p.category?.toLowerCase() === 'dog'
    );

    const handleAddToCart = async (prod, e) => {
        e.stopPropagation();
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

    const { hero, categories, features, cta } = config;

    return (
        <div className="w-full bg-white">

            {/* ========== HERO ========== */}
            <section
                className="relative w-full min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FFF1E6 0%, #FDEBD0 45%, #FAD5A5 100%)' }}
            >
                <span className="absolute top-10 right-16 text-8xl md:text-9xl select-none pointer-events-none" style={{ opacity: 0.10 }}>🐾</span>
                <span className="absolute bottom-6 left-8 text-6xl select-none pointer-events-none" style={{ opacity: 0.10 }}>🐾</span>
                <div className="absolute -right-24 -top-24 w-[400px] h-[400px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #C2692A 0%, transparent 70%)', opacity: 0.18 }} />
                <div className="absolute -left-16 bottom-0 w-[300px] h-[300px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #A0521F 0%, transparent 70%)', opacity: 0.10 }} />

                <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16 w-full">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
                            style={{ background: '#C2692A20', color: '#C2692A' }}>
                            {hero.badge}
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                            {hero.title}<br />
                            <span style={{ color: '#C2692A' }}>{hero.titleHighlight}</span>
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">{hero.subtitle}</p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Link to={hero.ctaPrimaryLink} id="dogs-shop-now-btn"
                                className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white rounded-xl shadow-lg text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                style={{ background: 'linear-gradient(135deg, #C2692A 0%, #A0521F 100%)' }}>
                                {hero.ctaPrimaryText} <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to={hero.ctaSecondaryLink} id="dogs-browse-all-btn"
                                className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl text-sm border-2 transition-all hover:-translate-y-0.5"
                                style={{ borderColor: '#C2692A', color: '#C2692A' }}>
                                {hero.ctaSecondaryText}
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 mt-10 text-sm text-gray-500">
                            {hero.stat1 && (
                                <span className="flex items-center gap-1.5 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{hero.stat1}
                                </span>
                            )}
                            {hero.stat2 && (
                                <span className="flex items-center gap-1.5 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{hero.stat2}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== CATEGORIES ========== */}
            {categories?.length > 0 && (
                <section className="py-20 px-4" style={{ background: '#FFF8F2' }}>
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#C2692A' }}>What Does Your Dog Need?</p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Shop by Category</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((cat, i) => (
                                <Link key={i} to={`/collections/${cat.slug || 'dogs'}`}
                                    id={`dog-cat-${i}`}
                                    className="group flex flex-col items-center text-center bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg border border-transparent transition-all duration-300"
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#C2692A30'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                                    <span className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3 transition-all duration-300 group-hover:scale-110"
                                        style={{ background: '#FEF0E0' }}>{cat.emoji}</span>
                                    <span className="text-sm font-bold text-gray-800 leading-tight mb-1 group-hover:transition-colors"
                                        onMouseEnter={e => e.currentTarget.style.color = '#C2692A'}
                                        onMouseLeave={e => e.currentTarget.style.color = ''}>
                                        {cat.label}
                                    </span>
                                    <span className="text-xs text-gray-400 leading-tight">{cat.desc}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ========== FEATURED DOG PRODUCTS ========== */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#C2692A' }}>Handpicked for Your Pup</p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Featured Dog Products</h2>
                        </div>
                        <Link to="/collections/dogs" className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3" style={{ color: '#C2692A' }}>
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {status === 'loading' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex flex-col animate-pulse">
                                    <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                                    <div className="bg-gray-100 p-4 rounded-b-xl space-y-2 mt-0.5">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : dogProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6" style={{ background: '#FEF0E0' }}>🐾</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Dog products coming soon!</h3>
                            <p className="text-gray-400 text-sm mb-8 max-w-xs">We're stocking up on the best dog essentials. Check back soon or browse all products.</p>
                            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 font-bold text-white rounded-xl text-sm transition-all hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(135deg, #C2692A 0%, #A0521F 100%)' }}>
                                Browse All Products <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {dogProducts.slice(0, 8).map(prod => (
                                <div key={prod._id} id={`dog-product-${prod._id}`}
                                    className="relative group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                    onClick={() => navigate(`/product/${prod._id}`)}
                                    onMouseEnter={() => setHoveredProd(prod._id)}
                                    onMouseLeave={() => setHoveredProd(null)}>
                                    {prod.ratings >= 4 && (
                                        <div className="absolute top-3 left-3 z-10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#C2692A' }}>
                                            ⭐ Top Rated
                                        </div>
                                    )}
                                    {prod.stock === 0 && (
                                        <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Out of Stock</div>
                                    )}
                                    <div className="w-full aspect-square relative overflow-hidden" style={{ background: '#FFF8F2' }}>
                                        {prod.images?.length > 0 ? (
                                            <img src={prod.images[0]} alt={prod.name}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>
                                        )}
                                        {hoveredProd === prod._id && (
                                            <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center gap-3"
                                                style={{ background: 'rgba(58,30,10,0.75)' }}>
                                                <button onClick={(e) => handleAddToCart(prod, e)}
                                                    disabled={prod.stock === 0 || addingId === prod._id}
                                                    className="font-bold px-8 py-2.5 text-sm disabled:opacity-50 rounded transition-colors"
                                                    style={{ background: 'white', color: '#C2692A' }}>
                                                    {addingId === prod._id ? 'Adding…' : prod.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                </button>
                                                <div className="flex gap-4 text-sm font-semibold items-center text-white">
                                                    <Link to={`/product/${prod._id}`} onClick={e => e.stopPropagation()} className="hover:underline">View</Link>
                                                    <button onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(prod)); }}>
                                                        <Heart className={`w-4 h-4 ${wishlistIds.includes(prod._id) ? 'fill-red-400 text-red-400 scale-110' : 'text-white'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="md:hidden absolute bottom-2 right-2 z-10 flex flex-col gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(prod)); }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border bg-white ${wishlistIds.includes(prod._id) ? 'border-red-100' : 'border-gray-100'}`}>
                                                <Heart className={`w-4 h-4 ${wishlistIds.includes(prod._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                            </button>
                                            <button onClick={(e) => handleAddToCart(prod, e)} disabled={prod.stock === 0 || addingId === prod._id}
                                                className="w-8 h-8 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:opacity-50"
                                                style={{ background: '#C2692A' }}>
                                                <ShoppingCart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow" style={{ background: '#FFF8F2' }}>
                                        <p className="text-xs font-medium mb-1" style={{ color: '#C2692A' }}>{prod.subCategory || prod.category}</p>
                                        <div className="text-sm sm:text-base font-bold text-gray-800 mb-1 line-clamp-2 leading-tight"
                                            onMouseEnter={e => e.currentTarget.style.color = '#C2692A'}
                                            onMouseLeave={e => e.currentTarget.style.color = ''}>
                                            {prod.name}
                                        </div>
                                        {prod.ratings > 0 && (
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <StarRating rating={prod.ratings} />
                                                <span className="text-xs text-gray-400">({prod.reviews?.length || 0})</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-auto pt-2">
                                            <span className="font-extrabold text-lg text-gray-900">₹{Math.round(prod.price)?.toLocaleString('en-IN')}</span>
                                            {prod.mrp > 0 && prod.mrp > prod.price && (
                                                <span className="text-xs text-gray-400 line-through">₹{Math.round(prod.mrp)?.toLocaleString('en-IN')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {dogProducts.length > 8 && (
                        <div className="flex justify-center mt-10">
                            <Link to="/collections/dogs"
                                className="inline-flex items-center gap-2 px-10 py-3.5 font-bold text-white rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #C2692A 0%, #A0521F 100%)' }}>
                                View All Dog Products <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ========== WHY SKYBEINGS ========== */}
            {features?.length > 0 && (
                <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #3D2B1F 0%, #5C3D2A 100%)' }}>
                    <div className="max-w-6xl mx-auto text-center">
                        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#F4A95A' }}>Why Dog Parents Love Us</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-14">SkyBeings — Built for Dogs 🐾</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {features.map(({ iconName, title, desc }, i) => {
                                const Icon = ICON_MAP[iconName] || Shield;
                                return (
                                    <div key={i} className="rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:-translate-y-1"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: '#C2692A20' }}>
                                            <Icon className="w-6 h-6" style={{ color: '#F4A95A' }} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>{desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ========== CTA STRIP ========== */}
            <section className="py-16 px-4 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FFF1E6 0%, #FDE8CC 100%)' }}>
                <span className="absolute top-4 right-8 text-6xl select-none pointer-events-none" style={{ opacity: 0.10 }}>🐾</span>
                <span className="absolute bottom-4 left-8 text-5xl select-none pointer-events-none" style={{ opacity: 0.10 }}>🐾</span>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="text-5xl mb-4">{cta.emoji}</div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">{cta.title}</h2>
                    <p className="text-gray-500 text-base mb-8">{cta.subtitle}</p>
                    <Link to={cta.buttonLink} id="dogs-final-cta-btn"
                        className="inline-flex items-center gap-2 px-10 py-4 font-bold text-white rounded-xl shadow-lg text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #C2692A 0%, #A0521F 100%)' }}>
                        {cta.buttonText} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default Dogs;
