import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Product, mockProducts } from '../data/mockProducts';

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: mockProducts,
  isLoading: false,
  error: null,
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        set({ products: mockProducts, isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          brands(name, slug),
          product_images(image_url, is_primary),
          product_variants(id, sku, color, size, stock_quantity, price_adjustment)
        `);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedProducts: Product[] = data.map((item: any) => {
          // Extract image URLs from the joined product_images table
          let imageUrls: string[] = [];
          if (item.product_images && item.product_images.length > 0) {
            // Sort to ensure primary image is first
            const sortedImages = [...item.product_images].sort((a, b) => 
              (a.is_primary === b.is_primary) ? 0 : a.is_primary ? -1 : 1
            );
            imageUrls = sortedImages.map((img: any) => img.image_url);
          } else if (item.images && item.images.length > 0) {
            // Fallback to legacy column if it exists
            imageUrls = item.images;
          }
          
          // Provide a fallback placeholder if no images exist
          if (imageUrls.length === 0) {
            imageUrls = ['https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=1000'];
          }

          
          // Process variants
          let variants = item.product_variants || [];
          let colors = item.colors || [];
          let sizes = item.sizes || [];
          let totalStock = item.stock_quantity || 0;

          if (variants.length > 0) {
            const uniqueColors = new Set<string>();
            const uniqueSizes = new Set<string>();
            totalStock = 0;
            
            variants.forEach((v: any) => {
              if (v.color) uniqueColors.add(v.color);
              if (v.size) uniqueSizes.add(v.size);
              totalStock += (v.stock_quantity || 0);
            });
            
            if (uniqueColors.size > 0) colors = Array.from(uniqueColors);
            if (uniqueSizes.size > 0) sizes = Array.from(uniqueSizes);
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            originalPrice: item.original_price,
            images: imageUrls,
            category: item.categories?.name || 'Uncategorized',
            brand: item.brands?.name || item.brand || 'Generic',
            rating: item.rating,
            reviews: item.reviews_count,
            inStock: item.in_stock && totalStock > 0,
            stockQuantity: totalStock,
            isNew: item.is_new,
            colors: colors,
            sizes: sizes,
            variants: variants
          };

        });
        // Deduplicate products by ID, preferring Supabase data (formattedProducts)
        const allProducts = [...mockProducts, ...formattedProducts];
        const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values());
        
        set({ products: uniqueProducts, isLoading: false });
      } else {
        set({ products: mockProducts, isLoading: false });
      }
    } catch (err: any) {
      console.error("Error fetching products from Supabase:", err.message);
      set({ products: mockProducts, isLoading: false, error: err.message });
    }
  },
}));
