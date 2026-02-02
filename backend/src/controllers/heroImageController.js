const HeroImage = require('../models/HeroImage');

const listHeroImages = async (req, res) => {
    const images = await HeroImage.find({ enabled: true })
        .sort({ order: 1, createdAt: -1 })
        .populate('articleId');
    return res.json(images);
};

const createHeroImage = async (req, res) => {
    const image = await HeroImage.create(req.body);
    const populated = await HeroImage.findById(image._id).populate('articleId');
    return res.json(populated);
};

const updateHeroImage = async (req, res) => {
    const { id } = req.params;
    const image = await HeroImage.findByIdAndUpdate(id, req.body, { new: true }).populate('articleId');
    return res.json(image);
};

const deleteHeroImage = async (req, res) => {
    const { id } = req.params;
    await HeroImage.findByIdAndDelete(id);
    return res.json({ message: 'Image deleted successfully' });
};

module.exports = { listHeroImages, createHeroImage, updateHeroImage, deleteHeroImage };
