import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Clock } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { ProductCard } from '../components/product/ProductCard';
import { formatCurrency } from '../lib/utils';

export const Home = () => {
  const { products, fetchProducts, isLoading } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const featuredProducts = products.filter(p => p.isFeatured);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Fashion" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-900/30" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-sm md:text-base font-semibold tracking-[0.2em] uppercase mb-4"
          >
            Spring / Summer 2026
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter"
          >
            Redefining <br className="hidden md:block" /> Modern Elegance.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              to="/shop" 
              className="inline-flex items-center px-8 py-4 bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors rounded-sm tracking-wide"
            >
              Explore Collection
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center text-center md:text-left md:justify-start gap-4">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-slate-900">Free Global Shipping</h4>
                <p className="text-sm text-slate-500">On all orders over {formatCurrency(200)}</p>
              </div>
            </div>
            <div className="flex items-center justify-center text-center md:text-left md:justify-start gap-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-slate-900">Secure Payments</h4>
                <p className="text-sm text-slate-500">256-bit SSL encryption</p>
              </div>
            </div>
            <div className="flex items-center justify-center text-center md:text-left md:justify-start gap-4">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <h4 className="font-semibold text-slate-900">30-Day Returns</h4>
                <p className="text-sm text-slate-500">Hassle-free return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Trending Now</h2>
              <p className="text-slate-500">Discover our most sought-after pieces.</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Category Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000" 
                alt="Women" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/20" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-3xl font-bold text-white mb-4">Women's Edit</h3>
                <Link to="/shop?category=Women" className="inline-block bg-white text-slate-900 px-6 py-2 font-medium hover:bg-slate-100 transition-colors">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=1000" 
                alt="Men" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/20" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-3xl font-bold text-white mb-4">Men's Tailoring</h3>
                <Link to="/shop?category=Men" className="inline-block bg-white text-slate-900 px-6 py-2 font-medium hover:bg-slate-100 transition-colors">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Join The Club</h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter and get 15% off your first order, plus exclusive access to new arrivals and sales.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow px-4 py-3 rounded-sm border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              required
            />
            <button type="submit" className="px-8 py-3 bg-slate-900 text-white font-medium rounded-sm hover:bg-slate-800 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
