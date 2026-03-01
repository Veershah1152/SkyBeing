import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, RefreshCw, Filter, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../api/axios';

// ─── GST Report Table ────────────────────────────────────────────────────────
const GST_COLUMNS = [
    { key: 'Invoice Date', label: 'Invoice Date', width: 110 },
    { key: 'Invoice Number', label: 'Invoice No.', width: 130 },
    { key: 'Transaction Type', label: 'Transaction Type', width: 120 },
    { key: 'Ship To State', label: 'Ship To State', width: 110 },
    { key: 'Invoice Amount (₹)', label: 'Invoice Amount (₹)', width: 140, num: true },
    { key: 'Tax Exclusive Gross (₹)', label: 'Tax Excl. Gross (₹)', width: 150, num: true },
    { key: 'Total Tax Amount (₹)', label: 'Total Tax (₹)', width: 120, num: true },
    { key: 'CGST Rate (%)', label: 'CGST Rate %', width: 100, num: true },
    { key: 'SGST Rate (%)', label: 'SGST Rate %', width: 100, num: true },
    { key: 'IGST Rate (%)', label: 'IGST Rate %', width: 100, num: true },
    { key: 'CGST Tax (₹)', label: 'CGST Tax (₹)', width: 110, num: true },
    { key: 'SGST Tax (₹)', label: 'SGST Tax (₹)', width: 110, num: true },
    { key: 'IGST Tax (₹)', label: 'IGST Tax (₹)', width: 110, num: true },
];

