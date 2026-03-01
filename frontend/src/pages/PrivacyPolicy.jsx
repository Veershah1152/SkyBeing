import BannerCarousel from '../components/ui/BannerCarousel';

const PrivacyPolicy = () => {
    return (
        <div className="bg-white min-h-screen font-sans">
            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <BannerCarousel
                page="legal"
                height="h-[300px]"
                fallback={
                    <div className="h-[300px] bg-[#FCECD8] w-full flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="relative z-10 text-center">
                            <h1 className="text-5xl font-bold text-black mb-4 tracking-wide">Privacy Policy</h1>
                            <p className="text-lg text-black font-semibold">
                                Home <span className="mx-2">&gt;</span> Privacy Policy
                            </p>
                        </div>
                    </div>
                }
            />

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 py-16 text-[#4A4A4A] text-[15px] leading-relaxed">

                <h2 className="text-[28px] font-bold text-black mb-6">Privacy Policy</h2>
                <p className="mb-6">
                    <strong>SkyBeing</strong> is committed to protecting all the information you share with us.
                </p>
                <p className="mb-8">
                    Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect,
                    or otherwise handle your information in accordance with our website.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4 mt-10">What personal information do we collect?</h3>
                <p className="mb-8">
                    When ordering or registering on our site, as appropriate, you may be asked to enter your name, email
                    address, mailing address, phone number, or other details to help you with your experience.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4 mt-10">When do we collect information?</h3>
                <p className="mb-8">
                    We collect information from you when you place an order or enter information on our site.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4 mt-10">How do we use your information?</h3>
                <p className="mb-4">
                    We may use the information we collect from you when you register, make a purchase, sign up for our
                    newsletter, respond to a survey or marketing communication, browse the website, or use certain other
                    site features to quickly process your transactions.
                </p>
                <p className="mb-8">
                    We may also use your email address to send regular information to help you keep up to date with our
                    new offerings, promotions, and shopping offers. You may choose to unsubscribe from our mailing list
                    at any point.
                </p>

                <h3 className="text-[20px] font-bold text-black mb-4 mt-10">How do we protect visitor information?</h3>
                <p className="mb-4">
                    Our website is scanned on a regular basis for security holes and known vulnerabilities in order to
                    make your visit to our site as safe as possible.
                </p>
                <p className="mb-4">
                    Your personal information is contained behind secured networks and is only accessible by a limited
                    number of persons who have special access rights to such systems, and are required to keep the
                    information confidential.
                </p>
                <p className="mb-4">
                    We implement a variety of security measures when a user places an order enters, submits, or accesses
                    their information to maintain the safety of your personal information.
                </p>
                <p className="mb-8">
                    All transactions are processed through a gateway provider and are not stored or processed on our
                    servers. We have no access to your credit card details.
                </p>

            </div>
        </div>
    );
};

export default PrivacyPolicy;
