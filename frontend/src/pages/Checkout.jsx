import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearCartLocal } from '../store/slices/cartSlice';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';
import BannerCarousel from '../components/ui/BannerCarousel';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalAmount, status } = useSelector(state => state.cart);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [shipToDifferent, setShipToDifferent] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchCart());
        }
    }, [status, dispatch]);

    const formattedTotal = totalAmount ? Math.round(totalAmount).toLocaleString('en-IN') : '0';

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const formData = new FormData(e.target);

            // Collect customer details from form
            const customerName = `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`.trim();
            const customerEmail = formData.get('email') || '';
            const customerPhone = formData.get('phone') || '';
            const orderNotes = formData.get('orderNotes') || '';

            // Use alternate shipping address if checkbox is ticked, otherwise use billing address
            const shippingAddress = shipToDifferent ? {
                street: formData.get('ship_street') || '',
                city: formData.get('ship_city') || '',
                state: formData.get('ship_state') || '',
                country: 'India',
                zipCode: formData.get('ship_pinCode') || ''
            } : {
                street: formData.get('street') || '',
                city: formData.get('city') || '',
                state: formData.get('state') || '',
                country: 'India',
                zipCode: formData.get('pinCode') || ''
            };

            const cartItems = items.map(i => ({
                productId: i.product._id,
                quantity: i.quantity
            }));

            // Create order in our DB first
            const orderRes = await api.post('/orders/guest', {
                shippingAddress,
                cartItems,
                paymentMethod,
                customerName,
                customerEmail,
                customerPhone,
                orderNotes,
            });
            const orderId = orderRes.data.data._id;

            if (paymentMethod === 'online') {
                // Load Razorpay SDK
                const sdkLoaded = await loadRazorpayScript();
                if (!sdkLoaded) {
                    toast.error('Razorpay SDK failed to load. Check your internet connection.');
                    setLoading(false);
                    return;
                }

                // Create Razorpay order on backend
                const rzpRes = await api.post('/payments/create-order', { orderId });
                const { id: rzpOrderId, amount, currency, key_id } = rzpRes.data.data;

                if (!key_id) {
                    toast.error('Razorpay key not configured. Please contact support.');
                    setLoading(false);
                    return;
                }

                const options = {
                    key: key_id,
                    amount: amount,
                    currency: currency,
                    name: "SkyBeings",
                    description: "Order Payment",
                    image: "/logo-cropped.png",
                    order_id: rzpOrderId,
                    handler: async function (response) {
                        try {
                            await api.post('/payments/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: orderId
                            });

                            // Track Purchase Events
                            if (window.fbq) window.fbq('track', 'Purchase', { value: totalAmount, currency: 'INR' });
                            if (window.gtag) window.gtag('event', 'purchase', { value: totalAmount, currency: 'INR', transaction_id: orderId });

                            dispatch(clearCartLocal());
                            toast.success('🎉 Payment successful! Your order has been placed.', { duration: 5000 });
                            navigate('/');
                        } catch (err) {
                            console.error('Payment verification error:', err);
                            toast.error('Payment verification failed! Please contact support with your payment ID: ' + response.razorpay_payment_id);
                        }
                    },
                    prefill: {
                        name: customerName || 'Customer',
                        email: customerEmail || '',
                        contact: customerPhone || '',
                    },
                    notes: {
                        orderId: orderId,
                    },
                    theme: {
                        color: "#0E7A0D"
                    },
                    modal: {
                        ondismiss: function () {
                            // User closed modal without paying
                            setLoading(false);
                            toast.error('Payment cancelled. Your order is saved — complete payment to confirm.');
                        }
                    }
                };

                setLoading(false); // Re-enable button while Razorpay modal is open
                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', function (response) {
                    toast.error(`Payment failed: ${response.error?.description || 'Please try again.'}`);
                });
                paymentObject.open();

            } else {
                // COD flow
                if (window.fbq) window.fbq('track', 'Purchase', { value: totalAmount, currency: 'INR' });
                if (window.gtag) window.gtag('event', 'purchase', { value: totalAmount, currency: 'INR', transaction_id: orderId });

                dispatch(clearCartLocal());
                toast.success('✅ Order placed successfully! Cash on Delivery.', { duration: 5000 });
                navigate('/');
            }
        } catch (error) {
            console.error('Order error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
            setLoading(false);
        }
    };


    return (
        <div className="bg-white min-h-screen text-[#333] font-sans">
            {/* Header / Banner — Admin-managed or fallback */}
            <BannerCarousel
                page="checkout"
                fallback={
                    <div className="pt-20 pb-16 text-center">
                        <div className="flex justify-center items-center gap-2 mb-3">
                            <h1 className="text-4xl text-black font-normal tracking-wide relative">
                                Checkout
                                <div className="absolute -top-6 -right-10 w-12 h-12 opacity-80 pointer-events-none">
                                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10,80 Q40,60 80,30" stroke="#7E9F6E" strokeWidth="3" strokeLinecap="round" />
                                        <circle cx="30" cy="65" r="4" fill="#7E9F6E" />
                                        <circle cx="55" cy="45" r="4" fill="#7E9F6E" />
                                        <circle cx="75" cy="20" r="5" fill="#7E9F6E" />
                                        <path d="M90,30 Q95,45 80,55" fill="#C9A388" />
                                    </svg>
                                </div>
                            </h1>
                        </div>
                        <p className="text-[13px] font-medium text-gray-400">
                            <Link to="/" className="hover:text-black transition">Home</Link> <span className="mx-1">/</span>
                            <Link to="/shop" className="hover:text-black transition">Shop</Link> <span className="mx-1">/</span>
                            <span className="text-black font-semibold">Shopping Cart</span>
                        </p>
                    </div>
                }
            />

            <div className="max-w-[1100px] mx-auto px-6 pb-24">
                <div className="flex flex-col lg:flex-row gap-16 item-start">

                    {/* ── Left: Billing details ────────────────────────────────── */}
                    <div className="flex-1">
                        <h2 className="text-[22px] font-medium text-black mb-10">Billing details</h2>

                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

                                {/* Row 1 */}
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">First name <span className="text-red-500">*</span></label>
                                    <input name="firstName" type="text" required className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                </div>
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">Last name <span className="text-red-500">*</span></label>
                                    <input name="lastName" type="text" required className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                </div>

                                {/* Row 2 */}
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">Street address <span className="text-red-500">*</span></label>
                                    <input name="street" type="text" required placeholder="House number and street name" className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 placeholder-gray-400 text-[13px] transition-colors" />
                                </div>
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">Apartment, suite, unit, etc. <span className="text-red-500">*</span></label>
                                    <input name="apartment" type="text" required className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                </div>

                                {/* Row 3 */}
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">Town / City <span className="text-red-500">*</span></label>
                                    <input name="city" type="text" required className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                </div>
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">State <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select name="state" required defaultValue="" className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 text-gray-800 text-[13px] cursor-pointer appearance-none transition-colors">
                                            <option value="" disabled>Select a state</option>
                                            <option value="mh" className="text-black">Maharashtra</option>
                                            <option value="dl" className="text-black">Delhi</option>
                                            <option value="ka" className="text-black">Karnataka</option>
                                        </select>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-2.5 h-2.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4 */}
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">PIN Code <span className="text-red-500">*</span></label>
                                    <input name="pinCode" type="text" required className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                </div>
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">Whatsapp Phone Number <span className="text-red-500">*</span></label>
                                    <input name="phone" type="tel" required className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                </div>

                                {/* Row 5 */}
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">Alternate Contact Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input type="text" className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                </div>
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-black mb-2">Email <span className="text-red-500">*</span></label>
                                    <input name="email" type="email" required placeholder="example@gmail.com" className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 placeholder-gray-400 text-[13px] transition-colors" />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="flex flex-col gap-5 mt-14">
                                {/* Create account — optional, cosmetic only */}
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <div className="relative flex items-center justify-center shrink-0">
                                        <input type="checkbox" className="w-3.5 h-3.5 border border-gray-300 rounded-sm outline-none appearance-none checked:bg-black checked:border-black transition-colors" />
                                        <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none opacity-0" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                                        <style>{`input:checked + svg { opacity: 1; }`}</style>
                                    </div>
                                    <span className="font-bold text-[13px] text-[#333]">Create an account? <span className="text-gray-400 font-normal">(Optional)</span></span>
                                </label>

                                {/* Ship to different address — functional toggle */}
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <div className="relative flex items-center justify-center shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={shipToDifferent}
                                            onChange={e => setShipToDifferent(e.target.checked)}
                                            className="w-3.5 h-3.5 border border-gray-300 rounded-sm outline-none appearance-none checked:bg-black checked:border-black transition-colors"
                                        />
                                        <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none opacity-0" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                                    </div>
                                    <span className="font-bold text-[13px] text-[#333]">Ship to a different address? <span className="text-gray-400 font-normal">(Optional)</span></span>
                                </label>
                            </div>

                            {/* ── Alternate Shipping Address (shown only when checkbox is ticked) ── */}
                            {shipToDifferent && (
                                <div className="mt-8 p-5 border border-dashed border-gray-300 rounded-lg bg-gray-50/60 space-y-6">
                                    <h3 className="text-[13px] font-bold text-black uppercase tracking-wider">Shipping Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="relative">
                                            <label className="block text-[13px] font-bold text-black mb-2">Street address <span className="text-red-500">*</span></label>
                                            <input name="ship_street" type="text" required={shipToDifferent} placeholder="House number and street name" className="w-full border-0 border-b border-gray-300 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 placeholder-gray-400 text-[13px] transition-colors" />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-[13px] font-bold text-black mb-2">Apartment, suite, unit, etc.</label>
                                            <input name="ship_apartment" type="text" placeholder="Optional" className="w-full border-0 border-b border-gray-300 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 placeholder-gray-400 text-[13px] transition-colors" />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-[13px] font-bold text-black mb-2">Town / City <span className="text-red-500">*</span></label>
                                            <input name="ship_city" type="text" required={shipToDifferent} className="w-full border-0 border-b border-gray-300 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-[13px] font-bold text-black mb-2">State <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select name="ship_state" required={shipToDifferent} defaultValue="" className="w-full border-0 border-b border-gray-300 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 text-gray-800 text-[13px] cursor-pointer appearance-none transition-colors">
                                                    <option value="" disabled>Select a state</option>
                                                    <option value="mh">Maharashtra</option>
                                                    <option value="dl">Delhi</option>
                                                    <option value="ka">Karnataka</option>
                                                    <option value="gj">Gujarat</option>
                                                    <option value="rj">Rajasthan</option>
                                                    <option value="up">Uttar Pradesh</option>
                                                    <option value="tn">Tamil Nadu</option>
                                                </select>
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-2.5 h-2.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-[13px] font-bold text-black mb-2">PIN Code <span className="text-red-500">*</span></label>
                                            <input name="ship_pinCode" type="text" required={shipToDifferent} className="w-full border-0 border-b border-gray-300 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Notes — optional */}
                            <div className="mt-8">
                                <label className="block text-[13px] font-bold text-black mb-2">Order notes <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <textarea name="orderNotes" rows="2" placeholder="Notes about your order, e.g. special notes for delivery." className="w-full border-0 border-b border-gray-200 rounded-none outline-none focus:ring-0 focus:border-black bg-transparent py-2 placeholder-gray-400 text-[13px] resize-none transition-colors" />
                            </div>

                        </form>
                    </div>

                    {/* ── Right: Your Order ────────────────────────────────────── */}
                    <div className="w-full lg:w-[420px] shrink-0 mt-8 lg:mt-0">
                        <div className="border border-black p-8">
                            <h3 className="text-xl text-black mb-8 font-normal">Your Order</h3>

                            {/* Cart Item Display */}
                            {items && items.length > 0 ? (
                                <div className="flex flex-col gap-6 mb-10">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3 w-3/4">
                                                <div className="w-10 h-12 bg-white flex items-center justify-center shrink-0">
                                                    {item.product?.images?.[0] ? (
                                                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200"></div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col text-[11px] font-bold text-[#555] uppercase leading-relaxed tracking-wide truncate">
                                                    <p className="truncate block w-full">{item.product?.name}</p>
                                                    <p className="text-black font-extrabold mt-0.5">QTY : {item.quantity}</p>
                                                    <p className="text-[#888] font-semibold mt-0.5">(INCL. GST)</p>
                                                </div>
                                            </div>
                                            <div className="font-bold text-black text-[13px] pt-1 shrink-0">
                                                ₹{Math.round((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-sm font-semibold text-gray-400 mb-10">
                                    Your cart is currently empty.
                                </div>
                            )}

                            {/* Subtotal */}
                            <div className="flex justify-between items-center border-t border-gray-200 py-6">
                                <span className="text-[13px] text-[#333] font-medium">Subtotal</span>
                                <span className="font-bold text-black text-[13px]">₹{formattedTotal}</span>
                            </div>

                            {/* Shipping */}
                            <div className="flex justify-between items-center border-t border-gray-200 py-6">
                                <span className="text-[13px] text-[#333] font-medium">Shipping</span>
                                <span className="text-gray-500 text-[13px] font-medium">
                                    {items.length > 0 ? "free" : "—"}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center border-t border-gray-200 pt-6 pb-8">
                                <span className="text-[13px] text-[#333] font-medium">Total</span>
                                <span className="font-bold text-black text-[15px]">₹{formattedTotal}</span>
                            </div>

                            {/* Payment Options Box */}
                            <div className="border border-gray-200 bg-[#FAFAFA] p-6 mb-8 text-sm relative">
                                <div className="flex flex-col gap-5">

                                    {/* Option 1 */}
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                            className="sr-only"
                                        />
                                        <div className={`relative w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-[5px] border-green-700' : 'border border-gray-400'} bg-white`}>
                                            {/* Not selected */}
                                        </div>
                                        <span className="font-bold text-[13px] text-gray-800">Cash on delivery</span>
                                    </label>

                                    {/* Option 2 */}
                                    <div className="flex flex-col gap-2 relative">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="online"
                                                checked={paymentMethod === 'online'}
                                                onChange={() => setPaymentMethod('online')}
                                                className="sr-only"
                                            />
                                            <div className={`relative w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'online' ? 'border-[5px] border-green-700' : 'border border-gray-400'} bg-white`}></div>
                                            <span className="font-bold text-[13px] text-black">UPI, Cards, Netbanking, Wallet</span>
                                        </label>

                                        {/* Logos */}
                                        <div className="pl-7 flex items-center gap-2 mt-1">
                                            <span className="font-extrabold italic text-sky-800 border border-black/10 px-1 py-0.5 text-[8px] rounded leading-none shrink-0">UPI</span>
                                            <span className="font-extrabold italic text-blue-800 text-sm leading-none shrink-0 tracking-tighter">VISA</span>
                                            <div className="flex items-center w-5 shrink-0 ml-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B] absolute mix-blend-multiply"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] absolute ml-1.5 mix-blend-multiply"></div>
                                            </div>
                                            <span className="font-bold italic text-sky-900 text-[10px] ml-1 leading-none shrink-0">RuPay</span>
                                        </div>

                                        <p className="pl-7 text-[10px] text-gray-400 font-medium leading-[1.4] mt-3">
                                            Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                                        </p>
                                    </div>

                                </div>
                            </div>

                            <button type="submit" form="checkout-form" disabled={items.length === 0} className="w-full bg-black text-white font-bold py-4 text-[12px] tracking-widest hover:bg-gray-800 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed">
                                Place order
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
