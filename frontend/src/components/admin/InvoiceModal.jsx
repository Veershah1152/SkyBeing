import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Loader2, Printer } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

const InvoiceModal = ({ order, onClose }) => {
    const invoiceRef = useRef(null);
    const barcodeRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (order && barcodeRef.current) {
            JsBarcode(barcodeRef.current, order._id.substring(order._id.length - 10).toUpperCase(), {
                format: "CODE128",
                width: 1.5,
                height: 40,
                displayValue: true,
                fontSize: 12,
                margin: 0,
                background: "#00000000" // transparent
            });
        }
    }, [order]);

    const handleDownload = async () => {
        if (!invoiceRef.current) return;
        try {
            setIsDownloading(true);
            const element = invoiceRef.current;

            // Generate canvas/image natively to support OKLCH & modern CSS
            const imgData = await toPng(element, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });

            // Calculate dimensions for A4 PDF page
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            // Estimate height based on typical A4 ratio (1:1.414) or actual element aspect ratio
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Add image and download
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${order._id.substring(order._id.length - 6).toUpperCase()}.pdf`);
        } catch (error) {
            console.error('Download failed', error);
            alert('Failed to process PDF download. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (!order) return null;

    const invoiceNumber = order._id.substring(order._id.length - 6).toUpperCase();
    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const paymentStatus = (order.paymentStatus || 'pending').toUpperCase();
    const orderStatus = (order.orderStatus || 'processing').toUpperCase();

    const subTotal = order.products.reduce((acc, item) => {
        // Handle case where productId might be an object populating data, or just an id with price stored separately
        const price = item.price || item.productId?.price || 0;
        return acc + price * item.quantity;
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Invoice Preview</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className={`flex items-center gap-2 px-4 py-2 ${isDownloading ? 'bg-gray-400' : 'bg-skyGreen'} text-white rounded-lg hover:bg-opacity-90 transition`}
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isDownloading ? 'Processing...' : 'Download PDF'}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 p-8 flex justify-center">
                    {/* A4 sized container for accurate rendering layout */}
                    <div
                        ref={invoiceRef}
                        className="bg-white invoice-print-area"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '0mm 0mm',
                            boxSizing: 'border-box',
                            position: 'relative',
                            fontFamily: '"Inter", sans-serif'
                        }}
                    >
                        {/* INVOICE CONTENT */}
                        <div className="p-12 relative h-full flex flex-col">
                            {/* Header Logo */}
                            <div className="flex justify-center mb-16">
                                <img src="/logo-cropped.png" alt="SkyBeings Logo" className="h-32 w-auto object-contain" />
                            </div>

                            {/* Info Section */}
                            <div className="flex justify-between items-start mb-12">
                                <div className="space-y-4">
                                    <h1 className="text-2xl font-bold tracking-[0.2em] mb-6">INVOICE # <span className="ml-4">{invoiceNumber}</span></h1>
                                    <div className="flex text-sm text-gray-800">
                                        <div className="w-32 font-semibold tracking-wider text-xs uppercase">INVOICE DATE</div>
                                        <div className="w-4 font-semibold">:</div>
                                        <div className="font-medium text-sm">{invoiceDate}</div>
                                    </div>
                                    <div className="flex text-sm text-gray-800">
                                        <div className="w-32 font-semibold tracking-wider text-xs uppercase">STATUS</div>
                                        <div className="w-4 font-semibold">:</div>
                                        <div className="font-medium text-sm">{orderStatus}</div>
                                    </div>
                                    <div className="flex text-sm text-gray-800">
                                        <div className="w-32 font-semibold tracking-wider text-xs uppercase">PAYMENT</div>
                                        <div className="w-4 font-semibold">:</div>
                                        <div className="font-medium text-sm">{paymentStatus}</div>
                                    </div>
                                </div>

                                <div className="text-left w-64 pt-1">
                                    <h2 className="text-xl font-bold tracking-[0.2em] mb-6 uppercase">BILL TO</h2>
                                    <div className="text-sm text-gray-800 space-y-2 font-medium">
                                        <div className="font-bold">{order.userId?.name || 'Guest User'}</div>
                                        {Object.keys(order.shippingAddress || {}).length > 0 ? (
                                            <>
                                                <div>{order.shippingAddress?.street}</div>
                                                <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
                                                <div>{order.shippingAddress?.country || 'India'}</div>
                                            </>
                                        ) : (
                                            <div>Address not provided</div>
                                        )}
                                        <div>{order.userId?.email}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="w-full mt-4">
                                <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr className="bg-[#9cb73b] text-gray-800 tracking-wider">
                                            <th className="py-4 px-6 text-sm font-bold w-16">NO</th>
                                            <th className="py-4 px-6 text-sm font-bold uppercase">DESCRIPTION</th>
                                            <th className="py-4 px-6 text-sm font-bold w-32 uppercase text-center">PRICE</th>
                                            <th className="py-4 px-6 text-sm font-bold w-24 uppercase text-center">QTY</th>
                                            <th className="py-4 px-6 text-sm font-bold w-32 uppercase text-right">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.products && order.products.length > 0 ? (
                                            order.products.map((item, index) => {
                                                const bgColor = index % 2 === 0 ? '#f5f5f5' : '#ffffff';

                                                // Handle the case where product might have been deleted from DB or simply not populated
                                                const name = item.productId?.name || item.name || 'Product Not Found';

                                                // Price fallback from order details or from populated product
                                                const price = item.price || item.productId?.price || 0;
                                                const total = price * item.quantity;

                                                return (
                                                    <tr key={index} style={{ backgroundColor: bgColor }} className="font-medium text-gray-800 text-sm">
                                                        <td className="py-4 px-6 text-center">{index + 1}</td>
                                                        <td className="py-4 px-6">{name}</td>
                                                        <td className="py-4 px-6 text-center">₹{price.toFixed(2)}</td>
                                                        <td className="py-4 px-6 text-center">{item.quantity}</td>
                                                        <td className="py-4 px-6 text-right font-semibold">₹{total.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr className="font-medium text-gray-500 text-sm bg-gray-50">
                                                <td colSpan={5} className="py-8 text-center italic">No products detail available for this order</td>
                                            </tr>
                                        )}
                                        {/* empty rows to fill visual space if products are few */}
                                        {Array.from({ length: 4 - order.products.length }).map((_, idx) => (
                                            <tr key={`empty-${idx}`} style={{ backgroundColor: (order.products.length + idx) % 2 === 0 ? '#f5f5f5' : '#ffffff' }} className="h-12">
                                                <td></td><td></td><td></td><td></td><td></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals Section */}
                            <div className="flex justify-end mt-12 w-full">
                                <div className="w-[300px]">
                                    <div className="bg-[#9cb73b] p-6 flex justify-between mt-2 tracking-wide font-bold">
                                        <span className="text-base text-gray-800">TOTAL</span>
                                        <span className="text-base text-gray-800">₹{order.totalAmount?.toFixed(2) || subTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <canvas ref={barcodeRef}></canvas>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1"></div>

                            {/* Footer Content */}
                            <div>
                                <p className="text-center font-bold text-[11px] tracking-wider uppercase text-gray-800 mb-8 max-w-xl mx-auto leading-relaxed">
                                    THANK YOU FOR YOUR SUPPORT. YOUR PURCHASE MAKES A POSITIVE DIFFERENCE FOR BIRDS AND NATURE.
                                </p>
                            </div>
                        </div>
                        {/* Deep Dark Grey Footer Address Bar (Absolute to bottom of A4) */}
                        <div className="absolute bottom-0 w-full bg-[#353535] text-white/90 rounded-t-[40px] px-12 py-8 text-center text-[10px] tracking-widest font-light leading-relaxed uppercase">
                            6624/6, CHINCHKHED ROAD, BRAMHAA VALLEY SCHOOL, SAMBHAJI<br />
                            NAGAR, PIMPALGAON BASWANT, NASHIK, MAHARASHTRA-422209
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { margin: 0; background: white !important; }
                    body * { visibility: hidden !important; }
                    .invoice-print-area, .invoice-print-area * { visibility: visible !important; }
                    .invoice-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    /* Ensure totals and colors are preserved */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            ` }} />
        </div>
    );
};

export default InvoiceModal;
