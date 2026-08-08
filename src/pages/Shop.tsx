import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/product/ProductCard';
import { useProductStore } from '../store/productStore';
import { Filter, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [categories, setCategories] = useState<any[]>([]);
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);
  
  useEffect(() => {
    if (categoryParam) {
      const decodedParam = decodeURIComponent(categoryParam).toLowerCase();
      // Match exactly or loosely
      const match = categories.find(c => 
        c.slug.toLowerCase() === decodedParam || 
        c.name.toLowerCase() === decodedParam
      );
      if (match) {
        setSelectedCategory(match.name);
      } else if (decodedParam === 'new arrivals' || decodedParam === 'featured') {
        setSelectedCategory(decodedParam);
      } else {
        setSelectedCategory(categoryParam);
      }
    } else {
        setSelectedCategory(null);
    }
  }, [categoryParam, categories]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleCategorySelect = (catName: string | null) => {
    setSelectedCategory(catName);
    if (!catName || catName === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: catName });
    }
  };

  const filteredProducts = products.filter(p => {
      if (!selectedCategory || selectedCategory === "All") return true;
      if (selectedCategory.toLowerCase() === 'new arrivals') return p.isNew;
      if (selectedCategory.toLowerCase() === 'featured') return p.isFeatured;
      
      const pCat = (p.category || '').toLowerCase();
      const sCat = selectedCategory.toLowerCase();
      
      if (pCat === sCat) return true;
      
      // Match legacy categories with new ones
      if (sCat === 'men' && pCat === "men's fashion") return true;
      if (sCat === 'women' && pCat === "women's fashion") return true;
      if (sCat === "men's fashion" && pCat === 'men') return true;
      if (sCat === "women's fashion" && pCat === 'women') return true;
      
      return false;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">The Collection</h1>
            <p className="text-slate-500">Explore our complete range of premium products.</p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-sm text-sm font-medium hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="relative">
              <select className="appearance-none bg-transparent border border-slate-300 rounded-sm px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar / Categories */}
          <div className="w-full lg:w-64 shrink-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`text-sm hover:text-blue-600 transition-colors ${
                    !selectedCategory || selectedCategory === "All" ? 'text-blue-600 font-medium' : 'text-slate-600'
                  }`}
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategorySelect("New Arrivals")}
                  className={`text-sm hover:text-blue-600 transition-colors ${
                    selectedCategory?.toLowerCase() === "new arrivals" ? 'text-blue-600 font-medium' : 'text-slate-600'
                  }`}
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategorySelect("Featured")}
                  className={`text-sm hover:text-blue-600 transition-colors ${
                    selectedCategory?.toLowerCase() === "featured" ? 'text-blue-600 font-medium' : 'text-slate-600'
                  }`}
                >
                  Featured Products
                </button>
              </li>
              {categories.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => handleCategorySelect(c.name)}
                    className={`text-sm hover:text-blue-600 transition-colors ${
                      selectedCategory === c.name ? 'text-blue-600 font-medium' : 'text-slate-600'
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 mt-10 mb-4">Price Range</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm" />
                <span className="text-slate-500">-</span>
                <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No products found for this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
