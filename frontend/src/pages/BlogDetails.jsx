import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, User, Share2 } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';
import DOMPurify from 'dompurify';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import useSEO from '../hooks/useSEO';

const BlogDetails = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const toast = useToast();

    useSEO({
        title: blog ? blog.title : 'Loading Article...',
        description: blog ? (blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').slice(0, 160)) : 'Read the latest nature logs and bird articles from SkyBeings.'
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        api.get(`/blogs/${slug}`)
            .then(res => setBlog(res.data?.data))
            .catch(err => {
                toast.error("Blog post not found");
                navigate('/blogs');
            })
            .finally(() => setLoading(false));
    }, [slug, navigate, toast]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog.title,
                url: window.location.href,
            }).catch(() => toast.success("Link copied to clipboard"));
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <SkeletonLoader text="Loading Article..." />
            </div>
        );
    }

    if (!blog) return null;

    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.title,
        "image": blog.coverImage ? [blog.coverImage] : [],
        "datePublished": blog.createdAt,
        "dateModified": blog.updatedAt || blog.createdAt,
        "author": [{
            "@type": "Person",
            "name": blog.author || "Admin"
        }]
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-28">
            <script type="application/ld+json">
                {JSON.stringify(blogSchema)}
            </script>
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back Link */}
                <Link to="/blogs" className="inline-flex items-center gap-2 text-skyGreen font-semibold hover:underline mb-8 hover:-translate-x-1 transition-transform">
                    <ArrowLeft className="w-4 h-4" /> Back to Journal
                </Link>

                {/* Header Information */}
                <header className="mb-10 text-center">
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {blog.tags?.map((tag, i) => (
                            <span key={i} className="text-xs font-bold uppercase tracking-widest text-[#A77B51] bg-[#FCECD8] px-3 py-1.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-8">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-2">
                            <User className="w-4 h-4 text-skyGreen" /> {blog.author}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-skyGreen" />
                            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-skyGreen" /> {blog.views} Reads
                        </span>
                    </div>
                </header>

                {/* Cover Image */}
                {blog.coverImage && (
                    <div className="w-full aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 shadow-xl border border-gray-100">
                        <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Blog Content */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 px-6 py-10 md:p-16 relative">
                    {/* Floating Share Button */}
                    <button
                        onClick={handleShare}
                        className="absolute top-8 right-8 w-12 h-12 bg-gray-50 hover:bg-green-50 text-gray-500 hover:text-skyGreen rounded-full flex items-center justify-center transition shadow-sm border border-gray-100"
                        title="Share this post"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>

                    <div
                        className="prose prose-lg md:prose-xl max-w-none text-gray-700 font-serif leading-relaxed prose-headings:font-sans prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-skyGreen hover:prose-a:text-green-800 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || blog.excerpt || "<p>Content coming soon...</p>") }}
                    />
                </div>
            </article>
        </div>
    );
};

export default BlogDetails;
