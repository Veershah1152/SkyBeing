import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Layers, Loader2, X, Save, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const AdminSubCategories = () => {
    const [subcategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', parentCategory: '' });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, catRes] = await Promise.all([
                api.get('/settings/subcategories'),
                api.get('/settings/categories'),
            ]);
            setSubCategories(subRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditId(null); setForm({ name: '', parentCategory: categories[0] || '' }); setShowForm(true); };
    const openEdit = (sub) => { setEditId(sub._id); setForm({ name: sub.name, parentCategory: sub.parentCategory }); setShowForm(true); };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/settings/subcategories/${editId}`, form);
            } else {
                await api.post('/settings/subcategories', form);
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete sub-category "${name}"?`)) return;
        try {
            await api.delete(`/settings/subcategories/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Sub Categories <span className="text-gray-400 text-lg font-normal ml-2">({subcategories.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Manage sub-categories nested under each category.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Sub Category
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-gray-900 text-lg">{editId ? 'Edit Sub-Category' : 'Add Sub-Category'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <input
                                    autoFocus
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Tube Feeders"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Category</label>
                                {categories.length > 0 ? (
                                    <select
                                        value={form.parentCategory}
                                        onChange={e => setForm(f => ({ ...f, parentCategory: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                                    >
                                        <option value="">— None —</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        value={form.parentCategory}
                                        onChange={e => setForm(f => ({ ...f, parentCategory: e.target.value }))}
                                        placeholder="e.g. Bird Feeders"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                                    />
                                )}
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

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-skyGreen" /></div>
                ) : subcategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Layers className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm font-medium">No sub-categories yet</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['#', 'Sub Category', 'Parent Category', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subcategories.map((sub, i) => (
                                <tr key={sub._id} className="hover:bg-green-50/20 transition-colors">
                                    <td className="px-6 py-4 text-gray-400 text-sm">{i + 1}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-skyGreen flex-shrink-0" />{sub.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {sub.parentCategory
                                            ? <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">{sub.parentCategory}</span>
                                            : <span className="text-xs text-gray-300">—</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(sub)} className="p-1.5 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(sub._id, sub.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminSubCategories;
