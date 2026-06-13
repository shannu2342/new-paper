const ApRegion = require('../models/ApRegion');

const listApRegions = async (req, res) => {
  const regions = await ApRegion.find({}).sort({ order: 1, createdAt: -1 });
  return res.json(regions);
};

const createApRegion = async (req, res) => {
  const region = await ApRegion.create(req.body);
  return res.status(201).json(region);
};

const updateApRegion = async (req, res) => {
  const { id } = req.params;
  const region = await ApRegion.findByIdAndUpdate(id, req.body, { new: true });
  if (!region) {
    return res.status(404).json({ message: 'AP region not found' });
  }
  return res.json(region);
};

const deleteApRegion = async (req, res) => {
  const { id } = req.params;
  const region = await ApRegion.findByIdAndDelete(id);
  if (!region) {
    return res.status(404).json({ message: 'AP region not found' });
  }
  return res.json({ message: 'Deleted' });
};

const reorderApRegions = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ message: 'order must be an array' });
  }
  await Promise.all(
    order.map((item, index) =>
      ApRegion.findByIdAndUpdate(item.id, { order: item.order ?? index })
    )
  );
  return res.json({ message: 'Order updated' });
};

module.exports = {
  listApRegions,
  createApRegion,
  updateApRegion,
  deleteApRegion,
  reorderApRegions
};
