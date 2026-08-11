import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, MessageCircle, Package } from 'lucide-react';
import { CartItem } from '../store/cartStore';
import { formatCurrency } from '../lib/utils';

interface LocationState {
  orderNumber: string;
  customerName: string;
  amount: number;
  reference: string;
  items: CartItem[];
  grandTotal: number;
}

export const PaymentSuccess = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { orderNumber, customerName, amount, reference, items, grandTotal } = state;

  const waNumber = "2347030916304"; // Can be loaded from config
  const message = `Hello,\n\nI have successfully made payment.\n\nOrder Number: ${orderNumber}\nCustomer Name: ${customerName}\nAmount Paid: ${formatCurrency(amount || 0)}\n\nKindly confirm my payment and process my order.\n\nThank you.`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="pt-32 pb-16 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-10 rounded-lg shadow-sm border border-slate-100">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-600 text-lg">Thank you for your order, {customerName}.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Order Info */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="font-semibold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-500" /> Order Details
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-medium text-slate-900">{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Reference</span>
                  <span className="font-medium text-slate-900 truncate max-w-[150px]" title={reference}>{reference}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-medium text-slate-900">{formatCurrency(amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Status</span>
                  <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Paid</span>
                </div>
              </div>
            </div>

            {/* Products Info */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="font-semibold text-slate-900 border-b border-slate-200 pb-3 mb-4">Items Purchased</h2>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {items && items.length > 0 ? items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between items-start text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                      </p>
                    </div>
                    <div className="font-medium text-slate-900 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500">No items data available.</div>
                )}
              </div>
              
              <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center text-sm">
                <span className="font-medium text-slate-900">Total</span>
                <span className="font-bold text-slate-900">{formatCurrency(grandTotal || amount || 0)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 mb-8 text-center">
            You will receive an email confirmation shortly. Estimated delivery is 3-5 business days.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-green-500 text-white px-8 py-3 font-medium hover:bg-green-600 transition-colors rounded-sm"
            >
              <MessageCircle className="w-5 h-5" /> Confirm on WhatsApp
            </a>
            
            <Link 
              to="/shop" 
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-slate-900 text-white px-8 py-3 font-medium hover:bg-slate-800 transition-colors rounded-sm"
            >
              <ShoppingBag className="w-5 h-5" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
