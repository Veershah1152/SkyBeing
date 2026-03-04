import React from 'react';
import { X, Printer } from 'lucide-react';

const BulkPackingSlipModal = ({ orders, onClose }) => {
    if (!orders || orders.length === 0) return null;

    const handlePrint = () => {
        window.print();
    };

    const storeDetails = {
        name: "SkyBeings",
        address1: "6624/6, CHINCHKHED ROAD, BRAMHAA VALLEY SCHOOL",
        address2: "SAMBHAJI NAGAR, PIMPALGAON BASWANT",
        address3: "NASHIK, MAHARASHTRA-422209",
        phone: "+91 9370228555"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:block overflow-y-auto">
            <div className="absolute inset-0 print:hidden" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl min-h-[90vh] flex flex-col print:shadow-none print:rounded-none print:w-full print:block">

                {/* Modal Header - Hidden in Print */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-[110] rounded-t-2xl print:hidden">
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">Bulk Packing Slips</h2>
                        <p className="text-xs text-gray-400">Ready to print {orders.length} slips</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-skyGreen text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-skyGreen/20"
                        >
                            <Printer className="w-5 h-5" /> Print All
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* All Slips Container */}
                <div className="flex-1 p-8 space-y-8 bg-gray-50 print:bg-white print:p-0 print:space-y-0 bulk-print-area">
                    {orders.map((order, idx) => (
                        <div key={order._id} className="bg-white p-8 shadow-sm border border-gray-100 print:border-none print:shadow-none print:p-10 page-break-after">
                            {/* Slip Content Header */}
                            <div className="flex justify-between items-start mb-12">
                                <div className="text-sm">
                                    <span className="font-medium text-gray-500">Payment: </span>
                                    <span className="font-bold uppercase text-gray-900">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / UPI'}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400 font-mono mb-1">ORDER ID</div>
                                    <div className="text-2xl font-black text-gray-900">ORD {order._id.substring(order._id.length - 4).toUpperCase()}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-12">
                                {/* To Section */}
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 print:bg-transparent">
                                        Ship To
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{order.customerName || order.userId?.name}</div>
                                    <div className="text-base leading-relaxed text-gray-700">
                                        {order.shippingAddress?.street}<br />
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                                        {order.shippingAddress?.country}, {order.shippingAddress?.zipCode}<br />
                                        <div className="mt-2 font-bold text-gray-900">Phone: {order.customerPhone}</div>
                                    </div>
                                </div>

                                {/* From Section */}
                                <div className="space-y-2 pt-10 border-t border-dashed border-gray-200 print:border-t-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 print:bg-transparent">
                                        Return Address
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">{storeDetails.name}</div>
                                    <div className="text-sm leading-relaxed text-gray-600">
                                        {storeDetails.address1}<br />
                                        {storeDetails.address2}<br />
                                        {storeDetails.address3}<br />
                                        <div className="mt-1 font-semibold text-gray-900">Support: {storeDetails.phone}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Slip Footer / Separator */}
                            <div className="mt-12 flex justify-between items-center text-[10px] text-gray-300 font-mono uppercase tracking-widest print:hidden">
                                <span>Packing Slip {idx + 1} of {orders.length}</span>
                                <span>------------------------------------------</span>
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
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                    }
                }
            ` }} />
        </div>
    );
};

export default BulkPackingSlipModal;
