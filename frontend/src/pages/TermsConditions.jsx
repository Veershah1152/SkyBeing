import BannerCarousel from '../components/ui/BannerCarousel';
import PageHero from '../components/ui/PageHero';

const TermsConditions = () => {
    return (
        <div className="bg-white min-h-screen font-sans">
            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <BannerCarousel
                page="legal"
                height="md:h-[300px] lg:h-[400px]"
                fallback={
                    <PageHero
                        title="Terms & Conditions"
                        subtitle="Rules, guidelines, and terms of service for visiting and ordering from our website."
                        badgeText="⚖️ User Agreement"
                    />
                }
            />

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 py-16 text-[#4A4A4A] text-[15px] leading-relaxed">

                <h2 className="text-[28px] font-bold text-black mb-6">Terms</h2>
                <p className="mb-4">
                    By accessing the website at <a href="https://skybeings.in/" className="text-skyGreen font-semibold hover:underline">https://skybeings.in/</a>,
                    you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are
                    responsible for compliance with any applicable local laws.
                </p>
                <p className="mb-10">
                    If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials
                    contained in this website are protected by applicable copyright and trademark law.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4 mt-8">Delivery</h3>
                <p className="mb-4">
                    Your order will be delivered by us at your doorstep and will require a signature on delivery.
                </p>
                <p className="mb-4">
                    All orders will be delivered between <strong>2-3 working days</strong> from the order date. Please allow up to <strong>5-7 days</strong> for
                    outstation deliveries. All product prices include delivery charges.
                </p>
                <p className="mb-4">
                    Delivery times are estimates only, and dispatch may be slightly delayed, so please allow up to 5 days.
                </p>
                <p className="mb-4">
                    If we are unable to perform the whole or part of the order due to any cause or event beyond our control, we may, by
                    notice in writing to you, cancel or suspend the order in whole or in part without liability.
                </p>
                <p className="mb-10">
                    We may deliver separately the goods that make up your order.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4 mt-8">Refund Policy</h3>
                <p className="mb-4">
                    We provide refunds under the following circumstances:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>The internal product packaging is damaged on arrival.</li>
                    <li>You face an issue with the quality of the product.</li>
                </ul>
                <p className="mb-10 font-bold text-black">
                    Refund claims must be reported within 5 days of receiving the package.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4 mt-8">Modifications</h3>
                <p className="mb-4">
                    <strong>SkyBeings</strong> may revise these terms of service for its website at any time without notice. By using this website,
                    you are agreeing to be bound by the then-current version of these terms of service.
                </p>

            </div>
        </div>
    );
};

export default TermsConditions;
