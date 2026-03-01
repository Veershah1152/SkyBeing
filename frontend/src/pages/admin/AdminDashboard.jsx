import { useSelector } from 'react-redux';
import { ShoppingBag, Package, Users, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

const STATS = [
    { label: 'Total Revenue', value: '₹84,320', sub: '+12% this month', icon: DollarSign, bg: 'bg-skyGreen/10', text: 'text-skyGreen', iconBg: 'bg-skyGreen' },
    { label: 'Active Orders', value: '48', sub: '3 pending review', icon: ShoppingBag, bg: 'bg-skyBrown/10', text: 'text-skyBrown', iconBg: 'bg-skyBrown' },
    { label: 'Total Products', value: '124', sub: '8 out of stock', icon: Package, bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-500' },
    { label: 'Total Users', value: '342', sub: '+21 this week', icon: Users, bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-500' },
];

const RECENT = [
    { id: '#8821', customer: 'Rahul Sharma', amount: '₹1,250', status: 'Delivered', date: 'Today' },
    { id: '#8820', customer: 'Priya Singh', amount: '₹680', status: 'Shipped', date: 'Today' },
    { id: '#8819', customer: 'Amit Patel', amount: '₹2,100', status: 'Processing', date: 'Yesterday' },
    { id: '#8818', customer: 'Meera Nair', amount: '₹450', status: 'Pending', date: 'Yesterday' },
];

const STATUS_COLORS = {
    Delivered: 'bg-skyGreen/10 text-skyGreen',
    Shipped: 'bg-blue-50 text-blue-700',
    Processing: 'bg-amber-50 text-amber-700',
    Pending: 'bg-orange-50 text-orange-700',
};

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, <span className="text-skyGreen">{user?.name || 'Administrator'}</span> 👋
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Here's what's happening at SkyBeing today.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-skyBg rounded-xl border border-skyGreen/20">
                    <TrendingUp className="w-4 h-4 text-skyGreen" />
                    <span className="text-sm font-semibold text-skyGreen">Store is Live ✓</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                <p className={`text-xs font-semibold mt-1 ${s.text}`}>{s.sub}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Recent Orders</h2>
                    <a href="/admin/orders" className="text-sm text-skyGreen font-semibold flex items-center gap-1 hover:underline">
                        View All <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                </div>
                <table className="w-full text-left">
                    <thead><tr className="bg-skyBg/50 border-b border-gray-100">
                        {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h =>
                            <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        )}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {RECENT.map(r => (
                            <tr key={r.id} className="hover:bg-skyBg/30 transition-colors">
                                <td className="px-6 py-3.5 font-mono text-sm font-semibold text-gray-900">{r.id}</td>
                                <td className="px-6 py-3.5 text-sm text-gray-700">{r.customer}</td>
                                <td className="px-6 py-3.5 text-sm font-bold text-gray-900">{r.amount}</td>
                                <td className="px-6 py-3.5">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                                </td>
                                <td className="px-6 py-3.5 text-sm text-gray-500">{r.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Add Product', href: '/admin/products/create', icon: Package },
                    { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag },
                    { label: 'Add Banner', href: '/admin/banners', icon: TrendingUp },
                    { label: 'Manage Users', href: '/admin/users', icon: Users },
                ].map(q => {
                    const Icon = q.icon;
                    return (
                        <a key={q.label} href={q.href} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:border-skyGreen/40 hover:bg-skyGreen/5 transition-all shadow-sm group">
                            <div className="w-9 h-9 rounded-xl bg-skyBg flex items-center justify-center group-hover:bg-skyGreen transition-colors">
                                <Icon className="w-4 h-4 text-skyGreen group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-skyGreen transition-colors">{q.label}</span>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
