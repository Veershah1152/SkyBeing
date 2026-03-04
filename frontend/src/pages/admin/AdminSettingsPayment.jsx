import { useState, useEffect } from 'react';
import { CreditCard, Save, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const AdminSettingsPayment = () => {
    const [settings, setSettings] = useState({
        razorpayKey: '',
        razorpaySecret: '',
        razorpayWebhookSecret: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/maintenance'); // This returns all settings
                if (res.data.data) {
                    setSettings({
                        razorpayKey: res.data.data.razorpayKey || '',
                        razorpaySecret: res.data.data.razorpaySecret || '',
                        razorpayWebhookSecret: res.data.data.razorpayWebhookSecret || ''
                    });
                }
            } catch (error) {
                console.error('Failed to fetch payment settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings/maintenance', settings);
            alert('Payment settings saved successfully!');
        } catch (error) {
            console.error('Failed to save payment settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-skyGreen" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Configure your permanent Razorpay credentials.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-skyGreen/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-skyGreen" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Razorpay Configuration</h2>
                        <p className="text-xs text-gray-400">These keys will be used for all transactions</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Razorpay Key ID</label>
                        <input
                            type="text"
                            value={settings.razorpayKey}
                            onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
                            placeholder="rzp_live_..."
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-4 focus:ring-skyGreen/10 transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Razorpay Key Secret</label>
                        <input
                            type="password"
                            value={settings.razorpaySecret}
                            onChange={(e) => setSettings({ ...settings, razorpaySecret: e.target.value })}
                            placeholder="Enter Key Secret"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-4 focus:ring-skyGreen/10 transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Webhook Secret</label>
                        <input
                            type="password"
                            value={settings.razorpayWebhookSecret}
                            onChange={(e) => setSettings({ ...settings, razorpayWebhookSecret: e.target.value })}
                            placeholder="Enter Webhook Secret"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-4 focus:ring-skyGreen/10 transition-all font-mono"
                        />
                        <p className="mt-2 text-[10px] text-gray-400">Make sure this matches the secret set in your Razorpay Dashboard Webhook settings.</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-skyGreen text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-skyGreen/20 disabled:opacity-50"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Payment Credentials'}
            </button>
        </div>
    );
};

export default AdminSettingsPayment;

