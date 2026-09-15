import React from 'react';
import { X, Trash2, Plus, Minus, Lock, ArrowRight } from 'lucide-react';

export default function CartModal({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  loading
}) {
  if (!isOpen) return null;

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Your cart is empty.</p>
              <p className="text-xs text-gray-500 mt-1">Add items from the store to reserve stock.</p>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-xl"
              >
                <div>
                  <h4 className="font-semibold text-white text-sm">{product.name}</h4>
                  <p className="text-xs text-blue-400 font-medium">
                    Rs. {product.price.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity controls */}
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQty(product.id, quantity - 1)}
                      className="p-1 text-gray-300 hover:text-white hover:bg-slate-700 rounded transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => onUpdateQty(product.id, quantity + 1)}
                      className="p-1 text-gray-300 hover:text-white hover:bg-slate-700 rounded transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-white w-24 text-right">
                    Rs. {(product.price * quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Total Amount:</span>
              <span className="text-2xl font-black text-emerald-400">
                Rs. {totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Proceeding will instantly lock stock for <strong>5 minutes</strong> via a database transaction.
              </span>
            </div>

            <button
              disabled={loading}
              onClick={onProceedToCheckout}
              className="glow-btn-primary w-full py-3 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>{loading ? 'Reserving Stock...' : 'Proceed to Checkout & Lock Stock'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
