import React from 'react';
import { ShoppingCart, History, PackagePlus, ShieldCheck } from 'lucide-react';

export default function Navbar({ cartCount, onOpenCart, onOpenOrders, onOpenInventory }) {
  return (
    <header className="glass-card sticky top-0 z-40 px-3 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-8 border-b border-emerald-900/40 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Brand with LKPOS System Styling */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-emerald-600 p-2 sm:p-2.5 rounded-xl text-white shadow-lg shadow-emerald-600/30 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wide text-white flex items-center gap-1.5 sm:gap-2">
                LKPOS <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">System</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-400">Concurrency-Safe POS & Stock Reservation</p>
            </div>
          </div>

          {/* Mobile Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="md:hidden glow-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition relative shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-emerald-950 font-black text-[10px] px-1.5 py-0.2 rounded-full ml-0.5">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          <button
            onClick={onOpenInventory}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
          >
            <PackagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Manage Products</span>
          </button>

          <button
            onClick={onOpenOrders}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="truncate">Orders & Lifecycle</span>
          </button>

          <button
            onClick={onOpenCart}
            className="hidden md:flex glow-btn-primary items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition relative"
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
