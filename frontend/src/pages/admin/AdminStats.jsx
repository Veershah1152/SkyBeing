import { BarChart2, TrendingUp, Users, Eye, Globe, ShoppingBag, DollarSign } from 'lucide-react';
const STATS_DATA = [
    { label: 'Page Views (Today)', value: '1,284', icon: Eye, bg: 'bg-skyGreen', },
    { label: 'Unique Visitors', value: '342', icon: Users, bg: 'bg-skyBrown' },
    { label: 'Bounce Rate', value: '38%', icon: TrendingUp, bg: 'bg-amber-500' },
    { label: 'Countries Reached', value: '12', icon: Globe, bg: 'bg-emerald-500' },
    { label: 'Revenue (Today)', value: '₹4,200', icon: DollarSign, bg: 'bg-skyGreen' },
    { label: 'Orders (Today)', value: '7', icon: ShoppingBag, bg: 'bg-skyBrown' },
];
const AdminStats = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Website Stats</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of traffic and visitor analytics.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STATS_DATA.map(s => {
                const Icon = s.icon;
                return (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                    </div>
                );
            })}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center h-64">
            <BarChart2 className="w-12 h-12 text-skyGreen/20 mb-3" />
            <p className="text-gray-500 font-medium text-sm">Analytics chart integration coming soon.</p>
            <p className="text-gray-400 text-xs mt-1">Connect Google Analytics or a custom analytics provider.</p>
        </div>
    </div>
);
export default AdminStats;
