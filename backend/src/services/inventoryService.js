const Product = require('../models/Product');

const inventoryService = {
  async getAllProducts() {
    const products = await Product.find().lean();
    return products.map(p => ({
      id: String(p._id),
      _id: String(p._id),
      name: p.name,
      price: Number(p.price),
      stock: Number(p.stock),
      reserved_stock: Number(p.reserved_stock || 0),
      available_stock: Math.max(0, Number(p.stock) - Number(p.reserved_stock || 0)),
      created_at: p.created_at || new Date().toISOString()
    }));
  },

  async getProductById(id) {
    try {
      const p = await Product.findById(id).lean();
      if (!p) return null;
      return {
        id: String(p._id),
        _id: String(p._id),
        name: p.name,
        price: Number(p.price),
        stock: Number(p.stock),
        reserved_stock: Number(p.reserved_stock || 0),
        available_stock: Math.max(0, Number(p.stock) - Number(p.reserved_stock || 0)),
        created_at: p.created_at || new Date().toISOString()
      };
    } catch (e) {
      return null;
    }
  },

  async createProduct({ name, price, stock }) {
    const newProduct = await Product.create({
      name,
      price: Number(price),
      stock: Number(stock),
      reserved_stock: 0
    });
    return this.getProductById(newProduct._id);
  },

  async updateProduct(id, updateData) {
    const { name, price, stock, reserved_stock } = updateData;
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (price !== undefined) fieldsToUpdate.price = Number(price);
    if (stock !== undefined) fieldsToUpdate.stock = Number(stock);
    if (reserved_stock !== undefined) fieldsToUpdate.reserved_stock = Number(reserved_stock);

    const updated = await Product.findByIdAndUpdate(id, fieldsToUpdate, { new: true }).lean();
    if (!updated) return null;
    return this.getProductById(id);
  },

  async deleteProduct(id) {
    const res = await Product.findByIdAndDelete(id);
    return !!res;
  }
};

module.exports = inventoryService;
