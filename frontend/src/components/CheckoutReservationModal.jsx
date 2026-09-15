import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw, X } from 'lucide-react';

export default function CheckoutReservationModal({
  isOpen,
  onClose,
  order,
  onProcessPayment,
  onRefreshOrders
}) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300s)
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [loadingOutcome, setLoadingOutcome] = useState(null);

  useEffect(() => {
    if (order) {
      const expiry = new Date(order.expires_at).getTime();
      const now = new Date().getTime();
      const secondsRemaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(secondsRemaining > 0 ? secondsRemaining : 300);
      setIdempotencyKey(`KEY-${order.id}-${Date.now()}`);
      setDuplicateAlert(null);
    }
  }, [order]);

  useEffect(() => {
    if (!isOpen || !order || order.status !== 'RESERVED') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRefreshOrders();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, order, onRefreshOrders]);

  if (!isOpen || !order) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSimulatePayment = async (outcome, forceDuplicate = false) => {
    try {
      setLoadingOutcome(outcome);
      setDuplicateAlert(null);
      const keyToUse = forceDuplicate ? idempotencyKey : `KEY-${order.id}-${Date.now()}`;
      
      if (!forceDuplicate) {
        setIdempotencyKey(keyToUse);
      }

      const res = await onProcessPayment(order.id, outcome, keyToUse);

      if (res && res.duplicate) {
        setDuplicateAlert(res.message);
      }
    } catch (err) {
      alert(`Payment Simulation Error: ${err.message}`);
    } finally {
      setLoadingOutcome(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESERVED':
        return <span className="badge-warning px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold">RESERVED (5-MIN LOCK)</span>;
      case 'PAID':
        return <span className="badge-success px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold">PAID (CONFIRMED)</span>;
      case 'FAILED':
        return <span className="badge-danger px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold">PAYMENT FAILED</span>;
      case 'EXPIRED':
        return <span className="badge-danger px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold">RESERVATION EXPIRED</span>;
      case 'CANCELLED':
        return <span className="bg-slate-700 text-gray-300 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold">CANCELLED</span>;
      default:
        return <span className="badge-info px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-2xl rounded-xl sm:rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Stock Reserved & Checkout</h2>
              <p className="text-[11px] sm:text-xs text-emerald-400/90 font-mono font-semibold">Order ID: {order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Reservation Countdown Timer Widget */}
          {order.status === 'RESERVED' && (
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center space-y-1.5 sm:space-y-2 shadow-inner">
              <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-amber-400" /> Stock Hold Window Remaining
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wider font-mono">
                {formattedTime}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400">
                Stock is guaranteed for 5 minutes. If checkout is not completed, reservation automatically expires and stock is released back.
              </p>
            </div>
          )}

          {/* Current Order Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/60 border border-slate-800 p-3 sm:p-4 rounded-xl gap-2">
            <span className="text-xs sm:text-sm text-gray-300 font-medium">Order Status:</span>
            {getStatusBadge(order.status)}
          </div>

          {/* Order Summary */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Reserved Items</h4>
            <div className="divide-y divide-slate-800">
              {order.items?.map((item, idx) => (
                <div key={item.id || idx} className="py-2 flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <span className="text-white font-medium">{item.product_name}</span>
                    <span className="text-[11px] sm:text-xs text-gray-400 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">Rs. {Number((item.unit_price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-sm sm:text-base">
              <span className="text-gray-300">Total:</span>
              <span className="text-emerald-400 font-black">Rs. {Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Duplicate Detection Alert Banner */}
          {duplicateAlert && (
            <div className="bg-purple-500/20 border border-purple-500/40 rounded-xl p-3 sm:p-4 text-purple-300 text-xs flex items-start gap-2.5 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-purple-400 mt-0.5" />
              <div>
                <strong className="block text-purple-200 font-bold mb-0.5">Idempotency Duplicate Rejection Detected!</strong>
                {duplicateAlert}
              </div>
            </div>
          )}

          {/* Mock Payment Simulation Controls */}
          {order.status === 'RESERVED' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
              <h4 className="text-[11px] sm:text-xs font-bold text-gray-300 uppercase tracking-wider">
                Simulate Gateway Outcome (Assessment Demo)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  disabled={!!loadingOutcome}
                  onClick={() => handleSimulatePayment('SUCCESS')}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 p-2.5 sm:p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span>Simulate Success</span>
                  <span className="text-[10px] font-normal text-emerald-400/80">Confirms & Sells Stock</span>
                </button>

                <button
                  disabled={!!loadingOutcome}
                  onClick={() => handleSimulatePayment('FAILURE')}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 p-2.5 sm:p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition"
                >
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <span>Simulate Failure</span>
                  <span className="text-[10px] font-normal text-red-400/80">Releases Stock Immediately</span>
                </button>

                <button
                  disabled={!!loadingOutcome}
                  onClick={() => handleSimulatePayment('TIMEOUT')}
                  className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 p-2.5 sm:p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <span>Simulate Timeout</span>
                  <span className="text-[10px] font-normal text-amber-400/80">Expires & Releases Stock</span>
                </button>
              </div>

              {/* Duplicate Submission Tester */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                <div className="text-[11px] sm:text-xs text-gray-400 truncate">
                  Key: <code className="text-gray-300 bg-slate-800 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">{idempotencyKey.slice(0, 16)}...</code>
                </div>
                <button
                  disabled={!!loadingOutcome}
                  onClick={() => handleSimulatePayment('SUCCESS', true)}
                  className="px-3 sm:px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Duplicate Submission</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
