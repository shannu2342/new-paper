const HeroImage = require('../models/HeroImage');
const mongoose = require('mongoose');

const normalizeTitle = (title = {}) => ({
    en: (title.en || '').trim(),
    te: (title.te || '').trim()
});

const validatePayload = (payload = {}, { partial = false } = {}) => {
    if (!partial || Object.prototype.hasOwnProperty.call(payload, 'imageUrl')) {
        if (!payload.imageUrl || !payload.imageUrl.trim()) {
            return 'imageUrl is required';
        }
    }

    if (!partial || Object.prototype.hasOwnProperty.call(payload, 'title')) {
        const title = normalizeTitle(payload.title || {});
        if (!title.en || !title.te) {
            return 'title.en and title.te are required';
        }
    }

    if (payload.articleId && !mongoose.Types.ObjectId.isValid(payload.articleId)) {
        return 'Invalid articleId';
    }

    return null;
};

const normalizeArticleId = (value) => {
    const normalized = String(value || '').trim();
    return normalized || undefined;
};

const listHeroImages = async (req, res) => {
    const images = await HeroImage.find({ enabled: true })
        .sort({ order: 1, createdAt: -1 })
        .populate('articleId');
    return res.json(images);
};

const createHeroImage = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            articleId: normalizeArticleId(req.body.articleId)
        };
        const message = validatePayload(payload, { partial: false });
        if (message) {
            return res.status(400).json({ message });
        }

        const image = await HeroImage.create({
            ...payload,
            imageUrl: payload.imageUrl.trim(),
            title: normalizeTitle(payload.title)
        });
        const populated = await HeroImage.findById(image._id).populate('articleId');
        return res.json(populated);
    } catch (error) {
        return res.status(400).json({ message: error?.message || 'Unable to create hero image' });
    }
};

const updateHeroImage = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid hero image id' });
    }

    const payload = {
        ...req.body,
        articleId: normalizeArticleId(req.body.articleId)
    };
    const message = validatePayload(payload, { partial: true });
    if (message) {
        return res.status(400).json({ message });
    }

    if (payload.imageUrl) payload.imageUrl = payload.imageUrl.trim();
    if (payload.title) payload.title = normalizeTitle(payload.title);

    const image = await HeroImage.findByIdAndUpdate(id, payload, { new: true }).populate('articleId');
    if (!image) {
        return res.status(404).json({ message: 'Hero image not found' });
    }
    return res.json(image);
};

const deleteHeroImage = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid hero image id' });
    }

    const deleted = await HeroImage.findByIdAndDelete(id);
    if (!deleted) {
        return res.status(404).json({ message: 'Hero image not found' });
    }
    return res.json({ message: 'Image deleted successfully' });
};

module.exports = { listHeroImages, createHeroImage, updateHeroImage, deleteHeroImage };
