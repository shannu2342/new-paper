const mongoose = require('mongoose');

const heroImageSchema = new mongoose.Schema(
    {
        imageUrl: { type: String, required: true },
        articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
        title: {
            type: {
                en: { type: String, required: true },
                te: { type: String, required: true }
            },
            required: true
        },
        order: { type: Number, default: 0 },
        enabled: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('HeroImage', heroImageSchema);
