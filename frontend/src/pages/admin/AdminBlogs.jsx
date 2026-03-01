import { Plus, Pencil, Trash2, BookOpen, Eye } from 'lucide-react';
const SAMPLE = [
    { id: 1, title: 'Top 5 Bird Feeders for Your Garden', author: 'Admin', date: '2026-01-15', status: 'Published', views: 320 },
    { id: 2, title: 'How to Attract Colourful Birds', author: 'Admin', date: '2026-02-01', status: 'Published', views: 210 },
    { id: 3, title: 'Winter Bird Feeding: A Complete Guide', author: 'Admin', date: '2026-02-20', status: 'Draft', views: 0 },
];
const AdminBlogs = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div><h1 className="text-3xl font-bold text-gray-900">Blogs</h1><p className="text-sm text-gray-500 mt-1">Create and manage your website blog posts.</p></div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"><Plus className="w-4 h-4" /> New Blog Post</button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead><tr className="bg-gray-50 border-b border-gray-100">{['Title', 'Author', 'Date', 'Views', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-100">{SAMPLE.map(s => (
                    <tr key={s.id} className="hover:bg-green-50/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2"><BookOpen className="w-4 h-4 text-skyGreen flex-shrink-0" />{s.title}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{s.author}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{s.date}</td>
                        <td className="px-6 py-4"><span className="flex items-center gap-1 text-gray-600 text-sm"><Eye className="w-3.5 h-3.5" />{s.views}</span></td>
                        <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{s.status}</span></td>
                        <td className="px-6 py-4"><div className="flex gap-2"><button className="p-1.5 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg"><Pencil className="w-4 h-4" /></button><button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    </div>
);
export default AdminBlogs;
