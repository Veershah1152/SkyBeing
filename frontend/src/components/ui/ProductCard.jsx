import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { useToast } from './Toast';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const toast = useToast();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        try {
            await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
            toast.cart(product.name, { image: product.images?.[0] });
        } catch (error) {
            toast.error(error || 'Please login to add to cart');
        }
    };

    return (
        <div className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white flex flex-col h-full">
            {/* Image Container */}
            <Link to={`/product/${product._id}`} className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-6">
                <img
                    src={product.images && product.images[0] ? product.images[0] : "https://via.placeholder.com/300?text=No+Image"}
                    alt={product.name}
                    className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                {/* Placeholder for badges like 'Sale' or 'New' */}
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                    <span className="text-xs font-semibold text-skyGreen uppercase tracking-wider">{product.category}</span>
                </div>
                <Link to={`/product/${product._id}`} className="block mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-skyGreen transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xl font-extrabold text-gray-900">₹{Math.round(product.price).toLocaleString('en-IN')}</span>
                    <button
                        onClick={handleAddToCart}
                        className="bg-skyGreen/10 text-skyGreen hover:bg-skyGreen hover:text-white p-2 md:px-4 rounded-lg flex items-center gap-2 transition-colors font-semibold"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span className="hidden md:block text-sm">Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
