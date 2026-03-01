import { useState } from 'react';
import { Plus, Pencil, Trash2, Star, ToggleLeft, ToggleRight } from 'lucide-react';
const SAMPLE = [
    { id: 1, name: 'Rahul Sharma', rating: 5, text: 'Amazing bird feeder! My backyard is lively now.', active: true },
    { id: 2, name: 'Priya Singh', rating: 4, text: 'Great quality and fast delivery. Highly recommended!', active: true },
    { id: 3, name: 'Amit Patel', rating: 5, text: 'The birds love the new feeder. Beautiful craftsmanship.', active: false },
];
const AdminTestimonials = () => {
    const [items, setItems] = useState(SAMPLE);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-bold text-gray-900">Testimonials</h1><p className="text-sm text-gray-500 mt-1">Manage customer reviews shown on the website.</p></div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"><Plus className="w-4 h-4" /> Add Testimonial</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(t => (
                    <div key={t.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-opacity ${t.active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-900">{t.name}</p>
                                <div className="flex gap-0.5 mt-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}</div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{t.active ? 'Visible' : 'Hidden'}</span>
                        </div>
                        <p className="text-sm text-gray-600 italic">"{t.text}"</p>
                        <div className="flex gap-2 pt-1">
                            <button onClick={() => setItems(items.map(i => i.id === t.id ? { ...i, active: !i.active } : i))} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${t.active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-skyGreen hover:bg-green-50'}`}>{t.active ? <><ToggleLeft className="w-3.5 h-3.5" /> Hide</> : <><ToggleRight className="w-3.5 h-3.5" /> Show</>}</button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AdminTestimonials;
