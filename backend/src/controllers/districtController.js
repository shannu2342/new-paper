const District = require('../models/District');

const listDistricts = async (req, res) => {
  const { apRegion } = req.query;
  const query = apRegion ? { apRegion } : {};
  const districts = await District.find(query)
    .populate('apRegion')
    .sort({ order: 1, createdAt: -1 });
  return res.json(districts);
};

const createDistrict = async (req, res) => {
  const district = await District.create(req.body);
  return res.status(201).json(district);
};

const updateDistrict = async (req, res) => {
  const { id } = req.params;
  const district = await District.findByIdAndUpdate(id, req.body, { new: true });
  if (!district) {
    return res.status(404).json({ message: 'District not found' });
  }
  return res.json(district);
};

const deleteDistrict = async (req, res) => {
  const { id } = req.params;
  const district = await District.findByIdAndDelete(id);
  if (!district) {
    return res.status(404).json({ message: 'District not found' });
  }
  return res.json({ message: 'Deleted' });
};

const reorderDistricts = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ message: 'order must be an array' });
  }
  await Promise.all(
    order.map((item, index) =>
      District.findByIdAndUpdate(item.id, { order: item.order ?? index })
    )
  );
  return res.json({ message: 'Order updated' });
};

module.exports = {
  listDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  reorderDistricts
};
