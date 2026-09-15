import React, { useState } from 'react';
import { X, Plus, Edit2, Package, Check } from 'lucide-react';

export default function ProductManagerModal({
  isOpen,
  onClose,
  products,
  onCreateProduct,
  onUpdateProduct
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  if (!isOpen) return null;

  const handleSubmitNew = (e) => {
    e.preventDefault();
    if (!name || !price || !stock) return;
    onCreateProduct({
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10)
    });
    setName('');
    setPrice('');
    setStock('');
  };

  const handleSaveStockUpdate = (productId) => {
    if (editStock === '') return;
    onUpdateProduct(productId, { stock: parseInt(editStock, 10) });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-3xl rounded-xl sm:rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">Product & Inventory Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Create Product Form */}
          <form onSubmit={handleSubmitNew} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3 sm:space-y-4">
            <h4 className="text-[11px] sm:text-xs font-bold text-gray-300 uppercase tracking-wider">Add New Product</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Mouse"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2 text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 4999.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2 text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Initial Stock Qty</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2 text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product</span>
            </button>
          </form>

          {/* Existing Inventory Table */}
          <div className="space-y-2.5 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-bold text-gray-300 uppercase tracking-wider">Current Stock Inventory</h4>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 min-w-[520px]">
                <thead className="bg-slate-950 text-gray-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Physical Stock</th>
                    <th className="p-3">Reserved</th>
                    <th className="p-3">Available</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((prod) => (
                    <tr key={prod.id || prod._id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{prod.name}</td>
                      <td className="p-3 text-emerald-400 font-bold">Rs. {Number(prod.price || 0).toFixed(2)}</td>
                      <td className="p-3">
                        {editingId === (prod.id || prod._id) ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-16 bg-slate-950 text-white border border-emerald-500 rounded px-1.5 py-0.5 text-xs"
                            />
                            <button
                              onClick={() => handleSaveStockUpdate(prod.id || prod._id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono text-white">{prod.stock}</span>
                        )}
                      </td>
                      <td className="p-3 text-amber-400 font-mono">{prod.reserved_stock || 0}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{prod.available_stock}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setEditingId(prod.id || prod._id);
                            setEditStock(prod.stock);
                          }}
                          className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-slate-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
