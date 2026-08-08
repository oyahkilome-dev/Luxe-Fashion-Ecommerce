import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Trash2, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  const cartTotal = total();
  const shipping = cartTotal > 200 ? 0 : 15;
  const grandTotal = cartTotal + shipping;

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-16 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Your Cart is Empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="bg-slate-900 text-white px-8 py-4 font-medium hover:bg-slate-800 transition-colors rounded-sm inline-flex items-center">
          Continue Shopping <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-slate-100">
            <div className="flow-root">
              <ul className="-my-6 divide-y divide-slate-200">
                {items.map((item) => (
                  <li key={`${item.id}-${item.size}-${item.color}`} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-slate-900">
                          <h3>
                            <Link to={`/product/${item.id}`}>{item.name}</Link>
                          </h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.color && `Color: ${item.color}`}
                          {item.color && item.size && ` | `}
                          {item.size && `Size: ${item.size}`}
                        </p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border border-slate-300 rounded-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size, item.color)} 
                            className="px-3 py-1 text-slate-500 hover:text-slate-900"
                          >-</button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)} 
                            className="px-3 py-1 text-slate-500 hover:text-slate-900"
                          >+</button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h2 className="text-lg font-medium text-slate-900 mb-6">Order Summary</h2>
              
              <div className="flow-root">
                <dl className="-my-4 divide-y divide-slate-200 text-sm">
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-slate-600">Subtotal</dt>
                    <dd className="font-medium text-slate-900">${cartTotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-slate-600">Shipping</dt>
                    <dd className="font-medium text-slate-900">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-base font-bold text-slate-900">Order Total</dt>
                    <dd className="text-base font-bold text-slate-900">${grandTotal.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-slate-900 text-white px-4 py-4 font-medium hover:bg-slate-800 transition-colors rounded-sm flex justify-center items-center gap-2"
                >
                  Proceed to Checkout
                </button>
              </div>
              
              <div className="mt-6 flex justify-center text-center text-sm text-slate-500">
                <p>
                  or{' '}
                  <Link to="/shop" className="font-medium text-blue-600 hover:text-blue-500">
                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
