import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { useState } from 'react';

const Wishlist = () => {
    const dispatch = useDispatch();
    const items = useSelector(state => state.wishlist.items);
    const [addingId, setAddingId] = useState(null);

    const handleAddToCart = async (product) => {
        setAddingId(product._id);
        try {
            await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
        } catch (err) {
            alert(err || 'Please login to add to cart');
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Page Header */}
            <div className="h-[200px] bg-[#FCECD8] w-full flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-black mb-2">Wishlist</h1>
                <p className="text-black font-semibold text-sm">
                    <Link to="/" className="hover:underline">Home</Link>
                    <span className="mx-2">›</span>
                    Wishlist
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {items.length === 0 ? (
                    /* ── Empty State ── */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Heart className="w-20 h-20 text-gray-200 mb-6" strokeWidth={1.5} />
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Wishlist is Empty</h2>
                        <p className="text-gray-400 text-sm mb-8 max-w-sm">
                            You haven't added any products to your wishlist yet. Explore our store and
                            save your favourite items here!
                        </p>
                        <Link
                            to="/shop"
                            className="bg-skyGreen text-white font-bold px-10 py-3 rounded hover:bg-[#0c660b] transition-all shadow-md"
                        >
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    /* ── Products Grid ── */
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-800">
                                {items.length} {items.length === 1 ? 'Item' : 'Items'} Saved
                            </h2>
                            <Link to="/shop" className="text-sm text-skyGreen font-semibold hover:underline">
                                Continue Shopping →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map(product => (
                                <div key={product._id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                    {/* Image */}
                                    <Link to={`/product/${product._id}`} className="block relative overflow-hidden aspect-square bg-[#F4F5F7]">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                <Heart className="w-10 h-10 text-gray-300" />
                                            </div>
                                        )}
                                        {/* Remove from wishlist */}
                                        <button
                                            onClick={(e) => { e.preventDefault(); dispatch(toggleWishlist(product)); }}
                                            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                                            title="Remove from wishlist"
                                        >
                                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                        </button>
                                    </Link>

                                    {/* Info */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <Link to={`/product/${product._id}`} className="text-base font-bold text-gray-800 hover:text-skyGreen transition-colors mb-1 leading-tight">
                                            {product.name}
                                        </Link>
                                        <p className="text-xs text-gray-400 font-medium mb-3">{product.category || 'Product'}</p>
                                        <p className="text-skyGreen font-extrabold text-lg mb-4">
                                            ₹ {product.price?.toLocaleString('en-IN')}
                                        </p>

                                        <div className="flex gap-2 mt-auto">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={addingId === product._id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-skyGreen text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#0c660b] disabled:opacity-60 transition-colors"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                {addingId === product._id ? 'Adding…' : 'Add to Cart'}
                                            </button>
                                            <button
                                                onClick={() => dispatch(toggleWishlist(product))}
                                                className="w-10 h-10 flex items-center justify-center border border-red-200 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
