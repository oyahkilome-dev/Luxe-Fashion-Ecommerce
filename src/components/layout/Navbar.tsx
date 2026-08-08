import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Heart, Lock } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

    const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Men', path: '/shop?category=Men' },
    { name: 'Women', path: '/shop?category=Women' },
    { name: 'Kids', path: '/shop?category=Kids' },
    { name: 'New Arrivals', path: '/shop?category=New%20Arrivals' },
  ];

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold tracking-tighter">
              <span className={isScrolled ? 'text-slate-900' : 'text-slate-900 lg:text-white'}>
                LUXE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide hover:opacity-70 transition-opacity ${
                    isScrolled ? 'text-slate-800' : 'text-slate-800 lg:text-white/90'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-5">
              <Link to="/admin" className={`hover:opacity-70 transition-opacity ${isScrolled ? 'text-slate-800' : 'text-slate-800 lg:text-white'}`} title="Admin Login">
                <Lock className="w-4 h-4 opacity-50" />
              </Link>
              <button className={`hover:opacity-70 transition-opacity ${isScrolled ? 'text-slate-800' : 'text-slate-800 lg:text-white'}`}>
                <Search className="w-5 h-5" />
              </button>
              <Link to="/dashboard" className={`hidden sm:block hover:opacity-70 transition-opacity ${isScrolled ? 'text-slate-800' : 'text-slate-800 lg:text-white'}`}>
                <User className="w-5 h-5" />
              </Link>
              <Link to="/cart" className={`relative hover:opacity-70 transition-opacity ${isScrolled ? 'text-slate-800' : 'text-slate-800 lg:text-white'}`}>
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {/* Mobile Menu Toggle */}
              <button
                className={`md:hidden ${isScrolled ? 'text-slate-800' : 'text-slate-800'}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-semibold text-slate-900 border-b border-slate-100 pb-4"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 flex space-x-6 border-t border-slate-200">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-slate-600">
                  <User className="w-5 h-5 mr-2" />
                  Account
                </Link>
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-slate-600">
                  <Heart className="w-5 h-5 mr-2" />
                  Wishlist
                </Link>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-slate-600">
                  <Lock className="w-5 h-5 mr-2 opacity-70" />
                  Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