const AdminReports = () => {
    const today = new Date().toISOString().slice(0, 10);
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().slice(0, 10);

    const [from, setFrom] = useState(firstOfMonth);
    const [to, setTo] = useState(today);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (from) params.from = from;
            if (to) params.to = to;
            const res = await api.get('/orders/gst-report', { params });
            setRows(res.data?.data || []);
            setFetched(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, []);

    // ── Summary Totals ──
    const totals = rows.reduce((acc, r) => {
        acc.invoiceAmount += Number(r['Invoice Amount (₹)']) || 0;
        acc.gross += Number(r['Tax Exclusive Gross (₹)']) || 0;
        acc.tax += Number(r['Total Tax Amount (₹)']) || 0;
        acc.cgst += Number(r['CGST Tax (₹)']) || 0;
        acc.sgst += Number(r['SGST Tax (₹)']) || 0;
        acc.igst += Number(r['IGST Tax (₹)']) || 0;
        return acc;
    }, { invoiceAmount: 0, gross: 0, tax: 0, cgst: 0, sgst: 0, igst: 0 });

    // ── Excel Export ──
    const exportExcel = () => {
        if (!rows.length) return;

        const ws = XLSX.utils.json_to_sheet(rows, { header: GST_COLUMNS.map(c => c.key) });

        // Auto column widths
        ws['!cols'] = GST_COLUMNS.map(c => ({ wch: Math.round(c.width / 7) }));

        // Style header row bold (xlsx-style not supported in SheetJS CE, but set header row separately)
        const header = GST_COLUMNS.map(c => c.key);
        XLSX.utils.sheet_add_aoa(ws, [header], { origin: 'A1' });

        // Add totals row at the bottom
        const totalsRow = {
            'Invoice Date': 'TOTAL',
            'Invoice Number': '',
            'Transaction Type': '',
            'Ship To State': `${rows.length} invoices`,
            'Invoice Amount (₹)': +totals.invoiceAmount.toFixed(2),
            'Tax Exclusive Gross (₹)': +totals.gross.toFixed(2),
            'Total Tax Amount (₹)': +totals.tax.toFixed(2),
            'CGST Rate (%)': '',
            'SGST Rate (%)': '',
            'IGST Rate (%)': '',
            'CGST Tax (₹)': +totals.cgst.toFixed(2),
            'SGST Tax (₹)': +totals.sgst.toFixed(2),
            'IGST Tax (₹)': +totals.igst.toFixed(2),
        };
        XLSX.utils.sheet_add_json(ws, [totalsRow], { header: GST_COLUMNS.map(c => c.key), origin: -1, skipHeader: true });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'GST Report');

        const fileName = `GST_Report_${from}_to_${to}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const fmt = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">GST Tax Report</h1>
                    <p className="text-sm text-gray-500 mt-1">Invoice-wise GST breakdown for filing returns</p>
                </div>
                <button
                    onClick={exportExcel}
                    disabled={!rows.length}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    Download Excel
                </button>
            </div>

            {/* Date Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />From Date
                        </label>
                        <input
                            type="date"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />To Date
                        </label>
                        <input
                            type="date"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-semibold rounded-xl hover:bg-[#0c660b] disabled:opacity-60 transition-all shadow-sm"
                    >
                        {loading
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <Filter className="w-4 h-4" />}
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            {fetched && rows.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total Invoices', value: rows.length, prefix: '#', color: 'text-gray-800' },
                        { label: 'Invoice Amount', value: fmt(totals.invoiceAmount), prefix: '₹', color: 'text-skyGreen' },
                        { label: 'Tax Excl. Gross', value: fmt(totals.gross), prefix: '₹', color: 'text-blue-600' },
                        { label: 'Total Tax', value: fmt(totals.tax), prefix: '₹', color: 'text-amber-600' },
                        { label: 'CGST + SGST', value: fmt(totals.cgst + totals.sgst), prefix: '₹', color: 'text-purple-600' },
                        { label: 'IGST', value: fmt(totals.igst), prefix: '₹', color: 'text-rose-600' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                            <p className={`text-xl font-bold ${s.color}`}>{s.prefix === '#' ? s.value : `${s.prefix}${s.value}`}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 gap-3 text-gray-400">
                        <RefreshCw className="w-6 h-6 animate-spin text-skyGreen" />
                        <span className="text-sm font-medium">Generating report...</span>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <FileSpreadsheet className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">No orders found for selected period.</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different date range.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
                                    {GST_COLUMNS.map(col => (
                                        <th
                                            key={col.key}
                                            className={`px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.num ? 'text-right' : ''}`}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-green-50/30 transition-colors">
                                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                        {GST_COLUMNS.map(col => (
                                            <td
                                                key={col.key}
                                                className={`px-4 py-3 whitespace-nowrap font-medium ${col.key === 'Invoice Number' ? 'text-skyGreen font-semibold' :
                                                        col.key === 'Transaction Type' ? (row[col.key] === 'Inter-State' ? 'text-blue-600' : 'text-purple-600') :
                                                            col.key === 'Invoice Amount (₹)' ? 'text-gray-900 font-semibold' :
                                                                col.num ? 'text-right text-gray-700' : 'text-gray-700'
                                                    }`}
                                            >
                                                {row[col.key] !== '' && row[col.key] !== undefined ? row[col.key] : '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            {/* Totals Footer */}
                            <tfoot>
                                <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold text-gray-800">
                                    <td className="px-4 py-3" colSpan={5}>TOTAL ({rows.length} invoices)</td>
                                    <td className="px-4 py-3 text-right text-skyGreen">₹{fmt(totals.invoiceAmount)}</td>
                                    <td className="px-4 py-3 text-right text-blue-600">₹{fmt(totals.gross)}</td>
                                    <td className="px-4 py-3 text-right text-amber-600">₹{fmt(totals.tax)}</td>
                                    <td className="px-4 py-3" colSpan={3}></td>
                                    <td className="px-4 py-3 text-right text-purple-600">₹{fmt(totals.cgst)}</td>
                                    <td className="px-4 py-3 text-right text-purple-600">₹{fmt(totals.sgst)}</td>
                                    <td className="px-4 py-3 text-right text-rose-600">₹{fmt(totals.igst)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Export hint */}
            {rows.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{rows.length} invoice rows ready. Click <strong>Download Excel</strong> to export the full GST report with all columns.</span>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
