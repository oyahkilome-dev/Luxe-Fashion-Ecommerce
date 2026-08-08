import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '../store/cartStore';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  postalCode: z.string().min(3),
  phone: z.string().min(8),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const Checkout = () => {
  const { total, items, clearCart } = useCartStore();
  const cartTotal = total();
  const shipping = cartTotal > 200 ? 0 : 15;
  const grandTotal = cartTotal + shipping;
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema)
  });

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: getValues('email') || 'customer@example.com',
    amount: Math.round(grandTotal * 100), // Paystack amount is in kobo/cents
    currency: 'NGN',
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePayment = usePaystackPayment(paystackConfig);


  const navigate = useNavigate();

  const handleSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      const data = getValues();
      
      const response = await fetch('/api/orders/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reference: typeof reference === 'string' ? reference : (reference.reference || reference.trans),
          items: items,
          customerData: data,
          cartTotal: cartTotal,
          shipping: shipping,
          grandTotal: grandTotal
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to process order');
      }

      clearCart();
      
      // Navigate to success page
      navigate('/payment-success', { 
        state: { 
          orderNumber: responseData.orderNumber, 
          customerName: responseData.customerName,
          amount: responseData.amount,
          reference: typeof reference === 'string' ? reference : (reference.reference || reference.trans || 'unknown'),
          items: items,
          grandTotal: grandTotal
        } 
      });
      
    } catch (error: any) {
      console.error("Order processing error:", error);
      setCheckoutError(`Payment successful but order processing failed: ${error.message || 'Please contact support.'}`);
      setIsProcessing(false);
    }
  };


  const handleClose = () => {
    console.log('Payment closed');
    setIsProcessing(false);
  };

  const onSubmit = (data: CheckoutForm) => {
    if (!paystackConfig.publicKey) {
      setCheckoutError("Paystack Public Key is missing. Please configure it in settings.");
      return;
    }
    // Update config with real email before passing to paystack
    paystackConfig.email = data.email;
    initializePayment({ onSuccess: handleSuccess as any, onClose: handleClose as any });
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          {checkoutError && (
            <div className="lg:col-span-12 mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
              {checkoutError}
            </div>
          )}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border border-slate-100">
              
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact Information</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    {...register('email')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input {...register('firstName')} className="w-full px-4 py-2 border border-slate-300 rounded-sm" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input {...register('lastName')} className="w-full px-4 py-2 border border-slate-300 rounded-sm" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input {...register('address')} className="w-full px-4 py-2 border border-slate-300 rounded-sm" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input {...register('city')} className="w-full px-4 py-2 border border-slate-300 rounded-sm" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                    <input {...register('postalCode')} className="w-full px-4 py-2 border border-slate-300 rounded-sm" />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input {...register('country')} className="w-full px-4 py-2 border border-slate-300 rounded-sm" />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input {...register('phone')} className="w-full px-4 py-2 border border-slate-300 rounded-sm" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  Payment Method <ShieldCheck className="w-5 h-5 text-green-600" />
                </h2>
                <div className="p-4 border border-slate-300 rounded-sm bg-slate-50 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-slate-900 mb-2">Secure Payment via Paystack</p>
                  <p className="text-xs text-slate-500 mb-4">You will be redirected to WhatsApp to confirm your order after payment.</p>
                  
                  <div className="mb-4 text-center">
                    <p className="text-xs text-slate-600">
                      By clicking Pay Now, you confirm that the order details above are correct.
                    </p>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isProcessing || items.length === 0}
                    className="w-full bg-slate-900 text-white px-4 py-4 font-medium hover:bg-slate-800 transition-colors rounded-sm disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : `Pay ₦${grandTotal.toFixed(2)}`}
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 sticky top-28">
              <h2 className="text-lg font-medium text-slate-900 mb-6">Order Summary</h2>
              
              <ul className="divide-y divide-slate-200 mb-6 max-h-[400px] overflow-y-auto">
                {items.map((item) => (
                  <li key={`${item.id}-${item.size}-${item.color}`} className="flex py-4">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover border border-slate-200" />
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-medium text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity} {item.size && `| Size: ${item.size}`}</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">₦{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flow-root border-t border-slate-200 pt-6">
                <dl className="-my-4 divide-y divide-slate-200 text-sm">
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-slate-600">Subtotal</dt>
                    <dd className="font-medium text-slate-900">₦{cartTotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-slate-600">Shipping</dt>
                    <dd className="font-medium text-slate-900">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-lg font-bold text-slate-900">Total</dt>
                    <dd className="text-lg font-bold text-slate-900">₦{grandTotal.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
