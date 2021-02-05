const mongoose = require('mongoose')

const excursionsSchema = new mongoose.Schema({
    company: String,
    title: String,
    description: String,
    price: Number,
    picturesURLs: Array,
    slug: String,
    isApproved: Boolean,
    isPublished: Boolean
})

module.exports.Excursions = mongoose.model('Excursions', excursionsSchema)