import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartQuantity, removeFromCart } from '../store/slices/cartSlice';

const Cart = () => {
    const dispatch = useDispatch();
    const { items, totalAmount, status } = useSelector(state => state.cart);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchCart());
        }
    }, [status, dispatch]);

    return (
        <div className="bg-white min-h-screen">

            {/* Banner */}
            <div className="h-[250px] bg-[#FCECD8] w-full flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://via.placeholder.com/1500x500?text=Bg')] bg-cover bg-center"></div>
                <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-black font-extrabold text-white flex items-center justify-center rounded-full mb-2">S</div>
                    <h1 className="text-4xl text-black mb-2 font-medium tracking-wide">Cart</h1>
                    <p className="text-sm text-black font-medium tracking-wider"><span className="font-bold">Home</span> &gt; Cart</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Cart Items Table */}
                    <div className="lg:w-2/3">
                        <div className="bg-[#F9F1E7] hidden md:flex justify-between px-10 py-4 font-semibold text-black uppercase text-sm mb-10">
                            <span className="w-1/4">Product</span>
                            <span className="w-1/4 text-center">Price</span>
                            <span className="w-1/4 text-center">Quantity</span>
                            <span className="w-1/4 text-right">Subtotal</span>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-12 text-center text-[#9F9F9F] font-bold text-xl">Your cart is empty.</div>
                        ) : (
                            items.map((item) => (
                                <div key={item._id || item.product._id} className="flex flex-col md:flex-row items-center justify-between px-4 md:px-10 py-6 border-b border-gray-100 gap-4 md:gap-0">
                                    <div className="flex flex-1 items-center gap-6 w-full md:w-auto">
                                        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#F9F1E7] rounded-lg overflow-hidden shrink-0">
                                            {item.product.images?.length > 0 && <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-1 md:gap-0 flex-1 md:items-center">
                                            <Link to={`/product/${item.product._id}`} className="text-black md:text-[#9F9F9F] font-bold md:font-medium hover:text-black">{item.product.name}</Link>

                                            {/* Mobile only price & qty */}
                                            <div className="md:hidden flex items-center justify-between mt-2">
                                                <span className="text-skyGreen font-bold">₹{item.product.price}</span>
                                                <div className="flex items-center border border-[#9F9F9F] rounded w-20 bg-white">
                                                    <button onClick={() => dispatch(updateCartQuantity({ productId: item.product._id, quantity: Math.max(1, item.quantity - 1) }))} className="flex-1 text-center py-0.5">-</button>
                                                    <span className="flex-1 text-center font-semibold">{item.quantity}</span>
                                                    <button onClick={() => dispatch(updateCartQuantity({ productId: item.product._id, quantity: item.quantity + 1 }))} className="flex-1 text-center py-0.5">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop only columns */}
                                    <div className="hidden md:block flex-1 text-center text-[#9F9F9F] font-medium">
                                        ₹{item.product.price}
                                    </div>
                                    <div className="hidden md:flex flex-1 justify-center text-black font-medium">
                                        <div className="flex items-center border border-[#9F9F9F] rounded w-20">
                                            <button onClick={() => dispatch(updateCartQuantity({ productId: item.product._id, quantity: Math.max(1, item.quantity - 1) }))} className="flex-1 text-center">-</button>
                                            <span className="flex-1 text-center">{item.quantity}</span>
                                            <button onClick={() => dispatch(updateCartQuantity({ productId: item.product._id, quantity: item.quantity + 1 }))} className="flex-1 text-center">+</button>
                                        </div>
                                    </div>

                                    {/* Responsive Subtotal / Delete */}
                                    <div className="flex-1 text-right flex items-center justify-between md:justify-end gap-6 text-black font-medium w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-50">
                                        <span className="md:hidden text-sm text-gray-400">Subtotal:</span>
                                        <div className="flex items-center gap-6">
                                            <span className="font-bold md:font-medium">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                                            <Trash
                                                onClick={() => dispatch(removeFromCart(item.product._id))}
                                                className="w-5 h-5 text-red-400 cursor-pointer hover:text-red-600 transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Totals Box */}
                    <div className="lg:w-1/3">
                        <div className="bg-[#F9F1E7] p-10 pt-4 flex flex-col items-center h-full">
                            <h2 className="text-3xl font-bold text-black mb-12">Cart Totals</h2>

                            <div className="w-full flex justify-between text-black font-semibold mb-6">
                                <span>Subtotal</span>
                                <span className="text-[#9F9F9F]">Rs. {totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="w-full flex justify-between items-center text-black font-semibold mb-12">
                                <span>Total</span>
                                <span className="text-xl text-[#B88E2F] font-medium">Rs. {totalAmount.toFixed(2)}</span>
                            </div>

                            <Link to="/checkout" className="border border-black rounded-xl hover:bg-black hover:text-white transition w-56 py-3 text-center text-black font-medium text-lg">
                                Check Out
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Cart;
