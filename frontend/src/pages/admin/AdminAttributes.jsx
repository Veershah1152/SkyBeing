import { useState } from 'react';
import { Plus, Pencil, Trash2, Sliders, X, Save, Check } from 'lucide-react';

const DEFAULT_ATTRIBUTES = [
    { id: 1, name: 'Size', isVariable: true, isFilterable: true, customValue: false },
    { id: 2, name: 'Color', isVariable: true, isFilterable: true, customValue: false },
    { id: 3, name: 'Material', isVariable: false, isFilterable: true, customValue: false },
    { id: 4, name: 'Weight', isVariable: false, isFilterable: false, customValue: true },
    { id: 5, name: 'Capacity', isVariable: true, isFilterable: true, customValue: false },
];

const EMPTY_FORM = { name: '', isVariable: false, isFilterable: false, customValue: false };

const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-skyGreen' : 'bg-gray-200'}`}
    >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
);

const AdminAttributesPage = () => {
    const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [nextId, setNextId] = useState(6);

    const openAdd = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (attr) => {
        setForm({ name: attr.name, isVariable: attr.isVariable, isFilterable: attr.isFilterable, customValue: attr.customValue });
        setEditingId(attr.id);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        if (editingId !== null) {
            setAttributes(attrs => attrs.map(a => a.id === editingId ? { ...a, ...form } : a));
        } else {
            setAttributes(attrs => [...attrs, { id: nextId, ...form }]);
            setNextId(n => n + 1);
        }
        setShowModal(false);
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this attribute?')) return;
        setAttributes(attrs => attrs.filter(a => a.id !== id));
    };

    const toggleField = (id, field) => {
        setAttributes(attrs => attrs.map(a => a.id === id ? { ...a, [field]: !a[field] } : a));
    };

    return (
        <div className="space-y-6 admin-page-enter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Attributes
                        <span className="text-gray-400 text-lg font-normal ml-2">({attributes.length})</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage product attributes like Size, Color, Material, etc. Toggle variable and filterable settings inline.
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5">
                    <Plus className="w-4 h-4" /> Add Attribute
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-skyBg border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider">Attribute Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider text-center">Is Variable</th>
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider text-center">Is Filterable</th>
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider text-center">Custom Value</th>
                                <th className="px-6 py-4 text-xs font-bold text-skyBrown uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attributes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-skyBg flex items-center justify-center">
                                                <Sliders className="w-7 h-7 text-skyGreen/40" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No attributes yet</p>
                                            <button onClick={openAdd} className="text-sm text-skyGreen font-semibold hover:underline">
                                                + Add your first attribute
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : attributes.map((attr, i) => (
                                <tr key={attr.id} className="hover:bg-skyBg/40 transition-colors group">
                                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">{i + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-skyGreen/10 flex items-center justify-center flex-shrink-0">
                                                <Sliders className="w-4 h-4 text-skyGreen" />
                                            </div>
                                            <span className="font-semibold text-gray-900">{attr.name}</span>
                                        </div>
                                    </td>

                                    {/* Is Variable — inline toggle */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center">
                                            <Toggle
                                                checked={attr.isVariable}
                                                onChange={() => toggleField(attr.id, 'isVariable')}
                                            />
                                        </div>
                                    </td>

                                    {/* Is Filterable — inline toggle */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center">
                                            <Toggle
                                                checked={attr.isFilterable}
                                                onChange={() => toggleField(attr.id, 'isFilterable')}
                                            />
                                        </div>
                                    </td>

                                    {/* Custom Value — inline toggle */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center">
                                            <Toggle
                                                checked={attr.customValue}
                                                onChange={() => toggleField(attr.id, 'customValue')}
                                            />
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(attr)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-skyGreen/30 text-skyGreen hover:bg-skyGreen hover:text-white transition-all">
                                                <Pencil className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(attr.id)}
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
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingId !== null ? 'Edit Attribute' : 'Add New Attribute'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Attribute Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Attribute Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    autoFocus
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Size, Color, Material"
                                    className="w-full bg-skyBg border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all placeholder-gray-400"
                                />
                            </div>

                            {/* Toggle Fields */}
                            <div className="space-y-3 bg-skyBg rounded-xl p-4 border border-gray-100">
                                {[
                                    { key: 'isVariable', label: 'Is Variable', desc: 'Allows this attribute to create product variants (e.g. sizes)' },
                                    { key: 'isFilterable', label: 'Is Filterable', desc: 'Show this attribute in shop filter sidebar' },
                                    { key: 'customValue', label: 'Custom Value', desc: 'Allow customers to enter a custom value for this attribute' },
                                ].map(({ key, label, desc }) => (
                                    <div key={key} className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{label}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                        </div>
                                        <Toggle
                                            checked={form[key]}
                                            onChange={(val) => setForm(f => ({ ...f, [key]: val }))}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Submit */}
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
                                    {editingId !== null ? 'Save Changes' : 'Add Attribute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAttributesPage;
