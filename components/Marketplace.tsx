import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Star, ExternalLink } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';

interface MarketplaceProps {
  products: Product[];
}

export const Marketplace: React.FC<MarketplaceProps> = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await db.getProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const handleProductClick = async (productId: string, link: string) => {
    await db.trackAffiliateClick(productId, user?.id);
    window.open(link, '_blank');
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-hemp-600 to-hemp-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10">
           <h2 className="text-2xl font-bold mb-2">Nepal Hemp Marketplace</h2>
           <p className="text-hemp-100 max-w-lg mb-4">Discover locally sourced hemp products, accessories, and wellness goods. Support local farmers and animal shelters with every purchase.</p>
           <button className="bg-white text-hemp-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-hemp-50 transition-colors">
             Start Selling
           </button>
         </div>
         <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4">
            <ShoppingBag size={200} />
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col group">
            <div className="relative h-48 overflow-hidden">
              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {product.is_featured && (
                <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                  FEATURED
                </span>
              )}
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                {product.category}
              </span>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">{product.title}</h3>
              </div>
              
              <div className="flex items-center space-x-1 mb-2">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-xs font-medium text-gray-600">{product.rating}</span>
                <span className="text-gray-300 mx-1">|</span>
                <span className="text-xs text-gray-500">Verified Seller</span>
                {product.clicks && product.clicks > 10 && (
                   <span className="ml-auto text-xs text-red-500 font-bold">🔥 Hot</span>
                )}
              </div>

              <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <span className="text-lg font-bold text-hemp-700">
                  {product.currency} {product.price.toLocaleString()}
                </span>
                <button 
                  onClick={() => handleProductClick(product.id, product.affiliate_link)}
                  className="flex items-center space-x-1 bg-hemp-600 hover:bg-hemp-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <span>Buy Now</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
