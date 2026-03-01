import { useState, useRef } from 'react';
import { Plus, Trash2, Pencil, X, Save, Palette } from 'lucide-react';

const DEFAULT_COLORS = [
    { id: 1, name: 'Forest Green', hex: '#0E7A0D' },
    { id: 2, name: 'Sky Blue', hex: '#87CEEB' },
    { id: 3, name: 'Sunrise Orange', hex: '#FF7043' },
    { id: 4, name: 'Sunflower Yellow', hex: '#FDD835' },
    { id: 5, name: 'Parrot Green', hex: '#4CAF50' },
    { id: 6, name: 'Deep Brown', hex: '#6D4C41' },
    { id: 7, name: 'Midnight Black', hex: '#212121' },
    { id: 8, name: 'Pearl White', hex: '#F5F5F5' },
];

const EMPTY_FORM = { name: '', hex: '#0E7A0D' };

// Determine if text on a colour should be dark or light
const isDark = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

const AdminColors = () => {
    const [colors, setColors] = useState(DEFAULT_COLORS);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [nextId, setNextId] = useState(9);
    const colorInputRef = useRef(null);

    const openAdd = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (c) => {
        setForm({ name: c.name, hex: c.hex });
        setEditingId(c.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this color?')) return;
        setColors(c => c.filter(x => x.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.hex) return;

        if (editingId !== null) {
            setColors(c => c.map(x => x.id === editingId ? { ...x, ...form } : x));
        } else {
            setColors(c => [...c, { id: nextId, ...form }]);
            setNextId(n => n + 1);
        }
        setShowModal(false);
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    // Sync hex input ↔ colour picker
    const handleHexChange = (val) => {
        // Allow freeform typing; validate only on submit
        const cleaned = val.startsWith('#') ? val : `#${val}`;
        setForm(f => ({ ...f, hex: cleaned }));
    };

    return (
        <div className="space-y-6 admin-page-enter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Colors
                        <span className="text-gray-400 text-lg font-normal ml-2">({colors.length})</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage product colour swatches used in variants and filters.
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5">
                    <Plus className="w-4 h-4" /> Add Color
                </button>
            </div>

            {/* Color Grid */}
            {colors.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 flex flex-col items-center text-center">
                    <Palette className="w-12 h-12 text-skyGreen/20 mb-3" />
                    <p className="text-gray-500 font-medium">No colors yet</p>
                    <button onClick={openAdd} className="mt-3 text-sm text-skyGreen font-semibold hover:underline">
                        + Add your first color
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {colors.map(c => (
                        <div key={c.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all hover:-translate-y-0.5">
                            {/* Colour Preview */}
                            <div
                                className="h-20 w-full relative"
                                style={{ backgroundColor: c.hex }}>
                                {/* Hex badge */}
                                <span className={`absolute bottom-2 right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isDark(c.hex) ? 'bg-white/20 text-white' : 'bg-black/10 text-gray-700'}`}>
                                    {c.hex.toUpperCase()}
                                </span>
                            </div>

                            {/* Info + actions */}
                            <div className="p-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-full border-2 border-gray-100 shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: c.hex }} />
                                    <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                                </div>
                                {/* Actions — show on hover */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button
                                        onClick={() => openEdit(c)}
                                        className="p-1.5 text-gray-400 hover:text-skyGreen hover:bg-skyGreen/10 rounded-lg transition-colors"
                                        title="Edit">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Quick-add card */}
                    <button
                        onClick={openAdd}
                        className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 h-[120px] hover:border-skyGreen hover:bg-skyGreen/5 transition-all group">
                        <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-skyGreen flex items-center justify-center transition-colors">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 group-hover:text-skyGreen transition-colors">Add Color</span>
                    </button>
                </div>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingId !== null ? 'Edit Color' : 'Add New Color'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Live colour preview */}
                            <div
                                className="h-24 w-full rounded-xl flex items-end p-3 transition-colors"
                                style={{ backgroundColor: form.hex }}>
                                <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${isDark(form.hex) ? 'bg-white/20 text-white' : 'bg-black/10 text-gray-800'}`}>
                                    {form.hex.toUpperCase()}
                                </span>
                            </div>

                            {/* Color Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Color Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    autoFocus
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Forest Green, Sky Blue…"
                                    className="w-full bg-skyBg border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all placeholder-gray-400"
                                />
                            </div>

                            {/* Colour Picker + Hex input side by side */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Color <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    {/* Native colour picker — clicking the swatch opens it */}
                                    <div
                                        className="relative w-12 h-12 rounded-xl border-2 border-gray-200 overflow-hidden cursor-pointer flex-shrink-0 shadow-sm hover:border-skyGreen transition-colors"
                                        style={{ backgroundColor: form.hex }}
                                        onClick={() => colorInputRef.current?.click()}
                                        title="Click to open colour picker">
                                        <input
                                            ref={colorInputRef}
                                            type="color"
                                            value={form.hex}
                                            onChange={e => setForm(f => ({ ...f, hex: e.target.value }))}
                                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        />
                                    </div>

                                    {/* Hex text input */}
                                    <input
                                        type="text"
                                        value={form.hex}
                                        onChange={e => handleHexChange(e.target.value)}
                                        maxLength={7}
                                        placeholder="#000000"
                                        className="flex-1 bg-skyBg border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">Click the swatch to open the colour picker, or type a hex code.</p>
                            </div>

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
                                    {editingId !== null ? 'Save Changes' : 'Add Color'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminColors;
