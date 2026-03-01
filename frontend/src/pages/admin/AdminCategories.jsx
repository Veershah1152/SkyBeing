import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
const SAMPLE = ['Bird Feeders', 'Water Feeders', 'Bird Houses', 'Accessories', 'Feed & Food'];
const AdminCategories = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div><h1 className="text-3xl font-bold text-gray-900">Categories</h1><p className="text-sm text-gray-500 mt-1">Organise your products into top-level categories.</p></div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"><Plus className="w-4 h-4" /> Add Category</button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead><tr className="bg-gray-50 border-b border-gray-100">{['#', 'Name', 'Slug', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-100">{SAMPLE.map((name, i) => (
                    <tr key={i} className="hover:bg-green-50/20 transition-colors">
                        <td className="px-6 py-4 text-gray-500 text-sm">{i + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2"><Tag className="w-4 h-4 text-skyGreen" />{name}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{name.toLowerCase().replace(/ /g, '-')}</td>
                        <td className="px-6 py-4"><div className="flex gap-2"><button className="p-1.5 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg"><Pencil className="w-4 h-4" /></button><button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    </div>
);
export default AdminCategories;
