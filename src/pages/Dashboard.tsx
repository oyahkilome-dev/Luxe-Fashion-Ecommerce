import React from 'react';
import { Package, Heart, MapPin, User, LogOut } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const Dashboard = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900">Jane Doe</h3>
                <p className="text-sm text-slate-500">jane@example.com</p>
              </div>
              <ul className="flex flex-col">
                <li className="border-b border-slate-100">
                  <button className="w-full flex items-center px-6 py-4 text-sm font-medium text-blue-600 bg-blue-50">
                    <Package className="w-5 h-5 mr-3" /> Orders
                  </button>
                </li>
                <li className="border-b border-slate-100">
                  <button className="w-full flex items-center px-6 py-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Heart className="w-5 h-5 mr-3" /> Wishlist
                  </button>
                </li>
                <li className="border-b border-slate-100">
                  <button className="w-full flex items-center px-6 py-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <MapPin className="w-5 h-5 mr-3" /> Addresses
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Orders</h2>
              
              <div className="space-y-6">
                {[1, 2].map((order) => (
                  <div key={order} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Order Placed</p>
                        <p className="text-sm font-medium text-slate-900">May 12, 2026</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total</p>
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(234.50)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Order #</p>
                        <p className="text-sm font-medium text-slate-900">ORD-89234{order}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Delivered
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-6">
                        <img 
                          src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200" 
                          alt="Product" 
                          className="w-20 h-20 object-cover rounded-md border border-slate-200"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-900">Classic White Sneakers</h4>
                          <p className="text-sm text-slate-500 mt-1">Size: 9 | Qty: 1</p>
                          <button className="text-sm text-blue-600 font-medium mt-2 hover:underline">View Product</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
