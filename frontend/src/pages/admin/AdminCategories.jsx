import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag, Loader2, X, Save, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editName, setEditName] = useState('');   // name being edited
    const [formValue, setFormValue] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings/categories');
            setCategories(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openAdd = () => { setEditName(''); setFormValue(''); setShowForm(true); };
    const openEdit = (name) => { setEditName(name); setFormValue(name); setShowForm(true); };

    const handleSave = async () => {
        if (!formValue.trim()) return;
        setSaving(true);
        try {
            if (editName) {
                await api.put('/settings/categories', { oldName: editName, newName: formValue.trim() });
            } else {
                await api.post('/settings/categories', { name: formValue.trim() });
            }
            setShowForm(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (name) => {
        if (!window.confirm(`Delete category "${name}"? This action cannot be undone.`)) return;
        try {
            await api.delete(`/settings/categories/${encodeURIComponent(name)}`);
            fetchCategories();
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
                        Categories <span className="text-gray-400 text-lg font-normal ml-2">({categories.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Organise your products into top-level categories.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-gray-900 text-lg">{editName ? 'Edit Category' : 'Add Category'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                            <input
                                autoFocus
                                value={formValue}
                                onChange={e => setFormValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                                placeholder="e.g. Bird Feeders"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formValue.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-skyGreen rounded-xl hover:bg-[#0c660b] disabled:opacity-50 transition-all"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editName ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-skyGreen" /></div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Tag className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm font-medium">No categories yet</p>
                        <p className="text-xs text-gray-300 mt-1">Click "Add Category" to create your first one.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['#', 'Name', 'Slug', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((name, i) => (
                                <tr key={i} className="hover:bg-green-50/20 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 text-sm">{i + 1}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-skyGreen flex-shrink-0" />{name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">{name.toLowerCase().replace(/ /g, '-')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(name)} className="p-1.5 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

export default AdminCategories;
