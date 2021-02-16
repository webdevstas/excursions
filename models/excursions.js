const mongoose = require('mongoose')

const excursionsSchema = new mongoose.Schema({
    company: String,
    title: String,
    description: String,
    picturesURLs: Array,
    slug: {
        type: String,
        unique: true
    },
    isApproved: Boolean,
    isPublished: Boolean,
    tags: [String],
    tickets: [{
        type: mongoose.Types.ObjectId,
        ref: 'Tickets'
    }],
    informationPhone: String
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports.Excursions = mongoose.model('Excursions', excursionsSchema)