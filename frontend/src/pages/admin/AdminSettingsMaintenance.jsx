import { useState } from 'react';
import { Wrench, Save, AlertTriangle } from 'lucide-react';
const AdminSettingsMaintenance = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    return (
        <div className="space-y-6 max-w-2xl">
            <div><h1 className="text-3xl font-bold text-gray-900">Maintenance</h1><p className="text-sm text-gray-500 mt-1">Control site availability and maintenance mode.</p></div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-gray-900">Maintenance Mode</p>
                        <p className="text-sm text-gray-500 mt-0.5">When enabled, visitors will see a maintenance page.</p>
                    </div>
                    <button onClick={() => setMaintenanceMode(m => !m)} className={`relative w-12 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-skyGreen' : 'bg-gray-200'}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
                {maintenanceMode && (
                    <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-700 font-medium">Maintenance mode is active. Your store is hidden from public visitors.</p>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Maintenance Message</label>
                    <textarea rows={3} defaultValue="We're upgrading our store. Back soon!" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all resize-none" />
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm"><Save className="w-4 h-4" /> Save Settings</button>
            </div>
        </div>
    );
};
export default AdminSettingsMaintenance;
