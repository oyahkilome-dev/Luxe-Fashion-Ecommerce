import React, { useEffect, useState } from 'react';
import { Eye, Search, Filter, X, CheckCircle, Clock, Truck, Package, XCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

export const OrdersView = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map(o => o.id === id ? { ...o, status: updated.status } : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status: updated.status });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.order_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.customer_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.payments?.[0]?.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || 
      (o.status?.toLowerCase() === statusFilter.toLowerCase()) ||
      (statusFilter === 'Paid' && o.status === 'paid');
      
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Paid</span>;
      case 'pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
      case 'processing': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Package className="w-3 h-3 mr-1"/> Processing</span>;
      case 'shipped': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"><Truck className="w-3 h-3 mr-1"/> Shipped</span>;
      case 'delivered': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1"/> Delivered</span>;
      case 'cancelled': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Cancelled</span>;
      case 'refunded': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Refunded</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header and Filters */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Order Management</h2>
          <button onClick={fetchOrders} className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-md flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by Order #, Name, Email or Ref..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="border border-slate-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {['All', 'Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading orders...</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{order.customer_name || 'Guest'}</div>
                    <div className="text-slate-500 text-xs">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{formatCurrency(Number(order.total_amount))}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4 mr-1.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-slate-900">
                Order {selectedOrder.order_number}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {/* Items */}
                <section>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Items Ordered</h4>
                  <ul className="divide-y divide-slate-100">
                    {selectedOrder.order_items?.map((item: any, i: number) => (
                      <li key={i} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900">{item.product_name}</p>
                          <p className="text-sm text-slate-500">
                            {item.size && `Size: ${item.size} `}
                            {item.color && `| Color: ${item.color}`}
                          </p>
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right font-medium text-slate-900">
                          {formatCurrency(Number(item.total_price))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
                
                {/* Customer & Shipping */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Customer</h4>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                      <p>{selectedOrder.customer_email}</p>
                      <p>{selectedOrder.customer_phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Shipping Address</h4>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p>{selectedOrder.shipping_address}</p>
                      <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}</p>
                      <p>{selectedOrder.shipping_country}</p>
                    </div>
                  </div>
                </section>
              </div>
              
              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Order Status</h4>
                  <div className="mb-4">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Update Status</label>
                  <select 
                    className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Payment Info</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-slate-500">Status</span> <span className="font-medium text-green-600">Paid</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Provider</span> <span className="font-medium capitalize">{selectedOrder.payments?.[0]?.provider || 'Paystack'}</span></div>
                    <div className="flex flex-col"><span className="text-slate-500">Reference</span> <span className="font-mono text-xs break-all">{selectedOrder.payments?.[0]?.reference || 'N/A'}</span></div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span> <span>{formatCurrency(Number(selectedOrder.subtotal))}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Shipping</span> <span>{formatCurrency(Number(selectedOrder.shipping_fee))}</span></div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Total</span> <span>{formatCurrency(Number(selectedOrder.total_amount))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
