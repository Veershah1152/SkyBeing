import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Eye, Loader2, Package, FileText } from 'lucide-react';
import api from '../../api/axios';
import InvoiceModal from '../../components/admin/InvoiceModal';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState('idle');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [invoiceOrder, setInvoiceOrder] = useState(null);

    // Status color mapping
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
            // Include status filter if selected
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
            // Optimistic update
            setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders <span className="text-gray-400 text-lg font-normal mb-1 ml-2">({orders.length})</span></h1>
                    <p className="mt-1 text-sm text-gray-500">View and manage customer orders and fulfillment.</p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, or Email..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {status === 'loading' ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-skyGreen" />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-green-50/30 transition-colors group">
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
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{order.userId?.name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{order.userId?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${order.totalAmount?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Status Dropdown instead of just text */}
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
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setInvoiceOrder(order)}
                                                className="p-2 bg-gray-100 hover:bg-skyGreen hover:text-white rounded-lg transition-colors text-gray-600 flex items-center justify-center m-auto"
                                                title="View Invoice"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Display Invoice Modal if an order is selected */}
            {invoiceOrder && (
                <InvoiceModal
                    order={invoiceOrder}
                    onClose={() => setInvoiceOrder(null)}
                />
            )}
        </div>
    );
};

export default AdminOrders;
