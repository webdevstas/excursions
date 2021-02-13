const mongoose = require('mongoose')

const ticketsSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number
})

module.exports.Tickets = mongoose.model('Tickets', ticketsSchema)