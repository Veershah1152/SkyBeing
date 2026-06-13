import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Star, Loader2, X, Save, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';

const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
            <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                className="transition-transform hover:scale-110"
            >
                <Star className={`w-5 h-5 ${s <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
            </button>
        ))}
    </div>
);

const AdminTestimonials = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', rating: 5, text: '' });
    const [saving, setSaving] = useState(false);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings/testimonials');
            setItems(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTestimonials(); }, []);

    const openAdd = () => { setEditId(null); setForm({ name: '', rating: 5, text: '' }); setShowForm(true); };
    const openEdit = (t) => { setEditId(t._id); setForm({ name: t.name, rating: t.rating, text: t.text }); setShowForm(true); };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/settings/testimonials/${editId}`, form);
            } else {
                await api.post('/settings/testimonials', form);
            }
            setShowForm(false);
            fetchTestimonials();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (t) => {
        try {
            await api.put(`/settings/testimonials/${t._id}`, { active: !t.active });
            fetchTestimonials();
        } catch {
            alert('Failed to toggle');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete testimonial from "${name}"?`)) return;
        try {
            await api.delete(`/settings/testimonials/${id}`);
            fetchTestimonials();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    const activeCount = items.filter(t => t.active).length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Testimonials
                        <span className="text-gray-400 text-lg font-normal ml-2">({items.length} total · {activeCount} visible)</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Manage customer reviews shown on the website.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Testimonial
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-gray-900 text-lg">{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                                <input
                                    autoFocus
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                                <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Review Text</label>
                                <textarea
                                    rows={3}
                                    value={form.text}
                                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                                    placeholder="What did the customer say?"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.name.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-skyGreen rounded-xl hover:bg-[#0c660b] disabled:opacity-50 transition-all"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-skyGreen" /></div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
                    <Star className="w-10 h-10 text-gray-200 mb-3" />
                    <p className="text-sm font-medium">No testimonials yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click "Add Testimonial" to add your first review.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(t => (
                        <div key={t._id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all ${t.active ? 'border-gray-100' : 'border-gray-100 opacity-55'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-900">{t.name}</p>
                                    <div className="flex gap-0.5 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {t.active ? 'Visible' : 'Hidden'}
                                </span>
                            </div>
                            {t.text && <p className="text-sm text-gray-600 italic flex-1">"{t.text}"</p>}
                            <div className="flex gap-2 pt-1 flex-wrap">
                                <button
                                    onClick={() => handleToggle(t)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${t.active
                                        ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                        : 'border-green-200 text-skyGreen hover:bg-green-50'
                                    }`}
                                >
                                    {t.active ? <><ToggleLeft className="w-3.5 h-3.5" />Hide</> : <><ToggleRight className="w-3.5 h-3.5" />Show</>}
                                </button>
                                <button
                                    onClick={() => openEdit(t)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(t._id, t.name)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminTestimonials;
