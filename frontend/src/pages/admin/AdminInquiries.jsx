import { useState } from 'react';
import { MessageSquare, Mail, Phone, Trash2, CheckCircle } from 'lucide-react';
const SAMPLE = [
    { id: 1, name: 'Suresh Kumar', email: 'suresh@gmail.com', phone: '9876543210', message: 'Can you ship to Pune? I need 3 bird feeders.', date: '2026-02-28', read: false },
    { id: 2, name: 'Meera Nair', email: 'meera@gmail.com', phone: '9812345678', message: 'Do you have custom colour options for the large feeder?', date: '2026-02-27', read: false },
    { id: 3, name: 'Deepak Joshi', email: 'deepak@yahoo.com', phone: '9988776655', message: 'Great products! Looking for bulk order discount.', date: '2026-02-26', read: true },
];
const AdminInquiries = () => {
    const [items, setItems] = useState(SAMPLE);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
                    <p className="text-sm text-gray-500 mt-1">Customer contact form submissions and messages.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-skyGreen inline-block" />
                    {items.filter(i => !i.read).length} unread
                </div>
            </div>
            <div className="space-y-3">
                {items.map(inq => (
                    <div key={inq.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-4 transition-all ${!inq.read ? 'border-skyGreen/30 ring-1 ring-skyGreen/10' : 'border-gray-100'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!inq.read ? 'bg-green-50 text-skyGreen' : 'bg-gray-100 text-gray-400'}`}>
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div>
                                    <p className="font-bold text-gray-900">{inq.name} {!inq.read && <span className="ml-2 text-xs bg-skyGreen text-white px-1.5 py-0.5 rounded-full">New</span>}</p>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inq.email}</span>
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{inq.phone}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">{inq.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{inq.message}</p>
                            <div className="flex gap-2 mt-3">
                                {!inq.read && <button onClick={() => setItems(items.map(i => i.id === inq.id ? { ...i, read: true } : i))} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 text-skyGreen hover:bg-green-50 transition-colors"><CheckCircle className="w-3.5 h-3.5" /> Mark as Read</button>}
                                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"><Mail className="w-3.5 h-3.5" /> Reply</button>
                                <button onClick={() => setItems(items.filter(i => i.id !== inq.id))} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AdminInquiries;
