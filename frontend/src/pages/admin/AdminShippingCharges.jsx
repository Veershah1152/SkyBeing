import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Truck, Loader2, X, Save, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';

const AdminShippingCharges = () => {
    const [charges, setCharges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', cost: '', minDays: '', maxDays: '', active: true });
    const [saving, setSaving] = useState(false);

    const fetchCharges = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings/shipping-charges');
            setCharges(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load shipping charges');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCharges(); }, []);

    const openAdd = () => { setEditId(null); setForm({ name: '', cost: '', minDays: '', maxDays: '', active: true }); setShowForm(true); };
    const openEdit = (c) => {
        setEditId(c._id);
        setForm({ name: c.name, cost: String(c.cost), minDays: c.minDays || '', maxDays: c.maxDays || '', active: c.active });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || form.cost === '') return;
        setSaving(true);
        try {
            const payload = { name: form.name, cost: Number(form.cost), minDays: form.minDays, maxDays: form.maxDays, active: form.active };
            if (editId) {
                await api.put(`/settings/shipping-charges/${editId}`, payload);
            } else {
                await api.post('/settings/shipping-charges', payload);
            }
            setShowForm(false);
            fetchCharges();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (charge) => {
        try {
            await api.put(`/settings/shipping-charges/${charge._id}`, { active: !charge.active });
            fetchCharges();
        } catch (err) {
            alert('Failed to toggle');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete shipping rule "${name}"?`)) return;
        try {
            await api.delete(`/settings/shipping-charges/${id}`);
            fetchCharges();
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
                        Shipping Charges <span className="text-gray-400 text-lg font-normal ml-2">({charges.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Manage delivery cost rules for your store.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Charge
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
                            <h2 className="font-bold text-gray-900 text-lg">{editId ? 'Edit Shipping Rule' : 'Add Shipping Rule'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Standard Delivery"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cost (₹) <span className="text-red-500">*</span></label>
                                <input type="number" min="0" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                                    placeholder="50"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Min Days</label>
                                    <input value={form.minDays} onChange={e => setForm(f => ({ ...f, minDays: e.target.value }))}
                                        placeholder="3 days"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Max Days</label>
                                    <input value={form.maxDays} onChange={e => setForm(f => ({ ...f, maxDays: e.target.value }))}
                                        placeholder="7 days"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                                </div>
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
                                disabled={saving || !form.name.trim() || form.cost === ''}
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
                ) : charges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Truck className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm font-medium">No shipping rules yet</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Name', 'Cost', 'Delivery Time', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {charges.map(c => (
                                <tr key={c._id} className={`hover:bg-green-50/20 transition-colors ${!c.active ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-skyGreen flex-shrink-0" />{c.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-bold">₹{c.cost}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {c.minDays && c.maxDays ? `${c.minDays} – ${c.maxDays}` : c.minDays || c.maxDays || '—'}
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

export default AdminShippingCharges;
