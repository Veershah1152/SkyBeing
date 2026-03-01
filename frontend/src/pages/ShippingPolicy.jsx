import BannerCarousel from '../components/ui/BannerCarousel';

const ShippingPolicy = () => {
    return (
        <div className="bg-white min-h-screen font-sans">
            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <BannerCarousel
                page="legal"
                height="h-[300px]"
                fallback={
                    <div className="h-[300px] bg-[#FCECD8] w-full flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="relative z-10 text-center">
                            <h1 className="text-5xl font-bold text-black mb-4 tracking-wide">Shipping Policy</h1>
                            <p className="text-lg text-black font-semibold">
                                Home <span className="mx-2">&gt;</span> Shipping Policy
                            </p>
                        </div>
                    </div>
                }
            />

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 py-16 text-[#4A4A4A] text-[15px] leading-relaxed">

                <h2 className="text-[28px] font-bold text-black mb-10">Shipping &amp; Delivery</h2>

                {/* DOMESTIC */}
                <h3 className="text-[20px] font-bold text-black mb-6 pb-2 border-b border-gray-100">
                    For Domestic Shipments (India)
                </h3>

                <h4 className="text-[16px] font-bold text-black mb-2 mt-4">Delivery</h4>
                <p className="mb-6">
                    Delivery of products will be done by the method indicated in the order. If for any reason the Company decides
                    to send the product by some other method, other than the one indicated in the order, you will not be required
                    to pay any additional charges for the same.
                </p>

                <h4 className="text-[16px] font-bold text-black mb-2 mt-4">Return Policy</h4>
                <p className="mb-14">
                    Once you place an order with the Company and such order has been processed, you shall not be permitted to cancel
                    or modify such order. You can only return damaged products or products that are not as per your order. Returns
                    must comply with the return conditions as set out in our returns and refund policy.
                </p>


                {/* INTERNATIONAL */}
                <h3 className="text-[20px] font-bold text-black mb-6 pb-2 border-b border-gray-100">
                    For International Shipments (Outside India)
                </h3>

                <h4 className="text-[16px] font-bold text-black mb-2 mt-4">Delivery</h4>
                <p className="mb-6">
                    International shipments delivery time varies from <strong>15 days to 45 days</strong> depending on the mode of
                    transport required by the customer.
                </p>

                <h4 className="text-[16px] font-bold text-black mb-2 mt-4">Return Policy</h4>
                <p className="mb-8">
                    In light of the current situation, we advise no returns unless the product is damaged!
                </p>

            </div>
        </div>
    );
};

export default ShippingPolicy;
