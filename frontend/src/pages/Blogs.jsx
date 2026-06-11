import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight, Eye, Camera } from 'lucide-react';
import api from '../api/axios';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import BannerCarousel from '../components/ui/BannerCarousel';
import useSEO from '../hooks/useSEO';

const Blogs = () => {
    useSEO({
        title: 'Our Journal & Bird Guides',
        description: 'Discover stories, guides, and tips for nature lovers and backyard birders at SkyBeings. Learn how to attract and care for local wild birds.'
    });

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/blogs')
            .then(res => setBlogs(res.data?.data || []))
            .catch(() => setBlogs([]))
            .finally(() => setLoading(false));
    }, []);

    // Featured blog (latest)
    const featured = blogs.length > 0 ? blogs[0] : null;
    const restBlogs = blogs.slice(1);

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24">
            {/* Header — Admin-managed banner or fallback */}
            <BannerCarousel
                page="blog"
                fallback={
                    <div className="bg-[#A77B51]/10 pt-28 pb-16 text-center">
                        <BookOpen className="w-10 h-10 text-[#A77B51] mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#3A3A3A] mb-4">Our Journal</h1>
                        <p className="text-lg text-gray-700 font-medium max-w-xl mx-auto px-4">
                            Stories, guides, and tips for nature lovers and backyard birders.
                        </p>
                    </div>
                }
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {loading ? (
                    <SkeletonLoader text="Loading Stories..." className="py-20" />
                ) : blogs.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No stories yet</h3>
                        <p className="text-gray-400 mt-2">Check back soon for latest articles.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Post */}
                        {featured && (
                            <Link to={`/blogs/${featured.slug}`} className="group block mb-16 relative bg-white rounded-3xl shrink-0 overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 border border-gray-100 flex flex-col md:flex-row min-h-[400px]">
                                <div className="md:w-3/5 bg-gray-100 overflow-hidden relative">
                                    {featured.coverImage ? (
                                        <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <Camera className="w-20 h-20 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white text-[#A77B51] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">Latest Featured</div>
                                </div>
                                <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {featured.tags?.slice(0, 2).map((tag, i) => (
                                            <span key={i} className="text-xs font-bold uppercase tracking-wider text-skyGreen bg-green-50 px-3 py-1 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 group-hover:text-skyGreen transition">{featured.title}</h2>
                                    <p className="text-gray-500 text-lg mb-8 line-clamp-3">{featured.excerpt}</p>

                                    <div className="flex items-center justify-between mt-auto pt-8 border-t border-gray-100">
                                        <div className="flex items-center gap-6 text-sm text-gray-400 font-semibold">
                                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(featured.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> {featured.views}</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-skyGreen transition group-hover:translate-x-2">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Recent Posts Grid */}
                        {restBlogs.length > 0 && (
                            <>
                                <h3 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-skyGreen pl-4">More Articles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {restBlogs.map(blog => (
                                        <Link key={blog._id} to={`/blogs/${blog.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-gray-100">
                                            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                                {blog.coverImage ? (
                                                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <BookOpen className="w-12 h-12 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 flex flex-col flex-grow">
                                                <div className="flex gap-2 mb-3">
                                                    {blog.tags?.[0] && <span className="text-[10px] font-bold uppercase tracking-wider text-skyGreen bg-green-50 px-2 py-1 rounded">{blog.tags[0]}</span>}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-skyGreen transition line-clamp-2">{blog.title}</h3>
                                                <p className="text-gray-500 text-sm line-clamp-3 mb-6">{blog.excerpt}</p>

                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 text-xs font-semibold text-gray-400">
                                                    <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{blog.views}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Blogs;
