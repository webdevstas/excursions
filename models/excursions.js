const mongoose = require('mongoose')

const excursionsSchema = new mongoose.Schema({
    company: {
        type: mongoose.Types.ObjectId,
        ref: 'Companies'
    },
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
    informationPhone: String,
    createdAt: String,
    updatedAt: String
}, {
    timestamps: {
        currentTime: () => {
            let date = new Date()
            return  date.toISOString()
        }
    }
})

module.exports.Excursions = mongoose.model('Excursions', excursionsSchema)