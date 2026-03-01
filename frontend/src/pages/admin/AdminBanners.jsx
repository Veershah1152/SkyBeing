import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Loader2, Image as ImageIcon, X, Save,
    Eye, EyeOff, LayoutGrid, Home, ShoppingBag, Info, Mail, Globe
} from 'lucide-react';
import api from '../../api/axios';

const PAGE_OPTIONS = [
    { id: 'home', label: 'Home Page', icon: Home },
    { id: 'shop', label: 'Shop Page', icon: ShoppingBag },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'contact', label: 'Contact Page', icon: Mail },
    { id: 'all', label: 'All Pages', icon: Globe },
];

const PageBadge = ({ page }) => {
    const opt = PAGE_OPTIONS.find(p => p.id === page);
    if (!opt) return null;
    const Icon = opt.icon;
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            <Icon className="w-2.5 h-2.5" />{opt.label}
        </span>
    );
};

const AdminBanners = () => {
    const [banners, setBanners] = useState([]);
    const [status, setStatus] = useState('idle');
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [editingPages, setEditingPages] = useState(null); // banner._id being edited

    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        order: '0',
        pages: ['home'],
    });

    const setF = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const togglePage = (pageId) => {
        if (pageId === 'all') {
            setF('pages', ['all']);
            return;
        }
        setForm(f => {
            const without = f.pages.filter(p => p !== 'all');
            return {
                ...f,
                pages: without.includes(pageId)
                    ? without.filter(p => p !== pageId)
                    : [...without, pageId]
            };
        });
    };

    const fetchBanners = async () => {
        setStatus('loading');
        try {
            const res = await api.get('/banners');
            setBanners(res.data.data);
            setStatus('succeeded');
        } catch {
            setStatus('failed');
        }
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) { alert('Please select a banner image'); return; }
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', form.title);
            data.append('subtitle', form.subtitle);
            data.append('buttonText', form.buttonText);
            data.append('buttonLink', form.buttonLink);
            data.append('order', form.order);
            data.append('pages', JSON.stringify(form.pages));
            data.append('image', imageFile);
            await api.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowForm(false);
            setForm({ title: '', subtitle: '', buttonText: 'Shop Now', buttonLink: '/shop', order: '0', pages: ['home'] });
            setImageFile(null);
            setPreviewUrl(null);
            fetchBanners();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create banner');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await api.put(`/banners/${id}/toggle`);
            setBanners(banners.map(b => b._id === id ? res.data.data : b));
        } catch { alert('Failed to toggle banner'); }
    };

    const handleSavePages = async (id, pages) => {
        try {
            const res = await api.put(`/banners/${id}/pages`, { pages });
            setBanners(banners.map(b => b._id === id ? res.data.data : b));
            setEditingPages(null);
        } catch { alert('Failed to update pages'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await api.delete(`/banners/${id}`);
            setBanners(banners.filter(b => b._id !== id));
        } catch { alert('Failed to delete banner'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Banners <span className="text-gray-400 text-lg font-normal ml-2">({banners.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage banners across all pages — assign each banner to Home, Shop, About, Contact, or All Pages.
                    </p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5">
                    <Plus className="w-5 h-5" /> Add Banner
                </button>
            </div>

            {/* Page filter legend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5" /> Page Assignment Guide
                </p>
                <div className="flex flex-wrap gap-2">
                    {PAGE_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                            <span key={opt.id} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                                <Icon className="w-3.5 h-3.5 text-skyGreen" /> {opt.label}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Add Banner Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Add New Banner</h2>
                            <button onClick={() => { setShowForm(false); setPreviewUrl(null); setImageFile(null); }}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form id="banner-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Banner Image <span className="text-red-500">*</span>
                                </label>
                                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-skyGreen hover:bg-green-50/40 group ${previewUrl ? 'border-skyGreen p-2' : 'border-gray-200 p-8'}`}>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    {previewUrl ? (
                                        <div className="relative w-full">
                                            <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                                                <span className="text-white text-sm font-medium">Click to change</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center mb-3 transition-colors">
                                                <ImageIcon className="w-7 h-7 text-gray-400 group-hover:text-skyGreen transition-colors" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-600">Upload Banner Image</span>
                                            <span className="text-xs text-gray-400 mt-1">Recommended: 1920×600px</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* Title & Subtitle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input required value={form.title} onChange={e => setF('title', e.target.value)}
                                    placeholder="e.g. Feed the World's Feathered Friends"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all placeholder-gray-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                                <input value={form.subtitle} onChange={e => setF('subtitle', e.target.value)}
                                    placeholder="e.g. Discover our premium bird feeders"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all placeholder-gray-400" />
                            </div>

                            {/* Button + Link + Order */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Button Text</label>
                                    <input value={form.buttonText} onChange={e => setF('buttonText', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Button Link</label>
                                    <input value={form.buttonLink} onChange={e => setF('buttonLink', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order</label>
                                    <input type="number" min="0" value={form.order} onChange={e => setF('order', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                                </div>
                            </div>

                            {/* Page Assignment */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Show on Pages <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-2">
                                    {PAGE_OPTIONS.map(opt => {
                                        const Icon = opt.icon;
                                        const selected = form.pages.includes(opt.id);
                                        return (
                                            <button key={opt.id} type="button" onClick={() => togglePage(opt.id)}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${selected
                                                        ? 'bg-skyGreen text-white border-skyGreen shadow-sm'
                                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-skyGreen hover:text-skyGreen'
                                                    }`}>
                                                <Icon className="w-4 h-4" />
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Select "All Pages" to show this banner everywhere.</p>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                            <button type="button" onClick={() => { setShowForm(false); setPreviewUrl(null); setImageFile(null); }}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="banner-form" disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-skyGreen rounded-xl hover:bg-[#0c660b] transition-colors flex items-center gap-2 min-w-[130px] justify-center disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Banner</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Banners List */}
            {status === 'loading' ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-skyGreen" /></div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Banners Yet</h3>
                    <p className="text-sm text-gray-400 mb-6">Add your first banner to get started.</p>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all">
                        <Plus className="w-4 h-4" /> Add First Banner
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {banners.map(banner => (
                        <div key={banner._id}
                            className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col sm:flex-row transition-all ${banner.isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                            {/* Thumbnail */}
                            <div className="sm:w-64 h-40 sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden relative">
                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                {!banner.isActive && (
                                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold bg-gray-800 px-3 py-1.5 rounded-full">Hidden</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{banner.title}</h3>
                                            {banner.subtitle && <p className="text-sm text-gray-500 mt-0.5">{banner.subtitle}</p>}
                                        </div>
                                        <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {banner.isActive ? 'Visible' : 'Hidden'}
                                        </span>
                                    </div>

                                    {/* Meta info */}
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        <span>Button: <span className="font-medium text-gray-700">{banner.buttonText}</span></span>
                                        <span>→ <span className="font-medium text-skyGreen">{banner.buttonLink}</span></span>
                                        <span>Order: <span className="font-medium text-gray-700">#{banner.order}</span></span>
                                    </div>

                                    {/* Page assignment */}
                                    <div className="mt-3">
                                        {editingPages === banner._id ? (
                                            <PageEditor
                                                currentPages={banner.pages || ['home']}
                                                onSave={(pages) => handleSavePages(banner._id, pages)}
                                                onCancel={() => setEditingPages(null)}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-gray-400 font-medium">Shown on:</span>
                                                {(banner.pages || ['home']).map(p => <PageBadge key={p} page={p} />)}
                                                <button onClick={() => setEditingPages(banner._id)}
                                                    className="text-xs text-skyGreen font-medium hover:underline">
                                                    Edit Pages
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleToggle(banner._id)}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors border ${banner.isActive
                                                ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                                : 'border-green-200 text-skyGreen hover:bg-green-50'
                                            }`}>
                                        {banner.isActive ? <><EyeOff className="w-4 h-4" /> Hide</> : <><Eye className="w-4 h-4" /> Show</>}
                                    </button>
                                    <button onClick={() => handleDelete(banner._id)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Inline page editor widget
const PageEditor = ({ currentPages, onSave, onCancel }) => {
    const [pages, setPages] = useState(currentPages);

    const toggle = (id) => {
        if (id === 'all') { setPages(['all']); return; }
        const without = pages.filter(p => p !== 'all');
        setPages(without.includes(id) ? without.filter(p => p !== id) : [...without, id]);
    };

    return (
        <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-xs font-semibold text-gray-600">Assign to pages:</p>
            <div className="flex flex-wrap gap-2">
                {PAGE_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const sel = pages.includes(opt.id);
                    return (
                        <button key={opt.id} type="button" onClick={() => toggle(opt.id)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${sel ? 'bg-skyGreen text-white border-skyGreen' : 'bg-white text-gray-600 border-gray-200 hover:border-skyGreen'}`}>
                            <Icon className="w-3 h-3" />{opt.label}
                        </button>
                    );
                })}
            </div>
            <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => onSave(pages)}
                    className="px-3 py-1.5 text-xs font-semibold bg-skyGreen text-white rounded-lg hover:bg-[#0c660b] transition-colors flex items-center gap-1">
                    <Save className="w-3 h-3" /> Save
                </button>
                <button type="button" onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AdminBanners;
