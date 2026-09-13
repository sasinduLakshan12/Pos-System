import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import CartModal from './components/CartModal';
import CheckoutReservationModal from './components/CheckoutReservationModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import ProductManagerModal from './components/ProductManagerModal';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modal open states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // Fetch live products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  // Initial load & periodic polling
  useEffect(() => {
    fetchProducts();
    fetchOrders();

    const interval = setInterval(() => {
      fetchProducts();
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > product.available_stock) {
          alert(`Cannot add more than available stock (${product.available_stock} units)`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId, qty) => {
    if (qty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && qty > product.available_stock) {
      alert(`Requested quantity exceeds available stock (${product.available_stock})`);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Checkout & Reserve Stock
  const handleProceedToCheckout = async () => {
    try {
      setLoading(true);
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: 'CART-' + Date.now(),
          items
        })
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error);
      }

      setCart([]);
      setIsCartOpen(false);
      setSelectedOrder(json.data);
      setIsCheckoutOpen(true);
      fetchProducts();
      fetchOrders();
    } catch (err) {
      alert(`Checkout Reservation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Simulate Payment Gateway Outcome
  const handleProcessPayment = async (orderId, outcome, idempotencyKey) => {
    const res = await fetch(`/api/orders/${orderId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, idempotencyKey })
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error);
    }

    setSelectedOrder(json.data);
    fetchProducts();
    fetchOrders();
    return json;
  };

  // Cancel Order & Restore Stock
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order? Stock will be restored immediately.')) {
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error);
      }
      fetchProducts();
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(json.data);
      }
    } catch (err) {
      alert(`Cancellation Error: ${err.message}`);
    }
  };

  // Product Manager Actions
  const handleCreateProduct = async (productData) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchProducts();
    } catch (err) {
      alert(`Error creating product: ${err.message}`);
    }
  };

  const handleUpdateProduct = async (id, updateData) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchProducts();
    } catch (err) {
      alert(`Error updating product stock: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pb-16 flex-1 w-full space-y-8">
        {/* Banner with LoomPOS Smart Store Title */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-900/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">LoomPOS Smart Store — Concurrency & Stock Reservation Portal</h2>
            <p className="text-xs text-slate-400">
              Demonstrates atomic SQLite transactions, 5 minute stock hold timers, mock payment outcomes, idempotency duplicate detection, and order lifecycle transitions.
            </p>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <ProductList products={products} onAddToCart={handleAddToCart} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950">
        LoomPOS Smart Store — Software Engineer Technical Assessment
      </footer>

      {/* Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        loading={loading}
      />

      <CheckoutReservationModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        order={selectedOrder}
        onProcessPayment={handleProcessPayment}
        onRefreshOrders={() => {
          fetchProducts();
          fetchOrders();
        }}
      />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onCancelOrder={handleCancelOrder}
        onRefreshOrders={fetchOrders}
        onSelectOrder={(order) => {
          setSelectedOrder(order);
          setIsOrdersOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <ProductManagerModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        products={products}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
      />
    </div>
  );
}
