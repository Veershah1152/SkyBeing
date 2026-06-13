import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    ShoppingBag, Package, Users, DollarSign,
    TrendingUp, ArrowUpRight, RefreshCw, AlertCircle,
    Loader2, CreditCard, X, MapPin, Phone, Mail,
    CheckCircle2, XCircle, Clock, MessageSquare, Truck
} from 'lucide-react';
import { fetchDashboard } from '../../store/slices/dashboardSlice';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    n >= 1_00_000
        ? `₹${(n / 1_00_000).toFixed(1)}L`
        : n >= 1_000
            ? `₹${(n / 1_000).toFixed(1)}K`
            : `₹${n}`;

const relativeTime = (dateStr) => {
    if (!dateStr) return '—';
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return '—';
    const diff = Math.floor((Date.now() - parsed) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Matches AdminOrders statusColors exactly ──────────────────────────────────
const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skel = ({ className, style }) => (
    <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} style={style} />
);

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
const MiniBarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
                <TrendingUp className="w-8 h-8 text-gray-200" />
                No sales data yet
            </div>
        );
    }
    const max = Math.max(...data.map(d => d.sales), 1);
    return (
        <div className="flex items-end gap-2 h-40 mt-2">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-1 group">
                    <div className="relative w-full flex justify-center">
                        <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {fmt(d.sales)} · {d.orders} orders
                        </div>
                        <div
                            className="w-full bg-skyGreen/20 rounded-t-md group-hover:bg-skyGreen transition-colors duration-200"
                            style={{ height: `${Math.max((d.sales / max) * 120, 4)}px` }}
                        />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{d.month}</span>
                </div>
            ))}
        </div>
    );
};

