import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PageHero = ({
    title,
    subtitle,
    breadcrumbText,
    badgeText,
    children
}) => {
    return (
        <section className="bg-gradient-to-br from-[#0E7A0D] via-[#1a9918] to-[#25c423] text-white py-20 px-4 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                {/* Breadcrumb */}
                <div className="flex items-center justify-center gap-2 text-white/70 text-sm mb-8">
                    <Link to="/" className="hover:text-white transition">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white font-medium">{breadcrumbText || title}</span>
                </div>

                {badgeText && (
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        {badgeText}
                    </div>
                )}

                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    {title}
                </h1>

                {subtitle && (
                    <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed mb-10">
                        {subtitle}
                    </p>
                )}

                {children}
            </div>
        </section>
    );
};

export default PageHero;
