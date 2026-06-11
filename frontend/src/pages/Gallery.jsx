import { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import api from '../api/axios';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import BannerCarousel from '../components/ui/BannerCarousel';
import PageHero from '../components/ui/PageHero';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        api.get('/gallery/active')
            .then(res => setImages(res.data?.data?.images || []))
            .catch(() => setImages([]))
            .finally(() => setLoading(false));
    }, []);

    // Helper for a simple masonry layout
    const getColumns = () => {
        const columns = [[], [], []];
        images.forEach((img, i) => columns[i % 3].push(img));
        return columns;
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24">
            {/* Header — Admin-managed banner or fallback */}
            <BannerCarousel
                page="gallery"
                fallback={
                    <PageHero
                        title="Our Birds Gallery"
                        subtitle="A beautiful collection of our feathered visitors captured in their natural elements."
                        badgeText="📷 Captured moments"
                    />
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {loading ? (
                    <SkeletonLoader text="Loading Gallery..." className="py-20" />
                ) : images.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No images yet</h3>
                        <p className="text-gray-400 mt-2">Check back later for beautiful bird moments.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getColumns().map((column, i) => (
                            <div key={i} className="flex flex-col gap-6">
                                {column.map((img) => (
                                    <div
                                        key={img._id}
                                        onClick={() => setSelectedImage(img)}
                                        className="relative group cursor-zoom-in rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-500 border border-gray-200"
                                    >
                                        <img
                                            src={img.imageUrl}
                                            alt={img.caption || "Gallery Bird"}
                                            className="w-full h-auto object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            {img.caption && (
                                                <p className="text-white font-bold text-lg drop-shadow-md">
                                                    {img.caption}
                                                </p>
                                            )}
                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mt-3 border border-white/30 text-white">
                                                <Camera className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div
                        className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center"
                        onClick={e => e.stopPropagation()} // prevent closing when clicking image
                    >
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.caption}
                            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                        />
                        {selectedImage.caption && (
                            <p className="text-white/90 text-lg md:text-xl font-medium mt-6 text-center bg-black/50 px-6 py-2 rounded-full border border-white/10">
                                {selectedImage.caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
