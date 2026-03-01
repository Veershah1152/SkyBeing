import BannerCarousel from '../components/ui/BannerCarousel';

const ReturnPolicy = () => {
    return (
        <div className="bg-white min-h-screen font-sans">
            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <BannerCarousel
                page="legal"
                height="h-[300px]"
                fallback={
                    <div className="h-[300px] bg-[#FCECD8] w-full flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="relative z-10 text-center">
                            <h1 className="text-5xl font-bold text-black mb-4 tracking-wide">Return &amp; Refund Policy</h1>
                            <p className="text-lg text-black font-semibold">
                                Home <span className="mx-2">&gt;</span> Return Policy
                            </p>
                        </div>
                    </div>
                }
            />

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 py-16 text-[#4A4A4A] text-[15px] leading-relaxed">

                <h2 className="text-[28px] font-bold text-black mb-6">Returns &amp; Cancellations</h2>
                <p className="mb-10 text-lg text-black font-medium">
                    At <strong>SkyBeing</strong>, we aim to provide the best possible experience for our customers.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4">Refund Policy</h3>
                <p className="mb-4">
                    We take pride in the quality of our carefully crafted bird-first feeders. However, if an issue arises, we are here to help.
                </p>
                <p className="mb-10">
                    After checking your received order and reviewing the reason for cancellation—such as receiving a damaged or incorrect product—refunds
                    will be processed within <strong>5 to 7 working days</strong> to the original method of payment.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4 mt-10">Cancellation Policy</h3>
                <p className="mb-4">
                    If you wish to cancel an order you have placed, please contact us as soon as possible before the item has shipped out.
                </p>
                <p className="mb-10">
                    Kindly ensure you provide the detailed reason for your cancellation. Your feedback helps us continually improve our
                    products and services.
                </p>

                <hr className="my-10 border-gray-200" />

                <h3 className="text-[20px] font-bold text-black mb-4">Contact Us</h3>
                <p className="mb-6">
                    For any questions relating to the return or cancellation of any products, you can always contact our support team at:
                </p>

                <ul className="space-y-3 font-medium text-black">
                    <li>
                        <span className="text-gray-500 w-44 inline-block font-normal">Customer Care Email:</span>
                        <a href="mailto:Skybeings422209@gmail.com" className="hover:text-skyGreen transition">Skybeings422209@gmail.com</a>
                    </li>
                    <li>
                        <span className="text-gray-500 w-44 inline-block font-normal">Customer Care Number:</span>
                        +91 721 900 6729
                    </li>
                </ul>

            </div>
        </div>
    );
};

export default ReturnPolicy;
