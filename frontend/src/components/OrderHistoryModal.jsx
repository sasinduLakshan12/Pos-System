import React from 'react';
import { X, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';

export default function OrderHistoryModal({
  isOpen,
  onClose,
  orders,
  onCancelOrder,
  onDeleteOrder,
  onClearAllOrders,
  onRefreshOrders,
  onSelectOrder
}) {
  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESERVED':
        return <span className="badge-warning px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold">RESERVED</span>;
      case 'PAID':
        return <span className="badge-success px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold">PAID</span>;
      case 'FAILED':
        return <span className="badge-danger px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold">FAILED</span>;
      case 'EXPIRED':
        return <span className="badge-danger px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold">EXPIRED</span>;
      case 'CANCELLED':
        return <span className="bg-slate-800 text-gray-400 border border-slate-700 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold">CANCELLED</span>;
      default:
        return <span className="badge-info px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-4xl rounded-xl sm:rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-base sm:text-lg font-bold text-white">Order History & Status Lifecycle</h2>
            <button
              onClick={onRefreshOrders}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh Orders"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {orders && orders.length > 0 && onClearAllOrders && (
              <button
                onClick={onClearAllOrders}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-semibold transition"
                title="Clear all order history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All Orders</span>
                <span className="sm:hidden">Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-gray-400">
              <p className="text-sm font-medium">No orders recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {orders.map((order) => {
                const canCancel = ['PAID', 'RESERVED'].includes(order.status);
                const isReserved = order.status === 'RESERVED';
                return (
                  <div
                    key={order.id || order._id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-5 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2.5 sm:mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-400">
                        Created: {order.created_at ? new Date(order.created_at).toLocaleDateString() + ' ' + new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="bg-slate-950/60 rounded-lg p-2.5 sm:p-3 border border-slate-900 mb-3 divide-y divide-slate-900 text-xs">
                      {order.items?.map((item, idx) => (
                        <div key={item.id || idx} className="py-1.5 flex justify-between items-center">
                          <span className="text-gray-300 font-medium truncate pr-2">{item.product_name}</span>
                          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            <span className="text-gray-400 text-[11px] sm:text-xs">Qty: {item.quantity}</span>
                            <span className="text-white font-semibold">Rs. {Number((item.unit_price || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                      <div className="text-xs sm:text-sm font-extrabold text-emerald-400">
                        Total: Rs. {Number(order.total_amount || 0).toFixed(2)}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {isReserved && (
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-bold transition text-center"
                          >
                            Pay / Review Lock
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => onCancelOrder(order.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/40 rounded-lg text-xs font-bold transition text-center"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Cancel & Restore</span>
                          </button>
                        )}

                        {onDeleteOrder && (
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-slate-800 hover:border-red-500/30 transition"
                            title="Delete this order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

