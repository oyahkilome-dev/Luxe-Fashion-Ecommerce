import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { Product } from '../../data/mockProducts';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore(state => state.addItem);

  
  const navigate = useNavigate();

  const hasVariants = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants) {
      navigate(`/product/${product.id}`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants) {
      navigate(`/product/${product.id}`);
      return;
    }
    
    handleAddToCart(e);
    navigate('/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-slate-100 mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-sm">
                New
              </span>
            )}
            {product.originalPrice && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-sm">
                Sale
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <button className="bg-white text-slate-900 p-3 rounded-full shadow-lg hover:bg-slate-900 hover:text-white transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-white text-slate-900 p-3 rounded-full shadow-lg hover:bg-slate-900 hover:text-white transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">{product.brand}</p>
          <h3 className="text-sm font-medium text-slate-900 truncate">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-slate-500 line-through">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
            <span className="text-xs text-slate-600">{product.rating} ({product.reviews})</span>
          </div>
        </div>
      </Link>
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
        >
          Add to Cart
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors text-center"
        >
          Buy Now
        </button>
      </div>
    </motion.div>
  );
};
