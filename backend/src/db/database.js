const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../pos_store.json');

function loadData() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      products: [
        { id: '1', name: 'Wireless Ergonomic Mouse', price: 49.99, stock: 15, reserved_stock: 0 },
        { id: '2', name: 'Mechanical RGB Keyboard', price: 119.99, stock: 8, reserved_stock: 0 },
        { id: '3', name: 'UltraWide 34" Monitor', price: 499.99, stock: 3, reserved_stock: 0 },
        { id: '4', name: 'USB-C Multi-Port Hub', price: 29.99, stock: 25, reserved_stock: 0 },
        { id: '5', name: 'Noise-Canceling Headphones', price: 199.99, stock: 5, reserved_stock: 0 }
      ],
      orders: [],
      order_items: [],
      stock_reservations: [],
      payments: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const content = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return { products: [], orders: [], order_items: [], stock_reservations: [], payments: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const memoryDb = {
  loadData,
  saveData,
  prepare(sql) {
    // Basic compatibility layer for SQL queries
    return {
      all(...args) {
        const data = loadData();
        if (sql.includes('FROM products')) {
          return data.products.map(p => ({
            ...p,
            available_stock: Math.max(0, p.stock - p.reserved_stock)
          }));
        }
        if (sql.includes('FROM orders')) {
          if (sql.includes("WHERE status = 'RESERVED' AND expires_at <=")) {
            const nowIso = args[0];
            return data.orders.filter(
              o => o.status === 'RESERVED' && o.expires_at && o.expires_at <= nowIso
            );
          }
          return data.orders;
        }
        if (sql.includes('FROM order_items')) {
          const orderId = args[0];
          return data.order_items.filter(i => i.order_id === orderId);
        }
        if (sql.includes('FROM stock_reservations')) {
          const orderId = args[0];
          return data.stock_reservations.filter(r => r.order_id === orderId);
        }
        if (sql.includes('FROM payments')) {
          const orderId = args[0];
          return data.payments.filter(p => p.order_id === orderId);
        }
        return [];
      },
      get(...args) {
        const data = loadData();
        if (sql.includes('FROM products WHERE id =')) {
          const prod = data.products.find(p => String(p.id) === String(args[0]));
          if (!prod) return null;
          return {
            ...prod,
            available_stock: Math.max(0, prod.stock - prod.reserved_stock)
          };
        }
        if (sql.includes('FROM orders WHERE id =')) {
          return data.orders.find(o => o.id === args[0]) || null;
        }
        if (sql.includes('FROM payments WHERE idempotency_key =')) {
          return data.payments.find(p => p.idempotency_key === args[0]) || null;
        }
        return null;
      },
      run(...args) {
        const data = loadData();
        if (sql.includes('INSERT INTO products')) {
          const newId = String(Date.now());
          const [name, price, stock] = args;
          data.products.push({ id: newId, name, price, stock, reserved_stock: 0 });
          saveData(data);
          return { lastInsertRowid: newId, changes: 1 };
        }
        if (sql.includes('UPDATE products SET name =')) {
          const [name, price, stock, id] = args;
          const prod = data.products.find(p => String(p.id) === String(id));
          if (prod) {
            prod.name = name;
            prod.price = price;
            prod.stock = stock;
            saveData(data);
          }
          return { changes: 1 };
        }
        if (sql.includes('DELETE FROM products')) {
          const id = args[0];
          data.products = data.products.filter(p => String(p.id) !== String(id));
          saveData(data);
          return { changes: 1 };
        }
        if (sql.includes('UPDATE products') && sql.includes('reserved_stock')) {
          if (sql.includes('reserved_stock +') || sql.includes('reserved_stock = reserved_stock +')) {
            const [qty, id, checkQty] = args;
            const prod = data.products.find(p => String(p.id) === String(id));
            if (prod && (prod.stock - prod.reserved_stock) >= (checkQty || qty)) {
              prod.reserved_stock += qty;
              saveData(data);
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          if (sql.includes('reserved_stock -') || sql.includes('MAX(0, reserved_stock - ?)')) {
            const [qty, id] = args;
            const prod = data.products.find(p => String(p.id) === String(id));
            if (prod) {
              prod.reserved_stock = Math.max(0, (prod.reserved_stock || 0) - qty);
              saveData(data);
            }
            return { changes: 1 };
          }
        }
        if (sql.includes('UPDATE orders SET status =')) {
          const [status, id] = args;
          const ord = data.orders.find(o => o.id === id);
          if (ord) {
            ord.status = status;
            saveData(data);
          }
          return { changes: 1 };
        }
        if (sql.includes('INSERT INTO orders')) {
          const [id, cart_id, idempotency_key, total_amount, status, expires_at] = args;
          data.orders.push({ id, cart_id, idempotency_key, total_amount, status, expires_at, created_at: new Date().toISOString() });
          saveData(data);
          return { changes: 1 };
        }
        if (sql.includes('INSERT INTO order_items')) {
          const [order_id, product_id, product_name, unit_price, quantity] = args;
          data.order_items.push({ id: Date.now(), order_id, product_id, product_name, unit_price, quantity });
          saveData(data);
          return { changes: 1 };
        }
        if (sql.includes('INSERT INTO stock_reservations')) {
          const [order_id, product_id, quantity, status, expires_at] = args;
          data.stock_reservations.push({ id: Date.now(), order_id, product_id, quantity, status, expires_at });
          saveData(data);
          return { changes: 1 };
        }
        if (sql.includes('UPDATE stock_reservations SET status =')) {
          const [status, orderId] = args;
          data.stock_reservations.forEach(r => {
            if (r.order_id === orderId || !orderId) {
              r.status = status;
            }
          });
          saveData(data);
          return { changes: 1 };
        }
        if (sql.includes('INSERT INTO payments')) {
          const [id, order_id, idempotency_key, amount, outcome, status] = args;
          data.payments.push({ id, order_id, idempotency_key, amount, outcome, status, created_at: new Date().toISOString() });
          saveData(data);
          return { changes: 1 };
        }
        return { changes: 1 };
      }
    };
  },
  transaction(fn) {
    return (...args) => {
      return fn(...args);
    };
  }
};

// Initialize file store
loadData();

module.exports = memoryDb;
