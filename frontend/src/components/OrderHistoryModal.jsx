import React from 'react';
import { X, RefreshCw, RotateCcw } from 'lucide-react';

export default function OrderHistoryModal({
  isOpen,
  onClose,
  orders,
  onCancelOrder,
  onRefreshOrders,
  onSelectOrder
}) {
  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESERVED':
        return <span className="badge-warning px-2.5 py-0.5 rounded-full text-xs font-bold">RESERVED</span>;
      case 'PAID':
        return <span className="badge-success px-2.5 py-0.5 rounded-full text-xs font-bold">PAID</span>;
      case 'FAILED':
        return <span className="badge-danger px-2.5 py-0.5 rounded-full text-xs font-bold">FAILED</span>;
      case 'EXPIRED':
        return <span className="badge-danger px-2.5 py-0.5 rounded-full text-xs font-bold">EXPIRED</span>;
      case 'CANCELLED':
        return <span className="bg-slate-800 text-gray-400 border border-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">CANCELLED</span>;
      default:
        return <span className="badge-info px-2.5 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-4xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">Order History & Status Lifecycle</h2>
            <button
              onClick={onRefreshOrders}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
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
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No orders recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const canCancel = ['PAID', 'RESERVED'].includes(order.status);
                const isReserved = order.status === 'RESERVED';
                return (
                  <div
                    key={order.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-emerald-400">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900 mb-3 divide-y divide-slate-900 text-xs">
                      {order.items?.map((item) => (
                        <div key={item.id} className="py-1.5 flex justify-between items-center">
                          <span className="text-gray-300 font-medium">{item.product_name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400">Qty: {item.quantity}</span>
                            <span className="text-white font-semibold">${(item.unit_price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm font-extrabold text-emerald-400">
                        Total: ${order.total_amount.toFixed(2)}
                      </div>

                      <div className="flex items-center gap-2">
                        {isReserved && (
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-bold transition"
                          >
                            Pay / Review Lock
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => onCancelOrder(order.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs font-bold transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Cancel & Restore Stock</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
