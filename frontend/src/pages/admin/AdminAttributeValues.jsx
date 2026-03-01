import { useState } from 'react';
import { Plus, Pencil, Trash2, AlignLeft, X, Save } from 'lucide-react';

const ATTRIBUTES = ['Size', 'Color', 'Material', 'Weight', 'Capacity'];

const DEFAULT_VALUES = [
    { id: 1, attributeName: 'Size', value: 'Small' },
    { id: 2, attributeName: 'Size', value: 'Medium' },
    { id: 3, attributeName: 'Size', value: 'Large' },
    { id: 4, attributeName: 'Color', value: 'Forest Green' },
    { id: 5, attributeName: 'Color', value: 'Sky Blue' },
    { id: 6, attributeName: 'Color', value: 'Walnut Brown' },
    { id: 7, attributeName: 'Material', value: 'Wood' },
    { id: 8, attributeName: 'Material', value: 'Stainless Steel' },
    { id: 9, attributeName: 'Capacity', value: '500ml' },
    { id: 10, attributeName: 'Capacity', value: '1 Litre' },
];

const EMPTY_FORM = { attributeName: '', value: '' };

const AdminAttributeValues = () => {
    const [values, setValues] = useState(DEFAULT_VALUES);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [nextId, setNextId] = useState(11);
    const [filterAttr, setFilterAttr] = useState('');

    const openAdd = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setForm({ attributeName: item.attributeName, value: item.value });
        setEditingId(item.id);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.attributeName || !form.value.trim()) return;

        if (editingId !== null) {
            setValues(v => v.map(i => i.id === editingId ? { ...i, ...form } : i));
        } else {
            setValues(v => [...v, { id: nextId, ...form }]);
            setNextId(n => n + 1);
        }
        setShowModal(false);
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this attribute value?')) return;
        setValues(v => v.filter(i => i.id !== id));
    };

    const filtered = filterAttr ? values.filter(v => v.attributeName === filterAttr) : values;

    // Attribute badge colours cycle
    const ATTR_COLORS = {
        'Size': 'bg-skyGreen/10 text-skyGreen',
        'Color': 'bg-purple-50 text-purple-700',
        'Material': 'bg-skyBrown/10 text-skyBrown',
        'Weight': 'bg-amber-50 text-amber-700',
        'Capacity': 'bg-blue-50 text-blue-700',
    };
    const getColor = (name) => ATTR_COLORS[name] || 'bg-gray-100 text-gray-600';

    return (
        <div className="space-y-6 admin-page-enter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Attribute Values
                        <span className="text-gray-400 text-lg font-normal ml-2">({filtered.length})</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage all values for each product attribute (e.g. Size → Small, Medium, Large).
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5">
                    <Plus className="w-4 h-4" /> Add Value
                </button>
            </div>

            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-skyBrown uppercase tracking-wider mr-2">Filter by Attribute:</span>
                <button
                    onClick={() => setFilterAttr('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterAttr === '' ? 'bg-skyGreen text-white border-skyGreen' : 'border-gray-200 text-gray-600 hover:border-skyGreen hover:text-skyGreen'}`}>
                    All
                </button>
                {ATTRIBUTES.map(a => (
                    <button
                        key={a}
                        onClick={() => setFilterAttr(a === filterAttr ? '' : a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterAttr === a ? 'bg-skyGreen text-white border-skyGreen' : 'border-gray-200 text-gray-600 hover:border-skyGreen hover:text-skyGreen'}`}>
                        {a}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-skyBg border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider w-12">#</th>
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider">Attribute Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider">Attribute Value</th>
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-skyBg flex items-center justify-center">
                                                <AlignLeft className="w-7 h-7 text-skyGreen/30" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No values found</p>
                                            <button onClick={openAdd} className="text-sm text-skyGreen font-semibold hover:underline">
                                                + Add first value
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((item, i) => (
                                <tr key={item.id} className="hover:bg-skyBg/40 transition-colors group">
                                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">{i + 1}</td>

                                    {/* Attribute Name */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${getColor(item.attributeName)}`}>
                                            <AlignLeft className="w-3 h-3" />
                                            {item.attributeName}
                                        </span>
                                    </td>

                                    {/* Attribute Value */}
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">{item.value}</span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-skyGreen/30 text-skyGreen hover:bg-skyGreen hover:text-white transition-all">
                                                <Pencil className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-skyBg/30 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Showing <span className="font-semibold text-gray-600">{filtered.length}</span> value{filtered.length !== 1 ? 's' : ''}
                            {filterAttr && <> for <span className="font-semibold text-skyGreen">{filterAttr}</span></>}
                        </p>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingId !== null ? 'Edit Attribute Value' : 'Add Attribute Value'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Attribute Name dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Attribute Name <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.attributeName}
                                    onChange={e => setForm(f => ({ ...f, attributeName: e.target.value }))}
                                    className="w-full bg-skyBg border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all appearance-none cursor-pointer">
                                    <option value="">— Select Attribute —</option>
                                    {ATTRIBUTES.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Attribute Value */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Attribute Value <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    autoFocus
                                    value={form.value}
                                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                                    placeholder="e.g. Small, Red, Wooden…"
                                    className="w-full bg-skyBg border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all placeholder-gray-400"
                                />
                            </div>

                            {/* Preview badge */}
                            {form.attributeName && form.value && (
                                <div className="flex items-center gap-2 p-3 bg-skyBg rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-500">Preview:</span>
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${getColor(form.attributeName)}`}>
                                        {form.attributeName}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-sm font-semibold text-gray-900">{form.value}</span>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-skyGreen rounded-xl hover:bg-[#0c660b] transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <Save className="w-4 h-4" />
                                    {editingId !== null ? 'Save Changes' : 'Add Value'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAttributeValues;
