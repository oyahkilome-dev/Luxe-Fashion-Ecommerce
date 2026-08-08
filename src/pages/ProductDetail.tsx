import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { Star, Truck, ShieldCheck, ArrowRight, Heart, RefreshCw, ShoppingBag, ChevronRight, ChevronLeft } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, fetchProducts, isLoading } = useProductStore();
  const product = products.find(p => p.id === id);
  const addItem = useCartStore(state => state.addItem);
  
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      else setSelectedSize(undefined);
      
      if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0]);
      else setSelectedColor(undefined);
      
      setQuantity(1);
      setActiveImageIndex(0);
      window.scrollTo(0, 0);
    }
  }, [product, id]);

  const currentVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    
    return product.variants.find(v => {
      const matchSize = !selectedSize || v.size === selectedSize;
      const matchColor = !selectedColor || v.color === selectedColor;
      return matchSize && matchColor;
    });
  }, [product, selectedSize, selectedColor]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (currentVariant && currentVariant.price_adjustment) {
      return product.price + currentVariant.price_adjustment;
    }
    return product.price;
  }, [product, currentVariant]);

  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (currentVariant) {
      return currentVariant.stock_quantity;
    }
    return product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 99 : 0);
  }, [product, currentVariant]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
      .slice(0, 4);
  }, [products, product]);

  if (isLoading && !product) {
    return (
      <div className="pt-32 pb-32 flex justify-center items-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Product not found</h2>
        <p className="text-slate-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 font-medium hover:bg-slate-800 transition-colors rounded-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;
  const isOutOfStock = currentStock === 0;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isOutOfStock) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.images[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    
    handleAddToCart();
    navigate('/checkout');
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-slate-900">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/shop" className="hover:text-slate-900">Shop</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-900">{product.category}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-100 group">
              <img 
                src={product.images[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
              
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-20 h-24 rounded-md overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-slate-900' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <p className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-2">{product.brand}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-orange-400 text-orange-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="text-sm text-slate-500">{product.reviews} Reviews</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-slate-900">${currentPrice.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <span className="text-xl text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {currentVariant?.sku && (
                <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">SKU: {currentVariant.sku}</span>
              )}
            </div>

            <p className="text-slate-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-6 mb-8 border-t border-b border-slate-200 py-8">
              {/* Colors */}
              {hasColors && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-slate-900">Color: <span className="text-slate-500">{selectedColor}</span></h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.colors!.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border text-sm font-medium transition-colors rounded-sm ${selectedColor === color ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-900 hover:border-slate-900'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {hasSizes && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-slate-900">Size: <span className="text-slate-500">{selectedSize}</span></h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes!.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border text-sm font-medium transition-colors rounded-sm ${selectedSize === size ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-900 hover:border-slate-900'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-slate-900">Quantity</h3>
                  {currentStock > 0 ? (
                    <span className="text-sm text-green-600 font-medium">{currentStock} in stock</span>
                  ) : (
                    <span className="text-sm text-red-600 font-medium">Out of stock</span>
                  )}
                </div>
                <div className="flex items-center border border-slate-300 w-32 rounded-sm bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-4 py-2 text-slate-500 hover:text-slate-900 disabled:opacity-50"
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} 
                    className="px-4 py-2 text-slate-500 hover:text-slate-900 disabled:opacity-50"
                    disabled={quantity >= currentStock || isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-white text-slate-900 border border-slate-900 px-8 py-4 font-bold tracking-wider uppercase text-sm hover:bg-slate-50 transition-colors rounded-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 bg-slate-900 text-white px-8 py-4 font-bold tracking-wider uppercase text-sm hover:bg-slate-800 transition-colors rounded-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now <ArrowRight className="w-5 h-5" />
              </button>
              <button className="p-4 border border-slate-300 rounded-sm hover:border-slate-900 transition-colors text-slate-600 hover:text-red-500 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-sm">
              <div className="flex items-start gap-4">
                <Truck className="w-6 h-6 text-slate-700 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Delivery & Returns</h4>
                  <p className="text-sm text-slate-600 mt-1">Free standard shipping on orders over $200. Estimated delivery in 3-5 business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-slate-700 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Secure Payment</h4>
                  <p className="text-sm text-slate-600 mt-1">100% secure checkout with Paystack. Your payment information is encrypted and safe.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center uppercase tracking-wider">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(related => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
