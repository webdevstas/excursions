const mongoose = require('mongoose')

const excursionsSchema = new mongoose.Schema({
    company: String,
    title: String,
    description: String,
    price: Number,
    picturesURLs: Array,
    slug: {
        type: String,
        unique: true
    },
    isApproved: Boolean,
    isPublished: Boolean,
    tags: [String]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports.Excursions = mongoose.model('Excursions', excursionsSchema)