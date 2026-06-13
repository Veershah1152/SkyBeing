import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Truck, Loader2, X, Save, AlertCircle, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import api from '../../api/axios';

const AdminShippingCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', trackingUrl: '', active: true });
    const [saving, setSaving] = useState(false);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings/shipping-companies');
            setCompanies(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load shipping companies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCompanies(); }, []);

    const openAdd = () => { setEditId(null); setForm({ name: '', trackingUrl: '', active: true }); setShowForm(true); };
    const openEdit = (c) => { setEditId(c._id); setForm({ name: c.name, trackingUrl: c.trackingUrl || '', active: c.active }); setShowForm(true); };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/settings/shipping-companies/${editId}`, form);
            } else {
                await api.post('/settings/shipping-companies', form);
            }
            setShowForm(false);
            fetchCompanies();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (company) => {
        try {
            await api.put(`/settings/shipping-companies/${company._id}`, { active: !company.active });
            fetchCompanies();
        } catch {
            alert('Failed to toggle');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete shipping company "${name}"?`)) return;
        try {
            await api.delete(`/settings/shipping-companies/${id}`);
            fetchCompanies();
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
                        Shipping Companies <span className="text-gray-400 text-lg font-normal ml-2">({companies.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your courier and logistics partners.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Company
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
                            <h2 className="font-bold text-gray-900 text-lg">{editId ? 'Edit Company' : 'Add Company'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                                <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. BlueDart"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tracking URL</label>
                                <input value={form.trackingUrl} onChange={e => setForm(f => ({ ...f, trackingUrl: e.target.value }))}
                                    placeholder="https://bluedart.com/track"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
                                    {form.active
                                        ? <ToggleRight className="w-8 h-8 text-skyGreen" />
                                        : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                                </button>
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
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
                ) : companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Truck className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm font-medium">No shipping companies yet</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Company', 'Tracking URL', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {companies.map(c => (
                                <tr key={c._id} className={`hover:bg-green-50/20 transition-colors ${!c.active ? 'opacity-60' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-skyGreen flex-shrink-0" />{c.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {c.trackingUrl
                                            ? <a href={c.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-skyGreen hover:underline flex items-center gap-1">
                                                {c.trackingUrl} <ExternalLink className="w-3 h-3" />
                                            </a>
                                            : <span className="text-gray-300">—</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {c.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleToggle(c)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Toggle">
                                                {c.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(c._id, c.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

export default AdminShippingCompanies;
