import React, { useState } from 'react';
import { Search, ShoppingCart, Lock, AlertCircle } from 'lucide-react';

export default function ProductList({ products, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Inventory Auto-Synced with Database Transactions</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const isOutOfStock = product.available_stock <= 0;
          return (
            <div
              key={product.id}
              className={`glass-card rounded-2xl p-6 transition duration-200 hover:border-emerald-500/40 flex flex-col justify-between relative overflow-hidden ${
                isOutOfStock ? 'opacity-80' : ''
              }`}
            >
              {isOutOfStock && (
                <div className="absolute top-3 right-3 badge-danger text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Out of Stock
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white leading-snug">{product.name}</h3>
                </div>

                <div className="text-2xl font-extrabold text-emerald-400 mb-4">
                  ${product.price.toFixed(2)}
                </div>

                {/* Inventory Stock Breakdown Pill */}
                <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 mb-5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Total Physical Stock:</span>
                    <span className="font-semibold text-white">{product.stock} units</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-400">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked in 5-Min Checkout:
                    </span>
                    <span className="font-semibold">{product.reserved_stock} units</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800 flex justify-between items-center">
                    <span className="font-medium text-gray-300">Available to Purchase:</span>
                    <span
                      className={`font-extrabold text-sm ${
                        product.available_stock > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {product.available_stock} units
                    </span>
                  </div>
                </div>
              </div>

              <button
                disabled={isOutOfStock}
                onClick={() => onAddToCart(product)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                  isOutOfStock
                    ? 'bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700'
                    : 'glow-btn-primary text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
