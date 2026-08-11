import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, BarChart, LogOut, Lock, Home } from 'lucide-react';
import { AdminSettings } from '../components/admin/AdminSettings';
import { OrdersView } from '../components/admin/views/OrdersView';
import { ProductsView } from '../components/admin/views/ProductsView';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { formatCurrency } from '../lib/utils';

export const Admin = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'orders' | 'settings'>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Login form state
  const [email, setEmail] = useState('oyahkilome@gmail.com');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        verifyAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await verifyAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const verifyAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        // If they are logged in but not an admin, optionally log them out of the admin panel
        // await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error verifying admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Verification will happen via onAuthStateChange
    } catch (err: any) {
      setLoginError(err.message || 'Failed to login');
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>;
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center text-slate-900 mb-6">
            <Lock className="w-12 h-12" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Admin Portal
          </h2>
          {session && !isAdmin && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center text-sm">
              Authenticated as {session.user.email}, but you do not have admin privileges.
              <button onClick={handleLogout} className="block w-full mt-2 font-medium underline">Sign out</button>
            </div>
          )}
        </div>

        {(!session || (session && !isAdmin)) && (
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
              <form className="space-y-6" onSubmit={handleLogin}>
                {loginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <div className="mt-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="mt-1">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800 text-center">
          <h2 className="text-2xl font-bold tracking-tighter">LUXE ADMIN</h2>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveView('products')}
            className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeView === 'products' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Package className="w-5 h-5 mr-3" /> Products
          </button>
          <button 
            onClick={() => setActiveView('orders')}
            className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeView === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <ShoppingCart className="w-5 h-5 mr-3" /> Orders
          </button>
          <button className="w-full flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors">
            <Users className="w-5 h-5 mr-3" /> Customers
          </button>
          <button className="w-full flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors">
            <BarChart className="w-5 h-5 mr-3" /> Analytics
          </button>
          <button 
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeView === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5 mr-3" /> Integrations
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
             <LogOut className="w-4 h-4 mr-2" /> Sign Out
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-100 min-h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {activeView === 'dashboard' ? 'Dashboard Overview' : activeView}
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors mr-2">
              <Home className="w-4 h-4 mr-2" />
              View Website
            </Link>
            <span className="text-sm font-medium text-slate-600 hidden sm:block">{session?.user?.email}</span>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold shrink-0">
               {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-8">
          {activeView === 'dashboard' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(124563.00)}</h3>
                  <p className="text-xs text-green-600 mt-2 font-medium">+14% from last month</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
                  <h3 className="text-2xl font-bold text-slate-900">845</h3>
                  <p className="text-xs text-green-600 mt-2 font-medium">+5% from last month</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 mb-1">Active Customers</p>
                  <h3 className="text-2xl font-bold text-slate-900">1,204</h3>
                  <p className="text-xs text-green-600 mt-2 font-medium">+12% from last month</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 mb-1">Products</p>
                  <h3 className="text-2xl font-bold text-slate-900">142</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">12 out of stock</p>
                </div>
              </div>

              <OrdersView />
            </>
          )}

          {activeView === 'products' && <ProductsView />}
          {activeView === 'orders' && <OrdersView />}
          {activeView === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};
