import React from 'react';
import { X, Printer } from 'lucide-react';

const PackingSlipModal = ({ order, onClose }) => {
    if (!order) return null;

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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 print:p-0">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm print:hidden" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:rounded-none print:static print:overflow-visible print-section">

                {/* Header - Hidden in Print */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl print:hidden">
                    <h2 className="font-bold text-gray-900 text-lg">Packing Slip</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 bg-skyGreen/10 text-skyGreen hover:bg-skyGreen hover:text-white rounded-xl transition-all"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Slip Content */}
                <div className="p-8 space-y-12 bg-white print:p-4 text-black font-sans">

                    {/* Top Row: Payment & Order ID */}
                    <div className="flex justify-between items-start">
                        <div className="text-sm">
                            <span className="font-medium">Payment Method: </span>
                            <span className="font-bold uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / UPI'}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black">ORD {order._id.substring(order._id.length - 4).toUpperCase()}</div>
                        </div>
                    </div>

                    {/* To Section */}
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold mb-2">To,</h3>
                        <div className="text-base font-semibold">{order.customerName || order.userId?.name}</div>
                        <div className="text-sm leading-snug">
                            {order.shippingAddress?.street}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                            {order.shippingAddress?.country}, {order.shippingAddress?.zipCode}<br />
                            {order.customerPhone}
                        </div>
                    </div>

                    {/* From Section */}
                    <div className="space-y-1 pt-10 border-t border-gray-100 print:border-none">
                        <h3 className="text-lg font-bold mb-2">From,</h3>
                        <div className="text-base font-bold">{storeDetails.name}</div>
                        <div className="text-sm leading-snug text-gray-700">
                            {storeDetails.address1}<br />
                            {storeDetails.address2}<br />
                            {storeDetails.address3}<br />
                            Phone: {storeDetails.phone}
                        </div>
                    </div>

                </div>

                {/* Footer - Hidden in Print */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end print:hidden">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>

            </div>

            {/* Print Specific Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                    body { margin: 1cm; background: white !important; }
                    body * { visibility: hidden !important; }
                    .print-section, .print-section * { visibility: visible !important; }
                    .print-section {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 20px !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .print-section button, .print-section .print\\:hidden { display: none !important; }
                }
            ` }} />
        </div>
    );
};

export default PackingSlipModal;