// ── Order Detail Drawer (matches AdminOrders detail modal layout) ──────────────
const OrderDetailDrawer = ({ order, onClose }) => {
    if (!order) return null;

    const paymentBadge = order.paymentMethod === 'cod'
        ? { label: 'Cash on Delivery', bg: 'bg-orange-100 text-orange-700' }
        : { label: 'Online Payment', bg: 'bg-blue-100 text-blue-700' };

    const paymentStatusBadge = {
        pending: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
    }[order.paymentStatus] || 'bg-gray-100 text-gray-600';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-skyGreen/10 rounded-xl">
                            <Package className="w-5 h-5 text-skyGreen" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-lg">Order Details</h2>
                            <p className="text-xs text-gray-400 font-mono">
                                #{order._id.substring(order._id.length - 10).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${paymentBadge.bg}`}>
                            <CreditCard className="w-3 h-3" />
                            {paymentBadge.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${paymentStatusBadge}`}>
                            Payment: {order.paymentStatus}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                            Order: {order.orderStatus}
                        </span>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4 text-skyGreen" /> Customer Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Full Name</p>
                                <p className="font-semibold text-gray-800">{order.customerName || order.userId?.name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Email</p>
                                <p className="font-semibold text-gray-800 break-all">{order.customerEmail || order.userId?.email || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Phone</p>
                                <p className="font-semibold text-gray-800">{order.customerPhone || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Order Date</p>
                                <p className="font-semibold text-gray-800">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-skyGreen" /> Shipping Address
                            </h3>
                            <div className="text-sm text-gray-800 space-y-1">
                                {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                                <p>
                                    {[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')}
                                    {order.shippingAddress.zipCode && ` – ${order.shippingAddress.zipCode}`}
                                </p>
                                {order.shippingAddress.country && <p className="text-gray-500">{order.shippingAddress.country}</p>}
                            </div>
                        </div>
                    )}

                    {/* Order Notes */}
                    {order.orderNotes && (
                        <div className="bg-amber-50 rounded-xl p-5 space-y-2">
                            <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Order Notes
                            </h3>
                            <p className="text-sm text-amber-800">{order.orderNotes}</p>
                        </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center bg-gray-900 text-white rounded-xl px-5 py-4">
                        <span className="font-semibold text-sm">Order Total</span>
                        <span className="font-bold text-lg">₹{Math.round(order.totalAmount)?.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { data, loading, error } = useSelector((state) => state.dashboard);
    const [detailOrder, setDetailOrder] = useState(null);

    useEffect(() => {
        dispatch(fetchDashboard());
        const interval = setInterval(() => dispatch(fetchDashboard()), 60_000);
        return () => clearInterval(interval);
    }, [dispatch]);

    const handleRefresh = () => dispatch(fetchDashboard());

    const stats = data ? [
        {
            label: 'Total Revenue',
            value: fmt(data.totalRevenue),
            sub: data.revenueGrowth !== null
                ? `${data.revenueGrowth >= 0 ? '+' : ''}${data.revenueGrowth}% vs last month`
                : `${fmt(data.thisMonthRevenue)} this month`,
            icon: DollarSign,
            iconBg: 'bg-skyGreen',
            text: parseFloat(data.revenueGrowth) >= 0 ? 'text-skyGreen' : 'text-red-500',
        },
        {
            label: 'Total Orders',
            value: data.totalOrders,
            sub: `${data.pendingOrders} awaiting action · ${data.todayOrders} today`,
            icon: ShoppingBag,
            iconBg: 'bg-skyBrown',
            text: 'text-skyBrown',
        },
        {
            label: 'Total Products',
            value: data.totalProducts,
            sub: `${data.outOfStockProducts} out of stock`,
            icon: Package,
            iconBg: 'bg-amber-500',
            text: data.outOfStockProducts > 0 ? 'text-amber-600' : 'text-emerald-500',
        },
        {
            label: 'Total Users',
            value: data.totalUsers,
            sub: `+${data.newUsersThisMonth} this month`,
            icon: Users,
            iconBg: 'bg-emerald-500',
            text: 'text-emerald-600',
        },
    ] : [];

    const statusEntries = data?.orderStatusBreakdown
        ? Object.entries(data.orderStatusBreakdown).sort((a, b) => b[1] - a[1])
        : [];

    return (
        <div className="space-y-6">
            {/* ── Welcome Header ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, <span className="text-skyGreen">{user?.name || 'Administrator'}</span> 👋
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">Here's what's happening at SkyBeings right now.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-skyBg rounded-xl border border-skyGreen/20">
                        <TrendingUp className="w-4 h-4 text-skyGreen" />
                        <span className="text-sm font-semibold text-skyGreen">Live</span>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-skyBg hover:border-skyGreen/30 transition-all text-gray-500 hover:text-skyGreen disabled:opacity-40"
                        title="Refresh data"
                    >
                        {loading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <RefreshCw className="w-4 h-4" />
                        }
                    </button>
                </div>
            </div>

            {/* ── Error Banner ── */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                    <button onClick={handleRefresh} className="ml-auto underline font-medium">Retry</button>
                </div>
            )}

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading && !data
                    ? Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                            <Skel className="w-12 h-12 flex-shrink-0 !rounded-xl" />
                            <div className="flex-1 space-y-2 pt-1">
                                <Skel className="h-7 w-24" />
                                <Skel className="h-3 w-32" />
                                <Skel className="h-3 w-20" />
                            </div>
                        </div>
                    ))
                    : stats.map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                                    <p className={`text-xs font-semibold mt-1 ${s.text}`}>{s.sub}</p>
                                </div>
                            </div>
                        );
                    })
                }
            </div>

            {/* ── Charts & Status Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="font-bold text-gray-900">Revenue Trend</h2>
                        <span className="text-xs text-gray-400 font-medium">Last 6 months</span>
                    </div>
                    {data?.monthlySales && (() => {
                        const totalSales = data.monthlySales.reduce((a, d) => a + d.sales, 0);
                        const totalOrd = data.monthlySales.reduce((a, d) => a + d.orders, 0);
                        return (
                            <p className="text-xs text-gray-400 mb-2">
                                {fmt(totalSales)} · {totalOrd} orders
                            </p>
                        );
                    })()}
                    {loading && !data
                        ? <div className="flex items-end gap-2 h-40 mt-2">
                            {Array(6).fill(0).map((_, i) => (
                                <Skel key={i} className="flex-1 !rounded-t-md !rounded-b-none"
                                    style={{ height: `${40 + i * 15}px` }} />
                            ))}
                        </div>
                        : <MiniBarChart data={data?.monthlySales} />
                    }
                </div>

                {/* Order Status Breakdown — uses same STATUS_COLORS as the table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Order Status</h2>
                    {loading && !data
                        ? <div className="space-y-3">
                            {Array(5).fill(0).map((_, i) => <Skel key={i} className="h-8 w-full" />)}
                        </div>
                        : statusEntries.length === 0
                            ? <p className="text-sm text-gray-400 text-center pt-6">No orders yet</p>
                            : <div className="space-y-3">
                                {statusEntries.map(([status, count]) => {
                                    const total = statusEntries.reduce((a, b) => a + b[1], 0);
                                    const pct = Math.round((count / total) * 100);
                                    const badgeCls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
                                    return (
                                        <div key={status}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${badgeCls}`}>
                                                    {status}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">{count} ({pct}%)</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-skyGreen rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                    }
                </div>
            </div>

            {/* ── Recent Orders — matches AdminOrders table exactly ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-gray-900">Recent Orders</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Confirmed orders only (COD &amp; paid online).</p>
                    </div>
                    <Link to="/admin/orders" className="text-sm text-skyGreen font-semibold flex items-center gap-1 hover:underline">
                        View All <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {loading && !data ? (
                    <div className="divide-y divide-gray-100">
                        {Array(5).fill(0).map((_, i) => (
                            <div key={i} className="px-6 py-4 flex gap-4">
                                <Skel className="h-4 w-24" />
                                <Skel className="h-4 w-36" />
                                <Skel className="h-4 w-16" />
                                <Skel className="h-4 w-20" />
                                <Skel className="h-4 w-20" />
                                <Skel className="h-4 w-16 ml-auto" />
                            </div>
                        ))}
                    </div>
                ) : !data?.recentOrders?.length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                        <ShoppingBag className="w-8 h-8 text-gray-200" />
                        <p className="text-sm">No confirmed orders yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {/* Matches AdminOrders column order: Order ID, Customer, Payment, Date, Total, Status, Actions */}
                                    {['Order ID', 'Customer', 'Payment', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.recentOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-green-50/30 transition-colors group">
                                        {/* Order ID — 8 chars, same as AdminOrders */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900 font-mono text-sm">
                                                    {order._id.substring(order._id.length - 8).toUpperCase()}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Customer — name + phone/email subline, same as AdminOrders */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-sm">
                                                {order.customerName || order.userId?.name || 'Guest'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {order.customerPhone || order.customerEmail || order.userId?.email || '—'}
                                            </div>
                                        </td>

                                        {/* Payment Method badge — same as AdminOrders */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                <CreditCard className="w-3 h-3" />
                                                {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                            </span>
                                        </td>

                                        {/* Date — same format as AdminOrders */}
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {formatDate(order.createdAt)}
                                        </td>

                                        {/* Total */}
                                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">
                                            ₹{Math.round(order.totalAmount)?.toLocaleString('en-IN')}
                                        </td>

                                        {/* Status badge — same colors as AdminOrders statusColors */}
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold rounded-full px-3 py-1 capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setDetailOrder(order)}
                                                className="p-2 bg-gray-100 hover:bg-skyGreen hover:text-white rounded-lg transition-colors text-gray-600"
                                                title="View Details"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Top Products & Quick Links ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Top Selling Products</h2>
                    {loading && !data
                        ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skel className="w-10 h-10 !rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skel className="h-3 w-40" />
                                    <Skel className="h-3 w-20" />
                                </div>
                                <Skel className="h-5 w-14 !rounded-full" />
                            </div>
                        ))}</div>
                        : !data?.topProducts?.length
                            ? <p className="text-sm text-gray-400 text-center py-6">No sales data yet</p>
                            : <div className="space-y-3">
                                {data.topProducts.map((p) => (
                                    <div key={p._id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-skyBg flex-shrink-0 overflow-hidden border border-gray-100">
                                            {p.images?.[0]
                                                ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                : <Package className="w-5 h-5 text-skyGreen m-auto mt-2.5" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                                            <p className="text-xs text-gray-400">₹{Math.round(p.price)?.toLocaleString('en-IN')}</p>
                                        </div>
                                        <span className="text-xs font-bold bg-skyGreen/10 text-skyGreen px-2.5 py-1 rounded-full whitespace-nowrap">
                                            {p.totalSold} sold
                                        </span>
                                    </div>
                                ))}
                            </div>
                    }
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Add Product', href: '/admin/products/create', icon: Package },
                            { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag },
                            { label: 'Manage Banners', href: '/admin/banners', icon: TrendingUp },
                            { label: 'Manage Users', href: '/admin/users', icon: Users },
                        ].map(q => {
                            const Icon = q.icon;
                            return (
                                <Link
                                    key={q.label}
                                    to={q.href}
                                    className="border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:border-skyGreen/40 hover:bg-skyGreen/5 transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-skyBg flex items-center justify-center group-hover:bg-skyGreen transition-colors flex-shrink-0">
                                        <Icon className="w-4 h-4 text-skyGreen group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-skyGreen transition-colors">{q.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Order Detail Modal ── */}
            {detailOrder && (
                <OrderDetailDrawer
                    order={detailOrder}
                    onClose={() => setDetailOrder(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
