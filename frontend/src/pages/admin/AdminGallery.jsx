import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GalleryHorizontal, ImagePlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await api.get('/gallery');
            setImages(res.data.data.images);
        } catch (err) {
            console.error('Failed to fetch gallery:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchImages(); }, []);

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        try {
            for (const file of files) {
                const data = new FormData();
                data.append('image', file);
                await api.post('/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            await fetchImages();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await api.put(`/gallery/${id}/toggle`);
            setImages(imgs => imgs.map(img => img._id === id ? res.data.data.image : img));
        } catch (err) {
            alert('Failed to update visibility');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this image from gallery and Cloudinary?')) return;
        try {
            await api.delete(`/gallery/${id}`);
            setImages(imgs => imgs.filter(img => img._id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    return (
        <div className="space-y-6 admin-page-enter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gallery
                        <span className="text-gray-400 text-lg font-normal ml-2">({images.length})</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage the photo gallery shown in the <strong>"When Birds Come Home"</strong> section on the home page.
                    </p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {uploading ? 'Uploading…' : 'Upload Images'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                />
            </div>

            {/* Info banner */}
            <div className="bg-skyGreen/5 border border-skyGreen/20 rounded-2xl p-4 flex items-start gap-3">
                <GalleryHorizontal className="w-5 h-5 text-skyGreen flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-skyGreen">Gallery Images appear on the Home Page</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Upload product/lifestyle images here. You can hide individual images using the eye toggle without deleting them.
                        Visible images will appear in the <strong>mosaic grid</strong> on the home page.
                    </p>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-skyGreen" />
                </div>
            ) : images.length === 0 ? (
                /* Empty state */
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center cursor-pointer hover:border-skyGreen hover:bg-skyGreen/5 transition-all">
                    <GalleryHorizontal className="w-12 h-12 text-skyGreen/20 mb-3" />
                    <p className="text-gray-500 font-medium">No gallery images yet</p>
                    <p className="text-gray-400 text-xs mt-1">Click here or use the Upload button to add photos.</p>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map(img => (
                        <div
                            key={img._id}
                            className={`relative group rounded-2xl overflow-hidden border shadow-sm bg-gray-100 aspect-square transition-all hover:shadow-md hover:-translate-y-0.5 ${img.isActive ? 'border-gray-100' : 'border-orange-200 opacity-60'}`}>
                            <img
                                src={img.imageUrl}
                                alt={img.caption || 'Gallery'}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {/* Toggle visibility */}
                                <button
                                    onClick={() => handleToggle(img._id)}
                                    className={`p-2 rounded-full transition-colors ${img.isActive
                                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                        : 'bg-skyGreen hover:bg-[#0c660b] text-white'}`}
                                    title={img.isActive ? 'Hide image' : 'Show image'}>
                                    {img.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(img._id)}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    title="Delete image">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Hidden badge */}
                            {!img.isActive && (
                                <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Hidden
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Quick-add card */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 aspect-square hover:border-skyGreen hover:bg-skyGreen/5 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-skyGreen flex items-center justify-center transition-colors">
                            <ImagePlus className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 group-hover:text-skyGreen transition-colors">Add Photos</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
