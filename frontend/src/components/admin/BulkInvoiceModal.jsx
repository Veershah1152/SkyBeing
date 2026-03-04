import React, { useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import JsBarcode from 'jsbarcode';

const BulkInvoiceModal = ({ orders, onClose }) => {
    if (!orders || orders.length === 0) return null;

    const handlePrint = () => {
        window.print();
    };

    const storeDetails = {
        name: "SkyBeings",
        address1: "6624/6, CHINCHKHED ROAD, BRAMHAA VALLEY SCHOOL",
        address2: "SAMBHAJI NAGAR, PIMPALGAON BASWANT",
        address3: "NASHIK, MAHARASHTRA-422209",
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:block overflow-y-auto">
            <div className="absolute inset-0 print:hidden" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl min-h-[90vh] flex flex-col print:shadow-none print:rounded-none print:w-full print:block">

                {/* Modal Header - Hidden in Print */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-[110] rounded-t-2xl print:hidden">
                    <div className="flex flex-col">
                        <h2 className="font-bold text-gray-900 text-lg">Bulk Invoices</h2>
                        <p className="text-xs text-gray-400">Ready to print {orders.length} invoices</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-skyGreen text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-skyGreen/20"
                        >
                            <Printer className="w-5 h-5 text-gray-900" /> Print All
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* All Invoices Container */}
                <div className="flex-1 space-y-8 bg-gray-50 print:bg-white print:p-0 print:space-y-0 bulk-print-area text-black h-full">
                    {orders.map((order, idx) => (
                        <div key={order._id} className="bg-white p-16 shadow-sm border border-gray-100 print:border-none print:shadow-none print:p-20 page-break-after relative min-h-[297mm]">

                            {/* Logo Header */}
                            <div className="flex justify-center mb-12">
                                <img src="/logo-cropped.png" alt="SkyBeings Logo" className="h-28 w-auto object-contain" />
                            </div>

                            {/* Info Section */}
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-4">
                                    <h1 className="text-2xl font-bold tracking-[0.2em] mb-4">INVOICE # <span className="ml-4">{order._id.substring(order._id.length - 6).toUpperCase()}</span></h1>
                                    <div className="text-sm font-medium space-y-1">
                                        <div className="flex items-center gap-4">
                                            <span className="w-32 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span>
                                            <span>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="w-32 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</span>
                                            <span className="font-bold">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / UPI'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left w-64 pt-1">
                                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">BILL TO</h2>
                                    <div className="text-sm space-y-1 font-semibold text-gray-900">
                                        <div className="text-lg font-black">{order.customerName || order.userId?.name}</div>
                                        <div>{order.shippingAddress?.street}</div>
                                        <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
                                        <div>{order.customerPhone}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="w-full mt-8">
                                <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr className="bg-skyGreen text-gray-900 tracking-wider">
                                            <th className="py-4 px-6 text-sm font-bold w-12 text-center underline underline-offset-4 decoration-skyGreen-900 decoration-2">#</th>
                                            <th className="py-4 px-6 text-sm font-bold uppercase tracking-widest">Description</th>
                                            <th className="py-4 px-6 text-sm font-bold w-32 uppercase text-center">Price</th>
                                            <th className="py-4 px-6 text-sm font-bold w-24 uppercase text-center tracking-tighter decoration-skyGreen-900 decoration-2">Qty</th>
                                            <th className="py-4 px-6 text-sm font-bold w-32 uppercase text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 border-x border-b border-gray-100">
                                        {order.products?.map((item, index) => {
                                            const name = item.productId?.name || item.name || 'Product';
                                            const price = item.price || item.productId?.price || 0;
                                            const total = price * item.quantity;
                                            return (
                                                <tr key={index} className="font-medium text-gray-800 text-sm">
                                                    <td className="py-4 px-6 text-center text-gray-400">{index + 1}</td>
                                                    <td className="py-4 px-6 text-gray-900 font-bold">{name}</td>
                                                    <td className="py-4 px-6 text-center">₹{price.toLocaleString()}</td>
                                                    <td className="py-4 px-6 text-center font-bold">{item.quantity}</td>
                                                    <td className="py-4 px-6 text-right font-black">₹{total.toLocaleString()}</td>
                                                </tr>
                                            );
                                        })}
                                        {/* Spacer rows */}
                                        {Array.from({ length: Math.max(0, 4 - (order.products?.length || 0)) }).map((_, i) => (
                                            <tr key={`bulk-empty-${i}`} className="h-10">
                                                <td></td><td></td><td></td><td></td><td></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Area */}
                            <div className="flex justify-end mt-12 w-full">
                                <div className="w-[300px]">
                                    <div className="bg-skyGreen p-6 flex justify-between items-center tracking-wide font-black border-2 border-skyGreen rounded-xl">
                                        <span className="text-sm uppercase tracking-[0.2em] text-gray-900">Total</span>
                                        <span className="text-xl text-gray-900">₹{order.totalAmount?.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-8 text-center uppercase tracking-widest text-[9px] text-gray-300 font-mono">
                                        Invoice {idx + 1} of {orders.length}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1"></div>

                            {/* Message */}
                            <div className="pt-20">
                                <p className="text-center font-bold text-[10px] tracking-widest uppercase text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed underline decoration-skyGreen/20 underline-offset-8 decoration-4">
                                    THANK YOU FOR YOUR SUPPORT. YOUR PURCHASE MAKES A POSITIVE DIFFERENCE FOR BIRDS AND NATURE.
                                </p>
                            </div>

                            {/* Footer Base */}
                            <div className="absolute bottom-0 left-0 w-full bg-[#1a1a1a] text-white/90 px-12 py-8 text-center text-[10px] tracking-widest font-light leading-relaxed uppercase">
                                {storeDetails.address1}, {storeDetails.address2}<br />
                                {storeDetails.address3}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { margin: 0; background: white !important; }
                    body * { visibility: hidden !important; }
                    .bulk-print-area, .bulk-print-area * { visibility: visible !important; }
                    .bulk-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        display: block !important;
                    }
                    .page-break-after {
                        page-break-after: always !important;
                        break-after: page !important;
                        margin: 0 !important;
                        height: 100vh !important;
                        display: block !important;
                    }
                }
            ` }} />
        </div>
    );
};

export default BulkInvoiceModal;
