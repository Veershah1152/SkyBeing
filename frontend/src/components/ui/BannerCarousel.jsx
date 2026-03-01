import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

/**
 * Reusable banner carousel.
 * Props:
 *   page         – which page to fetch banners for (e.g. "home", "shop")
 *   height       – Tailwind height class, default "h-[420px] md:h-[500px]"
 *   fallback     – JSX to render when no banners are configured
 */
const BannerCarousel = ({ page, height = 'h-[420px] md:h-[500px]', fallback = null }) => {
    const [banners, setBanners] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        api.get(`/banners/active${page ? `?page=${page}` : ''}`)
            .then(res => { setBanners(res.data.data); setLoaded(true); })
            .catch(() => setLoaded(true));
    }, [page]);

    useEffect(() => {
        if (banners.length < 2) return;
        const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
        return () => clearInterval(t);
    }, [banners]);

    const prev = () => setCurrent(c => (c - 1 + banners.length) % banners.length);
    const next = () => setCurrent(c => (c + 1) % banners.length);

    if (!loaded) return <div className={`${height} w-full bg-gray-100 animate-pulse`} />;

    if (banners.length === 0) {
        return fallback;
    }

    return (
        <div className={`${height} w-full relative overflow-hidden group`}>
            {banners.map((banner, i) => (
                <div key={banner._id}
                    className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 md:bg-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/30 md:to-transparent flex items-center justify-center md:justify-start">
                        <div className="max-w-6xl w-full mx-auto px-6 md:px-8">
                            <div className="max-w-full md:max-w-xl text-center md:text-left mt-8 md:mt-0">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
                                    {banner.title}
                                </h1>
                                {banner.subtitle && (
                                    <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 drop-shadow-md max-w-sm mx-auto md:mx-0">{banner.subtitle}</p>
                                )}
                                <Link to={banner.buttonLink}
                                    className="inline-block bg-skyGreen hover:bg-[#0c660b] text-white font-bold px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform">
                                    {banner.buttonText}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {banners.length > 1 && (
                <>
                    <button onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {banners.map((_, i) => (
                            <button key={i} onClick={() => setCurrent(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerCarousel;
