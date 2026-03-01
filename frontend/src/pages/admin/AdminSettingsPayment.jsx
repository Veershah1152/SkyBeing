import { CreditCard, Save } from 'lucide-react';
const AdminSettingsPayment = () => (
    <div className="space-y-6 max-w-2xl">
        <div><h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1><p className="text-sm text-gray-500 mt-1">Configure your payment gateway credentials.</p></div>
        {[
            { title: 'Stripe', fields: ['Stripe Publishable Key', 'Stripe Secret Key', 'Webhook Secret'] },
            { title: 'Razorpay', fields: ['Razorpay Key ID', 'Razorpay Key Secret'] },
        ].map(gw => (
            <div key={gw.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"><CreditCard className="w-5 h-5 text-gray-500" /></div>
                    <h2 className="font-bold text-gray-900">{gw.title}</h2>
                </div>
                {gw.fields.map(f => (
                    <div key={f}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{f}</label>
                        <input type="text" placeholder={`Enter ${f}`} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all" />
                    </div>
                ))}
            </div>
        ))}
        <button className="flex items-center gap-2 px-6 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"><Save className="w-4 h-4" /> Save Settings</button>
    </div>
);
export default AdminSettingsPayment;
