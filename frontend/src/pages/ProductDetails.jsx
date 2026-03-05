import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, StarHalf, Facebook, Linkedin, Twitter, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProductById, fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectWishlistIds } from '../store/slices/wishlistSlice';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedProduct: product, items, status } = useSelector(state => state.products);
    const { isAuthenticated } = useSelector(state => state.auth);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const wishlistIds = useSelector(selectWishlistIds);
    const isWishlisted = product ? wishlistIds.includes(product._id) : false;
    const toast = useToast();

    // Image gallery state
    const [activeImg, setActiveImg] = useState(0);
    const [imgFading, setImgFading] = useState(false);

    const changeImg = useCallback((idx) => {
        if (!product?.images?.length) return;
        const clamped = (idx + product.images.length) % product.images.length;
        setImgFading(true);
        setTimeout(() => {
            setActiveImg(clamped);
            setImgFading(false);
        }, 120);
    }, [product?.images?.length]);

    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { toast.warning('Please login to submit a review.'); return; }
        if (!comment.trim()) { toast.warning('Please enter a review comment.'); return; }
        try {
            setIsSubmittingReview(true);
            await api.post(`/products/${product._id}/reviews`, { rating, comment });
            toast.success('Review submitted successfully!');
            setComment('');
            setRating(5);
            dispatch(fetchProductById(product._id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0); // scroll to top when id changes
        setActiveImg(0);       // reset gallery to first image
        if (id) {
            dispatch(fetchProductById(id));
        }
        if (items.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, id, items.length]);

    // Derived related products
    const relatedProducts = items.filter(p => p.category === product?.category && p._id !== product?._id).slice(0, 4);

    if (status === 'loading' || !product) {
        return <SkeletonLoader text="Loading product details..." />;
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumb row */}
            <div className="bg-[#F9F1E7] px-4 md:px-16 py-6 flex items-center text-sm font-medium text-[#9F9F9F]">
                <Link to="/" className="text-black hover:underline transition">Home</Link>
                <span className="mx-4 text-black">&gt;</span>
                <Link to="/shop" className="text-black hover:underline transition">Shop</Link>
                <span className="mx-4 text-black">&gt;</span>
                <span className="w-px h-6 bg-[#9F9F9F] mx-4 border-l border-[#9F9F9F]"></span>
                <span className="text-black font-semibold tracking-wide">{product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Images Gallery */}
                    <div className="flex flex-col-reverse md:flex-row gap-4 w-full lg:w-1/2">
                        {/* Thumbnails column */}
                        <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[500px] md:w-20 shrink-0 pb-2 md:pb-0 pr-1">
                            {product.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => changeImg(idx)}
                                    className={`w-16 md:w-full shrink-0 aspect-square rounded overflow-hidden border-2 transition-all duration-200 ${activeImg === idx
                                        ? 'border-black shadow-md scale-105'
                                        : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Main image with arrows */}
                        <div className="relative flex-1 bg-[#F9F1E7] rounded h-80 md:h-[500px] overflow-hidden group">
                            {/* Main image */}
                            {product.images?.[activeImg] && (
                                <img
                                    key={activeImg}
                                    src={product.images[activeImg]}
                                    alt={product.name}
                                    className={`w-full h-full object-cover transition-opacity duration-150 ${imgFading ? 'opacity-0' : 'opacity-100'
                                        }`}
                                />
                            )}

                            {/* Left / Right arrows — only show if multiple images */}
                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => changeImg(activeImg - 1)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-800" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => changeImg(activeImg + 1)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-800" />
                                    </button>

                                    {/* Dot indicators */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                        {product.images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => changeImg(idx)}
                                                className={`rounded-full transition-all ${activeImg === idx
                                                    ? 'w-4 h-2 bg-black'
                                                    : 'w-2 h-2 bg-black/30 hover:bg-black/60'
                                                    }`}
                                                aria-label={`Go to image ${idx + 1}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Counter badge */}
                                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {activeImg + 1} / {product.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="w-full lg:w-1/2 pt-4 flex flex-col">
                        <h1 className="text-3xl md:text-4xl text-black font-semibold mb-2">{product.name}</h1>
                        <p className="text-xl md:text-2xl text-[#9F9F9F] font-semibold mb-4">Rs. {Math.round(product.price)?.toLocaleString('en-IN')}</p>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex text-[#FFC700]">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    (product.ratings || 0) >= s ?
                                        <Star key={s} className="w-4 h-4 fill-current" /> :
                                        (product.ratings || 0) >= s - 0.5 ?
                                            <StarHalf key={s} className="w-4 h-4 fill-current" /> :
                                            <Star key={s} className="w-4 h-4 text-gray-300" />
                                ))}
                            </div>
                            <span className="text-[#9F9F9F] text-sm font-semibold border-l border-[#9F9F9F] pl-4">{product.reviews?.length || 0} Customer Review{product.reviews?.length !== 1 ? 's' : ''}</span>
                        </div>

                        <p className="text-[#333333] text-sm leading-relaxed mb-6 font-medium max-w-sm">
                            {product.description || "Setting the bar as one of the loudest bird feeders in its class..."}
                        </p>

                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <span className="text-[#9F9F9F] text-sm font-semibold block mb-2">Size</span>
                                <div className="flex flex-wrap gap-4">
                                    {product.sizes.map((size, idx) => (
                                        <button key={idx} className={`w-8 h-8 rounded text-xs font-bold transition ${idx === 0 ? 'bg-[#B88E2F] text-white' : 'bg-[#F9F1E7] text-black hover:bg-[#B88E2F] hover:text-white'}`}>
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mb-10 md:mb-16">
                            <div className="flex items-center border border-gray-400 rounded-xl h-14 w-32 px-4 justify-between shrink-0">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl font-medium">-</button>
                                <span className="font-semibold">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-xl font-medium">+</button>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
                                        toast.cart(`${product.name} × ${quantity}`, {
                                            image: product.images?.[0],
                                        });
                                    } catch (err) {
                                        toast.error(err || 'Please login to add to cart');
                                    }
                                }}
                                className="border border-black rounded-xl h-14 px-8 md:px-10 text-black font-semibold hover:bg-black hover:text-white transition shrink-0">
                                Add To Cart
                            </button>
                            <button
                                onClick={() => product && dispatch(toggleWishlist(product))}
                                className={`border rounded-xl h-14 w-14 flex justify-center items-center font-semibold transition shrink-0 ${isWishlisted ? 'border-red-500 bg-red-50 hover:bg-red-100' : 'border-black text-black hover:bg-black hover:text-white'}`}>
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-red-500' : 'pointer-events-none'}`} />
                            </button>
                        </div>

                        <hr className="mb-8" />

                        <div className="flex flex-col gap-3 text-[#9F9F9F] text-sm font-medium">
                            <div className="flex">
                                <span className="w-24">SKU</span>
                                <span>: {product.sku || (product._id ? product._id.slice(-6).toUpperCase() : 'N/A')}</span>
                            </div>
                            <div className="flex">
                                <span className="w-24">Category</span>
                                <span>: {product.category || 'Uncategorized'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-24">Tags</span>
                                <span>: {product.tags?.length ? product.tags.join(', ') : 'None'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24">Share</span>
                                <span className="flex gap-4 text-black">
                                    <Facebook className="w-4 h-4 fill-current cursor-pointer" />
                                    <Linkedin className="w-4 h-4 fill-current cursor-pointer" />
                                    <Twitter className="w-4 h-4 fill-current cursor-pointer" />
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <hr className="max-w-7xl mx-auto border-gray-200" />

            {/* Guarantees Banner (Matches Desktop-1 Footer Guarantees) */}
            {/* Omitted here or replicate brown bar? Let's leave according to screenshot 3 which shows related products instead. */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center border-t border-gray-200 mt-16 text-[#9F9F9F]">
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 font-medium text-lg md:text-xl mb-10 text-black/50">
                    <span
                        onClick={() => setActiveTab('description')}
                        className={`cursor-pointer transition ${activeTab === 'description' ? 'text-black font-semibold border-b-2 border-black pb-1' : 'hover:text-black'}`}>Description</span>
                    <span
                        onClick={() => setActiveTab('additional')}
                        className={`cursor-pointer transition ${activeTab === 'additional' ? 'text-black font-semibold border-b-2 border-black pb-1' : 'hover:text-black'}`}>Additional Information</span>
                    <span
                        onClick={() => setActiveTab('reviews')}
                        className={`cursor-pointer transition ${activeTab === 'reviews' ? 'text-black font-semibold border-b-2 border-black pb-1' : 'hover:text-black'}`}>Reviews [{product.reviews?.length || 0}]</span>
                </div>

                {activeTab === 'description' && (
                    <div className="max-w-4xl mx-auto text-sm leading-relaxed text-left text-[#9F9F9F] mb-8 animate-fadeIn">
                        <p className="mb-4">{product.description || "No specific description format found."}</p>
                        {/* Dynamic images if array size > 1 */}
                        {product.images?.length > 1 && (
                            <div className="flex flex-col md:flex-row gap-8 justify-center h-auto md:h-[350px] mt-10">
                                <div className="bg-[#F9F1E7] rounded w-full md:w-1/2 overflow-hidden">
                                    <img src={product.images[1]} alt="View 2" className="w-full h-full object-cover" />
                                </div>
                                {product.images.length > 2 && (
                                    <div className="bg-[#F9F1E7] rounded w-full md:w-1/2 hidden md:block overflow-hidden">
                                        <img src={product.images[2]} alt="View 3" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'additional' && (
                    <div className="max-w-4xl mx-auto text-sm leading-relaxed text-left text-[#9F9F9F] mb-8 bg-gray-50/50 p-8 rounded-xl border border-gray-100 animate-fadeIn">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 font-semibold text-black w-40">Weight</td>
                                    <td className="py-4">{product.weight || '0.5 kg'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 font-semibold text-black">Dimensions</td>
                                    <td className="py-4">{product.dimensions || '10 x 15 x 20 cm'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 font-semibold text-black">Materials</td>
                                    <td className="py-4">{product.materials || 'Premium Wood & Sustainable Plastics'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 font-semibold text-black">Warranty</td>
                                    <td className="py-4">1 Year Standard Warranty</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="max-w-4xl mx-auto text-sm leading-relaxed text-left text-[#9F9F9F] mb-8 animate-fadeIn">

                        {/* Write a Review Section */}
                        {isAuthenticated ? (
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 mb-8">
                                <h3 className="text-lg font-bold text-black mb-4">Write a Review</h3>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-black font-medium mb-2">Rating</label>
                                        <div className="flex gap-1 text-[#FFC700] cursor-pointer">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star
                                                    key={s}
                                                    className={`w-6 h-6 ${rating >= s ? 'fill-current' : 'text-gray-300'}`}
                                                    onClick={() => setRating(s)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-black font-medium mb-2">Your Review</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows="4"
                                            className="w-full border border-gray-300 rounded p-3 text-black focus:outline-none focus:border-black"
                                            placeholder="What do you think about this product?"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="bg-black text-white px-8 py-3 rounded font-bold hover:bg-gray-800 transition disabled:opacity-50"
                                    >
                                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-[#F9F1E7] p-6 rounded-xl mb-8 text-center text-black font-medium">
                                Please <a href="/login" className="underline font-bold text-skyGreen">log in</a> to write a review.
                            </div>
                        )}

                        {/* Reviews List */}
                        {product.reviews && product.reviews.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                {product.reviews.map((rev, i) => (
                                    <div key={i} className="border-b border-gray-100 pb-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-skyGreen text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                                                {rev.name?.charAt(0)?.toUpperCase() || rev.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-black text-base">{rev.name || rev.user?.name || 'User'}</div>
                                                <div className="flex text-[#FFC700] mt-1">
                                                    {[...Array(5)].map((_, idx) => (
                                                        idx < (rev.rating || 5) ?
                                                            <Star key={idx} className="w-3.5 h-3.5 fill-current" /> :
                                                            <Star key={idx} className="w-3.5 h-3.5 text-gray-300" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="ml-14 text-sm text-gray-600 font-normal">{rev.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50/50 border border-gray-100 rounded-xl">
                                <div className="text-4xl mb-4">⭐</div>
                                <p className="text-lg font-medium text-black mb-1">No reviews yet</p>
                                <p className="text-sm">Be the first to review {product.name}!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Related Products Section */}
            {relatedProducts && relatedProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 mt-8 border-t border-gray-200 pt-12">
                    <h2 className="text-4xl font-semibold text-center text-black mb-12">Related Products</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {relatedProducts.map(relProd => (
                            <Link to={`/product/${relProd._id}`} key={relProd._id} className="bg-[#F4F5F7] pb-4 flex flex-col items-center group cursor-pointer block border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md transition-all">
                                <div className="w-full h-64 bg-gray-200 mb-4 overflow-hidden relative">
                                    {relProd.images?.[0] ? (
                                        <img src={relProd.images[0]} alt={relProd.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="px-4 w-full">
                                    <h3 className="text-lg font-bold text-[#3A3A3A] mb-1 truncate group-hover:text-skyGreen transition">{relProd.name}</h3>
                                    <p className="text-sm text-[#898989] mb-2 font-medium truncate">{relProd.category}</p>
                                    <p className="text-lg font-bold text-[#3A3A3A]">Rs. {Math.round(relProd.price)?.toLocaleString('en-IN')}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
};

export default ProductDetails;
