import { Truck, Plus, Pencil, Trash2 } from 'lucide-react';

const SAMPLE = [
    { id: 1, name: 'Standard Delivery', cost: '₹50', min: '3-5 days', max: '7 days', active: true },
    { id: 2, name: 'Express Delivery', cost: '₹120', min: '1 day', max: '2 days', active: true },
    { id: 3, name: 'Free Shipping (Above ₹999)', cost: '₹0', min: '5 days', max: '10 days', active: true },
];

const AdminShippingCharges = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Shipping Charges</h1>
                <p className="text-sm text-gray-500 mt-1">Manage delivery cost rules for your store.</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm">
                <Plus className="w-4 h-4" /> Add Charge
            </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                    {['Name', 'Cost', 'Min Time', 'Max Time', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                    {SAMPLE.map(s => (
                        <tr key={s.id} className="hover:bg-green-50/20 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2"><Truck className="w-4 h-4 text-skyGreen" />{s.name}</td>
                            <td className="px-6 py-4 text-gray-700 font-bold">{s.cost}</td>
                            <td className="px-6 py-4 text-gray-600">{s.min}</td>
                            <td className="px-6 py-4 text-gray-600">{s.max}</td>
                            <td className="px-6 py-4"><span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span></td>
                            <td className="px-6 py-4"><div className="flex gap-2">
                                <button className="p-1.5 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
export default AdminShippingCharges;
