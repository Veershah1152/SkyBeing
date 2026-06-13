import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Save, AlertCircle, Percent } from 'lucide-react';
import api from '../../api/axios';

const AdminTax = () => {
    const [taxRates, setTaxRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', rate: '', appliedTo: '' });
    const [saving, setSaving] = useState(false);

    const fetchTaxRates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings/tax-rates');
            setTaxRates(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load tax rates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTaxRates(); }, []);

    const openAdd = () => { setEditId(null); setForm({ name: '', rate: '', appliedTo: 'All Categories' }); setShowForm(true); };
    const openEdit = (tax) => { setEditId(tax._id); setForm({ name: tax.name, rate: String(tax.rate), appliedTo: tax.appliedTo }); setShowForm(true); };

    const handleSave = async () => {
        if (!form.name.trim() || !form.rate) return;
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/settings/tax-rates/${editId}`, { name: form.name, rate: Number(form.rate), appliedTo: form.appliedTo });
            } else {
                await api.post('/settings/tax-rates', { name: form.name, rate: Number(form.rate), appliedTo: form.appliedTo });
            }
            setShowForm(false);
            fetchTaxRates();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete tax rate "${name}"?`)) return;
        try {
            await api.delete(`/settings/tax-rates/${id}`);
            fetchTaxRates();
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
                        Tax Rates <span className="text-gray-400 text-lg font-normal ml-2">({taxRates.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Configure GST / tax rates applied to product categories.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Tax Rate
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
                            <h2 className="font-bold text-gray-900 text-lg">{editId ? 'Edit Tax Rate' : 'Add Tax Rate'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tax Name <span className="text-red-500">*</span></label>
                                <input
                                    autoFocus
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. GST 12%"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Rate (%) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.rate}
                                    onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
                                    placeholder="12"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Applied To</label>
                                <input
                                    value={form.appliedTo}
                                    onChange={e => setForm(f => ({ ...f, appliedTo: e.target.value }))}
                                    placeholder="e.g. Bird Feeders"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.name.trim() || !form.rate}
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
                ) : taxRates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Percent className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm font-medium">No tax rates configured</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Name', 'Rate', 'Applied To', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {taxRates.map(tax => (
                                <tr key={tax._id} className="hover:bg-green-50/20 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{tax.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 font-bold text-skyGreen bg-skyGreen/10 px-2.5 py-0.5 rounded-full text-sm">
                                            <Percent className="w-3 h-3" />{tax.rate}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{tax.appliedTo || '—'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(tax)} className="p-1.5 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(tax._id, tax.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

export default AdminTax;
