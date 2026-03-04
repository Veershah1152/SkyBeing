import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Eye, Loader2, Package, FileText, X, User, MapPin, Phone, Mail, CreditCard, MessageSquare, ChevronRight, Truck, Printer } from 'lucide-react';
import api from '../../api/axios';
import InvoiceModal from '../../components/admin/InvoiceModal';
import PackingSlipModal from '../../components/admin/PackingSlipModal';
import BulkPackingSlipModal from '../../components/admin/BulkPackingSlipModal';
import BulkInvoiceModal from '../../components/admin/BulkInvoiceModal';
import { DollarSign } from 'lucide-react';

// ─── Order Details Modal ───────────────────────────────────────────────────
const OrderDetailsModal = ({ order, onClose }) => {
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
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-skyGreen/10 rounded-xl">
                            <Package className="w-5 h-5 text-skyGreen" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-lg">Order Details</h2>
                            <p className="text-xs text-gray-400 font-mono">#{order._id.substring(order._id.length - 10).toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Row */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${paymentBadge.bg}`}>
                            <CreditCard className="w-3 h-3" />
                            {paymentBadge.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${paymentStatusBadge}`}>
                            Payment: {order.paymentStatus}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">
                            Order: {order.orderStatus}
                        </span>

                        {/* Razorpay Details */}
                        {order.razorpayOrderId && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-blue-50 text-blue-600 border border-blue-100">
                                rzp_order: {order.razorpayOrderId}
                            </span>
                        )}
                        {order.razorpayPaymentId && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-green-50 text-green-600 border border-green-100">
                                rzp_pay: {order.razorpayPaymentId}
                            </span>
                        )}

                        {/* Money Check Button for Razorpay */}
                        {order.paymentMethod === 'online' && (
                            <button
                                onClick={async (e) => {
                                    const btn = e.currentTarget;
                                    try {
                                        btn.disabled = true;
                                        btn.innerHTML = 'Verifying...';

                                        const res = await api.get(`/payments/verify-money/${order._id}`);
                                        alert(res.data.message);
                                        window.location.reload();
                                    } catch (err) {
                                        console.error(err);
                                        alert(err.response?.data?.message || 'Failed to verify payment from server record.');
                                        btn.disabled = false;
                                        btn.innerHTML = 'Money Cross Check';
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-skyGreen text-white hover:bg-green-700 transition shadow-sm"
                            >
                                <DollarSign className="w-3 h-3" /> Cross Check Payment
                            </button>
                        )}
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4 text-skyGreen" /> Customer Information
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
                                <p className="text-xs text-gray-400 font-medium mb-0.5">WhatsApp / Phone</p>
                                <p className="font-semibold text-gray-800">{order.customerPhone || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Order Date</p>
                                <p className="font-semibold text-gray-800">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-skyGreen" /> Shipping Address
                        </h3>
                        {order.shippingAddress ? (
                            <div className="text-sm text-gray-800 space-y-1">
                                {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                                <p>
                                    {[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')}
                                    {order.shippingAddress.zipCode && ` – ${order.shippingAddress.zipCode}`}
                                </p>
                                {order.shippingAddress.country && <p className="text-gray-500">{order.shippingAddress.country}</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No address provided</p>
                        )}
                    </div>

                    {/* Order Notes */}
                    {order.orderNotes && (
                        <div className="bg-amber-50 rounded-xl p-5 space-y-2">
                            <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Order Notes
                            </h3>
                            <p className="text-sm text-amber-800">{order.orderNotes}</p>
                        </div>
                    )}

                    {/* Products Ordered */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-skyGreen" /> Products Ordered
                        </h3>
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                            {order.products?.map((item, idx) => {
                                const product = item.productId;
                                return (
                                    <div key={idx} className="flex items-center gap-4 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {product?.images?.[0]
                                                ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                : <Package className="w-5 h-5 text-gray-400" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{product?.name || 'Product'}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 shrink-0">
                                            ₹{((product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shiprocket Dispatch Section */}
                    {order.isConfirmed && (
                        <div className="bg-blue-50/50 rounded-xl p-5 space-y-4 border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Logistics & Dispatch
                            </h3>

                            {order.shiprocketOrderId ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500 font-medium">Shiprocket Order ID:</span>
                                        <span className="font-semibold text-gray-900">{order.shiprocketOrderId}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500 font-medium">Courier:</span>
                                        <span className="font-semibold text-gray-900">{order.courierName || 'Pending'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500 font-medium">AWB Code:</span>
                                        <span className="font-mono bg-white px-2 py-0.5 rounded text-blue-700 font-bold border border-blue-200">
                                            {order.awbCode || 'Generating...'}
                                        </span>
                                    </div>
                                </div>
                            ) : order.isSelfShipped ? (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-sm text-gray-800 font-bold bg-white px-4 py-2.5 rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm">
                                        <span className="text-xl">🙌</span> Delivered Manually by System Admin
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-100 pt-3">
                                    <p className="text-sm text-gray-600 font-medium">
                                        Choose a dispatch method for this order:
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={async (e) => {
                                                const btn = e.currentTarget;
                                                const confirmed = window.confirm("Are you sure you want to handle this delivery manually? It will not be sent to Shiprocket.");
                                                if (!confirmed) return;

                                                try {
                                                    btn.disabled = true;
                                                    btn.innerHTML = 'Updating...';

                                                    await api.put(`/admin/orders/${order._id}/self-ship`);
                                                    window.location.reload();
                                                } catch (err) {
                                                    console.error(err);
                                                    alert(err.response?.data?.message || 'Failed to switch to manual delivery');
                                                    btn.disabled = false;
                                                    btn.innerHTML = 'Deliver Manually';
                                                }
                                            }}
                                            className="whitespace-nowrap px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                                        >
                                            Deliver Manually
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                const btn = e.currentTarget;
                                                try {
                                                    btn.disabled = true;
                                                    btn.innerHTML = 'Dispatching...';

                                                    await api.post(`/shiprocket/create/${order._id}`);
                                                    alert('Shipment successfully created on Shiprocket!');

                                                    window.location.reload();
                                                } catch (err) {
                                                    console.error(err);
                                                    alert(err.response?.data?.message || 'Failed to dispatch to Shiprocket');
                                                    btn.disabled = false;
                                                    btn.innerHTML = 'Dispatch to Shiprocket';
                                                }
                                            }}
                                            className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                                        >
                                            Dispatch to Shiprocket
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center bg-gray-900 text-white rounded-xl px-5 py-4">
                        <span className="font-semibold text-sm">Order Total</span>
                        <span className="font-bold text-lg">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main AdminOrders Component ────────────────────────────────────────────
const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState('idle');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [detailOrder, setDetailOrder] = useState(null);
    const [packingSlipOrder, setPackingSlipOrder] = useState(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [bulkPackingOrders, setBulkPackingOrders] = useState(null);
    const [bulkInvoiceOrders, setBulkInvoiceOrders] = useState(null);
    const [isBulkShipping, setIsBulkShipping] = useState(false);

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    const fetchOrders = async () => {
        setStatus('loading');
        try {
            const query = selectedStatus ? `?status=${selectedStatus}` : '';
            const res = await api.get(`/admin/orders${query}`);
            setOrders(res.data.data.orders);
            setStatus('succeeded');
        } catch (error) {
            console.error(error);
            setStatus('failed');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedStatus]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName || order.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerEmail || order.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerPhone || '').includes(searchTerm)
    );

    const toggleOrderSelection = (id) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
        );
    };

    const toggleAllSelection = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o._id));
        }
    };

    const handleBulkShiprocket = async () => {
        if (!window.confirm(`Are you sure you want to dispatch ${selectedOrderIds.length} orders to Shiprocket?`)) return;

        setIsBulkShipping(true);
        let successCount = 0;
        let failCount = 0;

        for (const id of selectedOrderIds) {
            try {
                await api.post(`/shiprocket/create/${id}`);
                successCount++;
            } catch (err) {
                console.error(`Failed to ship order ${id}:`, err);
                failCount++;
            }
        }

        setIsBulkShipping(false);
        alert(`Bulk Dispatch Complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
        setSelectedOrderIds([]);
        fetchOrders();
    };

    const handleBulkSelfShip = async () => {
        if (!window.confirm(`Are you sure you want to mark ${selectedOrderIds.length} orders as manually shipped?`)) return;

        setIsBulkShipping(true);
        let successCount = 0;
        let failCount = 0;

        for (const id of selectedOrderIds) {
            try {
                await api.put(`/admin/orders/${id}/self-ship`);
                successCount++;
            } catch (err) {
                console.error(`Failed to self-ship order ${id}:`, err);
                failCount++;
            }
        }

        setIsBulkShipping(false);
        alert(`Bulk Manual Shipping Complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
        setSelectedOrderIds([]);
        fetchOrders();
    };

    const handleBulkMoneyCheck = async () => {
        const onlineOrders = orders.filter(o => selectedOrderIds.includes(o._id) && o.paymentMethod === 'online');

        if (onlineOrders.length === 0) {
            alert("No online payment orders selected to cross-check.");
            return;
        }

        if (!window.confirm(`Cross-check payment status for ${onlineOrders.length} online orders with Razorpay?`)) return;

        setIsBulkShipping(true);
        let successCount = 0;
        let failCount = 0;

        for (const order of onlineOrders) {
            try {
                await api.get(`/payments/verify-money/${order._id}`);
                successCount++;
            } catch (err) {
                console.error(`Failed to verify order ${order._id}:`, err);
                failCount++;
            }
        }

        setIsBulkShipping(false);
        alert(`Bulk Money Check Complete!\nSuccessfully Verified: ${successCount}\nNo Payment Found / Failed: ${failCount}`);
        setSelectedOrderIds([]);
        fetchOrders();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Orders <span className="text-gray-400 text-lg font-normal mb-1 ml-2">({orders.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Showing confirmed orders only (COD &amp; paid online).</p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Email or Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all outline-none"
                    />
                </div>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                                        onChange={toggleAllSelection}
                                        className="w-4 h-4 rounded border-gray-300 text-skyGreen focus:ring-skyGreen"
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {status === 'loading' ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-skyGreen" />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No confirmed orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className={`hover:bg-green-50/30 transition-colors group ${selectedOrderIds.includes(order._id) ? 'bg-green-50/50' : ''}`}>
                                        {/* Checkbox */}
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrderIds.includes(order._id)}
                                                onChange={() => toggleOrderSelection(order._id)}
                                                className="w-4 h-4 rounded border-gray-300 text-skyGreen focus:ring-skyGreen"
                                            />
                                        </td>
                                        {/* Order ID */}
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

                                        {/* Customer */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                {order.customerName || order.userId?.name || 'Guest'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {order.customerPhone || order.customerEmail || order.userId?.email || '—'}
                                            </div>
                                        </td>

                                        {/* Payment Method */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                <CreditCard className="w-3 h-3" />
                                                {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* Total */}
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                                        </td>

                                        {/* Status Dropdown */}
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className={`text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer border-none appearance-none ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setDetailOrder(order)}
                                                    className="p-2 bg-gray-100 hover:bg-skyGreen hover:text-white rounded-lg transition-colors text-gray-600"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setPackingSlipOrder(order)}
                                                    className="p-2 bg-gray-100 hover:bg-skyGreen hover:text-white rounded-lg transition-colors text-gray-600"
                                                    title="Packing Slip"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setInvoiceOrder(order)}
                                                    className="p-2 bg-gray-100 hover:bg-skyGreen hover:text-white rounded-lg transition-colors text-gray-600"
                                                    title="Invoice"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                {order.paymentMethod === 'online' && (
                                                    <button
                                                        onClick={async (e) => {
                                                            const btn = e.currentTarget;
                                                            try {
                                                                const originalContent = btn.innerHTML;
                                                                btn.disabled = true;
                                                                btn.innerHTML = '<span class="w-4 h-4 animate-spin block border-2 border-skyGreen border-t-transparent rounded-full mx-auto"></span>';

                                                                const res = await api.get(`/payments/verify-money/${order._id}`);
                                                                alert(res.data.message);
                                                                window.location.reload();
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert(err.response?.data?.message || 'Verification failed');
                                                                btn.disabled = false;
                                                                btn.innerHTML = '<DollarSign className="w-4 h-4" />';
                                                            }
                                                        }}
                                                        className="p-2 bg-yellow-50 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors text-yellow-600"
                                                        title="Cross Check payment with Razorpay Webhook/API"
                                                    >
                                                        <DollarSign className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {detailOrder && (
                <OrderDetailsModal
                    order={detailOrder}
                    onClose={() => setDetailOrder(null)}
                />
            )}

            {/* Invoice Modal */}
            {invoiceOrder && (
                <InvoiceModal
                    order={invoiceOrder}
                    onClose={() => setInvoiceOrder(null)}
                />
            )}
            {/* Packing Slip Modal */}
            {packingSlipOrder && (
                <PackingSlipModal
                    order={packingSlipOrder}
                    onClose={() => setPackingSlipOrder(null)}
                />
            )}

            {/* Bulk Action Bar */}
            {selectedOrderIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-300">
                    <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                        <div className="bg-skyGreen rounded-lg p-1.5 ring-4 ring-skyGreen/20">
                            <Package className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">{selectedOrderIds.length} orders selected</p>
                            <button
                                onClick={() => setSelectedOrderIds([])}
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                Deselect all
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={isBulkShipping}
                            onClick={() => {
                                const bulkOrders = orders.filter(o => selectedOrderIds.includes(o._id));
                                setBulkPackingOrders(bulkOrders);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-sm font-semibold"
                        >
                            <Printer className="w-4 h-4" /> Bulk Slips
                        </button>
                        <button
                            disabled={isBulkShipping}
                            onClick={() => {
                                const bulkOrders = orders.filter(o => selectedOrderIds.includes(o._id));
                                setBulkInvoiceOrders(bulkOrders);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-sm font-semibold"
                        >
                            <FileText className="w-4 h-4" /> Bulk Invoices
                        </button>
                        <button
                            onClick={handleBulkMoneyCheck}
                            disabled={isBulkShipping}
                            className={`flex items-center gap-2 px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 rounded-xl transition-all text-sm font-bold shadow-lg shadow-yellow-500/20 ${isBulkShipping ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <DollarSign className="w-4 h-4" /> Bulk Money Check
                        </button>
                        <button
                            onClick={handleBulkSelfShip}
                            disabled={isBulkShipping}
                            className={`flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all text-sm font-bold shadow-lg shadow-gray-500/20 ${isBulkShipping ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Package className="w-4 h-4" /> Bulk Self-Ship
                        </button>
                        <button
                            onClick={handleBulkShiprocket}
                            disabled={isBulkShipping}
                            className={`flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all text-sm font-bold shadow-lg shadow-blue-500/20 ${isBulkShipping ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isBulkShipping ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Truck className="w-4 h-4" />
                            )}
                            Bulk Shiprocket
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Action Modals */}
            {bulkPackingOrders && (
                <BulkPackingSlipModal
                    orders={bulkPackingOrders}
                    onClose={() => setBulkPackingOrders(null)}
                />
            )}
            {bulkInvoiceOrders && (
                <BulkInvoiceModal
                    orders={bulkInvoiceOrders}
                    onClose={() => setBulkInvoiceOrders(null)}
                />
            )}
        </div>
    );
};

export default AdminOrders;
