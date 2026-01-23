const Category = require('../models/Category');

const listCategories = async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};
  const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });
  return res.json(categories);
};

const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  return res.status(201).json(category);
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  return res.json(category);
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  return res.json({ message: 'Deleted' });
};

const reorderCategories = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ message: 'order must be an array' });
  }
  const updates = order.map((item, index) =>
    Category.findByIdAndUpdate(item.id, { order: item.order ?? index })
  );
  await Promise.all(updates);
  return res.json({ message: 'Order updated' });
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
};
