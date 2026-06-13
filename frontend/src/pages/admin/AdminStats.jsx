import { useEffect, useState, useCallback } from 'react';
import {
    BarChart2, TrendingUp, Users, Eye, ShoppingBag,
    DollarSign, RefreshCw, Loader2, AlertCircle,
    ArrowUpRight, ArrowDownRight, Globe, MousePointer
} from 'lucide-react';
import api from '../../api/axios';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmtRupee = (n) => {
    if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
    if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
    return `₹${n}`;
};
const fmtNum = (n) => Number(n).toLocaleString('en-IN');

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skel = ({ className }) => (
    <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, iconBg, loading, trend }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
        {loading ? (
            <>
                <Skel className="w-12 h-12 flex-shrink-0 !rounded-xl" />
                <div className="flex-1 space-y-2 pt-1">
                    <Skel className="h-7 w-20" />
                    <Skel className="h-3 w-28" />
                    <Skel className="h-3 w-16" />
                </div>
            </>
        ) : (
            <>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                    {sub !== undefined && sub !== null && (
                        <p className={`text-xs font-semibold mt-1 flex items-center gap-0.5 ${trend === 'up' ? 'text-skyGreen' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                            {sub}
                        </p>
                    )}
                </div>
            </>
        )}
    </div>
);

// ── Bar Chart (pure CSS) ───────────────────────────────────────────────────────
const BarChart = ({ data, labelKey, valueKey, color = 'bg-skyGreen', loading }) => {
    if (loading) {
        return (
            <div className="flex items-end gap-1.5 h-36 mt-2">
                {Array(7).fill(0).map((_, i) => (
                    <Skel key={i} className="flex-1 !rounded-t-md !rounded-b-none"
                        style={{ height: `${30 + Math.random() * 80}px` }} />
                ))}
            </div>
        );
    }
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-36 text-gray-300 gap-2 mt-2">
                <BarChart2 className="w-8 h-8" />
                <p className="text-xs">No data yet</p>
            </div>
        );
    }
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
        <div className="flex items-end gap-1.5 h-36 mt-3">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-1 group">
                    <div className="relative w-full flex justify-center">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {d[labelKey]}: {fmtNum(d[valueKey])}
                        </div>
                        <div
                            className={`w-full ${color} rounded-t-md opacity-70 group-hover:opacity-100 transition-all duration-200`}
                            style={{ height: `${Math.max((d[valueKey] / max) * 128, 3)}px` }}
                        />
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium truncate w-full text-center">{d[labelKey]}</span>
                </div>
            ))}
        </div>
    );
};

// ── Hourly sparkline ──────────────────────────────────────────────────────────
const Sparkline = ({ data, loading }) => {
    if (loading) return <Skel className="h-14 w-full mt-2" />;
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.visits), 1);
    // Only show hours with data or every 3rd hour label
    const peak = data.reduce((a, b) => (b.visits > a.visits ? b : a), data[0]);
    return (
        <div>
            <div className="flex items-end gap-0.5 h-12 mt-3">
                {data.map((d, i) => (
                    <div key={i}
                        title={`${d.label}: ${d.visits} visits`}
                        className={`flex-1 rounded-t transition-all cursor-default ${d.visits === peak.visits && peak.visits > 0 ? 'bg-skyGreen' : 'bg-gray-100 hover:bg-skyGreen/40'}`}
                        style={{ height: `${Math.max((d.visits / max) * 44, 1)}px` }}
                    />
                ))}
            </div>
            <div className="flex justify-between text-[9px] text-gray-300 mt-1">
                <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>Now</span>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminStats = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/site-stats');
            setData(res.data.data);
            setLastRefresh(new Date());
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60_000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Derived
    const vsYesterday = data
        ? data.yesterdayVisits > 0
            ? (((data.todayVisits - data.yesterdayVisits) / data.yesterdayVisits) * 100).toFixed(1)
            : null
        : null;

    const stats = data ? [
        {
            label: 'Page Views Today',
            value: fmtNum(data.todayVisits),
            sub: vsYesterday !== null
                ? `${vsYesterday >= 0 ? '+' : ''}${vsYesterday}% vs yesterday`
                : `${fmtNum(data.yesterdayVisits)} yesterday`,
            trend: vsYesterday !== null ? (parseFloat(vsYesterday) >= 0 ? 'up' : 'down') : 'neutral',
            icon: Eye, iconBg: 'bg-skyGreen',
        },
        {
            // uniquePersonsToday = distinct sessionIds today (one real person = one session)
            label: 'Persons Today',
            value: fmtNum(data.uniquePersonsToday ?? data.uniqueVisitorsToday),
            sub: `${fmtNum(data.uniquePersons7d ?? 0)} unique this week`,
            trend: 'up',
            icon: Users, iconBg: 'bg-skyBrown',
        },
        {
            label: 'Bounce Rate',
            value: data.bounceRate !== null ? `${data.bounceRate}%` : 'N/A',
            sub: data.bounceRate !== null
                ? (parseFloat(data.bounceRate) < 50 ? 'Good engagement' : 'High bounce rate')
                : 'Need more sessions',
            trend: data.bounceRate !== null ? (parseFloat(data.bounceRate) < 50 ? 'up' : 'down') : 'neutral',
            icon: MousePointer, iconBg: 'bg-amber-500',
        },
        {
            label: 'Conversion Rate',
            value: `${data.conversionRate}%`,
            sub: `${fmtNum(data.todayOrders)} order${data.todayOrders !== 1 ? 's' : ''} today`,
            trend: parseFloat(data.conversionRate) > 0 ? 'up' : 'neutral',
            icon: TrendingUp, iconBg: 'bg-emerald-500',
        },
        {
            label: 'Revenue Today',
            value: fmtRupee(data.todayRevenue),
            sub: `${fmtNum(data.uniquePersons30d ?? 0)} unique this month`,
            trend: data.todayRevenue > 0 ? 'up' : 'neutral',
            icon: DollarSign, iconBg: 'bg-skyGreen',
        },
        {
            label: 'New Users Today',
            value: fmtNum(data.newUsersToday),
            sub: `${fmtNum(data.todayOrders)} orders placed`,
            trend: data.newUsersToday > 0 ? 'up' : 'neutral',
            icon: Globe, iconBg: 'bg-skyBrown',
        },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Website Stats</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Real-time traffic & store analytics
                        {lastRefresh && (
                            <span className="ml-2 text-gray-300">
                                · Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-skyBg hover:border-skyGreen/30 transition-all text-gray-500 hover:text-skyGreen disabled:opacity-40"
                    title="Refresh"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                    <button onClick={fetchStats} className="ml-auto underline font-medium">Retry</button>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && !data
                    ? Array(6).fill(0).map((_, i) => <StatCard key={i} loading={true} icon={Eye} />)
                    : stats.map(s => <StatCard key={s.label} {...s} loading={false} />)
                }
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Daily views chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="font-bold text-gray-900">Daily Page Views</h2>
                        <span className="text-xs text-gray-400">Last 7 days</span>
                    </div>
                    <BarChart
                        data={data?.daily}
                        labelKey="label"
                        valueKey="visits"
                        color="bg-skyGreen"
                        loading={loading && !data}
                    />
                </div>

                {/* Today's hourly chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="font-bold text-gray-900">Today's Traffic</h2>
                        <span className="text-xs text-gray-400">Hour by hour</span>
                    </div>
                    {loading && !data
                        ? <Skel className="h-16 w-full mt-3" />
                        : <Sparkline data={data?.hourly} loading={false} />
                    }
                    {data && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-skyBg rounded-xl p-3">
                                <p className="text-xs text-gray-400">Peak Hour</p>
                                <p className="font-bold text-skyGreen text-lg">
                                    {data.hourly?.reduce((a, b) => b.visits > a.visits ? b : a, data.hourly[0])?.label ?? '--'}
                                </p>
                            </div>
                            <div className="bg-skyBg rounded-xl p-3">
                                <p className="text-xs text-gray-400">Total Today</p>
                                <p className="font-bold text-skyGreen text-lg">{fmtNum(data.todayVisits)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Top Pages Today</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Most visited URLs in the last 24 hours</p>
                </div>
                {loading && !data ? (
                    <div className="divide-y divide-gray-50 px-6 py-2">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="py-3 flex items-center gap-4">
                                <Skel className="h-4 w-48" />
                                <Skel className="h-4 w-12 ml-auto" />
                            </div>
                        ))}
                    </div>
                ) : !data?.topPages?.length ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
                        <ShoppingBag className="w-8 h-8" />
                        <p className="text-sm">No page visits recorded yet</p>
                        <p className="text-xs text-gray-300">Browse the website to start tracking</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {data.topPages.map((p, i) => {
                            const maxViews = data.topPages[0]?.count ?? 1;
                            const pct = Math.round((p.count / maxViews) * 100);
                            return (
                                <div key={i} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-skyBg text-skyGreen text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{p.page || '/'}</p>
                                        <div className="mt-1 h-1 bg-gray-100 rounded-full w-full overflow-hidden">
                                            <div
                                                className="h-full bg-skyGreen rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 flex-shrink-0">
                                        {fmtNum(p.count)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Stats Summary Row */}
            {data && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Page Views Today', value: fmtNum(data.todayVisits), bg: 'bg-skyGreen' },
                            { label: 'Persons Today', value: fmtNum(data.uniquePersonsToday ?? data.uniqueVisitorsToday), bg: 'bg-skyBrown' },
                            { label: 'Unique Persons (7d)', value: fmtNum(data.uniquePersons7d ?? 0), bg: 'bg-amber-500' },
                            { label: 'Orders Today', value: fmtNum(data.todayOrders), bg: 'bg-emerald-500' },
                        ].map(s => (
                            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-white`}>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs opacity-80 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                    {/* Explanation note */}
                    <p className="text-xs text-gray-400 px-1">
                        💡 <strong>Page Views</strong> counts every page navigation. <strong>Persons</strong> counts unique visitors by session — one person browsing 10 pages = 1 person.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminStats;
