import React from 'react';
import { ShoppingCart, History, PackagePlus, ShieldCheck } from 'lucide-react';

export default function Navbar({ cartCount, onOpenCart, onOpenOrders, onOpenInventory }) {
  return (
    <header className="glass-card sticky top-0 z-40 px-6 py-4 mb-8 border-b border-emerald-900/40 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand with LoomPOS Smart Store Styling */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-600/30">
            <ShieldCheck className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
              LOOMPOS <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Smart Store</span>
            </h1>
            <p className="text-xs text-gray-400">Concurrency-Safe POS & Stock Reservation System</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
          >
            <PackagePlus className="w-4 h-4 text-emerald-400" />
            <span>Manage Products</span>
          </button>

          <button
            onClick={onOpenOrders}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Orders & Lifecycle</span>
          </button>

          <button
            onClick={onOpenCart}
            className="glow-btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition relative"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-emerald-950 font-black text-xs px-2 py-0.5 rounded-full ml-1">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
